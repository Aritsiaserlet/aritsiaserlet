# Architectural and Algorithmic Optimization Plan

## Overview
Based on an analysis of the site's current context and modern web performance best practices, this document outlines a detailed, step-by-step architectural and algorithmic plan to eliminate lag on mobile devices. The strategy focuses on unblocking the main thread, optimizing media delivery, reducing DOM complexity, and leveraging GPU-accelerated rendering.

---

## Step 1: Asset and Media Optimization (Quick Wins)
The site currently serves extremely large assets (e.g., a 367KB `favicon.jpg`) and a potentially heavy background video.

### Architectural Changes:
1. **Favicon & Images**: 
   - Convert `favicon.jpg` to an optimized `.ico`, `.png`, or `.svg` (should be < 10KB).
   - Migrate all raster imagery (gallery thumbnails, background assets) to next-generation formats like **WebP** or **AVIF**.
   - Implement responsive images using `<picture>` tags or `srcset`/`sizes` attributes to ensure mobile devices download appropriately scaled-down assets.
2. **Lazy Loading**: Ensure all off-screen images have the `loading="lazy"` attribute. Avoid lazy-loading above-the-fold content.
3. **Background Video Optimization**: 
   - Transcode the `<video id="customBgVideo">` using highly efficient codecs (VP9 or AV1) with an H.264 fallback.
   - **Crucial**: Strip the audio track from the video file entirely, rather than just using the `muted` attribute. This dramatically reduces file size and decoding overhead.

### Algorithmic Considerations:
- **Conditional Rendering**: Implement a script that checks the user agent or `window.matchMedia('(max-width: 768px)')`. On mobile devices or when battery saving mode is detected (`navigator.getBattery()`), replace the video background entirely with a high-quality static WebP poster image to save CPU/GPU cycles.

---

## Step 2: Render-Blocking Resource Mitigation
Scripts loaded synchronously in the `<head>` block HTML parsing, delaying the First Contentful Paint (FCP) and making the site feel unresponsive.

### Architectural Changes:
1. **Script Deferral**: Update the HTML document to add the `defer` attribute to `toastManager.js`, `index.js`, `portfolio-ozonz-live.js`, and any other main bundles. This ensures they download in the background and execute only after the DOM is fully constructed.
2. **Third-Party Async**: Any analytics or independent tracking scripts should use the `async` attribute.
3. **Font Preconnecting**: Add network hints for Google Fonts to reduce DNS/TLS negotiation latency:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   ```
   Add `font-display: swap` to CSS `@font-face` declarations to prevent invisible text during font loading.

---

## Step 3: DOM Size and Rendering Architecture
The site dynamically loads gallery works. Rendering too many DOM elements simultaneously causes severe memory bloat and layout calculation lag on mobile.

### Architectural Changes:
1. **Virtual Scrolling / Windowing**: Overhaul the gallery rendering architecture. Instead of continuously appending new DOM nodes as the user scrolls, implement a virtualized list.

### Algorithmic Implementation (Virtual Scroller):
- **State Management**: Maintain a JavaScript array of all gallery item data (the "model").
- **View Buffer**: Calculate how many items can fit in the viewport, plus a small buffer (e.g., 2 items above, 2 items below).
- **Recycling Nodes**: Instantiate only the exact number of DOM nodes required for the buffer. 
- **Scroll Event**: Listen to scroll events (throttled via `requestAnimationFrame`). As the user scrolls, use absolute positioning (`transform: translateY(...)`) to move existing, out-of-view DOM nodes to the bottom/top of the list and update their inner content with the next data model. This keeps the total DOM node count fixed and extremely low.
- **DocumentFragment**: When initially rendering the initial batch of elements, attach them to a `DocumentFragment` in memory, then append the fragment to the DOM in a single operation to avoid forced synchronous layouts.

---

## Step 4: Animation and Rendering Engine Overhaul
Animations driven by JS or non-compositor CSS properties cause heavy CPU layout recalculations ("jank").

### Architectural Changes:
1. **GPU-Accelerated CSS**: Audit all CSS and JS animations. Replace any animations modifying `width`, `height`, `top`, `left`, `margin`, or `padding` with `transform` (`translate`, `scale`, `rotate`) and `opacity`. These properties are handled by the GPU compositor.
2. **Animation Loop Synchronization**: Ensure `wind-vfx.js` and `game.js` strictly use `window.requestAnimationFrame()` for their animation loops. Never use `setInterval` or `setTimeout` for visual updates.

### Algorithmic Considerations (Intersection Observers):
- **Culling Off-Screen VFX**: Implement an `IntersectionObserver`. If the canvas or container for `wind-vfx.js` or the game logic is not currently intersecting the viewport, pause the `requestAnimationFrame` loop entirely. Resume it only when the user scrolls back. This instantly frees up the main thread when the VFX are out of sight.

---

## Step 5: Main Thread Execution Optimization
Complex JavaScript tasks can block the single main thread, freezing the UI.

### Architectural Changes:
1. **Event Throttling**: Review global event listeners (scroll, resize, mousemove). Wrap their execution logic in a throttling utility or `requestAnimationFrame` to ensure they execute no more than once per frame (60 times a second max).
2. **Eliminate Layout Thrashing**: Audit `portfolio-ozonz-live.js` and `game.js` for interleaving DOM reads (`.offsetWidth`, `.getBoundingClientRect()`) and writes (`element.style...`). Refactor functions to perform all necessary DOM reads in one batch, store the values, and then perform all DOM writes in a subsequent batch.

### Advanced Optimization (Web Workers):
- If `game.js` or gallery sorting/filtering requires heavy computational logic, offload this data processing to a **Web Worker**. Let the Worker process the data and pass the finalized arrays back to the main thread via `postMessage`. This guarantees the UI thread remains completely fluid.

---

## Summary of Priority Execution
1. **High Impact, Low Effort**: Fix script loading (`defer`), preconnect fonts, compress/resize `favicon.jpg`, and strip audio from the background video.
2. **High Impact, Medium Effort**: Convert layout-triggering animations to use `transform`/`opacity`. Pause off-screen `requestAnimationFrame` loops using `IntersectionObserver`.
3. **High Impact, High Effort**: Implement Virtual Scrolling for the gallery DOM nodes to ensure perfect performance on low-end mobile devices regardless of gallery size.
