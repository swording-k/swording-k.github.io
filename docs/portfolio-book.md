# 三维作品册

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
Directory selection jumps without traversing intermediate projects. Arrows/keyboard/drag flip. Reduced-motion chooses pages immediately and a long drag advances only once. Full project dialog preserves the original article. Native project list is retained if scripts fail; without WebGL the HTML book remains available. No browser backend or paid API is required.

## Verification and limits
See progress.md and ignored .book-qa/ captures. The scene now has project-led spreads, leather grain, physical paper edges, curved resting pages and a stationary camera throughout a turn. The phone uses a longer lens rather than retreating mid-animation. Six state/geometry tests cover navigation and paper bounds, not full camera projection; actual held-turn screenshots provide the visual check. No low-end-device FPS, battery or cold public-network benchmark has been performed. Neither source comments nor test success imply user aesthetic acceptance or parity with the reference video.
