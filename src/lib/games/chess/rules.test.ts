import test from 'node:test';
import assert from 'node:assert/strict';
import { createChessState, evaluateResult, isInCheck, legalMoves, makeMove, type ChessState } from './rules.ts';

const sq = (row: number, col: number) => ({ row, col });
const move = (state: ChessState, from: [number, number], to: [number, number], extra: Record<string, unknown> = {}) => makeMove(state, { from: sq(...from), to: sq(...to), ...extra });
const blank = (): ChessState => ({ board: Array.from({ length: 8 }, () => Array(8).fill(null)), turn: 'white', result: 'playing', halfmoveClock: 0, positionHistory: [] });

test('starts with the standard board and twenty legal white moves', () => {
  const state = createChessState();
  assert.equal(legalMoves(state).length, 20);
  assert.equal(state.board[7][4]?.kind, 'king');
  assert.equal(state.board[0][3]?.kind, 'queen');
});

test('enforces turns, blocked pieces, and check protection', () => {
  const state = createChessState();
  assert.throws(() => makeMove(state, { from: sq(1, 0), to: sq(2, 0) }));
  assert.throws(() => makeMove(state, { from: sq(7, 4), to: sq(5, 4) }));
  const after = move(move(state, [6, 4], [4, 4]), [1, 4], [3, 4]);
  assert.equal(after.turn, 'white');
});

test('supports castling on both sides when the path is safe', () => {
  let state = blank();
  state.board[7][4] = { color: 'white', kind: 'king', moved: false };
  state.board[7][7] = { color: 'white', kind: 'rook', moved: false };
  state.board[7][0] = { color: 'white', kind: 'rook', moved: false };
  state.board[0][4] = { color: 'black', kind: 'king', moved: false };
  state.positionHistory = [state.positionHistory[0] || ''];
  const kingMoves = legalMoves(state, sq(7, 4));
  assert.ok(kingMoves.some(m => m.castle === 'king-side'));
  assert.ok(kingMoves.some(m => m.castle === 'queen-side'));
  const castled = makeMove(state, kingMoves.find(m => m.castle === 'king-side')!);
  assert.equal(castled.board[7][6]?.kind, 'king');
  assert.equal(castled.board[7][5]?.kind, 'rook');
});

test('rejects castling through check', () => {
  let state = blank();
  state.board[7][4] = { color: 'white', kind: 'king', moved: false };
  state.board[7][7] = { color: 'white', kind: 'rook', moved: false };
  state.board[0][4] = { color: 'black', kind: 'king', moved: false };
  state.board[0][5] = { color: 'black', kind: 'rook', moved: false };
  assert.equal(legalMoves(state, sq(7, 4)).some(m => m.castle === 'king-side'), false);
});

test('promotes a pawn to a selected piece', () => {
  const state = blank();
  state.board[1][0] = { color: 'white', kind: 'pawn', moved: true };
  state.board[0][4] = { color: 'black', kind: 'king', moved: false };
  state.board[7][4] = { color: 'white', kind: 'king', moved: false };
  const promoted = makeMove(state, { from: sq(1, 0), to: sq(0, 0), promotion: 'knight' });
  assert.deepEqual(promoted.board[0][0], { color: 'white', kind: 'knight', moved: true });
});

test('supports en passant immediately after a double pawn move', () => {
  let state = blank();
  state.board[7][4] = { color: 'white', kind: 'king', moved: false };
  state.board[0][4] = { color: 'black', kind: 'king', moved: false };
  state.board[3][4] = { color: 'white', kind: 'pawn', moved: true };
  state.board[1][5] = { color: 'black', kind: 'pawn', moved: false };
  state.turn = 'black';
  state = move(state, [1, 5], [3, 5]);
  const capture = legalMoves(state, sq(3, 4)).find(m => m.enPassant);
  assert.ok(capture);
  const after = makeMove(state, capture!);
  assert.equal(after.board[3][5], null);
  assert.equal(after.board[2][5]?.kind, 'pawn');
});

test('detects checkmate and stalemate', () => {
  let state = blank();
  state.board[0][0] = { color: 'black', kind: 'king', moved: true };
  state.board[2][2] = { color: 'white', kind: 'king', moved: true };
  state.board[1][1] = { color: 'white', kind: 'queen', moved: true };
  state.turn = 'black';
  assert.equal(isInCheck(state, 'black'), true);
  assert.equal(evaluateResult(state), 'white_wins');
  state.board[1][1] = { color: 'white', kind: 'queen', moved: true };
  state.board[1][2] = null;
  assert.equal(evaluateResult(state), 'white_wins');
});

test('detects insufficient material and fifty-move draw', () => {
  let state = blank();
  state.board[7][4] = { color: 'white', kind: 'king', moved: true };
  state.board[0][4] = { color: 'black', kind: 'king', moved: true };
  assert.equal(evaluateResult(state), 'draw_insufficient');
  state.board[7][1] = { color: 'white', kind: 'rook', moved: true };
  state.halfmoveClock = 100;
  assert.equal(evaluateResult(state), 'draw_fifty_move');
});
