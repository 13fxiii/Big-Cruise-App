import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');

test('mobile glass UI keeps the iPhone safety and motion contracts', () => {
  assert.match(css, /backdrop-filter/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /prefers-reduced-motion/);
});

test('mobile-first game surfaces use phone-safe defaults', () => {
  assert.match(css, /--tap-size:44px/);
  assert.match(css, /grid-template-columns:1fr/);
  assert.match(css, /orientation:\s*landscape/);
  assert.match(css, /@media \(hover:hover\)/);
  assert.match(css, /touch-action:manipulation/);
  assert.match(css, /max\(12px,env\(safe-area-inset-left\)\)/);
});

test('mobile matchmaking surfaces have compact room and lobby contracts', () => {
  assert.match(css, /matchmaking-options/);
  assert.match(css, /room-code-card/);
  assert.match(css, /lobby-player/);
  assert.match(css, /connection-dot/);
});
