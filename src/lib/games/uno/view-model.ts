export type UnoViewState = {
  phase: 'lobby' | 'playing' | 'finished';
  players: Array<{ id: string }>;
  currentPlayerIndex: number;
};

export function isMyTurn(state: UnoViewState, userId: string): boolean {
  if (state.phase !== 'playing') return false;
  return state.players[state.currentPlayerIndex]?.id === userId;
}
