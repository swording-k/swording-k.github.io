export function shouldTurnByGesture(dx, dy) {
    return Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy) * 1.4;
}

export function mobileTurnFrames({ forward, width, reduced }) {
    if (reduced) return null;
    const exit = forward ? -width : width;
    const entrance = forward ? width : -width;
    const slide = (from, to) => [
        { transform: `translate3d(${from}px,0,0)` },
        { transform: `translate3d(${to}px,0,0)` }
    ];
    return {
        outgoing: slide(0, exit),
        fold: slide(entrance, 0)
    };
}
