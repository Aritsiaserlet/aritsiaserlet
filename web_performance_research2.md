# Web Performance Architecture: Lite vs. High Performance Experiences

When designing web applications that feature heavy computational assets (like 3D Canvas, WebGL, high-res video, or complex animations), it is crucial to ensure that low-end devices and poor networks are not overwhelmed. This research report explores how to detect device constraints and evaluates the architectural patterns for serving tailored experiences.

## 1. JavaScript APIs for Device & Network Detection

Modern browsers provide several APIs to assess the user's hardware and network environment. Combining these signals allows you to create a "capability profile."

### `navigator.hardwareConcurrency`
*   **What it is:** Returns the number of logical CPU cores available to run threads on the user's device.
*   **How to use it:** Typically, devices with `< 4` cores are considered low-end mobile devices or older hardware.
*   **Actionable Optimizations:** Disable parallel Web Workers, reduce the complexity of physics engines, or disable heavy JavaScript-driven animations.

### `navigator.deviceMemory`
*   **What it is:** Returns the approximate amount of device RAM in gigabytes (e.g., 1, 2, 4, 8). To prevent fingerprinting, this is often capped (e.g., at 8GB).
*   **How to use it:** Devices with `< 4GB` of memory are highly susceptible to browser crashes from memory bloat.
*   **Actionable Optimizations:** Disable high-memory features like 3D Canvases (WebGL), large WebAssembly modules, and avoid retaining large DOM trees. 

### `navigator.connection` (Network Information API)
*   **What it is:** Provides data about the system's connection. 
*   **Key properties:** 
    *   `effectiveType`: Returns strings like `'slow-2g'`, `'2g'`, `'3g'`, or `'4g'`.
    *   `saveData`: Returns `true` if the user has requested a reduced data usage mode in their OS or browser.
*   **Actionable Optimizations:** If `saveData` is true or `effectiveType` is `3g` or below, disable video autoplay, prevent eager preloading/prefetching, and serve lower-resolution images (e.g., WebP/AVIF with higher compression).

### `prefers-reduced-motion`
*   **What it is:** A CSS media feature (accessible via JS using `window.matchMedia`) used to detect if the user has requested the system minimize the amount of non-essential motion.
*   **How to use it:** `window.matchMedia('(prefers-reduced-motion: reduce)').matches`
*   **Actionable Optimizations:** While primarily an accessibility feature, it is often toggled by users on older devices to save battery or processing power. Use this signal to turn off parallax scrolling, heavy CSS animations, and JS `requestAnimationFrame` loops.

---

## 2. Architectural Evaluation: Separate Page vs. Dynamic Toggling

When building these tailored experiences, two primary architectural patterns emerge: creating a completely separate "lite" HTML page versus dynamically toggling features on a single responsive page.

### Approach A: Separate `lite.html` (or `lite.domain.com`)
This is the legacy "m-dot" architectural style where constraints are detected (often server-side via User-Agent or Edge-side routing), and the user is redirected to a completely different HTML document.

**Pros:**
*   **Absolute Payload Control:** Guarantees that absolutely zero heavy JavaScript (like Three.js or heavy frameworks) is parsed, compiled, or executed.
*   **Decoupled Development:** The high-end team and the lite team can move independently without risking bundle-pollution.

**Cons:**
*   **SEO Penalties:** Search engines (like Google) strongly prefer a single URL. Managing canonical links and avoiding duplicate content penalties is highly error-prone.
*   **Maintenance Nightmare:** You are effectively maintaining two separate websites. Bug fixes, analytics tagging, and UI updates must be duplicated.
*   **Redirect Latency:** Client-side redirects add severe latency, heavily impacting First Contentful Paint (FCP).

### Approach B: Dynamic Feature Toggling (Adaptive Loading)
This pattern, often called **Adaptive Loading** or **Progressive Enhancement**, uses a single URL and codebase. The baseline HTML is extremely lightweight, and heavy features are dynamically requested (`import()`) only if the device passes capability checks.

**Pros:**
*   **Single Codebase:** Much easier to maintain, test, and deploy.
*   **SEO Friendly:** A single URL preserves domain authority and page rank.
*   **Granular Control:** Instead of a binary "Lite" vs "Heavy", you can serve a gradient of experiences (e.g., 4G + 8GB RAM gets 3D Canvas; 4G + 2GB RAM gets High-Res Video; 3G + 2GB RAM gets Static Images).

**Cons:**
*   **Complex Implementation:** Requires strict discipline with **Code Splitting**. If your capability-checking logic is bundled *with* your heavy Three.js code, the user still pays the network and parsing cost of the heavy code, defeating the purpose.
*   **Baseline Bloat:** The "core" bundle must be carefully monitored to ensure it remains lightweight.

---

## 3. Recommendation

**Dynamically disabling heavy features (Adaptive Loading) is vastly superior to creating a separate `lite.html` page.** 

The industry standard has moved away from separate mobile/lite sites due to the immense SEO and maintenance overhead. The optimal architecture uses **Dynamic Imports (Code Splitting)** based on capability checks.

### Best Practice Implementation (The "Progressive Enhancement" Model)

1. **Serve a Lightweight Core:** The initial HTML load should contain standard DOM elements, text, and lightweight CSS. Do *not* include `<script src="heavy-3d-library.js">` in the initial HTML.
2. **Evaluate the Device:** Run a capability check immediately after the core DOM loads.
3. **Dynamically Import:** Use JS `import()` to fetch heavy dependencies *only* if the device passes.

```javascript
// capability-detection.js

function getDeviceCapabilities() {
  const memory = navigator.deviceMemory || 4; // Default to 4 if unsupported
  const cores = navigator.hardwareConcurrency || 4;
  const isSlowNetwork = navigator.connection ? 
      ['slow-2g', '2g', '3g'].includes(navigator.connection.effectiveType) || navigator.connection.saveData : 
      false;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return {
    isHighEnd: memory >= 4 && cores >= 4 && !isSlowNetwork && !prefersReducedMotion,
    isSlowNetwork: isSlowNetwork
  };
}

// main.js
const capabilities = getDeviceCapabilities();

if (capabilities.isHighEnd) {
  // Dynamically load the heavy 3D/Canvas experience
  import('./heavy-webgl-experience.js')
    .then(module => {
      module.initializeCanvas(document.getElementById('hero-container'));
    })
    .catch(err => console.error("Failed to load 3D experience", err));
} else {
  // Fallback to lightweight DOM/CSS alternative (or do nothing if baseline is already fine)
  document.getElementById('hero-container').classList.add('lite-static-fallback');
}
```

### Advanced Enhancement: Server-Side Client Hints
To avoid even the client-side check latency, you can opt-in to HTTP Client Hints (e.g., `Accept-CH: Device-Memory, Downlink, Sec-CH-Prefers-Reduced-Motion`). This allows your Server (or Edge/CDN) to read the device capabilities via HTTP request headers *before* serving the HTML, allowing you to SSR (Server-Side Render) the exact right DOM nodes immediately.
