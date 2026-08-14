# Web Performance Optimization for Mobile Lag

This document outlines research and best practices for optimizing frontend web applications (HTML, JS, CSS, Media) to reduce lag on mobile devices and in slow network conditions. Mobile devices typically have more constrained CPU, memory, and network capabilities compared to desktops, making performance optimization critical.

## 1. Reducing Main Thread Blocking (JS Execution)

The browser's main thread is responsible for handling user interactions, rendering frames, and executing JavaScript. Because JavaScript is single-threaded, any "long task" (taking longer than 50ms) blocks the main thread, leading to unresponsive UI and stuttering.

### Strategies:
*   **Break Up Long Tasks:** Avoid monolithic blocks of code. Use `setTimeout` or `requestIdleCallback` to yield control back to the main thread between chunks of work.
*   **Offload Intensive Work to Web Workers:** Move heavy computations, data processing, and complex algorithms off the main thread entirely using Web Workers. This allows true multi-threading. Consider tools like **Partytown** to offload third-party scripts (analytics, ads).
*   **Debounce and Throttle:** For high-frequency events like scrolling, resizing, or typing, use debouncing or throttling to limit how often your event handlers execute.
*   **Code Splitting:** Only send the JavaScript needed for the current route. Modern bundlers (Webpack, Vite) can split your code into smaller chunks that load on demand.

## 2. Optimizing CSS Animations vs. JS Animations

To achieve smooth 60fps animations on mobile and avoid "jank", the most important factor is **what properties you animate**, rather than just choosing between CSS or JavaScript.

### The Golden Rule: Animate GPU-Accelerated Properties
Regardless of the method used, only animate properties that don't trigger layout or paint recalculations:
*   **Animate these:** `transform` (translate, scale, rotate) and `opacity`. These are handed off to the GPU via the compositor thread.
*   **Avoid these:** `width`, `height`, `top`, `left`, `margin`, `padding`, or `box-shadow`. Animating these forces the CPU to recalculate layout on every frame.

### CSS vs. JS Animations
*   **CSS Animations (Transitions/Keyframes):** Best for simple, declarative UI transitions. They run on the browser's compositor thread and are highly efficient.
*   **JavaScript Animations:** Essential for complex, sequenced, or physics-based animations (e.g., using GSAP). Always use `requestAnimationFrame` (rAF) to synchronize updates with the browser's refresh cycle. Avoid `setTimeout` or `setInterval` for animations.
*   **will-change:** Use the CSS `will-change` property sparingly to hint the browser about upcoming animations, but do not overuse it as it consumes GPU memory.

## 3. Image and Video Optimization

Media often accounts for the vast majority of a page's weight. Optimizing media ensures faster loading and reduces bandwidth overhead.

### Strategies:
*   **Modern Image Formats:** Serve images in next-generation formats like **AVIF** and **WebP**. AVIF generally offers the best compression (20-30% smaller than WebP) and supports wide color gamuts. Fall back to JPEG/PNG for older browsers using the `<picture>` element.
*   **Proper Sizing (Responsive Images):** Do not send huge desktop images to mobile devices. Use the `srcset` and `sizes` attributes on `<img>` tags to let the browser choose the most appropriate size based on the user's viewport and pixel density.
*   **Lazy Loading:** Add the `loading="lazy"` attribute to images and iframes below the fold. **Important:** Never lazy-load above-the-fold images (like hero banners), as this will delay the Largest Contentful Paint (LCP).
*   **Video Optimization:** Use efficient codecs like VP9 or AV1. If using looping, muted videos in place of GIFs, remove the audio track to significantly reduce file size. Use lazy loading for off-screen videos.

## 4. Efficient DOM Manipulation and Reducing Layout Thrashing

Direct interactions with the DOM are computationally expensive. Mobile CPUs struggle with frequent DOM read/writes and deep component trees.

### Strategies:
*   **Eliminate Layout Thrashing (Forced Synchronous Layout):** Layout thrashing happens when you interleave DOM reads (e.g., `element.offsetHeight`) with DOM writes (e.g., `element.style.height = ...`). This forces the browser to recalculate the layout repeatedly within a single frame. **Batch reads and writes**: Read all necessary geometries first, then apply all style updates.
*   **Minimize DOM Access:** Cache DOM element references in variables instead of querying the DOM repeatedly inside loops.
*   **Use `DocumentFragment`:** When inserting multiple elements, append them to a `DocumentFragment` first, and then insert the fragment into the live DOM in a single operation. This triggers only one reflow.
*   **Flatten the DOM Tree:** Deeply nested elements increase the complexity of style calculations. Keep the HTML structure as shallow as possible.
*   **Virtual Scrolling/Windowing:** For large lists of data, do not render all nodes into the DOM. Use virtual scrolling to only render the items currently visible in the viewport.

## 5. Proper Script Loading

Managing when scripts are downloaded and executed prevents "render-blocking", enabling the HTML to parse and display quickly.

### Loading Attributes:
*   **`defer`:** The script is downloaded in the background while HTML parsing continues. It executes *after* the HTML is fully parsed, in the order it appeared. **This is the recommended default for most application scripts** (e.g., your main JS bundles), as it doesn't block rendering and guarantees the DOM is ready.
*   **`async`:** The script is downloaded in the background and executes *immediately* once downloaded, interrupting the HTML parser. The execution order is not guaranteed. **Use `async` for independent, third-party scripts** like analytics or ad trackers that don't rely on the DOM or other scripts.
*   **Default (no attribute):** Stops HTML parsing immediately to download and execute the script. Avoid this for external scripts in the `<head>`.

### Network Hints:
*   **`preconnect`:** Use `<link rel="preconnect" href="...">` for critical third-party origins (like CDNs or Google Fonts). This tells the browser to establish early connections (DNS, TCP, TLS) before the actual request is made, reducing latency.
*   **Preloading:** Use `<link rel="preload" as="script" href="...">` to fetch high-priority, critical resources early in the page lifecycle. Use sparingly to avoid wasting bandwidth.
