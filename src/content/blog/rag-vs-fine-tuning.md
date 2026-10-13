---
title: RAG vs Fine-Tuning: How to Make an LLM Know Your Business
description: Retrieval-augmented generation and fine-tuning solve different problems. Here is how to choose between them, and why prompts should come first.
image: /blog/rag-vs-fine-tuning/cover.png
date: Oct 11, 2026
category: AI & Automation
order: 6
published: true
---

A question I hear constantly: "We want the AI to know our business. Should we fine-tune a model on our documents?"

It is a reasonable instinct, and it is usually the wrong first move. Teams often reach for fine-tuning to teach a model *facts*, then discover it is expensive, hard to update, and surprisingly unreliable at remembering them. Meanwhile, a simpler technique called retrieval-augmented generation (RAG) would have solved the problem in a fraction of the time.

The two techniques are not competitors so much as tools for different jobs. This post explains the difference, and gives you a simple way to choose.

## What each approach actually does

**Prompting** means giving the model clear instructions and examples at request time. It changes nothing about the model itself. It is the cheapest thing to try, and it is where every project should start.

**RAG** means that when a question arrives, your system first *searches your own data* for relevant passages, then includes them in the prompt so the model can answer from them. The model is unchanged, but it now has the right information in front of it.

**Fine-tuning** means continuing to train a model on your own examples so that its *behavior* shifts: its style, its output format, how it handles a narrow task. The model itself is changed.

The key idea is to separate **knowledge** from **behavior**:

- If the problem is that the model *doesn't know something*, you need to supply knowledge. That is RAG.
- If the problem is that the model *doesn't behave the way you want*, you may need to shape behavior. That is prompting first, and fine-tuning if prompting falls short.

![Comparison of better prompts, RAG and fine-tuning: what each is best for and what to watch out for](/blog/rag-vs-fine-tuning/three-levers.svg "Each lever solves a different problem. Try them in order.")

## Why RAG is usually the right answer for business knowledge

Most business questions are about information that is specific, private, and changing: your policies, your product documentation, your customers' records, last week's pricing. RAG fits that situation well for several reasons:

- **It stays current.** Update a document and the next answer reflects it. With fine-tuning, new information means another training run.
- **It can cite sources.** Because answers come from retrieved passages, you can show where they came from, which builds trust and makes errors easy to catch.
- **It respects permissions.** You can filter what is retrieved by what the current user is allowed to see. A fine-tuned model has no such control: whatever it learned, it can say.
- **It is easier to debug.** If an answer is wrong, you can look at what was retrieved and see whether the problem was the search or the model.

Fine-tuning, by contrast, tends to be a poor and unreliable way to add new facts. The model may absorb some of them, blur others, and confidently produce things that were never in your data, and you cannot easily see which is which.

## When fine-tuning earns its place

Fine-tuning is the right tool when you need the model to **behave consistently** in a way that prompts alone cannot achieve:

- A **strict output format or style** across thousands of requests, such as a particular report structure or brand voice.
- A **narrow, repetitive task** such as classifying support tickets into your own categories, where you have many labeled examples.
- **Cost or latency pressure,** where a smaller tuned model can match a larger general one on a specific task.

Be honest about the requirements. Fine-tuning needs good labeled data, a way to evaluate results, and a plan to retrain when your needs or the base model change. If you only have a handful of clean examples, or the task keeps changing, it is usually not worth it yet.

## A simple decision guide

![Decision tree: use RAG when answers depend on your own changing information, consider fine-tuning for consistent style or narrow behavior, otherwise better prompts may be enough](/blog/rag-vs-fine-tuning/decision.svg "Two questions cover most situations.")

In practice, the best systems often combine them: **RAG supplies the knowledge, and a well-prompted (sometimes tuned) model supplies the behavior.**

## What makes RAG work (or fail)

RAG looks simple in a diagram and is easy to get subtly wrong. Most disappointing RAG systems fail on retrieval, not on the model. These are the things to get right:

- **Chunk by meaning.** Split documents by headings and sections, not at arbitrary character counts. A chunk should make sense on its own.
- **Combine keyword and semantic search.** Semantic (vector) search finds related ideas, but misses exact terms like product codes and error messages. Hybrid search covers both.
- **Re-rank the results.** Retrieve a generous set of candidates, then rank them again so that the best few reach the model.
- **Cite sources and allow "I don't know."** If nothing relevant is found, the system should say so rather than guess.
- **Filter by permissions at retrieval time,** not after the fact.
- **Keep the index fresh.** Stale documents produce confidently wrong answers.

Here is the core of a RAG request in outline:

```ts
export async function answer(question: string, user: User) {
  // 1. Retrieve: only passages this user may see
  const passages = await search({ query: question, filter: { access: user.groups }, topK: 20 });
  const best = await rerank(question, passages, { keep: 5 });

  if (best.length === 0) return { answer: "I couldn't find that in our documents.", sources: [] };

  // 2. Generate: answer only from the retrieved text
  const reply = await callModel({
    system: "Answer using only the provided sources. If they don't contain the answer, say so.",
    context: best.map((p) => `[${p.id}] ${p.text}`).join("\n\n"),
    question,
  });

  return { answer: reply.text, sources: best.map((p) => p.id) };
}
```

## Measure before you decide

You do not have to guess which approach works. Build a small evaluation set of 50 to 100 real questions with the answers you would accept, and run each approach against it. Measure the things that matter to the business: correctness, how often the system says it doesn't know, and cost per answer.

Evaluate retrieval separately from generation. If the right passage never reaches the model, no prompt will fix the answer. Knowing which half is failing saves weeks.

## Privacy and cost, briefly

- **Data exposure.** Both approaches send your data to a model somewhere. Check your provider's data-handling terms, and minimize what you send. With RAG you control exactly which passages are included in each request.
- **Cost.** RAG adds search infrastructure and makes prompts longer. Fine-tuning adds data preparation, training runs, and retraining. Compare them on your actual volumes, not in the abstract.

## A practical order of operations

1. **Write a clear prompt with a few good examples.** Measure the result.
2. **Add RAG** if the model needs your information. Measure again.
3. **Consider fine-tuning** only if a specific behavior gap remains, and you have the data to close it.

## The bottom line

"Make the AI know our business" almost always means "give the model the right information at the right time," and that is retrieval, not training. Reach for fine-tuning when you need to change how the model behaves, not what it knows.

If you are deciding how to ground an AI feature in your own data, [get in touch](/#contact). I'm happy to look at your use case and suggest a starting point.
