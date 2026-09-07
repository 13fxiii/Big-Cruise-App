export type UnoColor = 'red' | 'yellow' | 'green' | 'blue' | 'wild';
export type UnoKind = 'number' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4';
export type UnoCard = { id: string; color: UnoColor; kind: UnoKind; value?: number };

export type UnoPlayer = { id: string; displayName: string; avatarUrl?: string | null; hand: UnoCard[]; ready: boolean };
export type UnoState = {
  players: UnoPlayer[];
  drawPile: UnoCard[];
  discardPile: UnoCard[];
  currentPlayerIndex: number;
  direction: 1 | -1;
  currentColor: UnoColor;
  phase: 'lobby' | 'playing' | 'finished';
  winnerId?: string;
  pendingUnoPlayerId?: string;
};

const COLORS: UnoColor[] = ['red', 'yellow', 'green', 'blue'];
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function createDeck(): UnoCard[] {
  const deck: UnoCard[] = [];
  for (const color of COLORS) {
    deck.push({ id: uid(), color, kind: 'number', value: 0 });
    for (let n = 1; n <= 9; n++) {
      deck.push({ id: uid(), color, kind: 'number', value: n }, { id: uid(), color, kind: 'number', value: n });
    }
    for (const kind of ['skip', 'reverse', 'draw2'] as const) {
      deck.push({ id: uid(), color, kind }, { id: uid(), color, kind });
    }
  }
  for (let i = 0; i < 4; i++) {
    deck.push({ id: uid(), color: 'wild', kind: 'wild' }, { id: uid(), color: 'wild', kind: 'wild4' });
  }
  return deck;
}

export function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createGame(players: Array<Omit<UnoPlayer, 'hand'>>): UnoState {
  const deck = shuffle(createDeck());
  const gamePlayers = players.map((p) => ({ ...p, hand: [] as UnoCard[] }));
  for (let r = 0; r < 7; r++) for (const p of gamePlayers) p.hand.push(deck.pop()!);
  let first = deck.pop()!;
  while (first.kind === 'wild4') { deck.unshift(first); first = deck.pop()!; }
  const state: UnoState = { players: gamePlayers, drawPile: deck, discardPile: [first], currentPlayerIndex: 0, direction: 1, currentColor: first.color === 'wild' ? 'red' : first.color, phase: 'playing' };
  if (first.kind === 'wild') state.currentColor = 'red';
  return state;
}

export const topCard = (state: UnoState) => state.discardPile[state.discardPile.length - 1];
export const currentPlayer = (state: UnoState) => state.players[state.currentPlayerIndex];

export function canPlayCard(card: UnoCard, top: UnoCard, currentColor: UnoColor): boolean {
  return card.color === 'wild' || card.color === currentColor || (card.kind === top.kind && card.kind !== 'number') || (card.kind === 'number' && top.kind === 'number' && card.value === top.value);
}

export function getLegalPlays(state: UnoState, playerId: string): UnoCard[] {
  const p = state.players.find(x => x.id === playerId);
  if (!p || state.phase !== 'playing' || currentPlayer(state).id !== playerId) return [];
  return p.hand.filter(c => canPlayCard(c, topCard(state), state.currentColor) && (c.kind !== 'wild4' || !p.hand.some(x => x.id !== c.id && x.color === state.currentColor)));
}

function recycle(state: UnoState) {
  if (state.drawPile.length || state.discardPile.length <= 1) return;
  const top = state.discardPile.pop()!;
  state.drawPile = shuffle(state.discardPile.splice(0));
  state.discardPile = [top];
}

function drawOne(state: UnoState): UnoCard {
  recycle(state);
  return state.drawPile.pop()!;
}

function nextIndex(state: UnoState, count = 1) {
  let idx = state.currentPlayerIndex;
  for (let i = 0; i < count; i++) idx = (idx + state.direction + state.players.length) % state.players.length;
  state.currentPlayerIndex = idx;
}

export function drawCard(state: UnoState, playerId: string): UnoState {
  if (state.phase !== 'playing' || currentPlayer(state).id !== playerId) throw new Error('Not your turn');
  if (state.pendingUnoPlayerId && state.pendingUnoPlayerId !== playerId) throw new Error('UNO must be called first');
  const card = drawOne(state);
  if (card) currentPlayer(state).hand.push(card);
  return state;
}

export function playCard(state: UnoState, playerId: string, cardId: string, chosenColor?: UnoColor): UnoState {
  if (state.phase !== 'playing' || currentPlayer(state).id !== playerId) throw new Error('Not your turn');
  if (state.pendingUnoPlayerId) throw new Error('Call UNO before the turn advances');
  const p = currentPlayer(state);
  const index = p.hand.findIndex(c => c.id === cardId);
  if (index < 0) throw new Error('Card is not in your hand');
  const card = p.hand[index];
  if (!canPlayCard(card, topCard(state), state.currentColor)) throw new Error('Illegal card');
  if (card.kind === 'wild4' && p.hand.some(x => x.id !== card.id && x.color === state.currentColor)) throw new Error('Wild Draw Four is not legal on this color');
  if ((card.kind === 'wild' || card.kind === 'wild4') && !chosenColor) throw new Error('Choose a color');
  p.hand.splice(index, 1);
  state.discardPile.push(card);
  state.currentColor = card.color === 'wild' ? chosenColor! : card.color;
  if (p.hand.length === 0) { state.phase = 'finished'; state.winnerId = p.id; return state; }
  if (p.hand.length === 1) state.pendingUnoPlayerId = p.id;
  let advance = 1;
  if (card.kind === 'skip') advance = 2;
  if (card.kind === 'reverse') state.direction = state.direction === 1 ? -1 : 1;
  if (card.kind === 'draw2') { nextIndex(state); const victim = currentPlayer(state); victim.hand.push(drawOne(state), drawOne(state)); advance = 1; }
  if (card.kind === 'wild4') { nextIndex(state); const victim = currentPlayer(state); victim.hand.push(drawOne(state), drawOne(state), drawOne(state), drawOne(state)); advance = 1; }
  nextIndex(state, advance);
  return state;
}

export function callUno(state: UnoState, playerId: string): UnoState {
  if (state.pendingUnoPlayerId !== playerId) throw new Error('UNO is not available');
  state.pendingUnoPlayerId = undefined;
  return state;
}

export function rematch(state: UnoState): UnoState {
  return createGame(state.players.map(({ id, displayName, avatarUrl }) => ({ id, displayName, avatarUrl, ready: false })));
}
