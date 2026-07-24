const freezeCamera = (xPercent, yPercent, scale, rotation, opacity) => Object.freeze({
    xPercent,
    yPercent,
    scale,
    rotation,
    opacity,
});

const freezeStops = (stops) => Object.freeze(
    stops.map(([progress, values]) => Object.freeze({
        progress,
        camera: freezeCamera(...values),
    })),
);

export const DEFAULT_WEAPON_ID = "wolf-longsword";

export const WEAPONS = Object.freeze([
    Object.freeze({
        id: DEFAULT_WEAPON_ID,
        name: "狼首长剑",
        eyebrow: "THE NORTH / 01",
        description: "冷灰钢与旧皮革，一把经历过风雪的守誓之剑。",
        image: "images/longclaw-screen-used-weathered-v2-transparent.png",
        showcase: Object.freeze({ scale: 1, rotation: 0, yPercent: 0 }),
        cameraStops: freezeStops([
            [0, [28, 6, 1, -1, 0.88]],
            [0.24, [-8, -12, 1.02, 0.7, 0.84]],
            [0.52, [12, -30, 1.04, -0.45, 0.82]],
            [0.76, [-10, -48, 1, 0.35, 0.78]],
            [1, [18, -64, 0.94, 0, 0.72]],
        ]),
    }),
    Object.freeze({
        id: "goujian",
        name: "越王勾践剑",
        eyebrow: "YUE · 496 BC / 02",
        description: "黑色菱纹与青铜锋芒，穿过两千年的王者之剑。",
        image: "images/goujian-armory-transparent.webp",
        showcase: Object.freeze({ scale: 0.94, rotation: -1.2, yPercent: 1 }),
        cameraStops: freezeStops([
            [0, [25, 7, 1.04, -2.2, 0.9]],
            [0.24, [-10, -11, 1.07, 1.4, 0.86]],
            [0.52, [11, -29, 1.08, -0.8, 0.84]],
            [0.76, [-8, -47, 1.03, 0.6, 0.8]],
            [1, [16, -65, 0.96, -0.2, 0.74]],
        ]),
    }),
    Object.freeze({
        id: "wado-ichimonji",
        name: "和道一文字",
        eyebrow: "SHIMOTSUKI / 03",
        description: "白柄、黑鞘与一线冷光，克制而坚定。",
        image: "images/wado-ichimonji-armory-transparent.webp",
        showcase: Object.freeze({ scale: 0.9, rotation: 1.4, yPercent: 0 }),
        cameraStops: freezeStops([
            [0, [30, 5, 0.98, 1.6, 0.9]],
            [0.24, [-6, -13, 1.01, -1.1, 0.86]],
            [0.52, [14, -31, 1.03, 0.65, 0.84]],
            [0.76, [-7, -49, 0.99, -0.45, 0.8]],
            [1, [20, -66, 0.92, 0.15, 0.74]],
        ]),
    }),
]);

export function getWeapon(id) {
    return WEAPONS.find((weapon) => weapon.id === id) ?? WEAPONS[0];
}
