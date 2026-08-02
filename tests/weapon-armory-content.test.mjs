import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const load = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("hero exposes a semantic three-weapon armory", async () => {
    const html = await load("../index.html");

    assert.match(html, /class="weapon-armory"[^>]+role="listbox"[^>]+tabindex="0"/);
    assert.equal((html.match(/class="armory-weapon"/g) ?? []).length, 3);
    assert.equal((html.match(/role="option"/g) ?? []).length, 3);
    assert.equal((html.match(/aria-selected="true"/g) ?? []).length, 1);
    assert.match(html, /class="armory-readout"[^>]+aria-live="polite"/);
    assert.match(html, /aria-label="长爪"/);
    assert.match(html, /琼恩·雪诺使用的瓦利利亚钢佩剑/);
    assert.doesNotMatch(html, /莫尔蒙家族/);
    assert.doesNotMatch(html, /狼首长剑/);
});

test("armory includes the three approved weapon assets", async () => {
    const html = await load("../index.html");

    for (const image of [
        "images/longclaw-screen-used-weathered-v2-transparent.png",
        "images/goujian-armory-transparent.webp",
        "images/wado-ichimonji-armory-transparent.webp",
    ]) {
        assert.match(html, new RegExp(image.replaceAll(".", "\\.")));
    }
});

test("armory CSS defines center and side display slots", async () => {
    const css = await load("../css/sword-background.css");

    for (const slot of ["left", "center", "right"]) {
        assert.match(css, new RegExp(`data-slot=["']${slot}["']`));
    }
    assert.match(css, /\.weapon-armory/);
    assert.match(css, /\.armory-readout/);
});

test("armory controller supports drag, click, keyboard, and persistence", async () => {
    const js = await load("../js/main.js");

    assert.match(js, /import\(["']\.\/weapon-armory-state\.mjs["']\)/);
    assert.match(js, /setPointerCapture/);
    assert.match(js, /ArrowLeft/);
    assert.match(js, /ArrowRight/);
    assert.match(js, /baojian:selected-weapon/);
    assert.match(js, /new CustomEvent\(["']weaponchange["']/);
    assert.match(js, /initWeaponArmory\(\)/);
});

test("armory preserves vertical touch scrolling and reduces motion on request", async () => {
    const css = await load("../css/sword-background.css");

    assert.match(css, /touch-action:\s*pan-y/);
    assert.match(css, /@media \(max-width: 760px\)[\s\S]*\.weapon-armory/);
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.armory-weapon/);
});
