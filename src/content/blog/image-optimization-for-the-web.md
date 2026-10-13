---
title: Image Optimization for the Web
description: Choosing formats, sizing images for every screen, and delivering them efficiently, with practical code you can use today.
image: /blog/image-optimization-for-the-web/cover.png
date: Oct 11, 2026
category: Performance
order: 10
published: true
---

Images are usually the heaviest thing on a web page, and the easiest place to win back speed. A single oversized photo can outweigh all of a page's code combined, and it is often the very element that decides how fast the page *feels*.

The good news is that image optimization follows a small number of rules that apply everywhere, whether you are working in a hand-written site, a CMS, or a framework. This guide covers the decisions that matter: format, size, loading, and delivery.

## Why images dominate performance

Images affect all three Core Web Vitals:

- **Largest Contentful Paint (LCP).** The main image on a page, often a hero or product photo, is frequently the largest element, so its load time is the page's LCP.
- **Cumulative Layout Shift (CLS).** Images that load without reserved space push content around as they appear.
- **Interaction responsiveness.** Decoding very large images can occupy the browser at the wrong moment.

So the goals are simple: send fewer bytes, send them in the right size, and tell the browser early what it needs.

## Pick the right format

There is no single best format. Choose by what the image *is*.

![Image formats compared: JPEG and PNG, WebP, AVIF and SVG, with what each is best for](/blog/image-optimization-for-the-web/format-guide.svg "Pick by content type, then serve the smallest format the browser supports.")

- **JPEG** suits photographs, and **PNG** suits sharp graphics and images needing transparency. Both work everywhere, which makes them the dependable fallback, but their files are larger than newer formats.
- **WebP** is a strong default for both photos and graphics, with support for transparency and animation. It is supported by all current major browsers.
- **AVIF** often produces the smallest files for photographs at a given quality. It takes longer to encode, and, while support is broad, you should still keep a fallback.
- **SVG** is for logos, icons, and illustrations. It is vector-based, so it stays sharp at any size and is tiny. If users can upload SVGs, sanitize them, because they can contain scripts.

For animated content, avoid large animated GIFs. A short looping video is dramatically smaller, and plays the same.

## Serve modern formats with a safe fallback

You do not have to choose one format for everyone. The `<picture>` element lets the browser pick the first format it understands:

```html
<picture>
  <source srcset="/img/hero-1200.avif" type="image/avif" />
  <source srcset="/img/hero-1200.webp" type="image/webp" />
  <img
    src="/img/hero-1200.jpg"
    width="1200"
    height="630"
    alt="A designer reviewing a storefront on a laptop"
  />
</picture>
```

Browsers that support AVIF take the first source, those with WebP take the second, and anything else falls back to the JPEG in the `<img>` tag. The [MDN guide to the picture element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/picture) covers the details.

## Send the right size for each screen

A phone with a 400-pixel-wide image slot does not need a 2,400-pixel-wide file. Sending one anyway wastes bandwidth and slows the page.

Responsive images solve this. You provide several widths, and describe how wide the image will be displayed. The browser then picks the smallest file that still looks sharp on that screen:

```html
<img
  src="/img/product-800.webp"
  srcset="/img/product-400.webp 400w,
          /img/product-800.webp 800w,
          /img/product-1600.webp 1600w"
  sizes="(min-width: 1000px) 50vw, 100vw"
  width="800"
  height="800"
  alt="Ceramic coffee mug in matte green"
/>
```

- **`srcset`** lists the available files and their widths.
- **`sizes`** tells the browser how wide the image will appear at different viewport widths. Without it, the browser assumes the image fills the whole screen, and often downloads more than needed.

The [MDN guide to responsive images](https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Responsive_images) explains the logic in depth.

## Build the pipeline once

Do not resize images by hand. Generate the variants automatically, from a single high-quality master.

![Responsive image pipeline: master image, resize, describe with srcset and sizes, deliver from a CDN](/blog/image-optimization-for-the-web/responsive-pipeline.svg "Do the work once at build time, and let the browser choose.")

Here is a small Node script using the `sharp` library to generate several widths in two formats:

```js
import sharp from "sharp";

const widths = [400, 800, 1600];

for (const width of widths) {
  const image = sharp("master/product.jpg").resize({ width, withoutEnlargement: true });

  await image.clone().webp({ quality: 78 }).toFile(`public/img/product-${width}.webp`);
  await image.clone().avif({ quality: 55 }).toFile(`public/img/product-${width}.avif`);
}
```

Quality settings are a trade-off, not a formula. Start around the values above, compare the results with your own eyes on real photos, and lower the number until you start to notice a difference, then step back a little.

If you use a framework, many include this for you. In Next.js, for example, the `next/image` component resizes, converts to modern formats, and lazy-loads automatically.

## Tell the browser what matters

How and when an image loads can matter as much as its size.

- **Always include `width` and `height`** (or an aspect ratio in CSS). The browser reserves the space before the image arrives, which prevents layout shift.
- **Lazy-load images below the fold** with `loading="lazy"`, so they download only when the visitor scrolls near them.
- **Never lazy-load the main image.** The image that will be your LCP should load right away. Mark it with `fetchpriority="high"` so the browser fetches it first. [web.dev explains Fetch Priority](https://web.dev/articles/fetch-priority) well.
- **Use `decoding="async"`** for images that are not critical, so decoding does not block other work.

```html
<!-- The hero: load immediately, with high priority -->
<img src="/img/hero-1200.webp" width="1200" height="630" fetchpriority="high" alt="..." />

<!-- Below the fold: wait until needed -->
<img src="/img/gallery-1.webp" width="800" height="600" loading="lazy" decoding="async" alt="..." />
```

## Deliver efficiently

Once the files are small and well-described, make sure they travel well.

- **Use a CDN,** so images are served from a location near the visitor.
- **Cache aggressively.** If your file names include a content hash (for example `hero.3f9a1c.webp`), you can safely tell browsers to keep them for a year: `Cache-Control: public, max-age=31536000, immutable`.
- **Compress and strip metadata.** Camera files can carry location data and large embedded previews that no visitor needs, and that can leak private information.
- **Prefer HTTP/2 or HTTP/3,** which handle many parallel requests well, and avoid shipping everything in one giant sprite out of habit.

## Don't forget accessibility and SEO

Optimization should never come at the cost of usability.

- **Write meaningful `alt` text** that describes the image's purpose. Leave it empty (`alt=""`) for purely decorative images, so screen readers skip them.
- **Avoid putting important text inside images.** It cannot be searched, translated, resized, or read aloud reliably.
- **Use descriptive file names,** such as `green-ceramic-mug.webp` rather than `IMG_4821.webp`.

## A quick checklist

- Pick the format by content type, and serve AVIF or WebP with a fallback.
- Generate several widths, and describe them with `srcset` and `sizes`.
- Set `width` and `height` on every image.
- Lazy-load below the fold, and load the hero eagerly with `fetchpriority="high"`.
- Serve from a CDN with long-lived, hashed caching.
- Replace animated GIFs with short videos.
- Write useful alt text.

## The bottom line

Image optimization is one of the highest-return performance tasks, because it is mostly mechanical: right format, right size, right moment. Automate it once, and every image you add afterward is fast by default.

If you want a hand setting up an image pipeline or speeding up an existing site, [get in touch](/#contact). I'm happy to help.
