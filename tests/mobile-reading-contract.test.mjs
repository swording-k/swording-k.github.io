import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const load = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('mobile browsers share one native reading path without UA-specific touch interception', async () => {
    const [html, portfolio, main] = await Promise.all([
        load('../index.html'),
        load('../js/portfolio-book.js'),
        load('../js/main.js')
    ]);

    for (const source of [html, portfolio, main]) {
        assert.doesNotMatch(source, /MicroMessenger|wechat-reading/);
        assert.doesNotMatch(source, /location\.reload|location\.replace|http-equiv=["']refresh/i);
    }
    assert.doesNotMatch(html, /touchmove|addEventListener\('touchstart'/);
    assert.doesNotMatch(portfolio, /wechat-book\.js|restoreLightBook|自由旋转/);
    assert.match(portfolio, /import\('\.\/mobile-book\.js/);
});

test('mobile pages remain native text at every animation frame', async () => {
    const css = await load('../css/portfolio-book.css');
    assert.match(css, /\.mobile-leaf \.epic-crisp-page\s*\{[^}]*zoom:\s*var\(--ink-scale\)/);
    assert.match(css, /\.mobile-bound \.epic-book\s*\{[^}]*display:\s*none/);
    assert.match(css, /overscroll-behavior-y:\s*contain/);
    assert.doesNotMatch(css, /\.wechat-leaf \.epic-crisp-page\s*\{[^}]*transform:\s*scale/);
});

test('mobile hero copy keeps its two-line hierarchy within the viewport', async () => {
    const css = await load('../css/sword-hall-home.css');
    assert.match(css, /html\.sword-hall-home \.hero-subtitle span\s*\{[^}]*display:\s*block/);
    assert.match(css, /font-size:\s*clamp\(16px,\s*4\.4vw,\s*19px\)/);
});

test('a mobile turn keeps the incoming page readable while the outgoing sheet moves', async () => {
    const mobile = await load('../js/mobile-book.js');
    assert.match(mobile, /stage\.append\(leaf\)/);
    assert.match(mobile, /old\.style\.zIndex\s*=\s*'1'/);
    assert.match(mobile, /old\.animate\(frames\.outgoing/);
    assert.doesNotMatch(mobile, /leaf\.animate\(frames\.incoming/);
    assert.doesNotMatch(mobile, /rotateY|scale\(/);
});

test('desktop WebGL paper uses stronger anisotropic sampling for oblique turns', async () => {
    const webgl = await load('../js/portfolio-book-3d.js');
    assert.match(webgl, /texture\.anisotropy\s*=\s*Math\.min\(8,\s*renderer\.capabilities\.getMaxAnisotropy\(\)\)/);
    assert.match(webgl, /texture\.minFilter\s*=\s*THREE\.LinearMipmapLinearFilter/);
});

test('GitHub Pages never initiates a cross-origin visit request from an embedded mobile browser', async () => {
    const main = await load('../js/main.js');
    const footprint = main.slice(main.indexOf('function initFootprint()'), main.indexOf('function init() {'));
    assert.match(footprint, /window\.location\.hostname/);
    assert.match(footprint, /fetch\("\/api\/visit"/);
    assert.doesNotMatch(main, /baojian-personalweb\.vercel\.app\/api\/visit/);
});

test('mobile publishing uses distinct script versions and the dated resume', async () => {
    const html = await load('../index.html');
    const portfolio = await load('../js/portfolio-book.js');
    const mobile = await load('../js/mobile-book.js');
    const publishedResume = await readFile(new URL('../files/resume-yangkun-ai-product-engineer.pdf', import.meta.url));
    const resumeHash = createHash('sha256').update(publishedResume).digest('hex');

    assert.match(html, /href="files\/resume-yangkun-ai-product-engineer\.pdf\?v=20261029"/);
    assert.match(html, /js\/main\.js\?v=native-reading-1/);
    assert.match(html, /js\/portfolio-book\.js\?v=native-reading-1/);
    assert.match(html, /css\/portfolio-book\.css\?v=native-reading-1/);
    assert.match(html, /css\/sword-hall-home\.css\?v=native-reading-1/);
    assert.match(portfolio, /import\('\.\/mobile-book\.js\?v=native-reading-1'/);
    assert.match(portfolio, /import\('\.\/portfolio-book-3d\.js\?v=native-reading-1'/);
    assert.match(mobile, /from '\.\/book-page-art\.js\?v=native-reading-1'/);
    assert.equal(resumeHash, '67206b2df9e1110bcc09cf4f1c7048e6166cf45590b6734a6c36c313f49e72c4', 'the published PDF must match the approved 10.29 resume');
});
