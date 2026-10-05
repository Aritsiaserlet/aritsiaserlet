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
