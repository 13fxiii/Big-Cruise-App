/** Normalize UNO edge-function responses into a consistent shape. */
export type UnoApiPayload = {
  state?: unknown;
  phase?: string;
  players?: unknown[];
  roomId?: string;
  code?: string;
  [key: string]: unknown;
};

export function extractUnoState(payload: UnoApiPayload): unknown | null {
  if (payload.state) return payload.state;
  // Some actions (state, and sometimes others) return the state object at the top level.
  if (payload.phase && Array.isArray(payload.players)) return payload;
  return null;
}
