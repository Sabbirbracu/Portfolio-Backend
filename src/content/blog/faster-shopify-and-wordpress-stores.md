---
title: Faster Shopify and WordPress Stores
description: Where store speed is really lost, and a repeatable audit for winning it back: images, apps and plugins, theme code, and caching.
image: /blog/faster-shopify-and-wordpress-stores/cover.png
date: Oct 11, 2026
category: Performance
order: 9
published: true
---

An online store lives or dies on how quickly it feels. Shoppers are impatient, mobile connections are uneven, and a product page that stutters sends people straight back to the search results.

The frustrating part is that most slow stores did not start slow. They got slow gradually: one more app, one more plugin, one more banner, one more high-resolution photo. Nobody decided to make the site heavy. It just accumulated.

The fix is rarely a rebuild. It is an audit: find what is actually slow, remove what you don't need, and optimize what remains. This guide covers both Shopify and WordPress with WooCommerce, because the causes are surprisingly similar.

## Measure before you change anything

Guessing wastes time. Start by measuring the pages that matter: the home page, a collection or category page, and a product page.

- **PageSpeed Insights** reports both lab data (a simulated test) and, when available, field data from real visitors. Treat the field data as the truth, and use the lab data to diagnose.
- **Lighthouse** in Chrome DevTools gives a detailed breakdown and a list of specific opportunities.
- **Test on a mid-range phone and a slow connection,** because that is what many of your shoppers use.

Write down the numbers. The three that matter most are Largest Contentful Paint (how fast the main content shows), Interaction to Next Paint (how responsive the page is), and Cumulative Layout Shift (whether things jump around). If you want the details, [web.dev explains each](https://web.dev/articles/vitals).

## Where the speed actually goes

On almost every store I look at, the same four culprits appear.

![Four common causes of slow online stores: images, apps and plugins, theme code, and server and cache](/blog/faster-shopify-and-wordpress-stores/where-speed-goes.svg "The same four culprits show up on almost every audit.")

Work through them in order, because the first two usually deliver the biggest gains for the least effort.

## 1. Images

Product photography is the heart of a store, and also its heaviest asset. Common problems:

- **Originals uploaded at full camera size,** then squeezed into a small space by CSS.
- **Old formats.** Modern formats such as WebP and AVIF are much smaller than JPEG for similar quality.
- **Everything loading at once,** including images far below the visible screen.

What to do:

- **Resize before uploading.** A product image rarely needs to be wider than about 2,000 pixels.
- **Serve the right size for each screen.** On Shopify, the theme can request exactly the width it needs:

```liquid
{{ product.featured_image
  | image_url: width: 800
  | image_tag:
      widths: '400, 600, 800',
      sizes: '(min-width: 990px) 50vw, 100vw',
      loading: 'lazy' }}
```

- **Do not lazy-load the main image** at the top of the page. That image is usually your Largest Contentful Paint, so load it eagerly and mark it as high priority (`loading: 'eager', fetchpriority: 'high'`).
- **Lazy-load everything below the fold.**
- **On WordPress,** recent versions can upload and serve WebP and AVIF, and an image optimization plugin or CDN can convert and resize automatically.

See the [Shopify `image_tag` reference](https://shopify.dev/docs/api/liquid/filters/image_tag) for the options.

## 2. Apps and plugins

Every app or plugin you install is someone else's code running on your storefront. Many add scripts and stylesheets to *every* page, even when the feature is used on only one.

- **List everything installed,** and ask of each one: is this used? Is it earning its keep?
- **Uninstall what you don't need.** On Shopify, removing an app does not always remove the code it injected into your theme. Check for leftover snippets and scripts, and remove them carefully, or ask a developer to.
- **Prefer built-in features** over an app when the platform already does the job.
- **Load only where needed.** Review pages with a profiler: in WordPress, the free Query Monitor plugin shows which plugins add queries and assets.
- **Delay non-essential scripts,** such as chat widgets, review carousels, and tracking pixels, until after the page is usable.

On WooCommerce, a common win is to stop loading shop-specific assets on pages that are not part of the shop:

```php
add_action('wp_enqueue_scripts', function () {
    if (!is_woocommerce() && !is_cart() && !is_checkout()) {
        wp_dequeue_style('woocommerce-general');
        wp_dequeue_script('wc-cart-fragments');
    }
}, 99);
```

Test carefully after a change like this. Anything that relies on those scripts, such as a mini-cart in your header, may stop updating.

## 3. Theme and code

A heavy theme can undo everything else.

- **Choose a lightweight, well-maintained theme.** On Shopify, current Online Store 2.0 themes are built with performance in mind. On WordPress, avoid multipurpose themes that ship dozens of features you will never use.
- **Cut decorative weight:** large sliders, auto-playing video, parallax effects, and heavy animations.
- **Limit fonts.** Each extra family and weight is another file to download.
- **Remove unused CSS and JavaScript** where you can, or delay it.
- **Avoid layout shift.** Give images and embeds explicit dimensions so the page does not jump as it loads.

## 4. Server, caching, and delivery

Once the page itself is lean, the way it is delivered matters.

- **Shopify** handles hosting and a global content delivery network for you, so your leverage is mostly in the theme, images, and apps. The checkout is hosted by Shopify too.
- **On WordPress and WooCommerce,** hosting quality is a real factor. A slow shared server will limit everything. Use good hosting, **page caching,** an **object cache** for database-heavy pages, and a **CDN** for static assets.
- **Keep the database tidy.** Old revisions, expired transients, and bloated settings tables slow down every request.
- **Keep PHP and platform versions current,** since newer versions are generally faster and safer.

## A repeatable speed audit

Speed is not a one-off project. It decays as stores change. Run this loop on a schedule, and before any big campaign.

![Speed audit loop: measure, remove, optimize and verify](/blog/faster-shopify-and-wordpress-stores/audit-loop.svg "Change one thing at a time, so you know what actually helped.")

1. **Measure** your key pages and record the baseline.
2. **Remove** unused apps, plugins, and leftover code.
3. **Optimize** images, scripts, and caching.
4. **Verify** by re-testing against the baseline, and keep what worked.

Change one thing at a time. If you change five and the score improves, you will not know which one mattered, or which one helped and which one quietly hurt.

## Quick wins checklist

- Resize and compress product images, and use modern formats.
- Do not lazy-load the main image. Lazy-load the rest.
- Remove unused apps and plugins, and their leftover code.
- Delay chat, reviews, and tracking scripts until after load.
- Limit fonts to what the design needs.
- Turn on caching and a CDN (WordPress and WooCommerce).
- Re-test on a mid-range phone, and compare to your baseline.

## The bottom line

A fast store is mostly a lean store. Images and add-ons account for most of the weight, so start there, measure honestly, and make changes one at a time. The result is a store that feels instant, and shoppers who stay long enough to buy.

If your store feels slower than it should and you'd like a hand with an audit, [get in touch](/#contact). I'm happy to take a look.
