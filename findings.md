# Findings

## Catalog revision evidence, 2026-10-22
- First-open issue: controller fallbackPage/currentPage and Three.js initialPage all used 1. Changed all to 0; Home key also closes the book.
- Sources inspected: FitGenius AGENTS.md/README.md (training/diet, Vision, Watch, CloudBase); workisland README.md (local work interface, approvals/questions/completion/source navigation); Atoll README.md and own-author git history (localization/calendar fixes); codex-skins AGENTS.md/README.md (Electron manager + Skill + platform runtime, not Swift); WechatMemeLab README.md/AGENTS.md (local photos/video GIF editing); the-last-bookstore README.md (seven-day story, free library/book theatre); esports-talent README.md (six Canvas challenges); lovecourt AGENTS.md/README.md/PRODUCT.md/docs/DEPLOYMENT.md (public Web Demo, private repository, two-person text/voice and agreed task flow); codex-pet README.md and actual pet folders (17 roles, V2 atlases).
- LoveCourt permanent demo entry uses the documented Vercel URL, not a temporary local tunnel. Do not publish a private GitHub link.
- Pets: extracted only the first idle cell, 192x208, from each original V2 atlas (8 columns x 11 rows, 1536x2288) for Buddy, Zoro and SpongeBob. No generated or redrawn character art. Large transparent portraits replace the unreadable contact sheet. LoveCourt picture is the actual docs/screenshots/home-desktop.png, compressed to WebP; icon reuses its existing Lucide Scale brand mark.
- Category data lives on original articles. Existing content renderer and semantic nav are extended, with a pure stable ordering/search helper; no additional runtime dependency.
- Research subagents could not start due to usage limits; primary agent completed repository reading directly.
- Preview server had stopped between turns (ERR_CONNECTION_REFUSED); restarted the same scoped 4190 server.

Video contact sheet: .book-qa/reference.jpg. Original MP4 in user's Downloads, untouched. It shows actual curled paper across a desktop book, not slideshow cards.

Initial StPageFlip (MIT) implementation was rejected as too flat. Removed its bundle. Final dependency is three@0.160.1, official npm tarball, self-contained module 670681 bytes (gzip approx166846), MIT. No React or external runtime needed. Research agent verified version/license and actual source APIs; some remote documentation endpoints timed out, so no claim to have copied a maintained third-party 3D book sample.

No new generated imagery required. Original project text defines pages. Five real product captures were found in the existing product repositories and compressed to about 190KB total; provenance is in docs/portfolio-book.md. Paper/leather grain is code-native material, not an invented illustration.

The original camera retreated by 3.1 world units at peak curl, shrinking the whole book. The revised constant-length strip uses a tighter curl with height below2.1, so camera framing remains constant. A longer focal length on mobile reduces perspective enlargement of the raised page. Narrow mode also hides physical edges from the absent left page stack.

QA found a mobile 2→cover navigation defect and reduced-motion multi-flip drag. Both were fixed with bounded adjacentPage mapping and a reduced-motion pointermove guard, then verified in the actual WebGL scene. An old cached state module caused an HTML fallback during QA; imports now carry a consistent explicit version query.
