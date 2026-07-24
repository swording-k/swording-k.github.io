# Shared Sword Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the complete existing portfolio while the hero showcase sword seamlessly hands off to a fixed, scroll-travelling cinematic sword background.

**Architecture:** Use two copies of the same transparent sword asset: one inside the existing hero showcase and one in the fixed decorative stage. A GSAP ScrollTrigger handoff aligns their pose and crossfades ownership during the Hero-to-About scroll, then a pure camera interpolator maps the remaining document progress to sword regions. Content stays in the existing DOM and above the pointer-inert background.

**Tech Stack:** Static HTML/CSS, vanilla JavaScript, local GSAP + ScrollTrigger, Node.js built-in test runner, headless Chrome visual QA.

---

## File map

- Create `js/sword-integration-camera.mjs`: pure camera keyframes and interpolation.
- Create `tests/sword-integration-content.test.mjs`: content insurance and integration contract.
- Create `tests/sword-integration-camera.test.mjs`: pure camera behavior.
- Modify `index.html`: swap both sword images to the shared transparent asset and add non-content integration hooks.
- Modify `css/sword-background.css`: hero/background handoff states, cinematic background, mobile and reduced-motion fallbacks.
- Modify `js/main.js`: GSAP handoff, section-aware camera travel, pointer parallax and cleanup.

### Task 1: Lock the content insurance contract

**Files:**
- Create: `tests/sword-integration-content.test.mjs`
- Test: `index.html`

- [ ] **Step 1: Write the failing test**

Create assertions that the page still contains `hero`, `about`, `projects`, `contact`, eight `project-card` articles, phone/email/GitHub/resume links, and that both sword layers use `images/longclaw-screen-used-weathered-v2-transparent.png` with `data-sword-role="showcase|background"` hooks.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/sword-integration-content.test.mjs`  
Expected: FAIL because the two shared-sword hooks do not exist.

- [ ] **Step 3: Implement minimal markup**

Keep all content nodes unchanged. Change only the two decorative image references and add:

```html
<img class="cinematic-sword" data-sword-role="background" src="images/longclaw-screen-used-weathered-v2-transparent.png" alt="" ...>
<img class="kunwu-sword-photo" data-sword-role="showcase" src="images/longclaw-screen-used-weathered-v2-transparent.png" alt="">
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/sword-integration-content.test.mjs`  
Expected: PASS.

### Task 2: Extract and test camera math

**Files:**
- Create: `js/sword-integration-camera.mjs`
- Create: `tests/sword-integration-camera.test.mjs`

- [ ] **Step 1: Write the failing test**

Assert five ascending camera stops from `0` to `1`, interpolation clamping, and finite `xPercent`, `yPercent`, `scale`, `rotation`, and `opacity` values.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/sword-integration-camera.test.mjs`  
Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement minimal camera module**

Export immutable `integrationCameraStops` and `interpolateIntegrationCamera(progress)` using linear interpolation between adjacent stops.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/sword-integration-camera.test.mjs`  
Expected: PASS.

### Task 3: Build the hero-to-background handoff

**Files:**
- Modify: `css/sword-background.css`
- Modify: `js/main.js`
- Modify: `tests/sword-integration-content.test.mjs`

- [ ] **Step 1: Extend the contract test and verify RED**

Assert `main.js` imports the camera module, registers ScrollTrigger, creates a `sword-handoff` trigger from `#hero`, uses `ease: "none"`, and writes the CSS custom property `--sword-handoff`.

- [ ] **Step 2: Implement the transition**

Use `gsap.matchMedia()`. During the Hero-to-About range, crossfade identical aligned sword layers, fade only `.hero-artifact` chrome, and drive the background rig from showcase pose to the first cinematic camera pose with transforms and opacity.

- [ ] **Step 3: Verify GREEN**

Run: `node --test tests/sword-integration-content.test.mjs tests/sword-integration-camera.test.mjs`  
Expected: PASS.

### Task 4: Map the rest of the page to sword regions

**Files:**
- Modify: `js/main.js`
- Modify: `css/sword-background.css`
- Modify: `tests/sword-integration-content.test.mjs`

- [ ] **Step 1: Extend test and verify RED**

Assert section anchors `#about`, `#projects`, `.life-section`, and `#contact` feed `buildSwordSectionStops`, and mobile/reduced-motion CSS rules exist.

- [ ] **Step 2: Implement section-aware motion**

Compute normalized document progress at refresh, interpolate the pure camera stops, apply desktop/mobile motion scaling, and keep pointer parallax on `.sword-camera` separate from scroll transforms on the image.

- [ ] **Step 3: Verify GREEN**

Run all Node tests. Expected: all pass with no warnings.

### Task 5: Browser verification and regression check

**Files:**
- Verify: `index.html`, `css/sword-background.css`, `js/main.js`

- [ ] **Step 1: Start the local server and check resources**

Run `python3 -m http.server 4173` and verify `index.html`, both local GSAP scripts, the camera module, and the transparent sword return HTTP 200.

- [ ] **Step 2: Capture desktop checkpoints**

Capture 1440×1000 screenshots at the hero, Hero/About handoff, Projects, and Contact. Confirm no jump, duplicate sword, blocked content, or unreadable controls.

- [ ] **Step 3: Capture mobile checkpoints**

Capture 390×844 screenshots at the hero and Projects. Confirm the sword stays to the right and text/buttons remain readable.

- [ ] **Step 4: Final regression run**

Run `node --test tests/*.test.mjs` and `git diff --check`. Expected: all tests pass and no whitespace errors.

- [ ] **Step 5: Report state honestly**

Report the branch, tested viewport sizes, screenshots, and the distinction between locally integrated and deployed.
