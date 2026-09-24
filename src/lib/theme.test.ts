import test from 'node:test';
import assert from 'node:assert/strict';
import { getWeeklyTheme } from './theme.ts';

test('Monday resolves to the DOMINION STATE theme', () => {
  const theme = getWeeklyTheme(new Date('2026-09-07T12:00:00'));
  assert.equal(theme.id, 'dominion-state');
  assert.equal(theme.shortLabel, 'DOMINION');
  assert.equal(theme.displayName, 'DOMINION STATE');
  assert.equal(theme.accent, '#7A1F33');
  assert.equal(theme.typeClass, 'theme-dominion');
});

test('non-Monday resolves to a different seven-day theme', () => {
  const theme = getWeeklyTheme(new Date('2026-09-08T12:00:00'));
  assert.notEqual(theme.id, 'dominion-state');
  assert.ok(theme.accent.startsWith('#'));
});
