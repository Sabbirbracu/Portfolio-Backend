---
title: Building SaaS Products That Scale
description: Multi-tenancy, permissions, billing, background work, and observability: the early architecture decisions that are expensive to change later.
image: /blog/building-saas-products-that-scale/cover.png
date: Oct 11, 2026
category: SaaS Architecture
order: 2
published: true
---

"Scale" is usually discussed as a traffic problem. For most SaaS products, the harder problem arrives earlier and is quieter: the product starts succeeding, and the early shortcuts start to hurt.

A slow page can be fixed in an afternoon. A data model that mixes every customer's records into the wrong shape, a permission system hard-coded around two roles, or billing logic scattered across forty files can take months to untangle, while real customers are using the product.

So I don't start by asking how to handle a million users. I start by asking which decisions will be **expensive to change later**, and I make those carefully. Everything else can stay simple.

Here are the ones I look at first.

## 1. Decide how tenants are isolated

Every SaaS product serves multiple customers ("tenants") from one system. How you keep their data apart is the first architectural choice, and it touches almost every query you will ever write.

![Comparison of shared schema, schema per tenant and database per tenant: isolation increases from left to right, and so do cost and operational complexity](/blog/building-saas-products-that-scale/tenancy-models.svg "Three isolation models. Isolation, cost, and operational weight all rise from left to right.")

- **Shared schema.** All tenants share the same tables, and each row carries a `tenant_id`. It is the cheapest and simplest to operate, and it is where most products should start.
- **Schema per tenant.** One database, with a separate set of tables for each tenant. Isolation is stronger, but every migration now runs once per tenant, and the operational load grows with your customer count.
- **Database per tenant.** Full separation. It gives the strongest isolation and the cleanest per-customer cost tracking, and it is the most expensive to run. It tends to be reserved for large or regulated customers.

My default recommendation is **shared schema first**, with the option to move specific customers onto dedicated databases later. That only works if you build one habit from day one: **tenant scoping happens in one place, never ad hoc.**

The failure mode is quiet. A forgotten tenant filter doesn't throw an error. It returns another customer's data. So route every query through a single choke point:

```js
// Every data access goes through a tenant-scoped repository.
// If tenantId is missing, nothing runs.
export const forTenant = (tenantId) => {
  if (!tenantId) throw new Error("tenantId is required");
  return {
    projects: {
      find: (filter = {}) => Project.find({ ...filter, tenantId }),
      findById: (id) => Project.findOne({ _id: id, tenantId }),
      create: (data) => Project.create({ ...data, tenantId }),
    },
  };
};
```

If you use PostgreSQL, add a second layer with [row-level security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), so the database itself refuses to cross tenant boundaries even when application code has a bug:

```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON projects
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

Two details trip people up. Table owners bypass row-level security unless you use `FORCE`, and superusers (or roles with the `BYPASSRLS` attribute) always bypass it, so your application should connect as a role that is none of those. And with connection pooling, set the tenant per transaction, for example with `set_config('app.tenant_id', $1, true)`, so one request's tenant never leaks into the next.

Whichever database you use, write an automated test that logs in as tenant A and tries to read tenant B's data. It should fail, and it should keep failing.

## 2. Model organizations and roles, not just users

Early products often start with a `users` table and a boolean like `isAdmin`. Then a customer asks for a second admin, a read-only teammate, a contractor with access to one project, and an invite flow, and the shortcut becomes a rewrite.

A structure that holds up:

- **Organizations** own the data and the subscription.
- **Memberships** connect users to organizations. One person can belong to several.
- **Roles** are assigned per membership, and each role maps to a set of **permissions**.
- **Checks ask about permissions, not roles:** `can(member, "invoice:create")` instead of `member.role === "admin"`.

That last point matters most. When code asks about permissions, adding a new role later means editing one mapping, not hunting through the codebase.

## 3. Treat billing as a state machine

Billing looks like a payment form. It is really a lifecycle with several states and many ways to move between them.

![Subscription lifecycle: trial, active, past due and canceled, with the webhook events that move an account between states](/blog/building-saas-products-that-scale/billing-lifecycle.svg "Your billing provider owns the truth. Your app mirrors it through webhooks.")

The principles I follow:

- **The payment provider is the source of truth** for subscription state. Your database mirrors it, updated by webhooks, never by trusting the browser.
- **Webhooks arrive late, twice, and out of order.** Verify the signature, record each event's ID, and ignore duplicates, so every handler is idempotent.
- **Do the work off the request path.** Acknowledge the webhook quickly, and process it in a background job.
- **Derive access from entitlements,** a table that says what each plan allows. Avoid scattering `if (plan === "pro")` through the code.

```ts
app.post("/webhooks/billing", express.raw({ type: "application/json" }), async (req, res) => {
  const event = verifySignature(req.body, req.headers["signature"]); // throws if invalid

  const isNew = await db.webhookEvents.insertIfNew(event.id); // unique index on event id
  if (!isNew) return res.sendStatus(200); // duplicate delivery, already handled

  await queue.add("apply-billing-event", event); // process outside the request
  res.sendStatus(200);
});
```

Also plan for the unglamorous states: failed payments with a grace period, a read-only mode that lets customers export their data after canceling, and clear emails at each step. Payment provider availability varies by country, so check what your business location and your customers' locations support before you commit.

## 4. Start as a modular monolith

It's tempting to begin with microservices because that is what large companies run. For a new product it usually means distributed-systems problems with none of the benefits: network failures between services, harder debugging, and slower delivery.

A **modular monolith** gives you most of the structure with far less pain. It is one deployable application, divided into modules with clear boundaries.

![Architecture of a modular monolith: auth, billing, core domain and notification modules inside one application, connected to a database, a queue with workers, and object storage, with payment webhooks entering through billing](/blog/building-saas-products-that-scale/modular-monolith.svg "One deployable app, with strict module boundaries and a queue for background work.")

The rule that keeps it healthy: modules talk to each other through plain interfaces, never by reaching into each other's tables. If a module ever needs to become its own service, the seam is already there.

Put slow or unreliable work on a **queue**: sending email, generating exports, calling third-party APIs, processing webhooks. Make each job idempotent and retryable, so a crash halfway through is a non-event.

## 5. Make change safe

A product that can't change safely stops improving. Three habits help:

- **Migrate in steps.** Add the new column first, deploy code that writes to both, backfill the data, switch reads, and remove the old column in a later release. Never rename a live column in a single step.
- **Use feature flags** to release code separately from exposing it. You can ship incomplete work safely, roll out to a few tenants, and turn something off without a deploy.
- **Add per-tenant rate limits** so one customer's runaway script can't degrade everyone else's experience.

## 6. Build observability in from day one

When something breaks at 2 a.m., you want answers in minutes, not a guessing game. The minimum I add before launch:

- **Structured logs** that include a request ID and the tenant ID on every line.
- **Error tracking** with alerts, so you hear about failures before customers write in.
- **A few core metrics:** request latency, error rate, and queue depth.
- **An audit log** of important actions (who changed what, and when). Enterprise customers will ask for it.
- **Backups, and a restore you have actually tested.** An untested backup is a hope.

## What I deliberately leave for later

Scaling work has a cost, so I postpone what the numbers don't yet justify:

- Kubernetes and multi-region deployments
- Splitting into microservices
- Custom-built authentication (use a proven library or provider)
- Elaborate caching layers before measuring a real bottleneck

## A pre-launch checklist

- Tenant scoping goes through a single choke point, with a cross-tenant access test.
- Users, organizations, memberships, and permission-based checks are in place.
- Billing state comes from provider webhooks, with signature checks and idempotency.
- Slow work runs on a queue with retries.
- Migrations follow add, backfill, switch, remove.
- Logs carry request and tenant IDs, errors alert you, and a backup restore has been tested.

## The bottom line

Good SaaS architecture isn't about predicting how big you'll get. It's about avoiding the handful of early choices that become painful to reverse, and keeping everything else simple enough to change.

If you're planning a SaaS product and want a second opinion on the architecture before you build, [get in touch](/#contact).
