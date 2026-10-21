# 三维作品册

## Current polish, 2026-10-22
The user accepted the readability direction and requested realistic binding, whole-object manipulation and removal of a font jump. These are now implemented. Dragging the canvas rotates the entire model through unrestricted yaw/pitch; the Move mode or Shift/right drag pans within bounds; Reset restores its pose. Page edges still turn pages, so manipulation and reading do not compete for the same drag. Camera framing remains fixed during interaction. The persistent view pivot rotates around the visible book center (spread or single/closed book), and back-facing pages suppress the projected HTML ink.

Cover mode uses the new generated leather albedo (docs/book-cover-asset.md), native beveled leather boards, aged brass L guards, spine ribs and a textured underside. The cover does not get covered by a flat HTML card. Its title/author are rendered with actual typesetting, not generated lettering. This is a material-and-geometry improvement, not a claim of photogrammetric accuracy or an imported GLB.

The cause of the font jump was the Canvas text helper overriding headings/body with the sans stack, while resting HTML headings used Songti. Canvas and all resting page text now share the same Songti stack and regular weight; the title, running label, intro, notes, link captions and folio positions were also aligned. A regression test records the actual paint function's font selections. Minor browser-specific text antialiasing may still differ between a curved texture and native HTML, but the blackface-to-serif replacement is removed.

Actual browser checks: rotate the closed model to yaw3.147/pitch0.492; rotate an open spread to the rear and observe zero visible HTML page layers; pan then reset to yaw/pitch0; read→page-edge next with Songti visible mid-turn; cover/read labels follow page state.390px body equals viewport width; no observed console errors. Captures: .book-qa/cover-v3.png, cover-mobile-v3.png, font-turn-v3.png. Full suite36/36 passes. This supersedes the previous browser-tool blocker below. No merge/push/publication.

## Scope and content
Only #projects is enhanced. HTML article text, project icons and product links remain the source of truth; adding a project article automatically adds a directory entry and two book pages. Outside this section the production layout and three swords are unchanged. Full text is available from the explicit detail button and original list mode, including when the 3D view is inappropriate for reading.

## Visual system
Retain production black/gold identity. Book uses dark green-black hardcover, brass corners, ivory paper, dark warm type. Desktop shows a spread; below620px scene width, the renderer shows a single page. Paper surfaces are actual 36×12 segmented geometry, not rotating DOM cards. Front/back have independent textures and mirrored backside UV so the text reads normally after turning. Shadows are cast by the actual sheet onto the next page and desk.

## Assets and dependency
All project text and icons come from the original articles. Real product imagery is now typeset on dark visual pages opposite ivory story pages; see asset provenance below. No AI-generated interfaces. Three.js r160 (npm0.160.1) is vendored locally with MIT LICENSE; this module is imported only near the book section. Canvas textures are created as needed, bounded to an eight-page cache (1024×1408 per page). Product images load only when their page is painted. Static reading does not run a perpetual animation loop; pointer, resize and texture completion request frames.

### Asset provenance
The five new WebP files total approximately 190KB. They are resized/compressed copies of existing product assets, not newly invented screenshots:

| Local book asset | Existing source | Product |
| --- | --- | --- |
| fitgenius-promo.webp | FitGenius/docs/promo-cover.png | https://swording-k.github.io/fit-genius/ |
| atoll-stats.webp | Atoll/DynamicIslandSamples/statsmonitor.png | https://getatoll.app/ |
| atoll-media.webp | Atoll/DynamicIslandSamples/media.png | https://getatoll.app/ |
| workisland-approval.webp | workisland/website/assets/demo/approval.png | WorkIsland project linked by the original article |
| theme-studio.webp | codex-skins/video/codex-theme-creator-promo/public/textures/studio-default.png | Codex Theme Creator project linked by the original article |

Source roots are the existing project folders under /Users/baojian/Desktop (FitGenius under Xcode项目). WorkIsland is labeled “产品界面示例” because the source is the product website's demo capture, not live personal task data. Existing bookstore poster and pet collection preview are reused directly from this repository. Promotional screenshots illustrate the product; they are not claimed to document every feature in the current release.

## Interaction and fallback
Directory selection performs a paper turn toward the chosen chapter without requiring the visitor to turn every intervening chapter. Keyboard/drag/page-edge controls flip. Reduced-motion chooses pages immediately and a long drag advances only once. Full project dialog preserves the original article. Native project list is retained if scripts fail; without WebGL the HTML book remains available. No browser backend or paid API is required.

## 2026-10-22 readability correction (browser acceptance pending)
The user rejected the small raster-text pages, green tabletop and external control rows. The tabletop is removed. Resting pages now use real HTML projected onto the paper's four corners by a CSS projective matrix; actual WebGL paper textures take over during a curl. This reuses the existing Three vector projection and browser CSS transforms, without adding a second rendering framework. The surrounding original sword background is left intact. Medium widths use the catalog drawer so two pages have enough space. The renderer uses at least1.5× sampling for curved pages; static text is no longer limited by a canvas texture.

Catalog selection now animates a physical sheet toward the selected chapter. Rapid requests coalesce to the latest target after the active turn, rather than interrupting the middle of a sheet. For reduced motion, selection remains immediate. External arrows/action/chapter rows are visually removed in spatial mode; controls live on the outer paper edges and actual project links live on the pages. HTML fallback retains its controls. Keyboard-triggered page-edge turns transfer focus to the persistent book host before replacing sheets, preserving direction-key navigation.

Code review identified missing static-page notes and a keyboard focus regression; both have been corrected. Static and turning pages now carry the same project notes and primary entry captions. Projection math has a four-corner numerical test. The33-test suite passed before the final review corrections; syntax and diff checks also pass afterward. **This is not visual acceptance:** CUA getTab/getState/getBrowser timed out repeatedly, and the fallback local inspector failed to launch Chrome within20s. No new screenshot or completed interaction test is claimed for this revision. The previous .book-qa/*-v2.png captures depict the rejected version, not this correction.

## Verification and limits
See progress.md and ignored .book-qa/ captures. The scene now has project-led spreads, leather grain, physical paper edges, curved resting pages and a stationary camera throughout a turn. The phone uses a longer lens rather than retreating mid-animation. Six state/geometry tests cover navigation and paper bounds, not full camera projection; actual held-turn screenshots provide the visual check. No low-end-device FPS, battery or cold public-network benchmark has been performed. Neither source comments nor test success imply user aesthetic acceptance or parity with the reference video.
# 2026-10-22 interaction refinement

Default mode distinguishes on-paper page dragging from outside model rotation. Explicit rotation and pan modes remain available. Sheet progress follows the pointer and settles back when released below threshold. Reduced motion performs at most one turn per release.

Cover return rotates the physical left binding around the spine onto the right page block and eases framing to the closed book. Directory return dismisses the mobile catalog first. Inner visual and story pages now share ivory laid-paper artwork (see book-paper-asset.md), dark Songti ink and restrained print borders. Curvature varies slightly along page height to avoid a uniform cylinder turn.

Verified with actual pointer input in the local preview: forward turn, short-drag cancellation, held hinge, completed close/open, directory close, and reduced-motion five-move drag producing only one turn. Screenshot evidence under ignored .book-qa/: paper-drag-v4.png and closing-held-v4.png.37 automated tests pass. This is not a deployment or a claim of user aesthetic acceptance.
