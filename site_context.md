# Current Site Context

The user is experiencing lag on mobile devices and for other users accessing the site.
The website is a static frontend site built with HTML, CSS, JS, and possibly Firebase.

## Known Bottlenecks / Areas of Interest:
1. **Large Assets**: `favicon.jpg` is 367KB, which is extremely large for an icon. There are likely other large, uncompressed media files being loaded.
2. **Video Background**: `<video id="customBgVideo" autoplay loop muted playsinline...></video>` is used, which can be heavy on mobile processors if not optimized.
3. **Script Loading**: `toastManager.js` is loaded in the `<head>` without `defer` or `async`, which blocks parsing. Other scripts like `index.js` (~40KB) and `portfolio-ozonz-live.js` (~64KB) are also loaded.
4. **Animations**: There are likely CSS or JS animations (like `wind-vfx.js` or game logic in `game.js`) that may not be optimized for mobile (e.g., using `requestAnimationFrame`, or hardware-accelerated CSS properties like `transform` and `opacity`).
5. **DOM Size**: The site seems to load gallery works dynamically. If not paginated or virtualized, a large number of DOM elements could cause lag.
6. **Fonts**: Google fonts are loaded without `preconnect`.

## Next Steps for Idea Planner:
1. Read `web_performance_research.md` (to be created by the web perf researcher).
2. Cross-reference the research with the findings above.
3. Create a detailed architectural plan (`implementation_plan.md`) on how to optimize this website to run smoothly on mobile and for all users.
