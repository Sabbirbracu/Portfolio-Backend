---
title: Choosing the Right Tech Stack
description: Why the best stack is rarely the newest one, and a practical framework for choosing technologies your business won't regret in two years.
image: /blog/choosing-the-right-tech-stack/cover.png
date: Oct 11, 2026
category: SaaS Architecture
order: 5
published: true
---

Few early decisions feel as weighty as picking a tech stack, and few get made as badly. Teams choose what is fashionable, what the loudest engineer prefers, or what they used at their last job. Then, two years later, they are paying for it in slow hiring, awkward workarounds, or a rewrite.

The good news is that this decision does not require genius. It requires a clear head, a short list of honest questions, and the discipline to write down the answers. This is the process I use with clients.

## The best stack is the one you can ship and maintain

Most stack debates are really arguments about the wrong thing. They compare technologies in the abstract: which is faster, which is more elegant, which has more features. But a stack is never used in the abstract. It is used by *your team*, for *your product*, under *your constraints*.

A technology that is theoretically superior but that nobody on your team knows will cost you months. A mainstream choice with a large community, plenty of documentation, and easy hiring will quietly save you far more over time than a marginally better benchmark ever will.

So start with constraints, not technologies. The whole process fits in five steps.

![Five-step process for choosing a tech stack: constraints, shortlist, score, prototype, decide](/blog/choosing-the-right-tech-stack/decision-steps.svg "Slow enough to be deliberate, fast enough to fit in a week.")

## Step 1: Write down your constraints

Before you look at a single framework, answer these questions in plain language:

- **Who will build and maintain this?** What do they already know well? What can you realistically hire for in your market?
- **What is the deadline?** A launch in eight weeks and a platform meant to last a decade call for different trade-offs.
- **What is the budget,** for both development and ongoing running costs?
- **What are the non-negotiables?** Compliance rules, data residency, integrations with existing systems, offline support.
- **What does the product actually need?** Real-time updates, heavy computation, SEO-critical pages, a mobile app, AI features?
- **What happens if you succeed?** Rough expectations for traffic and data, in orders of magnitude rather than precise numbers.

If you cannot answer these, no stack comparison will help, because you have no basis for comparing.

## Step 2: Be boring where it hurts

One of the most useful ideas in this area is Dan McKinley's essay [Choose Boring Technology](https://boringtechnology.club/). Its argument is that every team has a limited number of "innovation tokens": a small budget for adopting new, unproven, or unfamiliar technology. Spend them carefully.

Boring technology is not bad technology. It is technology whose failure modes are well known, whose documentation is deep, and whose problems have already been solved on the internet. You can search for the error message and find the answer.

![Two columns: be boring with databases, authentication, payments, hosting and monitoring; take calculated risks only on the core of what customers pay for](/blog/choosing-the-right-tech-stack/boring-vs-bold.svg "Spend your innovation tokens on the product, not on the plumbing.")

So where should you be boring? Anywhere a failure is expensive and the differentiation is zero. Your customers will never praise your choice of database or authentication system, but they will absolutely notice if either one breaks.

Where should you take a risk? On the part of the product that makes you different, and only when a prototype shows the new technology genuinely gives you an edge.

## Step 3: Shortlist, then score

Pick two or three realistic options per layer. Not ten. Then score them against criteria that match your constraints. A simple weighted table is enough:

| Criterion | Weight | Option A | Option B |
| --- | --- | --- | --- |
| Team already knows it | High | Strong | Weak |
| Hiring pool in our market | High | Strong | Medium |
| Maturity and community | Medium | Strong | Strong |
| Fit for our product's needs | High | Medium | Strong |
| Running cost at expected scale | Medium | Medium | Medium |
| Risk of being locked in | Low | Medium | Low |

The numbers are not the point. The point is that the table forces you to say *why* one option wins, and exposes the cases where a gut feeling was standing in for a reason. Revise the weights if the result surprises you, and ask whether the surprise reveals a constraint you forgot.

## Step 4: Prototype the riskiest part

Every stack has one place where it might fall over for *your* product: a data-heavy report, a real-time feature, an integration with an awkward legacy system. Find it, and build a thin version of it before you commit.

A few days spent on a throwaway prototype can save months. If the risky part works on the candidate stack, your confidence is earned. If it does not, you learned that cheaply.

## Step 5: Decide, and write down why

Record the decision in a short document, sometimes called an architecture decision record. It does not need to be long:

```md
# Decision: Use PostgreSQL for the primary database

Date: 2026-10-11
Status: Accepted

## Context
Relational data with strong consistency needs (billing, permissions).
Team has deep SQL experience. Expected scale: low millions of rows in year one.

## Options considered
1. PostgreSQL (chosen)
2. MongoDB
3. A managed NoSQL service

## Why
Fits the data model, team knows it, easy to hire for, mature tooling.

## Consequences
We manage schema migrations carefully. Revisit if we need to scale writes
far beyond a single primary.
```

Two years from now, someone will ask why you chose what you chose. A decision you can explain is far easier to change than one nobody remembers.

## Typical shapes that work

There is no single right answer, but these combinations are sensible starting points for common situations. Treat them as examples to adapt, not rules.

| Situation | A reasonable starting point | Why |
| --- | --- | --- |
| Marketing site or content-heavy product | A server-rendered web framework with a headless CMS | Fast pages and good search visibility |
| SaaS product with a small team | One full-stack framework, a relational database, a hosted auth and billing provider | Least moving parts, fastest to ship |
| Data- or AI-heavy product | The same web stack, plus a separate service in the language your data tooling favors | Use the right tool for the compute-heavy part only |
| Internal tool | Low-code or a simple CRUD framework | Not worth custom engineering |

## Mistakes I see most often

- **Résumé-driven development.** Choosing a technology because it will look good on someone's CV, not because the product needs it.
- **Microservices on day one.** Distributed systems solve problems you may not have yet, and create several you definitely will.
- **Ignoring hiring.** A stack that is hard to hire for becomes a growth ceiling.
- **Chasing benchmarks.** Raw speed rarely decides whether a product succeeds. Your database is probably not the bottleneck.
- **Treating the choice as permanent.** Good architecture keeps the expensive-to-change parts few and the rest replaceable.
- **Rewriting too soon.** A "rewrite in a better stack" almost always takes longer than expected, while no new features ship.

## When to reconsider

A stack decision is not forever. Revisit it when the *constraints* change: the team grows or turns over, the product's needs shift, or a real, measured problem appears that your current choice cannot solve. Boredom with the technology is not a reason. A measured problem is.

## The bottom line

Choose the stack you can build with, hire for, and maintain, and spend your appetite for novelty on the part of the product only you can build. Write the decision down, and the next person, probably you, will thank you.

If you are choosing a stack for a new product and want a second opinion, [get in touch](/#contact). I'm happy to talk through your constraints.
