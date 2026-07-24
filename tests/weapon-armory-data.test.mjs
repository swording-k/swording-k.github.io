import test from "node:test";
import assert from "node:assert/strict";

import {
    DEFAULT_WEAPON_ID,
    WEAPONS,
    getWeapon,
} from "../js/weapon-armory-data.mjs";

test("armory exposes the three approved weapons", () => {
    assert.equal(DEFAULT_WEAPON_ID, "wolf-longsword");
    assert.deepEqual(
        WEAPONS.map(({ id }) => id),
        ["wolf-longsword", "goujian", "wado-ichimonji"],
    );
    assert.equal(new Set(WEAPONS.map(({ image }) => image)).size, 3);
});

test("every weapon has a complete ordered scroll camera", () => {
    for (const weapon of WEAPONS) {
        assert.equal(weapon.cameraStops.length, 5);
        assert.equal(weapon.cameraStops[0].progress, 0);
        assert.equal(weapon.cameraStops.at(-1).progress, 1);
        assert.deepEqual(
            [...weapon.cameraStops].sort((a, b) => a.progress - b.progress),
            weapon.cameraStops,
        );
        for (let index = 1; index < weapon.cameraStops.length; index += 1) {
            assert.ok(
                weapon.cameraStops[index].camera.yPercent
                    < weapon.cameraStops[index - 1].camera.yPercent,
                `${weapon.id} should travel continuously toward the tip`,
            );
        }
    }
});

test("unknown weapon IDs fall back to the wolf longsword", () => {
    assert.equal(getWeapon("invalid").id, DEFAULT_WEAPON_ID);
    assert.equal(getWeapon().id, DEFAULT_WEAPON_ID);
});

test("weapon copy uses canonical names and explains each origin", () => {
    const longclaw = getWeapon("wolf-longsword");
    const goujian = getWeapon("goujian");
    const wado = getWeapon("wado-ichimonji");

    assert.equal(longclaw.name, "长爪");
    assert.match(longclaw.description, /《权力的游戏》/);
    assert.match(longclaw.description, /琼恩·雪诺/);
    assert.match(longclaw.description, /守誓之剑/);
    assert.equal(goujian.name, "越王勾践剑");
    assert.match(goujian.description, /湖北省博物馆/);
    assert.match(goujian.description, /寒光/);
    assert.equal(wado.name, "和道一文字");
    assert.match(wado.description, /索隆/);
    assert.match(wado.description, /古伊娜/);
});
