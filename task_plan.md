# Epic portfolio book

- [x] Inspect actual supplied 21.87s video: tabletop book, curved paper turn, complete project spreads.
- [x] Research StPageFlip vs turn.js. Initial engine rejected by user as too flat; removed from build.
- [x] Build real Three.js paper geometry only inside original projects section; retain rest of site.
- [x] Verify directory jump, forward/backward, drag, full article, list fallback and reduced motion. Mobile viewport verified; no physical phone performance claim.
- [x] Capture desktop/mobile and save independent branch, no publication.

## Design contract
Original black/gold site is authority. Do not import rejected editorial CSS. Original project articles remain the content source. A dark hardcover and warm paper create the epic book; no invented swords or marketing claims. Real subdivided paper geometry handles curl; application handles catalog and accessible reading. Bounded stage rather than long pinned scroll. Desktop spreads, phone one page. Native full list remains available and is default if JS fails.

## Implementation
index.html adds book controller and stylesheet. js/portfolio-book.js builds cover, two pages per project, chapter index and full-text dialog. js/portfolio-book-3d.js lazily imports local Three.js r160 and renders actual paper geometry, independently typeset front/back textures, hard covers, page stacks, lights and shadows. book-surface.mjs supplies constant arc-length bend samples. CSS scopes changes to projects/book. portfolio-book-state.mjs supplies bounded page mapping. Vendor MIT license ships with the local module.

## Acceptance
10 original project articles remain readable; FitGenius1.6/Atoll5k retained. Chapter selection updates page + active index; first/last navigation bounded. Links in pages do not trigger unwanted flips. No body horizontal overflow at 390/853/1440. Reduced motion uses instantaneous page selection, not 0ms engine duration.

## Remaining visual gap
This is a functional true-3D prototype, not a video-level visual recreation. Project spreads remain icon/text-led; table material and cross-page art direction are simpler than the reference. Camera pulls back visibly during the turn to contain the raised paper. Do not describe the current state as user-approved or merged.
