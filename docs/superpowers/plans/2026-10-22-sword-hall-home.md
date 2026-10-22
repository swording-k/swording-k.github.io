# Sword Hall Home Implementation Plan

**Goal:** unify the existing sword-hall hero and replace the segmented cursor effect with a restrained continuous sword wake.

**Architecture:** scoped hero stylesheet, independent Canvas2D pointer controller, pure sample/decay math. Existing GSAP, armory and book remain owners of their current interactions.

**Tech Stack:** existing static HTML/CSS/JS, GSAP; Canvas2D only for the pointer wake.

## Tasks

- [ ] Add `tests/sword-wake-state.test.mjs` covering speed normalization, quiet motion, bounded samples, discontinuities and decay; run with Node and observe failure before implementation.
- [ ] Add `js/sword-wake-state.mjs` with pure sample and visual-profile functions; keep at most 40 samples and 300ms life. Add `js/sword-wake.js` for one pointer-transparent canvas, input guards and an on-demand frame loop.
- [ ] Retire `initSwordQiTrail()` in `js/main.js`; load the new pointer module from `index.html`. No duplicate cursor effects.
- [ ] Add `css/sword-hall-home.css`, scoped to the hero and wake. Remove the old colored fog/capsule layers, expose the same hall image and retain the console content as unobtrusive annotations.
- [ ] Inspect actual desktop 1440 and phone 390 hero; exercise weapon selection, pointer wake, reduced motion, book navigation and normal clicking. Save screenshots under ignored `.book-qa/`.
- [ ] Run the proportional Node suite, syntax and diff checks. Record visual evidence and any open gate. Commit on `codex/sword-hall-home`; do not publish or overwrite dirty primary checkout.

## Official references

## Checkpoint

Implementation and42 Node tests completed. Actual390px hero and book section checked; viewport-fixed background is continuous, width390 equals scrollWidth.1440px hero checked. Accepted book source files unchanged. Cursor math/lifecycle independently reviewed and corrected; its final live visual capture remains open because the browser connection timed out during screencast. No public deployment or main merge. Screenshot evidence: `.book-qa/hall-mobile-v2.png`, `.book-qa/hall-mobile-projects-v2.png`. The initial hero-only background was rejected for a section seam and oversized phone crop and was replaced by the viewport-fixed global surface.

- https://reactbits.dev/animations/ribbons and https://github.com/DavidHDev/react-bits/blob/main/src/content/Animations/Ribbons/Ribbons.jsx — tapered continuous path, no copied source; current React Bits license is MIT plus Commons Clause.
- https://motionsites.ai/lesson/cursor-tracking-website-with-motionsites — unified scene and coalesced pointer input; not a real-time 3D runtime. Screenshot name alone does not uniquely identify its domain.
- https://uiverse.io/elements — small CSS feedback, MIT elements.
- https://animejs.com/documentation/easings/spring/ — damping reference; no second animation engine installed.
- https://ui.aceternity.com/registry/tracing-beam.json — scroll-driven light segment; no direct code reuse or blanket license assumption.
