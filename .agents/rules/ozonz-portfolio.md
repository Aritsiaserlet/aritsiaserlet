---
description: Constraints for working on the OzonZ portfolio page and its admin/data pipeline
---

# OzonZ Portfolio Rules

## Responsive changes
- When asked to fix mobile, change ONLY mobile styles (base/`sm:` classes or `@media (max-width: 768px)`).
  Never change `md:`/`lg:` classes, desktop padding or max-width unless explicitly asked.
- Primary mobile test widths: 390px and 430px (portrait). Desktop reference: 1440px.
- Children of `grid-cols-1` mobile grids must have `col-span-1 w-full min-w-0` to avoid collapse/overflow.
- Before pushing a layout change, verify in the browser at 390px and 1440px: no horizontal scroll, no hidden cards.
- Keep the mobile root font-size scaling (`html { font-size: 86% }` at <=768px, `82%` at <=430px); the user chose to keep it.

## Architecture (React Base)
- Source of truth: `ozonz-app/` (Vite + React + TypeScript). `portfolio-ozonz.html` is a build output
  produced by `npm run build` and automatically built in `.github/workflows/static.yml`; do not hand-edit the root HTML.
- Always run `npm --prefix ozonz-app run build` before pushing; a failed CI build blocks deployment of the ENTIRE site.
- Do not change the works/profile JSON schema or `js/analytics.js` without also updating `admin-ozonz-page.html`.
- Other pages (index, game, lovertian, admin) remain vanilla HTML/JS and must not be broken by OzonZ changes.
