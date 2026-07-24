import test from "node:test";
import assert from "node:assert/strict";

import {
    resolveDrag,
    resolveStoredWeapon,
    stepWeapon,
} from "../js/weapon-armory-state.mjs";

test("weapon selection steps circularly in both directions", () => {
    assert.equal(stepWeapon("wolf-longsword", 1), "goujian");
    assert.equal(stepWeapon("wolf-longsword", -1), "wado-ichimonji");
    assert.equal(stepWeapon("wado-ichimonji", 1), "wolf-longsword");
});

test("drag selection respects distance and release velocity thresholds", () => {
    assert.equal(resolveDrag({ distance: 50, width: 500, velocity: 0.1 }), 0);
    assert.equal(resolveDrag({ distance: -70, width: 500, velocity: -0.1 }), 1);
    assert.equal(resolveDrag({ distance: 10, width: 500, velocity: 0.5 }), -1);
    assert.equal(resolveDrag({ distance: -10, width: 500, velocity: -0.5 }), 1);
});

test("invalid stored values resolve to the default weapon", () => {
    assert.equal(resolveStoredWeapon("goujian"), "goujian");
    assert.equal(resolveStoredWeapon("unknown"), "wolf-longsword");
    assert.equal(resolveStoredWeapon(null), "wolf-longsword");
});
