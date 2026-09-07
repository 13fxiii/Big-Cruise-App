/** Persist active UNO room so a hard refresh can rehydrate. */
export type UnoSession = {
  roomId: string;
  code: string;
};

export const UNO_SESSION_KEY = 'bc_uno_active_room';

export function loadUnoSession(): UnoSession | null {
  try {
    const raw = sessionStorage.getItem(UNO_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<UnoSession>;
    if (typeof parsed.roomId === 'string' && parsed.roomId && typeof parsed.code === 'string' && parsed.code) {
      return { roomId: parsed.roomId, code: parsed.code };
    }
    return null;
  } catch {
    return null;
  }
}

export function saveUnoSession(session: UnoSession): void {
  try {
    sessionStorage.setItem(UNO_SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore quota / private mode
  }
}

export function clearUnoSession(): void {
  try {
    sessionStorage.removeItem(UNO_SESSION_KEY);
  } catch {
    // ignore
  }
}
