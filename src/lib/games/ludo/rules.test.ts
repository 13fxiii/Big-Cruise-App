import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BASE,
  FINISHED,
  SAFE_SPACES,
  createLudoState,
  legalPieceIds,
  movePiece,
  rematch,
  rollDice,
} from './rules.ts';

function match() {
  return createLudoState({
    matchId: 'match-1',
    roomId: 'room-1',
    players: [
      { id: 'p1', displayName: 'Player 1', color: 'red' },
      { id: 'p2', displayName: 'Player 2', color: 'green' },
    ],
  });
}

test('creates the required deterministic match state', () => {
  const state = match();
  assert.equal(state.matchId, 'match-1');
  assert.equal(state.roomId, 'room-1');
  assert.equal(state.status, 'playing');
  assert.equal(state.phase, 'await_roll');
  assert.equal(state.players[0].pieces.every((piece) => piece.steps === BASE), true);
});

test('only the current player can roll, and six releases a base piece', () => {
  const state = match();
  assert.throws(() => rollDice(state, 'p2', () => 0.1), /Not your turn/);
  assert.equal(rollDice(state, 'p1', () => 5 / 6), 6);
  assert.equal(legalPieceIds(state, 'p1').length, 4);
  movePiece(state, 'p1', state.players[0].pieces[0].id);
  assert.equal(state.players[0].pieces[0].steps, 0);
  assert.equal(state.currentPlayerIndex, 0);
});

test('rejects illegal moves and enforces exact home entry', () => {
  const state = match();
  assert.throws(() => movePiece(state, 'p1', state.players[0].pieces[0].id), /Roll the dice first/);
  state.players[0].pieces[0].steps = FINISHED - 3;
  state.dice = 4;
  state.phase = 'await_move';
  assert.throws(() => movePiece(state, 'p1', state.players[0].pieces[0].id), /Illegal move/);
});

test('captures an opponent on an unsafe track space', () => {
  const state = match();
  state.players[0].pieces[0].steps = 4;
  state.players[1].pieces[0].steps = 44;
  rollDice(state, 'p1', () => 0);
  movePiece(state, 'p1', state.players[0].pieces[0].id);
  assert.equal(state.players[0].pieces[0].steps, 5);
  assert.equal(state.players[1].pieces[0].steps, BASE);
});

test('does not capture on a safe space', () => {
  const state = match();
  state.players[0].pieces[0].steps = 7;
  state.players[1].pieces[0].steps = 47;
  rollDice(state, 'p1', () => 0);
  movePiece(state, 'p1', state.players[0].pieces[0].id);
  assert.equal(SAFE_SPACES.has(8), true);
  assert.equal(state.players[1].pieces[0].steps, 47);
});

test('finishes the match when all pieces reach home', () => {
  const state = match();
  state.players[0].pieces.forEach((piece, index) => { piece.steps = index === 0 ? FINISHED - 4 : FINISHED; });
  rollDice(state, 'p1', () => 0.5);
  movePiece(state, 'p1', state.players[0].pieces[0].id);
  assert.equal(state.status, 'finished');
  assert.equal(state.winnerId, 'p1');
  assert.throws(() => rollDice(state, 'p1', () => 0), /Match is complete/);
});

test('rematch resets pieces while preserving room and match identity', () => {
  const state = match();
  state.status = 'finished';
  state.winnerId = 'p1';
  const next = rematch(state);
  assert.equal(next.roomId, 'room-1');
  assert.equal(next.matchId, 'match-1');
  assert.equal(next.status, 'playing');
  assert.equal(next.players[0].pieces.every((piece) => piece.steps === BASE), true);
});
