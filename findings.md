# Findings

Video contact sheet: .book-qa/reference.jpg. Original MP4 in user's Downloads, untouched. It shows actual curled paper across a desktop book, not slideshow cards.

Initial StPageFlip (MIT) implementation was rejected as too flat. Removed its bundle. Final dependency is three@0.160.1, official npm tarball, self-contained module 670681 bytes (gzip approx166846), MIT. No React or external runtime needed. Research agent verified version/license and actual source APIs; some remote documentation endpoints timed out, so no claim to have copied a maintained third-party 3D book sample.

No new generated imagery required; original icons and project text define pages. Paper texture is code-native material, not an invented illustration.

QA found a mobile 2→cover navigation defect and reduced-motion multi-flip drag. Both were fixed with bounded adjacentPage mapping and a reduced-motion pointermove guard, then verified in the actual WebGL scene. An old cached state module caused an HTML fallback during QA; imports now carry a consistent explicit version query.
