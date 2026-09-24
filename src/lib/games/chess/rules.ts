export type ChessColor = 'white' | 'black';
export type ChessPieceKind = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type ChessPiece = { color: ChessColor; kind: ChessPieceKind; moved: boolean };
export type ChessSquare = { row: number; col: number };
export type ChessMove = {
  from: ChessSquare;
  to: ChessSquare;
  promotion?: Exclude<ChessPieceKind, 'king' | 'pawn'>;
  castle?: 'king-side' | 'queen-side';
  enPassant?: boolean;
};
export type ChessResult = 'playing' | 'white_wins' | 'black_wins' | 'draw_stalemate' | 'draw_insufficient' | 'draw_fifty_move' | 'draw_repetition';
export type ChessState = {
  board: (ChessPiece | null)[][];
  turn: ChessColor;
  result: ChessResult;
  lastMove?: ChessMove;
  enPassantTarget?: ChessSquare;
  halfmoveClock: number;
  positionHistory: string[];
};

export const BOARD_SIZE = 8;
export const opposite = (color: ChessColor): ChessColor => color === 'white' ? 'black' : 'white';
export const inBounds = (square: ChessSquare) => square.row >= 0 && square.row < 8 && square.col >= 0 && square.col < 8;
export const sameSquare = (a: ChessSquare, b: ChessSquare) => a.row === b.row && a.col === b.col;
const emptyBoard = () => Array.from({ length: 8 }, () => Array<ChessPiece | null>(8).fill(null));

export function createChessState(): ChessState {
  const board = emptyBoard();
  const back: ChessPieceKind[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  for (let col = 0; col < 8; col++) {
    board[0][col] = { color: 'black', kind: back[col], moved: false };
    board[1][col] = { color: 'black', kind: 'pawn', moved: false };
    board[6][col] = { color: 'white', kind: 'pawn', moved: false };
    board[7][col] = { color: 'white', kind: back[col], moved: false };
  }
  const state: ChessState = { board, turn: 'white', result: 'playing', halfmoveClock: 0, positionHistory: [] };
  state.positionHistory = [positionKey(state)];
  return state;
}

function cloneBoard(board: ChessState['board']) { return board.map(row => row.map(piece => piece ? { ...piece } : null)); }
function cloneState(state: ChessState): ChessState { return { ...state, board: cloneBoard(state.board), positionHistory: [...state.positionHistory], lastMove: state.lastMove ? { ...state.lastMove, from: { ...state.lastMove.from }, to: { ...state.lastMove.to } } : undefined, enPassantTarget: state.enPassantTarget ? { ...state.enPassantTarget } : undefined }; }
const pieceAt = (state: ChessState, square: ChessSquare) => inBounds(square) ? state.board[square.row][square.col] : null;
const direction = (color: ChessColor) => color === 'white' ? -1 : 1;
const homeRow = (color: ChessColor) => color === 'white' ? 7 : 0;
const pawnRow = (color: ChessColor) => color === 'white' ? 6 : 1;
const promotionRow = (color: ChessColor) => color === 'white' ? 0 : 7;

function pseudoMoves(state: ChessState, from: ChessSquare, attacksOnly = false): ChessMove[] {
  const piece = pieceAt(state, from); if (!piece) return [];
  const moves: ChessMove[] = [];
  const add = (to: ChessSquare, extra: Partial<ChessMove> = {}) => { if (!inBounds(to)) return; const target = pieceAt(state, to); if (target?.color === piece.color) return; if (target?.kind === 'king' && !attacksOnly) return; moves.push({ from: { ...from }, to: { ...to }, ...extra }); };
  const ray = (vectors: ChessSquare[]) => { for (const vector of vectors) { let to = { row: from.row + vector.row, col: from.col + vector.col }; while (inBounds(to)) { const target = pieceAt(state, to); if (!target) add(to); else { add(to); break; } to = { row: to.row + vector.row, col: to.col + vector.col }; } } };
  if (piece.kind === 'rook') ray([{ row: 1, col: 0 }, { row: -1, col: 0 }, { row: 0, col: 1 }, { row: 0, col: -1 }]);
  if (piece.kind === 'bishop') ray([{ row: 1, col: 1 }, { row: 1, col: -1 }, { row: -1, col: 1 }, { row: -1, col: -1 }]);
  if (piece.kind === 'queen') ray([{ row: 1, col: 0 }, { row: -1, col: 0 }, { row: 0, col: 1 }, { row: 0, col: -1 }, { row: 1, col: 1 }, { row: 1, col: -1 }, { row: -1, col: 1 }, { row: -1, col: -1 }]);
  if (piece.kind === 'knight') for (const [row, col] of [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]]) add({ row: from.row + row, col: from.col + col });
  if (piece.kind === 'king') {
    for (const [row, col] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) add({ row: from.row + row, col: from.col + col });
    if (!attacksOnly && !piece.moved && from.row === homeRow(piece.color) && from.col === 4) {
      const rook = pieceAt(state, { row: from.row, col: 7 });
      if (rook?.kind === 'rook' && rook.color === piece.color && !rook.moved && !pieceAt(state, { row: from.row, col: 5 }) && !pieceAt(state, { row: from.row, col: 6 })) moves.push({ from: { ...from }, to: { row: from.row, col: 6 }, castle: 'king-side' });
      const queenRook = pieceAt(state, { row: from.row, col: 0 });
      if (queenRook?.kind === 'rook' && queenRook.color === piece.color && !queenRook.moved && !pieceAt(state, { row: from.row, col: 1 }) && !pieceAt(state, { row: from.row, col: 2 }) && !pieceAt(state, { row: from.row, col: 3 })) moves.push({ from: { ...from }, to: { row: from.row, col: 2 }, castle: 'queen-side' });
    }
  }
  if (piece.kind === 'pawn') {
    const step = direction(piece.color); const one = { row: from.row + step, col: from.col };
    if (!attacksOnly && inBounds(one) && !pieceAt(state, one)) {
      add(one, promotionRow(piece.color) === one.row ? { promotion: 'queen' } : {});
      const two = { row: from.row + step * 2, col: from.col };
      if (from.row === pawnRow(piece.color) && !pieceAt(state, two)) add(two);
    }
    for (const col of [from.col - 1, from.col + 1]) {
      const to = { row: from.row + step, col }; if (!inBounds(to)) continue;
      const target = pieceAt(state, to);
      if (target && target.color !== piece.color && target.kind !== 'king') add(to, promotionRow(piece.color) === to.row ? { promotion: 'queen' } : {});
      if (!attacksOnly && state.enPassantTarget && sameSquare(state.enPassantTarget, to)) add(to, { enPassant: true });
    }
  }
  return moves;
}

export function findKing(state: ChessState, color: ChessColor): ChessSquare | null { for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) if (state.board[row][col]?.kind === 'king' && state.board[row][col]?.color === color) return { row, col }; return null; }
export function isSquareAttacked(state: ChessState, square: ChessSquare, byColor: ChessColor): boolean { for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) { const piece = state.board[row][col]; if (!piece || piece.color !== byColor) continue; if (pseudoMoves(state, { row, col }, true).some(move => sameSquare(move.to, square))) return true; } return false; }
export function isInCheck(state: ChessState, color: ChessColor): boolean { const king = findKing(state, color); return !!king && isSquareAttacked(state, king, opposite(color)); }

function applyUnchecked(state: ChessState, move: ChessMove): ChessState {
  const next = cloneState(state); const piece = next.board[move.from.row][move.from.col]; if (!piece) return next;
  next.board[move.from.row][move.from.col] = null;
  if (move.enPassant) next.board[move.from.row][move.to.col] = null;
  next.board[move.to.row][move.to.col] = { ...piece, moved: true, ...(piece.kind === 'pawn' && move.to.row === promotionRow(piece.color) ? { kind: move.promotion || 'queen' } : {}) };
  if (move.castle === 'king-side') { const rook = next.board[move.from.row][7]; next.board[move.from.row][7] = null; next.board[move.from.row][5] = rook ? { ...rook, moved: true } : null; }
  if (move.castle === 'queen-side') { const rook = next.board[move.from.row][0]; next.board[move.from.row][0] = null; next.board[move.from.row][3] = rook ? { ...rook, moved: true } : null; }
  next.enPassantTarget = undefined;
  if (piece.kind === 'pawn' && Math.abs(move.to.row - move.from.row) === 2) next.enPassantTarget = { row: (move.from.row + move.to.row) / 2, col: move.from.col };
  next.turn = opposite(state.turn); next.lastMove = move; return next;
}

function legalMovesForPiece(state: ChessState, from: ChessSquare): ChessMove[] {
  const piece = pieceAt(state, from); if (!piece || piece.color !== state.turn) return [];
  return pseudoMoves(state, from).filter(move => {
    const next = applyUnchecked(state, move);
    if (move.castle) { const step = move.castle === 'king-side' ? 1 : -1; const transit = { row: from.row, col: from.col + step }; if (isInCheck(state, piece.color) || isSquareAttacked(state, transit, opposite(piece.color))) return false; }
    return !isInCheck(next, piece.color);
  });
}

export function legalMoves(state: ChessState, from?: ChessSquare): ChessMove[] { if (state.result !== 'playing') return []; if (from) return legalMovesForPiece(state, from); const moves: ChessMove[] = []; for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) moves.push(...legalMovesForPiece(state, { row, col })); return moves; }
export function isLegalMove(state: ChessState, move: ChessMove): boolean { return legalMovesForPiece(state, move.from).some(candidate => sameSquare(candidate.to, move.to) && (candidate.castle === move.castle) && (candidate.enPassant === move.enPassant)); }

export function positionKey(state: ChessState): string { return state.board.map(row => row.map(piece => piece ? `${piece.color[0]}${piece.kind[0]}` : '__').join('')).join('/') + `|${state.turn}|${state.enPassantTarget ? `${state.enPassantTarget.row}${state.enPassantTarget.col}` : '-'}`; }
function insufficientMaterial(state: ChessState): boolean { const pieces = state.board.flat().filter(Boolean) as ChessPiece[]; const nonKings = pieces.filter(piece => piece.kind !== 'king'); if (nonKings.length === 0) return true; if (nonKings.length === 1 && ['bishop', 'knight'].includes(nonKings[0].kind)) return true; if (nonKings.every(piece => piece.kind === 'bishop')) return true; return false; }
export function evaluateResult(state: ChessState): ChessResult { const moves = legalMoves(state); if (moves.length) { if (insufficientMaterial(state)) return 'draw_insufficient'; if (state.halfmoveClock >= 100) return 'draw_fifty_move'; const key = positionKey(state); if (state.positionHistory.filter(item => item === key).length >= 3) return 'draw_repetition'; return 'playing'; } return isInCheck(state, state.turn) ? (state.turn === 'white' ? 'black_wins' : 'white_wins') : 'draw_stalemate'; }
export function makeMove(state: ChessState, move: ChessMove): ChessState { if (state.result !== 'playing' || !isLegalMove(state, move)) throw new Error('Illegal chess move'); const piece = pieceAt(state, move.from); const captured = pieceAt(state, move.to) || (move.enPassant ? pieceAt(state, { row: move.from.row, col: move.to.col }) : null); const next = applyUnchecked(state, move); next.halfmoveClock = piece?.kind === 'pawn' || captured ? 0 : state.halfmoveClock + 1; next.positionHistory = [...state.positionHistory, positionKey(next)]; next.result = evaluateResult(next); return next; }
