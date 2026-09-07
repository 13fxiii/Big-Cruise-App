import test from 'node:test';
import assert from 'node:assert/strict';
import { getWeeklyTheme } from './theme.ts';

test('Monday resolves to the MCM theme', () => {
  const theme = getWeeklyTheme(new Date('2026-09-07T12:00:00'));
  assert.equal(theme.id, 'mcm');
  assert.equal(theme.shortLabel, 'MCM');
  assert.equal(theme.displayName, 'Men Crush Monday');
  assert.equal(theme.icon, '♥︎');
  assert.equal(theme.accent, '#ff4f8b');
  assert.match(theme.typeClass, /mcm/);
});

test('non-Monday resolves to a non-MCM weekly theme', () => {
  const theme = getWeeklyTheme(new Date('2026-09-08T12:00:00'));
  assert.notEqual(theme.id, 'mcm');
  assert.ok(theme.accent.startsWith('#'));
});
