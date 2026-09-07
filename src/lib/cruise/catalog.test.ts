import test from 'node:test';
import assert from 'node:assert/strict';
import { GAMES, MERCH_NAV } from './catalog.ts';

test('catalog contains all ten in-app games', () => {
  assert.equal(GAMES.length, 10);
  assert.deepEqual(GAMES.map(g => g.id), ['uno','ludo','werewolf','chess','draw-it-out','codenames','word-guess','karaoke','truth-or-dare','kahoot']);
});

test('catalog marks only implemented games as playable', () => {
  assert.equal(GAMES.find(g => g.id === 'uno')?.status, 'playable');
  assert.equal(GAMES.filter(g => g.status === 'playable').length, 1);
});

test('merch is an in-app destination', () => {
  assert.equal(MERCH_NAV.id, 'merch');
});
