# Three-Sword Armory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hero's single static sword with a draggable three-weapon armory whose selected weapon becomes the existing full-page scroll background without changing portfolio content.

**Architecture:** Keep the site frontend-only. Put weapon metadata and pure selection logic in small ES modules, render exactly three image slots in the existing hero artifact, and communicate selection to the existing cinematic controller with a `weaponchange` custom event. Reuse GSAP for transform/opacity animation and extend the current camera interpolator to accept weapon-specific stops.

**Tech Stack:** Semantic HTML, CSS 3D transforms, vanilla JavaScript Pointer Events, ES modules, GSAP + ScrollTrigger, Node.js built-in test runner.

---

## File map

- Create `js/weapon-armory-data.mjs`: immutable weapon metadata, resource paths, copy, showcase poses, and camera stops.
- Create `js/weapon-armory-state.mjs`: pure ID validation, circular selection, drag decision, and storage-safe resolution.
- Create `tests/weapon-armory-data.test.mjs`: metadata and camera-contract tests.
- Create `tests/weapon-armory-state.test.mjs`: pure interaction-state tests.
- Create `tests/weapon-armory-content.test.mjs`: HTML/CSS/JS integration contract tests.
- Modify `index.html`: three semantic weapon slots, live label, asset preload hints, and cache versions.
- Modify `css/sword-background.css`: armory composition, responsive layout, active/side poses, and reduced-motion fallback.
- Modify `js/sword-integration-camera.mjs`: interpolate arbitrary validated camera-stop arrays while preserving the current API.
- Modify `js/main.js`: initialize drag/click/keyboard selection, persist the selection, swap the background resource, and refresh the cinematic pose.
- Add two approved transparent assets under `images/`: Goujian and Wado Ichimonji.

### Task 1: Weapon metadata and pure selection state

**Files:**
- Create: `js/weapon-armory-data.mjs`
- Create: `js/weapon-armory-state.mjs`
- Create: `tests/weapon-armory-data.test.mjs`
- Create: `tests/weapon-armory-state.test.mjs`

- [ ] **Step 1: Write failing metadata tests**

Assert exactly three stable IDs, unique image paths, five ordered camera stops per weapon, and the wolf sword as the default:

```js
import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_WEAPON_ID, WEAPONS, getWeapon } from "../js/weapon-armory-data.mjs";

test("armory exposes the three approved weapons", () => {
  assert.equal(DEFAULT_WEAPON_ID, "wolf-longsword");
  assert.deepEqual(WEAPONS.map(({ id }) => id), [
    "wolf-longsword", "goujian", "wado-ichimonji",
  ]);
  assert.equal(new Set(WEAPONS.map(({ image }) => image)).size, 3);
  for (const weapon of WEAPONS) {
    assert.equal(weapon.cameraStops.length, 5);
    assert.equal(weapon.cameraStops[0].progress, 0);
    assert.equal(weapon.cameraStops.at(-1).progress, 1);
  }
  assert.equal(getWeapon("invalid").id, DEFAULT_WEAPON_ID);
});
```

- [ ] **Step 2: Write failing state tests**

Cover circular movement, the 12% drag threshold, the `0.45px/ms` velocity threshold, and invalid persisted values:

```js
assert.equal(stepWeapon("wolf-longsword", 1), "goujian");
assert.equal(stepWeapon("wolf-longsword", -1), "wado-ichimonji");
assert.equal(resolveDrag({ distance: 50, width: 500, velocity: 0.1 }), 0);
assert.equal(resolveDrag({ distance: -70, width: 500, velocity: -0.1 }), 1);
assert.equal(resolveDrag({ distance: 10, width: 500, velocity: 0.5 }), -1);
assert.equal(resolveStoredWeapon("unknown"), "wolf-longsword");
```

- [ ] **Step 3: Run tests and verify module-not-found failures**

Run: `node --test tests/weapon-armory-data.test.mjs tests/weapon-armory-state.test.mjs`  
Expected: FAIL because both modules do not exist.

- [ ] **Step 4: Implement immutable metadata and state helpers**

Use this public contract:

```js
export const DEFAULT_WEAPON_ID = "wolf-longsword";
export const STORAGE_KEY = "baojian:selected-weapon";
export const WEAPONS = Object.freeze([/* three frozen records */]);
export function getWeapon(id) { /* valid record or default */ }
export function stepWeapon(id, direction) { /* circular ID */ }
export function resolveDrag({ distance, width, velocity }) { /* -1, 0, or 1 */ }
export function resolveStoredWeapon(value) { /* valid ID or default */ }
```

Each weapon record must include `id`, `name`, `eyebrow`, `description`, `image`, `showcase`, and `cameraStops`. Reuse the verified wolf camera stops; give Goujian and Wado distinct x/rotation values but the same monotonic hilt-to-tip y progression.

- [ ] **Step 5: Run tests and commit**

Run: `node --test tests/weapon-armory-data.test.mjs tests/weapon-armory-state.test.mjs`  
Expected: PASS.  
Commit: `feat: define three-sword armory data`

### Task 2: Create and verify the two new weapon assets

**Files:**
- Create: `images/goujian-armory-transparent.webp`
- Create: `images/wado-ichimonji-armory-transparent.webp`

- [ ] **Step 1: Generate consistent source images**

Generate one full-length, front-facing studio weapon per canvas. Match the wolf sword's vertical framing, realistic material treatment, subdued lighting, and centered perspective. Goujian must show the bronze diamond pattern; Wado must show the white handle wrap, round guard, dark sheath, and a restrained polished blade presentation.

- [ ] **Step 2: Remove the background and normalize framing**

Produce transparent WebP files with a tall shared canvas, no floor shadow, no cropped hilt or tip, and enough transparent margin for rotation.

- [ ] **Step 3: Verify dimensions, alpha, and resource budget**

Run: `sips -g pixelWidth -g pixelHeight -g hasAlpha images/goujian-armory-transparent.webp images/wado-ichimonji-armory-transparent.webp`  
Expected: both images report alpha, matching portrait dimensions, and no crop.  
Run: `du -h images/*armory-transparent.webp`  
Expected: each file is at or below 700KB where visual quality permits.

- [ ] **Step 4: Make a two-asset contact sheet and visually inspect it**

Place both assets on the same dark neutral background at equal displayed height. Verify silhouette, material realism, edge cleanliness, and consistent camera angle before using them in the page.

- [ ] **Step 5: Commit approved assets**

Commit: `feat: add Goujian and Wado armory assets`

### Task 3: Semantic three-slot hero markup and static composition

**Files:**
- Modify: `index.html:23-36,125-137,711-712`
- Modify: `css/sword-background.css:78-90,166-221`
- Create: `tests/weapon-armory-content.test.mjs`

- [ ] **Step 1: Write failing HTML/CSS contract tests**

Require a focusable `role="listbox"`, three `role="option"` weapon elements, one selected option, a polite live label, three image paths, and CSS for `data-slot="left|center|right"`:

```js
assert.match(html, /class="weapon-armory"[^>]+role="listbox"[^>]+tabindex="0"/);
assert.equal((html.match(/class="armory-weapon"/g) ?? []).length, 3);
assert.equal((html.match(/role="option"/g) ?? []).length, 3);
assert.match(html, /aria-live="polite"/);
for (const slot of ["left", "center", "right"]) {
  assert.match(css, new RegExp(`data-slot=["']${slot}["']`));
}
```

- [ ] **Step 2: Run the test and verify failure**

Run: `node --test tests/weapon-armory-content.test.mjs`  
Expected: FAIL because armory markup and styles do not exist.

- [ ] **Step 3: Replace the single blade object with three slots**

Keep the existing `hero-artifact` and resume console. Add one button-like option per weapon, with the wolf sword selected and centered in the no-JavaScript state. Add live name/description text below the stage. Keep all original resume text unchanged.

- [ ] **Step 4: Add the approved static armory composition**

Implement centered/side transforms using CSS variables. The center weapon uses full opacity and roughly 82% stage height; side weapons use 62%–68% scale and 28%–38% opacity. Do not use animated `filter`, large blur, or layout properties.

- [ ] **Step 5: Run tests, inspect the desktop hero, and commit**

Run: `node --test tests/weapon-armory-content.test.mjs tests/sword-integration-content.test.mjs`  
Expected: PASS with the original portfolio-content test unchanged.  
Commit: `feat: compose three-sword hero armory`

### Task 4: Drag, click, keyboard, and persistence controller

**Files:**
- Modify: `js/main.js:846-1041,1186-1215`
- Modify: `tests/weapon-armory-content.test.mjs`

- [ ] **Step 1: Extend the integration test with controller requirements**

Assert module imports, Pointer Events, pointer capture, ArrowLeft/ArrowRight support, the storage key, and a `weaponchange` event:

```js
assert.match(js, /import\(["']\.\/weapon-armory-state\.mjs["']\)/);
assert.match(js, /setPointerCapture/);
assert.match(js, /ArrowLeft/);
assert.match(js, /ArrowRight/);
assert.match(js, /baojian:selected-weapon/);
assert.match(js, /new CustomEvent\(["']weaponchange["']/);
```

- [ ] **Step 2: Run the test and verify failure**

Run: `node --test tests/weapon-armory-content.test.mjs`  
Expected: FAIL at the missing controller assertions.

- [ ] **Step 3: Implement `initWeaponArmory()`**

On initialization, resolve stored state safely, render circular left/center/right slots, and dispatch `weaponchange` with `{ detail: { weapon } }`. During drag, update only CSS transform variables. On release, call the pure drag resolver and animate to the selected slot with GSAP. Use `overwrite: "auto"` to prevent stacked tweens.

- [ ] **Step 4: Add click and keyboard behavior**

Clicking a side option selects it. ArrowLeft/ArrowRight step circularly. Update `aria-selected`, live text, and `localStorage` inside `try/catch`; storage failure must not affect the UI.

- [ ] **Step 5: Run tests and commit**

Run: `node --test tests/weapon-armory-state.test.mjs tests/weapon-armory-content.test.mjs`  
Expected: PASS.  
Commit: `feat: add draggable armory selection`

### Task 5: Selected weapon controls the cinematic background

**Files:**
- Modify: `js/sword-integration-camera.mjs`
- Modify: `js/main.js:846-1041`
- Modify: `css/sword-background.css:32-76`
- Modify: `tests/sword-integration-camera.test.mjs`
- Modify: `tests/sword-integration-content.test.mjs`

- [ ] **Step 1: Write failing generic-camera tests**

Require `interpolateCameraStops(stops, progress)` to clamp and interpolate the supplied weapon stops without mutating them. Keep the existing wolf wrapper passing unchanged tests.

- [ ] **Step 2: Run camera tests and verify failure**

Run: `node --test tests/sword-integration-camera.test.mjs`  
Expected: FAIL because the generic interpolator is not exported.

- [ ] **Step 3: Implement the generic interpolator**

Add:

```js
export function interpolateCameraStops(stops, progress) {
  // clamp progress, find surrounding stops, return interpolated camera fields
}

export function interpolateIntegrationCamera(progress) {
  return interpolateCameraStops(integrationCameraStops, progress);
}
```

- [ ] **Step 4: Connect `weaponchange` to the fixed background**

Swap the background image and ghost image from the selected weapon record. Recompute the handoff endpoint and story camera from that weapon's stops. If a non-default image fails, select the wolf sword; if the wolf image fails, hide the cinematic stage without hiding content.

- [ ] **Step 5: Verify return-to-hero and rapid selection**

At scroll zero, all three slots must reappear with the selected weapon centered. During the story, changing selection is disabled so the handoff cannot split between two assets. Rapid home-page changes must keep a single background image and a single ScrollTrigger pair.

- [ ] **Step 6: Run integration tests and commit**

Run: `node --test tests/sword-integration-camera.test.mjs tests/sword-integration-content.test.mjs tests/weapon-armory-content.test.mjs`  
Expected: PASS.  
Commit: `feat: hand selected weapon to scroll story`

### Task 6: Responsive, reduced-motion, and real-browser verification

**Files:**
- Modify: `css/sword-background.css`
- Modify: `tests/weapon-armory-content.test.mjs`

- [ ] **Step 1: Add failing responsive and reduced-motion assertions**

Require the armory inside the existing 760px breakpoint, `touch-action: pan-y`, visible focus treatment, and a reduced-motion armory rule.

- [ ] **Step 2: Implement fallbacks**

On mobile, reduce perspective and side-weapon separation, preserve vertical page scrolling, and use tap/swipe selection. Under reduced motion, use a short crossfade with no arc or inertia. Under no JavaScript, keep the wolf sword centered and readable.

- [ ] **Step 3: Run the complete test suite**

Run: `node --test tests/*.test.mjs && git diff --check`  
Expected: all tests pass and no whitespace errors.

- [ ] **Step 4: Verify desktop in a real browser**

At 1950×1203, verify the three silhouettes, drag threshold, click, keyboard, stored reload, hero-to-background continuity, project visibility, and final tip for all three weapons. Capture hero, project, and page-bottom screenshots.

- [ ] **Step 5: Verify mobile and performance**

At 390×844, verify no horizontal overflow, vertical scroll remains native, swipe works, and the content is readable. Record that only three armory image elements and one background image exist. Check the console for runtime errors.

- [ ] **Step 6: Commit the verified implementation**

Commit: `fix: polish armory responsiveness and fallbacks`

## Completion evidence

The feature is complete only when all tests pass, desktop and mobile browser checks are captured, each selected weapon demonstrably controls the full scroll journey, and the original portfolio-content regression test remains unchanged and green. A local implementation is not described as deployed until the public URL is separately updated and verified.
