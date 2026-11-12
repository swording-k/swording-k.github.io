import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';

const moduleUrl = new URL('../js/mobile-book-state.mjs', import.meta.url);

test('a mobile turn keeps native text flat and moves only the outgoing sheet', async () => {
    assert.ok(existsSync(moduleUrl), 'a pure mobile-turn state helper must exist');
    const { mobileTurnFrames } = await import(moduleUrl);
    const forward = mobileTurnFrames({ forward: true, width: 390, reduced: false });
    const backward = mobileTurnFrames({ forward: false, width: 390, reduced: false });

    assert.equal(forward.outgoing.at(-1).transform, 'translate3d(-390px,0,0)');
    assert.equal(backward.outgoing.at(-1).transform, 'translate3d(390px,0,0)');
    for (const frames of [forward, backward]) {
        const serialized = JSON.stringify(frames);
        assert.doesNotMatch(serialized, /rotate|scale|blur|filter|opacity/i);
    }
    assert.equal(forward.fold[0].transform, 'translate3d(390px,0,0)');
    assert.equal(forward.fold.at(-1).transform, 'translate3d(0px,0,0)');
});

test('reduced motion removes the animated sheet entirely', async () => {
    const { mobileTurnFrames } = await import(moduleUrl);
    assert.equal(mobileTurnFrames({ forward: true, width: 390, reduced: true }), null);
});

test('only a deliberate horizontal swipe turns a page', async () => {
    const { shouldTurnByGesture } = await import(moduleUrl);
    assert.equal(shouldTurnByGesture(-50, 5), true);
    assert.equal(shouldTurnByGesture(50, 5), true);
    assert.equal(shouldTurnByGesture(-20, 5), false);
    assert.equal(shouldTurnByGesture(-50, 50), false);
    assert.equal(shouldTurnByGesture(0, 0), false);
});
