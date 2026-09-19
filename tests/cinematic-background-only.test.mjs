import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const load = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('cinematic background is enabled by default without replacing portfolio markup', async () => {
  const html = await load('../index.html');

  assert.match(html, /<html[^>]+class="cinematic-background"/);
  assert.match(html, /<link[^>]+href="css\/cinematic-background\.css\?v=20260919"/);
  assert.doesNotMatch(html, /searchParams\.get\(['"]cinematic['"]\)/i);
  assert.doesNotMatch(html, /cinematic[^'"\s>]*\.mjs/);
  assert.match(html, /class="weapon-armory"/);
  assert.match(html, /id="projects"/);
  assert.match(html, /id="contact"/);
});

test('cinematic stylesheet changes only the page background', async () => {
  const css = await load('../css/cinematic-background.css');

  assert.match(css, /longclaw-hall-v1\.png/);
  assert.match(css, /html\.cinematic-background body/);
  for (const selector of [
    '.hero-name-main',
    '.hero-layout',
    '.weapon-armory',
    '.global-sword-stage',
    '.project-card',
    '.projects-grid',
    '.profile-grid',
    '.contact-panel',
    '.nav-container',
  ]) {
    assert.doesNotMatch(css, new RegExp(`\\${selector}`));
  }
});

test('public role is presented consistently as AI 产品 builder', async () => {
  const html = await load('../index.html');

  assert.doesNotMatch(html, /AI 产品工程师/);
  assert.doesNotMatch(html, /AI Product Engineer/);
  assert.ok((html.match(/AI 产品 builder/g) ?? []).length >= 3);
  assert.match(html, /AI Product Builder/);
});
