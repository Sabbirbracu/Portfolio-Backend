---
title: How to Ship an MVP in 8 Weeks
description: A practical plan for getting a real product in front of real users in two months: define the one thing to test, cut ruthlessly, and launch before it feels ready.
image: /blog/ship-an-mvp-in-8-weeks/cover.png
date: Oct 11, 2026
category: SaaS Architecture
order: 7
published: true
---

Most startups do not fail because they shipped too little. They fail because they spent a year building something nobody wanted, and found out too late.

A minimum viable product, an MVP, exists to prevent that. Not to impress anyone, and not to be a smaller version of the dream product. Its only job is to answer one question as cheaply and quickly as possible: *does this idea work for real people?*

Eight weeks is a good constraint. It is long enough to build something real, and short enough to force hard decisions. Here is how I approach it with founders.

## What an MVP actually is

The word "minimum" gets ignored and the word "viable" gets misread. An MVP is not a buggy prototype, and it is not a feature-light copy of an existing product.

An MVP is **the smallest product that tests your riskiest assumption** with real users. Everything in it should exist because removing it would stop the test from working.

So the first question is not "what should we build?" It is "what is the thing we are most afraid is false?" Perhaps it is that customers will pay. Perhaps it is that they will change their habits. Perhaps it is that the core task can be done well enough, cheaply enough. The MVP is designed around that question.

## The plan

![Eight-week MVP timeline in four phases: discover and scope, build the core loop, harden and connect, launch and learn](/blog/ship-an-mvp-in-8-weeks/eight-week-plan.svg "Four two-week phases, each ending with something you can show.")

### Weeks 1 and 2: discover and scope

Resist the urge to open an editor. Spend this time making the build smaller.

- **Talk to real target users,** not friends. Understand how they handle the problem today, and what it costs them.
- **Choose one core workflow:** the single journey from "new user" to "got the value." If you cannot describe it in two sentences, it is too big.
- **Write the cut list.** Decide now what you will *not* build, and write it down. This is the most valuable document of the project.
- **Pick boring technology** you already know. This is not the time to learn a new stack.

### Weeks 3 and 4: build the core loop

Build the one workflow, end to end, even if it is ugly. A thin path that works from sign-up to value beats ten polished screens that do not connect.

- Get a **working version in front of someone every week.** Weekly demos expose misunderstandings while they are still cheap to fix.
- Hard-code and fake whatever you can. A hard-coded list is fine if the real data is not what you are testing.

### Weeks 5 and 6: harden and connect

Now make it safe to put in front of strangers.

- Add the **path to payment or contact:** a way to charge, or at least a way to capture interest.
- Handle **errors, edge cases, and emails.** Nobody forgives a product that loses their data or never confirms their sign-up.
- Put it in front of **a small group of real users,** and watch them use it. What confuses them is your next priority.

### Weeks 7 and 8: launch and learn

Launch to a defined audience, not "the internet." A few hundred people who match your target customer will teach you far more than thousands who do not.

Decide in advance **what success looks like** and which numbers you will watch. Then collect real behavior. What people do tells you more than what they say.

## Sorting every feature request

The hardest part is not building. It is saying no, repeatedly. A useful way to do it is to sort every idea into three buckets.

![Three columns for sorting features: build now, do by hand, and not yet](/blog/ship-an-mvp-in-8-weeks/scope-triage.svg "Most ideas belong in the second or third column.")

- **Build now:** the workflow that proves the idea, sign-up and login, and a way to get paid or get in touch.
- **Do by hand:** anything you can run manually or from a spreadsheet for your first customers. Onboarding emails, reports, exports, even parts of the core service.
- **Not yet:** admin dashboards, settings pages, integrations nobody has asked for.

The middle column is the secret weapon. Doing something by hand for your first twenty customers teaches you exactly how it should work, and tells you whether it is worth automating at all. Many successful products began as a person behind a curtain.

## Choosing what to build with

For a small team racing a deadline, the stack matters less than familiarity. A few principles:

- **Use what you know.** Learning curves are deadlines in disguise.
- **Buy, don't build,** for anything undifferentiated: authentication, payments, email delivery, file storage.
- **Use one deployable application** and one database. You do not need microservices to find out whether people want your product.
- **Keep the data model clean,** because that is the part that is painful to change later. Everything else can be rough.

## The traps that sink MVPs

- **Gold plating.** Spending weeks on animations and edge-case polish before anyone has confirmed they want the product.
- **Building the admin panel first.** It is invisible to customers, and you can do most of it from a database console.
- **Scope creep, one reasonable request at a time.** Every addition is small. Together they are a missed launch.
- **Waiting until it feels ready.** It never will. If you are not slightly embarrassed by the first version, you probably launched late.
- **Measuring vanity numbers.** Sign-ups are easy to get. Repeat use and willingness to pay are the signals that matter.

## A launch checklist

Before you open the doors, confirm that:

- The core workflow works from a fresh account, on a phone and on a laptop.
- Errors are handled gracefully, and you will be told when something breaks.
- You can contact users, and they can contact you.
- Payments, if included, work and have been tested end to end.
- Backups exist, and you have tested a restore.
- Basic security is in place, including hashed passwords, HTTPS, and access checks on every request.
- You know which two or three numbers will tell you whether to continue.

## After launch

The MVP is not the finish line. It is the start of a feedback loop. Watch how people actually use it. Talk to the ones who stay, and, even more usefully, to the ones who leave. Then decide with evidence whether to double down, change direction, or stop.

Stopping early, when the evidence says to, is a success of the process. It saves you the year you would otherwise have spent.

## The bottom line

An MVP is a question, not a product. Define the one thing you need to learn, cut everything that does not help you learn it, and launch while it still feels a little too early.

If you have an idea and want help scoping an eight-week build, [get in touch](/#contact). I'm happy to help you decide what belongs on the cut list.
