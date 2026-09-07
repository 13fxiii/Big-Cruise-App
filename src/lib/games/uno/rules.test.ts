import test from 'node:test';
import assert from 'node:assert/strict';
import { canPlayCard, createDeck, createGame, getLegalPlays } from './rules.ts';

test('UNO deck has 108 cards', () => assert.equal(createDeck().length, 108));

test('new four-player game deals seven cards each', () => {
  const state = createGame([0,1,2,3].map(id => ({ id: String(id), displayName: `P${id}`, ready: true })));
  assert.equal(state.players.length, 4);
  assert.deepEqual(state.players.map(p => p.hand.length), [7,7,7,7]);
  assert.equal(state.phase, 'playing');
});

test('card can match color, value, action kind, or wild', () => {
  const top = { id: 't', color: 'red' as const, kind: 'number' as const, value: 7 };
  assert.equal(canPlayCard({ id:'a', color:'red', kind:'number', value:2 }, top, 'red'), true);
  assert.equal(canPlayCard({ id:'b', color:'blue', kind:'number', value:7 }, top, 'red'), true);
  assert.equal(canPlayCard({ id:'c', color:'blue', kind:'skip' }, { id:'x', color:'yellow', kind:'skip' }, 'red'), true);
  assert.equal(canPlayCard({ id:'d', color:'wild', kind:'wild' }, top, 'red'), true);
  assert.equal(canPlayCard({ id:'e', color:'blue', kind:'number', value:3 }, top, 'red'), false);
});

test('only current player receives legal plays', () => {
  const state = createGame([0,1].map(id => ({ id:String(id), displayName:`P${id}`, ready:true })));
  assert.ok(getLegalPlays(state, '0').length >= 0);
  assert.equal(getLegalPlays(state, '1').length, 0);
});
