export const LUDO_COLORS = ['red', 'green', 'yellow', 'blue'] as const;
export type LudoColor = typeof LUDO_COLORS[number];
export type LudoPhase = 'await_roll' | 'await_move';
export type LudoStatus = 'lobby' | 'playing' | 'finished';

export type LudoPiece = { id: string; steps: number };
export type LudoPlayer = {
  id: string;
  displayName: string;
  cruiseId?: string | null;
  color: LudoColor;
  pieces: LudoPiece[];
  ready: boolean;
};
export type LudoState = {
  matchId: string;
  roomId: string;
  players: LudoPlayer[];
  currentPlayerIndex: number;
  dice: number | null;
  phase: LudoPhase;
  status: LudoStatus;
  winnerId?: string;
};

export const BASE = -1;
export const FINISHED = 58;
export const TRACK_LENGTH = 52;
export const HOME_LENGTH = 6;
export const PIECES_PER_PLAYER = 4;
export const SAFE_SPACES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
const START_OFFSETS = [0, 13, 26, 39] as const;
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export type NewLudoPlayer = { id: string; displayName: string; cruiseId?: string | null; ready?: boolean; color?: LudoColor };

export function createLudoState(input: { matchId: string; roomId: string; players: NewLudoPlayer[]; status?: LudoStatus }): LudoState {
  if (input.players.length < 1 || input.players.length > 4) throw new Error('Ludo needs between 1 and 4 players');
  const players = input.players.map((player, index) => ({
    id: player.id,
    displayName: player.displayName,
    cruiseId: player.cruiseId ?? null,
    color: player.color ?? LUDO_COLORS[index],
    pieces: Array.from({ length: PIECES_PER_PLAYER }, (_, pieceIndex) => ({ id: `${player.id}-${pieceIndex}-${uid()}`, steps: BASE })),
    ready: player.ready ?? false,
  }));
  return {
    matchId: input.matchId,
    roomId: input.roomId,
    players,
    currentPlayerIndex: 0,
    dice: null,
    phase: 'await_roll',
    status: input.status ?? 'playing',
  };
}

export function playerFor(state: LudoState, playerId: string): LudoPlayer {
  const player = state.players.find((candidate) => candidate.id === playerId);
  if (!player) throw new Error('Player is not in this match');
  return player;
}

export function currentPlayer(state: LudoState): LudoPlayer {
  const player = state.players[state.currentPlayerIndex];
  if (!player) throw new Error('Current player is invalid');
  return player;
}

export function absoluteTrackPosition(playerIndex: number, steps: number): number | null {
  if (steps < 0 || steps > TRACK_LENGTH - 1) return null;
  return (START_OFFSETS[playerIndex] + steps) % TRACK_LENGTH;
}

export function canPieceMove(piece: LudoPiece, dice: number, playerIndex: number): boolean {
  if (!Number.isInteger(dice) || dice < 1 || dice > 6) return false;
  if (piece.steps === FINISHED) return false;
  if (piece.steps === BASE) return dice === 6;
  return piece.steps + dice <= FINISHED;
}

export function legalPieceIds(state: LudoState, playerId: string): string[] {
  if (state.status !== 'playing' || state.phase !== 'await_move' || state.dice === null) return [];
  const index = state.players.findIndex((player) => player.id === playerId);
  if (index < 0 || index !== state.currentPlayerIndex) return [];
  return state.players[index].pieces.filter((piece) => canPieceMove(piece, state.dice!, index)).map((piece) => piece.id);
}

function nextPlayer(state: LudoState): void {
  state.currentPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
  state.dice = null;
  state.phase = 'await_roll';
}

function hasWon(player: LudoPlayer): boolean {
  return player.pieces.every((piece) => piece.steps === FINISHED);
}

function captureOpponents(state: LudoState, movingPlayerIndex: number, steps: number): void {
  const trackPosition = absoluteTrackPosition(movingPlayerIndex, steps);
  if (trackPosition === null || SAFE_SPACES.has(trackPosition)) return;
  for (let index = 0; index < state.players.length; index += 1) {
    if (index === movingPlayerIndex) continue;
    for (const piece of state.players[index].pieces) {
      if (absoluteTrackPosition(index, piece.steps) === trackPosition) piece.steps = BASE;
    }
  }
}

export function rollDice(state: LudoState, playerId: string, random: () => number = Math.random): number {
  if (state.status !== 'playing') throw new Error('Match is complete');
  if (state.phase !== 'await_roll') throw new Error('Move the rolled piece first');
  if (currentPlayer(state).id !== playerId) throw new Error('Not your turn');
  const value = Math.floor(random() * 6) + 1;
  state.dice = value;
  state.phase = 'await_move';
  if (legalPieceIds(state, playerId).length === 0) nextPlayer(state);
  return value;
}

export function movePiece(state: LudoState, playerId: string, pieceId: string): LudoState {
  if (state.status !== 'playing') throw new Error('Match is complete');
  if (state.phase !== 'await_move' || state.dice === null) throw new Error('Roll the dice first');
  const playerIndex = state.players.findIndex((player) => player.id === playerId);
  if (playerIndex !== state.currentPlayerIndex) throw new Error('Not your turn');
  const player = state.players[playerIndex];
  const piece = player.pieces.find((candidate) => candidate.id === pieceId);
  if (!piece) throw new Error('Piece is not yours');
  if (!canPieceMove(piece, state.dice, playerIndex)) throw new Error('Illegal move');
  const rolled = state.dice;
  piece.steps = piece.steps === BASE ? 0 : piece.steps + rolled;
  captureOpponents(state, playerIndex, piece.steps);
  if (hasWon(player)) {
    state.status = 'finished';
    state.winnerId = player.id;
    state.dice = null;
    state.phase = 'await_roll';
    return state;
  }
  if (rolled === 6) {
    state.dice = null;
    state.phase = 'await_roll';
  } else {
    nextPlayer(state);
  }
  return state;
}

export function rematch(state: LudoState): LudoState {
  if (state.status !== 'finished') throw new Error('Finish the match before rematching');
  return createLudoState({
    matchId: state.matchId,
    roomId: state.roomId,
    players: state.players.map(({ id, displayName, cruiseId, color }) => ({ id, displayName, cruiseId, color, ready: false })),
  });
}
