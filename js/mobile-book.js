import { createCrispPage } from './book-page-art.js?v=native-reading-2';
import { mobileTurnFrames, shouldTurnByGesture } from './mobile-book-state.mjs';

export function createMobileBook(host, chapters, { initialPage, onPage, readChapter }) {
    const stage = document.createElement('div');
    stage.className = 'mobile-readable';
    stage.setAttribute('role', 'group');
    stage.setAttribute('aria-label', '作品册，左右滑动翻页');
    host.append(stage);

    const count = chapters.length * 2 + 2;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let current = initialPage;
    let previousPage = initialPage;
    let leaf;
    let moving;
    let gesture;

    function update() {
        if (stage.clientWidth) stage.style.setProperty('--ink-scale', stage.clientWidth / 768);
    }

    function paint(page) {
        const sheet = document.createElement('div');
        sheet.className = 'mobile-leaf';
        const ink = createCrispPage(page, count, chapters);
        ink.classList.add('is-reading-surface');
        sheet.append(ink);
        return sheet;
    }

    function turn(page, animate = true) {
        page = Math.max(0, Math.min(count - 1, page));
        if (leaf && page === current) return;
        moving?.finish();
        const old = leaf;
        const forward = page > previousPage;
        previousPage = current = page;
        leaf = paint(page);
        stage.append(leaf);
        const frames = animate && old && !reduced.matches && mobileTurnFrames({
            forward,
            width: stage.clientWidth || 390,
            reduced: reduced.matches
        });
        if (frames && typeof leaf.animate === 'function') {
            old.style.zIndex = '1';
            old.inert = true;
            old.setAttribute('aria-hidden', 'true');
            const outgoing = old.animate(frames.outgoing, {
                duration: 360,
                easing: 'cubic-bezier(.2,.75,.3,1)',
                fill: 'forwards'
            });
            moving = outgoing;
            outgoing.onfinish = () => {
                old.remove();
                outgoing.cancel();
                if (moving === outgoing) moving = null;
            };
        } else old?.remove();
        onPage(page);
    }

    stage.addEventListener('click', (event) => {
        const action = event.target.closest('[data-surface-action]')?.dataset.surfaceAction;
        if (action === 'open') turn(1);
        if (action === 'prev') turn(current - 1);
        if (action === 'next') turn(current + 1);
        if (action === 'read') readChapter(Math.floor((current - 1) / 2), event.target);
    });

    stage.addEventListener('pointerdown', (event) => {
        gesture = event.isPrimary && !event.target.closest('a,button')
            ? { x: event.clientX, y: event.clientY, id: event.pointerId }
            : null;
    });
    stage.addEventListener('pointercancel', () => { gesture = null; });
    stage.addEventListener('pointerup', (event) => {
        if (!gesture || gesture.id !== event.pointerId) return;
        const dx = event.clientX - gesture.x;
        const dy = event.clientY - gesture.y;
        gesture = null;
        if (shouldTurnByGesture(dx, dy)) turn(current + (dx < 0 ? 1 : -1));
    });

    const observer = new ResizeObserver(update);
    observer.observe(stage);
    update();
    turn(current, false);
    return {
        getCurrentPageIndex: () => current,
        getOrientation: () => 'portrait',
        turnToPage: (page) => turn(page, false),
        flip: turn,
        flipNext: () => turn(current + 1),
        flipPrev: () => turn(current - 1),
        turnToNextPage: () => turn(current + 1, false),
        turnToPrevPage: () => turn(current - 1, false),
        update,
        dispose() {
            observer.disconnect();
            moving?.cancel();
            stage.remove();
        }
    };
}
