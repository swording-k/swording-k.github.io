import { DEFAULT_WEAPON_ID, WEAPONS, getWeapon } from "./weapon-armory-data.mjs";

export const STORAGE_KEY = "baojian:selected-weapon";

export function resolveStoredWeapon(value) {
    return getWeapon(value).id;
}

export function stepWeapon(id, direction) {
    const currentIndex = WEAPONS.findIndex((weapon) => weapon.id === resolveStoredWeapon(id));
    const step = direction < 0 ? -1 : 1;
    return WEAPONS[(currentIndex + step + WEAPONS.length) % WEAPONS.length].id;
}

export function resolveDrag({ distance, width, velocity }) {
    const safeWidth = Math.max(Number(width) || 0, 1);
    const safeDistance = Number(distance) || 0;
    const safeVelocity = Number(velocity) || 0;
    const distancePassed = Math.abs(safeDistance) >= safeWidth * 0.12;
    const velocityPassed = Math.abs(safeVelocity) >= 0.45;

    if (!distancePassed && !velocityPassed) return 0;
    const directionSource = velocityPassed ? safeVelocity : safeDistance;
    return directionSource < 0 ? 1 : -1;
}

export { DEFAULT_WEAPON_ID };
