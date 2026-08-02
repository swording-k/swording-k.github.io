# Longclaw Copy Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Longclaw description consistently identify it as Jon Snow's Valyrian steel sword and remove the Mormont-family reference.

**Architecture:** `js/weapon-armory-data.mjs` is the dynamic source used when the armory selection changes. `index.html` duplicates the default selected weapon's text for first paint, so both values must match exactly. A data test protects the canonical dynamic copy and a content test protects the initial HTML.

**Tech Stack:** Static HTML, ES modules, Node.js built-in test runner.

---

### Task 1: Lock the canonical Longclaw wording with failing tests

**Files:**
- Modify: `tests/weapon-armory-data.test.mjs:45-53`
- Modify: `tests/weapon-armory-content.test.mjs:5-18`

- [ ] **Step 1: Add explicit copy assertions**

```js
assert.match(longclaw.description, /瓦利利亚钢/);
assert.doesNotMatch(longclaw.description, /莫尔蒙家族/);
```

```js
assert.match(html, /琼恩·雪诺使用的瓦利利亚钢佩剑/);
assert.doesNotMatch(html, /莫尔蒙家族/);
```

- [ ] **Step 2: Run the focused tests and verify failure**

Run: `node --test tests/weapon-armory-data.test.mjs tests/weapon-armory-content.test.mjs`

Expected: FAIL because the current data and static HTML still say `原属莫尔蒙家族`.

### Task 2: Synchronize the default and dynamic copy

**Files:**
- Modify: `js/weapon-armory-data.mjs:23`
- Modify: `index.html:143`

- [ ] **Step 1: Replace both descriptions with the approved copy**

```text
《权力的游戏》中琼恩·雪诺使用的瓦利利亚钢佩剑。冷灰钢与旧皮革，一把经历过风霜的守誓之剑。
```

- [ ] **Step 2: Run the focused tests and verify success**

Run: `node --test tests/weapon-armory-data.test.mjs tests/weapon-armory-content.test.mjs`

Expected: PASS.

- [ ] **Step 3: Run regression tests**

Run: `node --test tests/*.test.mjs && git diff --check`

Expected: all tests pass and no whitespace errors are reported.

- [ ] **Step 4: Commit only this change and its tests**

```bash
git add index.html js/weapon-armory-data.mjs tests/weapon-armory-data.test.mjs tests/weapon-armory-content.test.mjs
git commit -m "fix: describe Longclaw as Valyrian steel"
```
