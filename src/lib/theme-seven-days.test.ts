import test from 'node:test';
import assert from 'node:assert/strict';
import { CRUISE_DAYS, getWeeklyTheme } from './theme.ts';

test('seven days preserve the brand-locked identities and artwork', () => {
  assert.deepEqual(CRUISE_DAYS.map(day => day.displayName), [
    'DOMINION STATE','NO FILTER ENERGY','SHE MOVES DIFFERENT','ECHO ERA','PLAY YOUR VIBE','READ BETWEEN THE LINES','CHAOS CULTURE',
  ]);
  for (const day of CRUISE_DAYS) {
    assert.match(day.image, /^\/assets\/cruise-days\/.+\.jpg$/);
    assert.match(day.motif, /^\/assets\/cruise-days\/motif-.+\.svg$/);
    assert.equal(day.subthemes.length, 7);
    assert.ok(day.accent.startsWith('#'));
  }
});

test('weekly theme follows Monday through Sunday in the seven-day system', () => {
  assert.equal(getWeeklyTheme(new Date('2026-09-07T12:00:00')).id, 'dominion-state');
  assert.equal(getWeeklyTheme(new Date('2026-09-13T12:00:00')).id, 'chaos-culture');
});
