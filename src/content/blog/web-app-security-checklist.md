---
title: A Security Checklist for Production Web Apps
description: Practical, prioritized steps to secure a web application or SaaS product, organized around the OWASP Top 10 and written for teams without a dedicated security engineer.
image: /blog/web-app-security-checklist/cover.png
date: Oct 11, 2026
category: SaaS Architecture
order: 8
published: true
---

Most breaches are not clever. They come from ordinary mistakes: a missing permission check, a leaked key in a repository, a package nobody reviewed, a password stored carelessly. The attackers are rarely geniuses. They are just thorough, and automated.

That is good news, because it means a small team can prevent most of the damage with a short list of habits applied consistently. This is the checklist I work through before a product goes live, organized around the [OWASP Top 10](https://owasp.org/Top10/2025/), the industry's reference list of the most critical web application risks.

![Six-part security checklist: identity, access control, input and output, secrets, dependencies and monitoring](/blog/web-app-security-checklist/checklist-grid.svg "Six areas that cover most real-world incidents.")

## Start with access control

In the 2025 edition of the OWASP Top 10, **Broken Access Control** is still the number one risk. It means a user can see or do something they should not: reading another customer's invoice, editing someone else's profile, or calling an admin endpoint.

The cause is almost always the same. The app checked that you were *logged in*, but not that the thing you asked for *belongs to you*.

- **Check ownership on every request,** on the server, every time. Never rely on the client hiding a button.
- **Deny by default.** A new endpoint should be inaccessible until a rule explicitly allows it.
- **Scope every query** by the current user or tenant.
- **Don't reveal what exists.** Return the same "not found" response whether a record is missing or simply not yours.

```js
app.get("/invoices/:id", requireAuth, async (req, res) => {
  // The tenant filter is part of the query, so another tenant's invoice can never match.
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    tenantId: req.user.tenantId,
  });

  if (!invoice) return res.sendStatus(404); // identical for "missing" and "not yours"
  res.json(invoice);
});
```

Write automated tests that sign in as one user and try to access another user's data. They should fail, and keep failing.

## Handle identity carefully

Authentication is the front door, and it is a place where you should rarely invent anything.

- **Hash passwords** with a slow, purpose-built algorithm such as bcrypt or Argon2. Never store them in plain text, or with a fast general-purpose hash.
- **Rate-limit sign-in attempts** to slow credential stuffing and brute force.
- **Require multi-factor authentication** for admin accounts at the very least.
- **Prefer a proven library or provider** over rolling your own session or token logic.
- **Think through where tokens live.** Cookies marked `HttpOnly`, `Secure`, and `SameSite` are not readable by page scripts, which limits the damage of a cross-site scripting bug. Tokens in browser storage are convenient, but any injected script can read them. Choose deliberately.
- **Make password reset safe:** single-use, short-lived tokens, and an identical response whether or not the account exists.

## Validate input, encode output

Anything that comes from outside your server, including form fields, query strings, headers, and uploaded files, is untrusted.

- **Validate on the server,** against a schema that states exactly what you expect. Client-side validation is for user experience, not security.
- **Use parameterized queries** or a query builder, never string concatenation, to prevent injection.
- **Watch for operator injection in document databases.** If you accept JSON, a value you expected to be a string may arrive as an object like `{ "$ne": null }`. A schema that insists on a string prevents this.
- **Encode output** for the context it appears in, and use a framework that does it by default.

```js
import { z } from "zod";
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 });
const Login = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(200),
});

app.post("/login", loginLimiter, async (req, res) => {
  const parsed = Login.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

  // ...look up the user using parsed.data.email, a verified string
});
```

For file uploads, check the type and size, store files outside the application's executable path (object storage is ideal), and never serve user-uploaded content from your main domain without care.

## Lock down configuration and headers

**Security Misconfiguration** rose to second place in the 2025 list, and it is the easiest category to fix.

- **Send security headers.** In Express, the `helmet` middleware sets sensible defaults.
- **Force HTTPS** and enable HTTP Strict Transport Security.
- **Set a strict CORS allow-list** of the exact origins you expect. Never combine a wildcard origin with credentials.
- **Turn off debug modes** and detailed error pages in production, and never return stack traces to users.
- **Use separate environments** for development, staging, and production, with separate credentials.

```js
import helmet from "helmet";
import cors from "cors";

app.use(helmet());
app.use(cors({ origin: ["https://www.example.com"], credentials: true }));
```

## Treat secrets like cash

- **Keep secrets out of Git,** including `.env` files, and add them to `.gitignore` before the first commit.
- **Load them from the environment or a secrets manager,** never from source code.
- **Turn on secret scanning** in your repository host, so an accidental commit is caught quickly.
- **Rotate keys on a schedule,** and immediately after any suspected exposure. If a key ever lands in a public repository, assume it is compromised, because it will be found fast.
- **Give each key the least privilege** it needs.

## Mind your dependencies

The 2025 list adds **Software Supply Chain Failures** as its own, broader category, reflecting how much of any application is code you did not write.

- **Commit your lockfile** and install with `npm ci` in builds, so you get exactly what you tested.
- **Run `npm audit`** (or your ecosystem's equivalent) regularly, and in CI.
- **Automate update proposals** with a tool such as Dependabot or Renovate, and merge them promptly.
- **Review new packages** before adding them. Check maintenance, popularity, and what they pull in.
- **Remove what you don't use.** Every dependency is attack surface.

## Log, alert, and be ready

You cannot respond to what you cannot see.

- **Log sign-ins, failures, permission denials, and sensitive actions,** with timestamps and user IDs.
- **Never log secrets or full personal data.**
- **Alert on unusual activity,** such as a burst of failed logins or a sudden spike in errors.
- **Back up your data, and test a restore.** An untested backup is only a hope.
- **Write a one-page incident plan:** who decides, who to call, how to rotate keys, how to notify customers.

## Layer your defenses

No single control is perfect, so design as if each layer might fail.

![Four security layers: edge, application, data and operations](/blog/web-app-security-checklist/defense-in-depth.svg "Each layer assumes another one may fail.")

The edge filters obvious abuse. The application enforces who can do what. The data layer limits what a compromised account can reach, and encrypts what it stores. Operations watches for trouble and lets you recover. A mistake in one layer then becomes an incident you can contain, rather than a breach.

## A pre-launch checklist

- Every endpoint checks ownership or tenant, with tests that prove it.
- Passwords are hashed, sign-in is rate-limited, and admins use MFA.
- All input is validated against a schema on the server.
- Security headers, HTTPS, and a strict CORS list are in place.
- No secrets in the repository, and secret scanning is on.
- Dependencies are locked, audited, and kept current.
- Sign-ins and sensitive actions are logged, alerts exist, and a backup restore has been tested.

## The bottom line

Security is not a feature you add at the end. It is a set of small, boring habits applied everywhere: check who is asking, distrust what arrives, keep secrets secret, and keep an eye on the logs. Start with access control, because that is where most real-world damage happens.

If you would like a second pair of eyes on an application before launch, [get in touch](/#contact). I'm happy to review your approach.
