const camera = (xPercent, yPercent, scale, rotation, opacity) => Object.freeze({
    xPercent,
    yPercent,
    scale,
    rotation,
    opacity,
});

export const integrationCameraStops = Object.freeze([
    Object.freeze({ progress: 0, camera: camera(18, 34, 1.02, -1.2, 0.78) }),
    Object.freeze({ progress: 0.24, camera: camera(-12, 18, 1.08, 0.8, 0.68) }),
    Object.freeze({ progress: 0.52, camera: camera(10, 0, 1.12, -0.55, 0.62) }),
    Object.freeze({ progress: 0.76, camera: camera(-10, -18, 1.08, 0.45, 0.58) }),
    Object.freeze({ progress: 1, camera: camera(8, -34, 1.02, 0, 0.5) }),
]);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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
