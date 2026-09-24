import test from 'node:test';
import assert from 'node:assert/strict';
import { GAMES, MERCH_NAV } from './catalog.ts';

test('catalog contains the complete mobile in-app game suite', () => {
  assert.equal(GAMES.length, 16);
  assert.deepEqual(GAMES.map(g => g.id), ['uno','ludo','tictactoe','connect4','werewolf','chess','draw-it-out','codenames','word-guess','karaoke','truth-or-dare','kahoot','othello','gomoku','mancala','word-hunt']);
});

test('catalog marks only implemented games as playable', () => {
  assert.equal(GAMES.find(g => g.id === 'uno')?.status, 'playable');
  assert.equal(GAMES.filter(g => g.status === 'playable').length, 16);
});

test('merch is an in-app destination', () => {
  assert.equal(MERCH_NAV.id, 'merch');
});
