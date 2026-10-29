import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

const load = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("portfolio content and primary actions remain intact", async () => {
    const html = await load("../index.html");

    for (const id of ["hero", "about", "projects", "contact"]) {
        assert.match(html, new RegExp(`id=["']${id}["']`));
    }

    // Production already has ten cards; allow future projects without weakening
    // preservation of the original named entries.
    assert.ok((html.match(/<article class="project-card\b/g) ?? []).length >= 9);
    for (const card of ["atoll", "workisland", "memelab", "codetheme", "lastbook", "esports", "pet", "blog", "notes"]) {
        assert.match(html, new RegExp(`<article class="project-card ${card}-card\\b`));
    }
    assert.equal((html.match(/<div class="featured-project\b/g) ?? []).length, 1);
    assert.match(html, /href="tel:15193342670"/);
    assert.match(html, /href="mailto:swordingk@gmail\.com"/);
    assert.match(html, /href="https:\/\/github\.com\/swording-k"/);
    assert.match(html, /href="files\/resume-yangkun-ai-product-engineer\.pdf"/);
});

test("MEME lab entry exposes web, GitHub, mini-program code and WeChat search guidance", async () => {
    const html = await load("../index.html");
    const card = html.match(/<article class="project-card memelab-card\b[\s\S]*?<\/article>/)?.[0] ?? "";

    assert.ok(card, "MEME lab card must exist");
    assert.match(card, /<h3>MEME lab<\/h3>/);
    assert.match(card, /怪相馆/);
    assert.match(card, /https:\/\/swording-k\.github\.io\/WechatMemeLab\//);
    assert.match(card, /https:\/\/github\.com\/swording-k\/WechatMemeLab/);
    assert.match(card, /images\/qrcode-wechatmemelab\.png/);
    assert.match(card, /微信搜索「怪相馆」/);
    assert.ok(existsSync(new URL("../images/qrcode-wechatmemelab.png", import.meta.url)));
});

test("book boots through one deliberate loading state instead of flashing the flat fallbacks", async () => {
    const html = await load("../index.html");
    const css = await load("../css/portfolio-book.css");
    const js = await load("../js/portfolio-book.js");

    assert.match(html, /<section class="projects section-shell epic-book-pending" id="projects">/);
    assert.match(html, /class="epic-book-boot"/);
    assert.match(html, /onerror="var p=document\.getElementById\('projects'\)/);
    assert.match(css, /\.projects\.epic-book-pending :is\(\.project-ledger/);
    assert.match(css, /\.epic-book-loading-boot/);
    assert.match(js, /epic-book-loading/);
    assert.match(js, /finishLoading/);
});

test("showcase and background use the same transparent sword asset", async () => {
    const html = await load("../index.html");
    const asset = "images/longclaw-screen-used-weathered-v2-transparent.png";

    assert.match(html, new RegExp(`data-sword-role="background"[^>]+src="${asset.replaceAll(".", "\\.")}"`));
    assert.match(html, new RegExp(`data-sword-role="showcase"[^>]+src="${asset.replaceAll(".", "\\.")}"`));
    assert.match(html, /css\/sword-background\.css\?v=20260724-three-armory-v1/);
    assert.match(html, /js\/main\.js\?v=[\w-]+/);
});

test("hero showcase hands off to the cinematic background with linear scroll motion", async () => {
    const js = await load("../js/main.js");

    assert.match(js, /import\(["']\.\/sword-integration-camera\.mjs["']\)/);
    assert.match(js, /interpolateHandoffCamera/);
    assert.match(js, /const handoffPose = isMobile/);
    assert.match(js, /id:\s*["']sword-handoff["']/);
    assert.match(js, /trigger:\s*hero/);
    assert.match(js, /ease:\s*["']none["']/);
    assert.match(js, /--sword-handoff/);
});

test("selected armory weapon controls the cinematic asset and camera stops", async () => {
    const js = await load("../js/main.js");

    assert.match(js, /import\(["']\.\/weapon-armory-data\.mjs["']\)/);
    assert.match(js, /addEventListener\(["']weaponchange["']/);
    assert.match(js, /selectedWeapon\.image/);
    assert.match(js, /selectedWeapon\.cameraStops/);
    assert.match(js, /interpolateCameraStops/);
});

test("sword camera is section-aware and has mobile and reduced-motion fallbacks", async () => {
    const js = await load("../js/main.js");
    const css = await load("../css/sword-background.css");

    assert.match(js, /function buildSwordSectionStops\(/);
    assert.match(js, /sort\(\(a, b\) => a\.offsetTop - b\.offsetTop\)/);
    assert.match(js, /trigger:\s*storyStart/);
    assert.match(js, /xBias\s*=\s*isMobile\s*\?\s*8\s*:\s*0/);
    for (const selector of ["#about", "#projects", ".life-section", "#contact"]) {
        assert.match(js, new RegExp(selector.replace(".", "\\.")));
    }
    assert.match(css, /--sword-handoff/);
    assert.match(css, /@media \(max-width: 760px\)/);
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});

test("desktop project glass preserves sword detail instead of blurring it away", async () => {
    const css = await load("../css/sword-background.css");

    assert.match(css, /body:has\(\.global-sword-stage\) \.projects :is\(\.featured-project, \.showcase-rail, \.project-card\)/);
    assert.match(css, /backdrop-filter:\s*blur\(2px\)/);
    assert.match(css, /rgba\(7, 9, 11, 0\.34\)/);
});
