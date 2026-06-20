# Architectural and Algorithmic Plan: Adaptive Loading Implementation

Based on performance research and the current site context, we will implement an **Adaptive Loading (Progressive Enhancement)** architecture. Instead of maintaining a separate "lite" site, we will use a single codebase that defaults to a lightweight baseline and dynamically upgrades the experience for capable devices.

## 1. Logic and Thresholds for 'Lite' Mode

The site will determine whether to serve the "High-End" (heavy VFX, 3D, video background) or "Lite" (static images, essential JS only) experience based on a strict set of thresholds.

The device will be classified as **High-End** ONLY IF it meets ALL the following criteria:
*   **Memory (`navigator.deviceMemory`):** >= 4GB RAM.
*   **CPU Cores (`navigator.hardwareConcurrency`):** >= 4 Cores.
*   **Network (`navigator.connection`):** `effectiveType` is `4g` (or unknown), AND `saveData` is `false`.
*   **Accessibility (`prefers-reduced-motion`):** User has NOT requested reduced motion.

If the device fails any of these checks, or if the browser lacks support for the API but the user is on a mobile device (detected via basic User-Agent sniffing as a fallback), the site will default to **Lite Mode**.

Furthermore, a user-defined override in `localStorage` will take precedence over hardware detection.

## 2. Step-by-Step Implementation Plan

### Step 1: Immediate Capability Detection
Inject a tiny, synchronous inline script in the `<head>` of the HTML. This ensures the capability profile is established before the browser parses the `<body>`, preventing FOUC (Flash of Unstyled Content) and preventing heavy preloads.

```javascript
// Inline in <head>
(function() {
    // 1. Check user preference override
    const savedMode = localStorage.getItem('site_experience_mode');
    if (savedMode === 'lite') {
        window.__isLiteMode = true;
    } else if (savedMode === 'high') {
        window.__isLiteMode = false;
    } else {
        // 2. Hardware and Network Detection
        const memory = navigator.deviceMemory || 4; 
        const cores = navigator.hardwareConcurrency || 4;
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const isSlow = connection ? (['slow-2g', '2g', '3g'].includes(connection.effectiveType) || connection.saveData) : false;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobileFallback = /Mobi|Android/i.test(navigator.userAgent) && !navigator.deviceMemory;

        // If any constraint is met, we are in Lite Mode
        window.__isLiteMode = (memory < 4) || (cores < 4) || isSlow || prefersReducedMotion || isMobileFallback;
    }

    // 3. Set CSS Hooks
    document.documentElement.classList.add(window.__isLiteMode ? 'lite-mode' : 'high-end-mode');
})();
```

### Step 2: Baseline HTML & Progressive Enhancement
Modify the HTML to NOT eagerly load heavy assets. 
*   **Video Background:** Remove `autoplay` and `src` from `<video id="customBgVideo">`. Use `data-src` instead. Add a CSS background image to the container as a static fallback.
*   **Script Tags:** Remove `<script src="wind-vfx.js">` and `<script src="game.js">` from the initial HTML load.

### Step 3: Dynamic JavaScript Loading (The Algorithm)
Create an entry-point script (e.g., `main-bootstrap.js`) that handles the dynamic enabling of features based on `window.__isLiteMode`.

**Algorithm for Media (Video vs. Image):**
1. Wait for `DOMContentLoaded`.
2. `IF window.__isLiteMode == true`:
   * Do nothing to the video. The CSS static background image fallback remains visible.
   * Optionally, remove the `<video>` element from the DOM to save memory.
3. `IF window.__isLiteMode == false`:
   * Locate `<video id="customBgVideo">`.
   * Transfer the URL from `data-src` to `src`.
   * Add the `autoplay` attribute and call `video.play()`.

**Algorithm for Heavy VFX (`wind-vfx.js`, `game.js`):**
1. Wait for idle time (using `requestIdleCallback` or `setTimeout`) to ensure primary UI is fully interactive.
2. `IF window.__isLiteMode == false`:
   * Use Dynamic Imports: `import('./wind-vfx.js').then(module => module.init())`
   * Use Dynamic Imports: `import('./game.js').then(module => module.init())`
   * Initialize the WebGL/Canvas contexts and start their `requestAnimationFrame` loops.
3. `IF window.__isLiteMode == true`:
   * Do not import the scripts. The network cost and parse/compile time are completely bypassed.

### Step 4: CSS Scoping for Animations
Ensure that heavy CSS properties (like expensive box-shadows, complex transforms, or high-frequency CSS animations) are only applied when the `high-end-mode` class is present.

```css
/* Base: Lightweight static styles */
.gallery-item {
    transition: none;
    opacity: 1;
}

/* Enhanced: Only applied on capable devices */
html.high-end-mode .gallery-item {
    transition: transform 0.3s ease, opacity 0.3s ease;
}
html.high-end-mode .gallery-item:hover {
    transform: scale(1.05);
}
```

### Step 5: User Control (Manual Override)
Add a toggle switch in the site footer or settings menu: "Enable Rich Animations / Lite Mode".
When toggled:
1. `localStorage.setItem('site_experience_mode', 'lite' /* or 'high' */)`
2. `location.reload()` to apply the new architectural path cleanly.
