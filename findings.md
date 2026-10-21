# Findings

Video contact sheet: .book-qa/reference.jpg. Original MP4 in user's Downloads, untouched. It shows actual curled paper across a desktop book, not slideshow cards.

Initial StPageFlip (MIT) implementation was rejected as too flat. Removed its bundle. Final dependency is three@0.160.1, official npm tarball, self-contained module 670681 bytes (gzip approx166846), MIT. No React or external runtime needed. Research agent verified version/license and actual source APIs; some remote documentation endpoints timed out, so no claim to have copied a maintained third-party 3D book sample.

No new generated imagery required. Original project text defines pages. Five real product captures were found in the existing product repositories and compressed to about 190KB total; provenance is in docs/portfolio-book.md. Paper/leather grain is code-native material, not an invented illustration.

The original camera retreated by 3.1 world units at peak curl, shrinking the whole book. The revised constant-length strip uses a tighter curl with height below2.1, so camera framing remains constant. A longer focal length on mobile reduces perspective enlargement of the raised page. Narrow mode also hides physical edges from the absent left page stack.

QA found a mobile 2→cover navigation defect and reduced-motion multi-flip drag. Both were fixed with bounded adjacentPage mapping and a reduced-motion pointermove guard, then verified in the actual WebGL scene. An old cached state module caused an HTML fallback during QA; imports now carry a consistent explicit version query.
