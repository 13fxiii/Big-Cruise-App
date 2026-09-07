import test from 'node:test';
import assert from 'node:assert/strict';
import { isMyTurn } from './view-model.ts';

test('UNO lobby never reports a player as having the turn', () => {
  const state = {
    phase: 'lobby' as const,
    players: [{ id: 'user-1' }],
    currentPlayerIndex: 0,
  };

  assert.equal(isMyTurn(state, 'user-1'), false);
});

test('UNO playing state reports the indexed player turn', () => {
  const state = {
    phase: 'playing' as const,
    players: [{ id: 'user-1' }, { id: 'user-2' }],
    currentPlayerIndex: 1,
  };

  assert.equal(isMyTurn(state, 'user-1'), false);
  assert.equal(isMyTurn(state, 'user-2'), true);
});
