import test from 'node:test';
import assert from 'node:assert/strict';
import { extractUnoState } from './response.ts';

test('extractUnoState uses nested state when present', () => {
  const payload = {
    roomId: 'r1',
    code: 'ABC123',
    state: { phase: 'lobby', players: [{ id: 'p1' }] },
  };
  const state = extractUnoState(payload);
  assert.deepEqual(state, { phase: 'lobby', players: [{ id: 'p1' }] });
});

test('extractUnoState accepts top-level state shape from state action', () => {
  const payload = {
    phase: 'lobby',
    players: [
      { id: 'p1', displayName: 'qa.p1', ready: false, handCount: 0 },
      { id: 'p2', displayName: 'qa.p2', ready: false, handCount: 0 },
    ],
    discardPile: [],
    drawPileCount: 0,
    currentPlayerIndex: 0,
    currentColor: 'red',
  };
  const state = extractUnoState(payload);
  assert.ok(state);
  assert.equal((state as { phase: string }).phase, 'lobby');
  assert.equal((state as { players: unknown[] }).players.length, 2);
});

test('extractUnoState returns null for join-only payload without state', () => {
  const payload = { roomId: 'r1', code: 'ABC123' };
  assert.equal(extractUnoState(payload), null);
});
