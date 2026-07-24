import test from "node:test";
import assert from "node:assert/strict";

import {
    integrationCameraStops,
    interpolateCameraStops,
    interpolateHandoffCamera,
    interpolateIntegrationCamera,
} from "../js/sword-integration-camera.mjs";

test("generic camera interpolator follows supplied weapon stops", () => {
    const customStops = [
        { progress: 0, camera: { xPercent: 0, yPercent: 10, scale: 1, rotation: 0, opacity: 1 } },
        { progress: 1, camera: { xPercent: 20, yPercent: -30, scale: 0.8, rotation: 2, opacity: 0.6 } },
    ];
    assert.deepEqual(interpolateCameraStops(customStops, -1), customStops[0].camera);
    assert.deepEqual(interpolateCameraStops(customStops, 2), customStops[1].camera);
    assert.deepEqual(interpolateCameraStops(customStops, 0.5), {
        xPercent: 10,
        yPercent: -10,
        scale: 0.9,
        rotation: 1,
        opacity: 0.8,
    });
});

test("integration camera stops cover the full story in order", () => {
    assert.equal(integrationCameraStops.length, 5);
    assert.equal(integrationCameraStops[0].progress, 0);
    assert.equal(integrationCameraStops.at(-1).progress, 1);
    assert.deepEqual(
        [...integrationCameraStops].sort((a, b) => a.progress - b.progress),
        integrationCameraStops,
    );
});

test("integration camera interpolation clamps and returns finite values", () => {
    assert.deepEqual(interpolateIntegrationCamera(-1), integrationCameraStops[0].camera);
    assert.deepEqual(interpolateIntegrationCamera(2), integrationCameraStops.at(-1).camera);

    for (const progress of [0.1, 0.33, 0.5, 0.84]) {
        const camera = interpolateIntegrationCamera(progress);
        for (const key of ["xPercent", "yPercent", "scale", "rotation", "opacity"]) {
            assert.equal(Number.isFinite(camera[key]), true, `${key} should be finite`);
        }
    }
});

test("desktop handoff arcs upward and right before becoming the first story camera", () => {
    const middle = interpolateHandoffCamera(0.5);
    assert.ok(middle.xPercent >= 40, "middle handoff should stay on the right");
    assert.ok(middle.yPercent <= -15, "middle handoff should lift the sword into view");
    assert.ok(middle.scale >= 0.5 && middle.scale <= 0.65, "middle handoff should reveal more of the sword");
    assert.deepEqual(interpolateHandoffCamera(1), integrationCameraStops[0].camera);
});

test("story cameras travel from a visible upper sword to a visible tip", () => {
    const first = integrationCameraStops[0].camera;
    const last = integrationCameraStops.at(-1).camera;

    assert.ok(first.xPercent >= 24, "first story camera should hold the sword to the right");
    assert.ok(first.yPercent <= 8, "first story camera should not sink below the fold");
    assert.ok(last.yPercent <= -60, "final story camera should lift the tip into the viewport");
    assert.ok(last.scale <= 0.96, "final story camera should reveal the tip rather than crop it");
    assert.ok(last.opacity >= 0.68, "final tip should remain visibly present");

    for (let index = 1; index < integrationCameraStops.length; index += 1) {
        assert.ok(
            integrationCameraStops[index].camera.yPercent < integrationCameraStops[index - 1].camera.yPercent,
            "camera should move continuously down the sword",
        );
    }
});
