# Epic portfolio book

## Catalog and product truth revision, 2026-10-22
- [x] Verify product repositories and write source-backed short copy.
- [x] Start closed; group chapters into personal products, open-source contributions, hackathon works, and remaining tools/content.
- [x] Add LoveCourt with its public demo (no private repository link); hold Mineradio until user says ready.
- [x] Replace the Pets contact sheet with large representative atlas frames.
- [x] Check desktop/phone cover, catalog/search/page mapping, links and rendering.
- [x] Merge and verify public deployment — code2eaf5ba built successfully; live cover/category/page/asset checks passed.

Reuse decision: extend the existing semantic catalog, DOM article source and Three.js renderer. No new carousel, book engine or dependency is needed. Explicit user design is the specification; preserve the accepted visual world.

## Active correction, 2026-10-22
- [x] Diagnose undersized canvas text and intentional instant catalog path.
- [x] Implement sharp native resting pages, transparent stage, animated catalog and paper-edge controls.
- [x] Apply code review fixes for notes consistency and keyboard focus.
- [x] Actual desktop/mobile visual and interaction checks — browser connection recovered; captures and limits recorded in progress.md. Do not publish without user approval.

## Binding and model polish
- [x] Realistic leather binding artwork on beveled physical cover geometry.
- [x] Whole-book rotation, pan and reset; back-facing HTML culled.
- [x] Shared Songti rendering across static/turning pages with font regression coverage.
- [x] Independent code review fix for Cover/Read state,36 tests and actual mobile/desktop interaction checks.

- [x] Inspect actual supplied 21.87s video: tabletop book, curved paper turn, complete project spreads.
- [x] Research StPageFlip vs turn.js. Initial engine rejected by user as too flat; removed from build.
- [x] Build real Three.js paper geometry only inside original projects section; retain rest of site.
- [x] Verify directory jump, forward/backward, drag, full article, list fallback and reduced motion. Mobile viewport verified; no physical phone performance claim.
- [x] Capture desktop/mobile and save independent branch, no publication.

## Design contract

v18 correction: strict explicit modes; one visible WebGL ink source; thicker page blocks and sealed leather spine; project icons retained alongside screenshots; user title 锻造之书. Final visual/gesture recheck remains pending browser reconnection (CUA timeouts), not user aesthetic approval.

Latest interaction pass: paper owns read-mode drags; outside owns rotation. Physical hinge closes the binding for both return-cover actions. Shared ivory paper art documented in docs/book-paper-asset.md. Actual held-turn/hinge and cancellation/reduced-motion checks completed;37 tests pass. No merge or publication.

Original black/gold site is authority. Do not import rejected editorial CSS. Original project articles remain the content source. A dark hardcover and warm paper create the epic book; no invented swords or marketing claims. Real subdivided paper geometry handles curl; application handles catalog and accessible reading. Bounded stage rather than long pinned scroll. Desktop spreads, phone one page. Native full list remains available and is default if JS fails.

## Implementation
index.html adds book controller and stylesheet. js/portfolio-book.js builds cover, two pages per project, chapter index and full-text dialog. js/portfolio-book-3d.js lazily imports local Three.js r160 and renders actual paper geometry, independently typeset front/back textures, hard covers, page stacks, lights and shadows. book-surface.mjs supplies constant arc-length bend samples. CSS scopes changes to projects/book. portfolio-book-state.mjs supplies bounded page mapping. Vendor MIT license ships with the local module.

## Acceptance
10 original project articles remain readable; FitGenius1.6/Atoll5k retained. Chapter selection updates page + active index; first/last navigation bounded. Links in pages do not trigger unwanted flips. No body horizontal overflow at 390/853/1440. Reduced motion uses instantaneous page selection, not 0ms engine duration.

## Second visual pass
- [x] Use real product captures for FitGenius, Atoll, WorkIsland and Theme Creator; reuse existing bookstore/pets art.
- [x] Bound paper lift and remove mid-turn camera retreat; keep a longer lens for mobile.
- [x] Add leather grain, warmer paper, physical edge visibility and gently curved resting pages.
- [x] Verify final desktop/mobile held-turn framing, detail entry and original list.
- [x] Save final revision on this branch only; no push/merge/deployment.

The reference remains an art-direction reference, not a claimed pixel-identical reproduction. Do not describe the current state as user-approved, published or merged.
