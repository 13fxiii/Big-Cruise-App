import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canPlayCard,
  createDeck,
  createGame,
  drawCard,
  getLegalPlays,
  playCard,
  callUno,
  rematch,
} from './rules.ts';

const player = (id: string) => ({ id, displayName: `P${id}`, avatarUrl: null, ready: true });
const stateWith = (cards0: Parameters<typeof playCard>[0]['players'][number]['hand'], cards1: Parameters<typeof playCard>[0]['players'][number]['hand']) => {
  const state = createGame([player('0'), player('1')]);
  state.players[0].hand = cards0;
  state.players[1].hand = cards1;
  state.currentPlayerIndex = 0;
  state.currentColor = 'red';
  state.discardPile = [{ id: 'top', color: 'red', kind: 'number', value: 9 }];
  state.pendingUnoPlayerId = undefined;
  return state;
};

test('UNO deck has 108 cards', () => assert.equal(createDeck().length, 108));

test('new four-player game deals seven cards each', () => {
  const state = createGame([0,1,2,3].map(id => player(String(id))));
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
  const state = createGame([player('0'), player('1')]);
  assert.ok(getLegalPlays(state, '0').length >= 0);
  assert.equal(getLegalPlays(state, '1').length, 0);
});

test('normal number cards hand the turn to the next player', () => {
  const state = stateWith([
    { id: 'a', color: 'red', kind: 'number', value: 2 },
    { id: 'b', color: 'blue', kind: 'number', value: 7 },
  ], [{ id: 'c', color: 'green', kind: 'number', value: 5 }]);
  playCard(state, '0', 'a');
  assert.equal(state.currentPlayerIndex, 1);
  assert.equal(state.players[0].hand.length, 1);
});

test('skip skips exactly one player', () => {
  const state = stateWith([
    { id: 'a', color: 'red', kind: 'skip' },
    { id: 'b', color: 'red', kind: 'number', value: 2 },
  ], [{ id: 'c', color: 'blue', kind: 'number', value: 3 }]);
  playCard(state, '0', 'a');
  assert.equal(state.currentPlayerIndex, 0);
});

test('reverse changes direction and gives turn to the previous player', () => {
  const state = createGame([player('0'), player('1'), player('2')]);
  state.players[0].hand = [{ id: 'a', color: 'red', kind: 'reverse' }];
  state.players[1].hand = [{ id: 'b', color: 'blue', kind: 'number', value: 2 }];
  state.players[2].hand = [{ id: 'c', color: 'green', kind: 'number', value: 3 }];
  state.currentColor = 'red';
  state.discardPile = [{ id: 'top', color: 'red', kind: 'number', value: 9 }];
  playCard(state, '0', 'a');
  assert.equal(state.direction, -1);
  assert.equal(state.currentPlayerIndex, 2);
});

test('+2 makes the next player draw two and then passes the turn', () => {
  const state = stateWith([
    { id: 'a', color: 'red', kind: 'draw2' },
    { id: 'b', color: 'red', kind: 'number', value: 2 },
  ], [{ id: 'c', color: 'blue', kind: 'number', value: 3 }]);
  const before = state.players[1].hand.length;
  playCard(state, '0', 'a');
  assert.equal(state.players[1].hand.length, before + 2);
  assert.equal(state.currentPlayerIndex, 0);
});

test('wild requires a chosen color and applies it', () => {
  const state = stateWith([
    { id: 'a', color: 'wild', kind: 'wild' },
    { id: 'b', color: 'red', kind: 'number', value: 2 },
  ], [{ id: 'c', color: 'blue', kind: 'number', value: 3 }]);
  assert.throws(() => playCard(state, '0', 'a'), /Choose a color/);
  playCard(state, '0', 'a', 'blue');
  assert.equal(state.currentColor, 'blue');
});

test('wild draw four is illegal when the player has the current color', () => {
  const state = stateWith([
    { id: 'a', color: 'wild', kind: 'wild4' },
    { id: 'b', color: 'red', kind: 'number', value: 2 },
  ], [{ id: 'c', color: 'blue', kind: 'number', value: 3 }]);
  assert.throws(() => playCard(state, '0', 'a', 'blue'), /Wild Draw Four is not legal/);
});

test('drawing is blocked while another player has an unresolved UNO call', () => {
  const state = stateWith([
    { id: 'a', color: 'red', kind: 'number', value: 2 },
    { id: 'b', color: 'red', kind: 'number', value: 3 },
  ], [{ id: 'c', color: 'blue', kind: 'number', value: 4 }]);
  state.pendingUnoPlayerId = '1';
  assert.throws(() => drawCard(state, '0'), /UNO must be called first/);
});

test('UNO call clears the pending UNO state', () => {
  const state = createGame([player('0'), player('1')]);
  state.pendingUnoPlayerId = '0';
  callUno(state, '0');
  assert.equal(state.pendingUnoPlayerId, undefined);
});

test('playing the last card finishes the game with a winner', () => {
  const state = stateWith([
    { id: 'a', color: 'red', kind: 'number', value: 2 },
  ], [{ id: 'c', color: 'blue', kind: 'number', value: 4 }]);
  playCard(state, '0', 'a');
  assert.equal(state.phase, 'finished');
  assert.equal(state.winnerId, '0');
});

test('rematch starts a fresh playing game with the same players', () => {
  const state = createGame([player('0'), player('1')]);
  state.phase = 'finished';
  state.winnerId = '0';
  const next = rematch(state);
  assert.equal(next.phase, 'playing');
  assert.deepEqual(next.players.map(p => p.id), ['0', '1']);
  assert.deepEqual(next.players.map(p => p.hand.length), [7, 7]);
});
