---
title: AI Agents for Business: What Actually Works in Production
description: Agents can handle open-ended work, but most business problems don't need one. Here is how to choose the right level of autonomy, design the loop, and keep an agent safe.
image: /blog/ai-agents-for-business/cover.png
date: Oct 11, 2026
category: AI & Automation
order: 4
published: true
---

"Agent" has become the most overused word in software. Vendors use it for anything with a chat window, and teams are being asked to "add agents" before anyone has said what the agent should do.

Underneath the hype is a genuinely useful idea. An AI agent is a language model that can **decide which action to take next**, use tools to take it, look at the result, and repeat until a goal is met. That flexibility is powerful. It is also expensive, slower, and harder to control than a fixed workflow.

This post is about telling the two apart: when an agent earns its complexity, and how to build one you can trust with real work.

## Workflow or agent?

The most useful distinction is *who decides the next step*.

- In a **workflow**, your code decides. The steps are fixed, and the model is called at specific points to do language work such as classifying, summarizing, or drafting.
- In an **agent**, the model decides. Given a goal and a set of tools, it chooses what to do next, and how many steps to take.

![Spectrum of autonomy from fixed workflows, to AI inside a workflow, to a single agent, to multiple agents, with cost and risk rising to the right](/blog/ai-agents-for-business/autonomy-spectrum.svg "Autonomy is a spectrum. Most business problems are solved well toward the left.")

Moving right buys flexibility and costs you predictability. Each step to the right means more model calls, higher latency, higher bills, and more ways to fail in ways you did not anticipate.

That leads to a rule I follow: **start with the simplest design that could work, and move right only when it fails a real test.** A workflow with one or two model steps handles a surprising share of business tasks, including ticket triage, document extraction, and drafting replies.

## When an agent is the right tool

An agent earns its place when three things are true:

1. **The path is not known in advance.** The number and order of steps depend on what the agent finds along the way.
2. **The work spans several systems.** For example, looking up an order, checking a policy, and issuing a refund.
3. **Success can be checked.** You can tell whether the task was completed correctly, either automatically or by a quick human review.

Good examples include resolving a support request that needs data from several tools, researching a topic across many documents, and running multi-step operations such as reconciling records.

A poor fit is anything with a fixed procedure, anything where one wrong action is very costly and cannot be reviewed, and anything simple enough that a form and a few rules would do.

## The loop at the heart of an agent

Every agent, however it is packaged, runs the same cycle.

![Agent loop: decide the next step, act by calling a tool, observe the result, then check limits and approvals before deciding again](/blog/ai-agents-for-business/agent-loop.svg "The loop repeats until the goal is met, or a limit stops it.")

The "check" stage is the one teams forget, and it is the one that keeps an agent from becoming a liability. It is where you enforce limits, request approval for risky actions, and decide to stop.

Here is a compact version of the loop. The model client is deliberately generic, because the pattern matters more than the vendor.

```ts
const MAX_STEPS = 8;

export async function runAgent(goal: string, tools: ToolMap) {
  const messages = [{ role: "user", content: goal }];

  for (let step = 0; step < MAX_STEPS; step++) {
    const reply = await callModel({ messages, tools: describe(tools) });
    if (reply.type === "final") return reply.text;

    const tool = tools[reply.tool];
    if (!tool) {
      messages.push(toolError(reply, "Unknown tool"));
      continue;
    }

    // Irreversible actions need a human decision.
    if (tool.risk === "write" && !(await requestApproval(reply))) {
      return "Stopped: approval was denied.";
    }

    const result = await tool.run(reply.args).catch((e) => ({ error: String(e) }));
    messages.push(toolResult(reply, result));
  }

  return "Stopped: step limit reached."; // never loop forever
}
```

Three details here matter. There is a hard **step limit**. Write actions pass through an **approval gate**. And tool errors are **returned to the model as data** rather than crashing the run, so it can recover.

## Design tools like you design APIs

An agent is only as good as its tools. Most agent failures I see trace back to vague or overpowered tools, not to the model.

- **Keep tools small and specific.** `get_order(order_id)` beats a generic `run_query(sql)`.
- **Write clear descriptions.** The model decides what to call based on the name and description, so state what the tool does and when to use it.
- **Separate reading from writing.** Read-only tools are low risk. Tools that change things deserve extra checks.
- **Make actions idempotent.** If the agent retries, issuing the same refund twice should not be possible.
- **Return useful errors.** "Order not found: check the ID format" lets the agent correct itself.
- **Grant least privilege.** Give the agent only the permissions the task needs, ideally scoped to the current user.

If you want tools that work across applications, the [Model Context Protocol](https://modelcontextprotocol.io/) is an open standard for connecting AI applications to tools and data, and it is now [governed under the Linux Foundation](https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation). It is worth knowing about, but a standard does not replace the design discipline above.

## Guardrails that matter

Autonomy needs boundaries. These are the ones I put in before an agent touches anything real:

- **Step and time limits,** so a confused agent stops instead of looping.
- **A cost budget** per task, with an alert when it is approached.
- **Human approval** for irreversible or high-value actions such as payments, deletions, and outbound messages.
- **A sandbox** for anything that runs code or touches files.
- **Treat tool output as untrusted.** Web pages, emails, and documents can contain instructions meant to hijack the agent (prompt injection). Never let retrieved content change what the agent is allowed to do.
- **A complete trace** of every step, tool call, and result, so you can debug and audit.

## Test agents like software, not demos

A demo shows an agent succeeding once. Production needs to know how often it succeeds, and how it fails.

- **Build a task set** of realistic scenarios, including messy and adversarial ones, each with a clear definition of success.
- **Measure task success rate,** not just whether the answer sounds plausible.
- **Track cost and steps per task.** A correct answer that takes 30 steps may still be too expensive.
- **Read traces.** Reviewing where runs went wrong teaches you more than the pass rate does.
- **Re-run after every change** to a prompt, a tool, or a model.

## Common failure modes

| Failure | What it looks like | Mitigation |
| --- | --- | --- |
| Looping | The agent repeats the same action without progress | Step limits and loop detection |
| Wrong tool | It picks a plausible but incorrect tool | Fewer, clearer tools with strong descriptions |
| Invented arguments | It fabricates IDs or values | Validate arguments against a schema before running |
| Over-trusting output | It follows instructions found in a document | Treat retrieved content as data, never as commands |
| Silent partial success | It reports "done" after finishing only part of the task | Verify the end state, not the agent's claim |

## Roll out in stages

Do not start with full autonomy. Earn it.

1. **Read-only.** The agent investigates and reports. Nothing changes.
2. **Suggest.** It proposes actions, and a person performs them.
3. **Act with approval.** It performs actions after a human confirms each one.
4. **Act on its own** for low-risk, well-tested actions, with monitoring in place.

Each stage produces data on how the agent behaves, and tells you when it is safe to move on.

## The bottom line

The question is rarely "should we use agents?" It is "how much autonomy does this task actually need?" Most of the time the answer is a workflow with a model in the right place. When the path really is open-ended, an agent with small tools, firm limits, and a human in the loop can do real work reliably.

If you are deciding where an agent fits in your product or operations, [get in touch](/#contact). I'm happy to help you scope the first one.
