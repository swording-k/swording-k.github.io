const camera = (xPercent, yPercent, scale, rotation, opacity) => Object.freeze({
    xPercent,
    yPercent,
    scale,
    rotation,
    opacity,
});

export const integrationCameraStops = Object.freeze([
    Object.freeze({ progress: 0, camera: camera(28, 6, 1, -1, 0.88) }),
    Object.freeze({ progress: 0.24, camera: camera(-8, -12, 1.02, 0.7, 0.84) }),
    Object.freeze({ progress: 0.52, camera: camera(12, -30, 1.04, -0.45, 0.82) }),
    Object.freeze({ progress: 0.76, camera: camera(-10, -48, 1, 0.35, 0.78) }),
    Object.freeze({ progress: 1, camera: camera(18, -64, 0.94, 0, 0.72) }),
]);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const desktopHandoffStart = camera(37, -29, 0.27, 0, 0);
const desktopHandoffControl = camera(60, -29, 0.485, 0, 0.78);

export function interpolateHandoffCamera(progress) {
    const t = clamp(progress, 0, 1);
    const inverse = 1 - t;
    const end = integrationCameraStops[0].camera;

    return Object.fromEntries(
        Object.keys(desktopHandoffStart).map((key) => [
            key,
            (inverse * inverse * desktopHandoffStart[key])
                + (2 * inverse * t * desktopHandoffControl[key])
                + (t * t * end[key]),
        ]),
    );
}

export function interpolateIntegrationCamera(progress) {
    const clamped = clamp(progress, 0, 1);
    if (clamped === 0) return integrationCameraStops[0].camera;
    if (clamped === 1) return integrationCameraStops.at(-1).camera;

    const upperIndex = integrationCameraStops.findIndex((stop) => stop.progress >= clamped);
    const lower = integrationCameraStops[upperIndex - 1];
    const upper = integrationCameraStops[upperIndex];
    const localProgress = (clamped - lower.progress) / (upper.progress - lower.progress);

    return Object.fromEntries(
        Object.keys(lower.camera).map((key) => [
            key,
            lower.camera[key] + ((upper.camera[key] - lower.camera[key]) * localProgress),
        ]),
    );
}
