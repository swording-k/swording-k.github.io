import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const load = (path) => readFile(new URL(path, import.meta.url), 'utf8');

test('cinematic query enables a stylesheet without replacing portfolio markup', async () => {
  const html = await load('../index.html');

  assert.match(html, /new URLSearchParams\(location\.search\)/);
  assert.match(html, /visualMode\.get\(['"]cinematic['"]\)/);
  assert.match(html, /cinematic-background\.css/);
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
