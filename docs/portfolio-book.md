# 三维作品册

## Scope and content
Only #projects is enhanced. HTML article text, project icons and product links remain the source of truth; adding a project article automatically adds a directory entry and two book pages. Outside this section the production layout and three swords are unchanged. Full text is available from the explicit detail button and original list mode, including when the 3D view is inappropriate for reading.

## Visual system
Retain production black/gold identity. Book uses dark green-black hardcover, brass corners, ivory paper, dark warm type. Desktop shows a spread; below620px scene width, the renderer shows a single page. Paper surfaces are actual 36×12 segmented geometry, not rotating DOM cards. Front/back have independent textures and mirrored backside UV so the text reads normally after turning. Shadows are cast by the actual sheet onto the next page and desk.

## Assets and dependency
All project icons/text come from the existing repository. No AI-generated imagery or screenshots added. Three.js r160 (npm0.160.1) is vendored locally with MIT LICENSE; this module is imported only near the book section. Removed the superseded page-flip dependency. Canvas textures are created as needed, bounded to an eight-page cache. Static reading does not run a perpetual animation loop; pointer, resize and texture completion request frames.

## Interaction and fallback
Directory selection jumps without traversing intermediate projects. Arrows/keyboard/drag flip. Reduced-motion chooses pages immediately and a long drag advances only once. Full project dialog preserves the original article. Native project list is retained if scripts fail; without WebGL the HTML book remains available. No browser backend or paid API is required.

## Verification and limits
See progress.md and ignored .book-qa/ captures. This version has real 3D behavior but not the reference's project-rich art direction or polished desk materials. No low-end-device FPS, battery or cold public-network benchmark has been performed. Neither source comments nor test success imply user aesthetic acceptance.
