import test from "node:test";
import assert from "node:assert/strict";

import {
    integrationCameraStops,
    interpolateIntegrationCamera,
} from "../js/sword-integration-camera.mjs";

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
