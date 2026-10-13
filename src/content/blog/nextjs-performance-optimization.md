---
title: Next.js Performance Optimization
description: From slow to instant: a measure-first guide to Core Web Vitals, rendering strategy, JavaScript weight, and data-fetching waterfalls in Next.js.
image: /blog/nextjs-performance-optimization/cover.png
date: Oct 11, 2026
category: Performance
order: 3
published: true
---

Speed is a feature your users never mention until it's missing. Slow pages lose visitors, hurt conversion, and drag down search visibility. The good news is that most Next.js performance problems come from a short list of causes, and each has a known fix.

The bad news is that optimizing without measuring is superstition. You can spend a week shaving a bundle that was never the bottleneck. So this guide follows one rule: **measure, change one thing, measure again.**

## Measure first: the three numbers that matter

Google's Core Web Vitals reduce user-perceived performance to three metrics. Each is judged at the **75th percentile of real visits**, meaning that three out of four of your users should have a good experience.

![Core Web Vitals thresholds: LCP good up to 2.5 seconds, INP good up to 200 milliseconds, CLS good up to 0.1, with needs-improvement and poor ranges](/blog/nextjs-performance-optimization/core-web-vitals.svg "Thresholds as published on web.dev. Field data from real users is what counts.")

- **LCP (Largest Contentful Paint)** measures how quickly the main content appears. Aim for 2.5 seconds or less.
- **INP (Interaction to Next Paint)** measures how quickly the page responds when someone clicks, taps, or types. Aim for 200 milliseconds or less. It replaced First Input Delay as a Core Web Vital in March 2024.
- **CLS (Cumulative Layout Shift)** measures how much the layout jumps while loading. Aim for 0.1 or less.

You'll use two kinds of data:

- **Lab data** comes from tools like Lighthouse and the Chrome DevTools Performance panel. It's repeatable and great for debugging, but it simulates one device on one connection.
- **Field data** comes from real visitors, through the Chrome User Experience Report, PageSpeed Insights, or an analytics tool such as Vercel Speed Insights. It reflects what users actually feel, and it's what search engines look at.

Start by recording a baseline for your most important pages. Read [web.dev's guide to the Core Web Vitals](https://web.dev/articles/vitals) if you want the details of how each is measured.

## Choose the right rendering strategy

The fastest page is the one that doesn't need to be built when the user asks for it. Next.js gives you several options, and choosing deliberately is the biggest single lever.

![Decision tree for choosing static, revalidated or dynamic rendering, and keeping client components to interactive leaves](/blog/nextjs-performance-optimization/rendering-decision.svg "Start static, and add dynamism only where the content demands it.")

- **Static.** If the page is the same for every visitor and only changes when you deploy, prerender it and serve it from the CDN. It's the fastest option.
- **Revalidated (ISR).** If content changes occasionally, such as a blog or a product catalog, prerender it and refresh it on a timer or on demand by tag.
- **Dynamic.** If the page depends on the request (a user's session, cookies, or search params), render it per request, and use streaming so the user isn't staring at a blank screen.

Refreshing a page at most once an hour looks like this:

```tsx
// app/articles/page.tsx
export const revalidate = 3600; // seconds

export default async function ArticlesPage() {
  const articles = await getArticles();
  return <ArticleList articles={articles} />;
}
```

For dynamic pages, stream the slow part and let the rest appear immediately:

```tsx
import { Suspense } from "react";

export default function Dashboard() {
  return (
    <>
      <Header /> {/* renders instantly */}
      <Suspense fallback={<StatsSkeleton />}>
        <Stats /> {/* slow query streams in when ready */}
      </Suspense>
    </>
  );
}
```

One caution: caching defaults have changed between Next.js versions. Next.js 15 stopped caching `fetch` requests by default, and Next.js 16 moved to an opt-in model built around Cache Components and the `"use cache"` directive. Check the [caching documentation](https://nextjs.org/docs/app/getting-started/caching) for the version you're running before you rely on any default.

Inside a page, keep **Server Components** as the default and use `"use client"` only on the small interactive pieces, such as a dropdown or a form, not on whole page layouts. Everything that stays on the server is JavaScript the browser never has to download.

## Fix LCP: get the main content on screen faster

Most LCP elements are a hero image, a large heading, or a big block of text. First identify yours: the Performance panel in Chrome DevTools labels the LCP element. Then work through these:

- **Prioritize the LCP image.** Use `next/image` so you get responsive sizes and modern formats, and tell the browser the image is important. In Next.js 15 that's the `priority` prop. From Next.js 16, `priority` is deprecated in favor of `preload`, and the docs suggest `loading="eager"` or `fetchPriority="high"` for most LCP images. Apply it to the one LCP image only, never to all of them.
- **Set `sizes` correctly.** Without it, the browser may download an image far larger than it displays.
- **Load fonts with `next/font`.** It self-hosts fonts and avoids an extra network round trip.
- **Lower server response time.** A slow database query or an uncached API call delays everything. Add indexes, cache where it's safe, and serve from a region close to your users.
- **Don't hide content behind client-side fetching.** If the main content only appears after JavaScript runs and then fetches data, LCP suffers. Fetch on the server instead.

[web.dev's LCP optimization guide](https://web.dev/articles/optimize-lcp) breaks LCP into its sub-parts, which makes it much easier to see where the time goes.

## Fix INP: keep the main thread free

Poor INP almost always means the browser's main thread is busy when the user tries to interact. The cause is typically too much JavaScript running at the wrong time.

- **Ship less JavaScript** (see the next section). Less code to parse and execute means a more responsive page.
- **Break up long tasks.** A single operation that blocks for 200 milliseconds makes the page feel frozen. Split heavy work, or move it off the main thread.
- **Mark non-urgent updates.** In React, wrap expensive state updates in `startTransition` so typing and clicking stay responsive.
- **Virtualize long lists.** Rendering thousands of rows at once is slow to build and slow to update.
- **Delay third-party scripts.** Analytics, chat widgets, and tag managers are frequent culprits. Load them with `next/script` and a strategy like `lazyOnload`.

Read [web.dev's INP guide](https://web.dev/articles/inp) for how to find and diagnose slow interactions.

## Fix CLS: stop the layout from jumping

Layout shift comes from content that changes size after the page has started to render.

- **Give images and videos dimensions,** or use `next/image` with `width` and `height` (or `fill` inside a sized container), so the browser reserves the space up front.
- **Reserve space for anything that loads late:** embeds, banners, ads, and cookie notices.
- **Never insert content above what the user is already reading** unless they triggered it.
- **Avoid font swaps that reflow text.** `next/font` adjusts fallback font metrics to minimize the shift.

## Ship less JavaScript

JavaScript is the most expensive thing you send to a browser, because it has to be downloaded, parsed, and executed, and it competes with user interaction.

Start by seeing what you're shipping. Add `@next/bundle-analyzer`, build, and look for surprises: a date library pulled in whole, a charting package on a page that doesn't show charts, a duplicated dependency.

Then act on what you find:

```tsx
import dynamic from "next/dynamic";

// Load a heavy, below-the-fold widget in its own chunk, only when it's rendered.
const SalesChart = dynamic(() => import("./SalesChart"), {
  loading: () => <ChartSkeleton />,
});
```

For a widget that only works in the browser, use the same pattern inside a Client Component with `ssr: false`; Next.js doesn't allow that option in Server Components.

- **Replace heavy libraries** with lighter ones, or with native browser APIs.
- **Keep `"use client"` boundaries small.** Every client component pulls its dependencies into the browser bundle.
- **Import only what you use** from large packages, so unused code can be removed during the build.

## Stop data-fetching waterfalls

A waterfall happens when requests that don't depend on each other run one after another. It's one of the most common and most fixable causes of slow pages.

![Timeline comparing three sequential data fetches taking about 1000 milliseconds against the same three fetches run in parallel taking about 400 milliseconds](/blog/nextjs-performance-optimization/request-waterfall.svg "The timings are illustrative. The principle is that independent requests should start together.")

```tsx
// Slow: each request waits for the previous one
const user = await getUser(id);
const orders = await getOrders(id);
const recommendations = await getRecommendations(id);

// Fast: independent requests start together
const [user, orders, recommendations] = await Promise.all([
  getUser(id),
  getOrders(id),
  getRecommendations(id),
]);
```

When one request genuinely depends on another, you can't parallelize it. But you can still stream: show the page shell, then let each section arrive as it's ready.

## Verify, then keep it fast

Optimizations decay. A new dependency, an unoptimized image, or a third-party script can undo weeks of work.

- **Re-measure after each change,** using the same pages and the same conditions as your baseline.
- **Watch field data after deploys.** It takes days to reflect changes, so don't judge from a single lab run.
- **Set performance budgets in CI.** Fail a build when bundle size or a Lighthouse score regresses past a threshold.
- **Review the numbers regularly,** not just when someone complains.

## A quick checklist

- Baseline recorded: LCP, INP, and CLS on key pages, from real-user data where possible.
- Static or revalidated rendering wherever content allows; streaming for the rest.
- One prioritized LCP image, correct `sizes`, fonts through `next/font`.
- Small `"use client"` boundaries; heavy widgets loaded dynamically.
- Third-party scripts delayed; long lists virtualized.
- Independent requests run in parallel.
- Budgets in CI, and field data checked after every release.

## The bottom line

A fast Next.js app is rarely the result of one clever trick. It comes from choosing the right rendering strategy, sending less JavaScript, fetching data without waterfalls, and measuring honestly at every step.

If your site or web app feels slower than it should and you'd like a second set of eyes, [get in touch](/#contact). I'm happy to run through the numbers with you.
