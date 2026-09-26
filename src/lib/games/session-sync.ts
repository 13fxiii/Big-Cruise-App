import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';

export type SyncStatus = 'idle' | 'connecting' | 'synced' | 'reconnecting' | 'offline' | 'error';
export type PendingAction = { actionId: string; type: string; payload: Record<string, unknown>; baseVersion: number; createdAt: string };
type SessionRow = { id: string; state: unknown; version: number };
type Options<T> = { roomCode?: string; game: string; actorId: string; initialState?: T };
type Dispatch<T> = { type: string; payload?: Record<string, unknown>; apply?: (state: T | null) => T; rollback?: (state: T | null) => T | null };

const storageKey = (game: string, actorId: string) => `big-cruise-sync:${game}:${actorId}`;
const makeActionId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
function readQueue(key: string): PendingAction[] { try { return JSON.parse(localStorage.getItem(key) || '[]') as PendingAction[]; } catch { return []; } }
function writeQueue(key: string, actions: PendingAction[]) { localStorage.setItem(key, JSON.stringify(actions)); }

export function useSessionSync<T>({ roomCode, game, actorId, initialState }: Options<T>) {
  const [state, setState] = useState<T | null>(initialState ?? null);
  const [version, setVersion] = useState(0);
  const [session, setSession] = useState<SessionRow | null>(null);
  const [status, setStatus] = useState<SyncStatus>(roomCode ? 'connecting' : 'idle');
  const [pending, setPending] = useState<PendingAction[]>(() => readQueue(storageKey(game, actorId)));
  const queueKey = storageKey(game, actorId);
  const stateRef = useRef(state); stateRef.current = state;
  const pendingRef = useRef(pending); pendingRef.current = pending;

  const load = useCallback(async () => {
    if (!roomCode) return;
    setStatus('connecting');
    const { data, error } = await supabase.from('game_sessions').select('id,state,version').eq('room_code', roomCode).eq('game', game).limit(1).maybeSingle();
    if (error || !data) { setStatus(error ? 'error' : 'offline'); return; }
    const next = data as SessionRow; setSession(next); setVersion(Number(next.version)); if (next.state != null) setState(next.state as T); setStatus('synced');
  }, [game, roomCode]);

  const replay = useCallback(async () => {
    if (!session || pendingRef.current.length === 0) return;
    const remaining: PendingAction[] = [];
    for (const action of pendingRef.current) {
      const { error } = await supabase.from('game_session_actions').upsert({ session_id: session.id, action_id: action.actionId, actor_id: actorId, action_type: action.type, payload: action.payload, base_version: action.baseVersion }, { onConflict: 'session_id,action_id', ignoreDuplicates: true });
      if (error) remaining.push(action);
    }
    setPending(remaining); writeQueue(queueKey, remaining);
  }, [actorId, queueKey, session]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (!session) return; void replay(); const channel = supabase.channel(`game-session-sync:${session.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'game_sessions', filter: `id=eq.${session.id}` }, (payload) => { const next = payload.new as SessionRow; if (next?.version != null) { setVersion(Number(next.version)); if (next.state != null) setState(next.state as T); setStatus('synced'); } }).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_session_actions', filter: `session_id=eq.${session.id}` }, () => { void load(); }).subscribe((channelStatus) => { if (channelStatus === 'SUBSCRIBED') setStatus('synced'); if (channelStatus === 'CHANNEL_ERROR' || channelStatus === 'TIMED_OUT') setStatus('reconnecting'); }); return () => { void supabase.removeChannel(channel); }; }, [load, replay, session]);

  const dispatch = useCallback(async ({ type, payload = {}, apply, rollback }: Dispatch<T>) => {
    const previous = stateRef.current;
    if (apply) setState(apply(previous));
    const action: PendingAction = { actionId: makeActionId(), type, payload, baseVersion: version, createdAt: new Date().toISOString() };
    const nextQueue = [...pendingRef.current, action]; setPending(nextQueue); writeQueue(queueKey, nextQueue);
    if (!session) return action.actionId;
    const { error } = await supabase.from('game_session_actions').insert({ session_id: session.id, action_id: action.actionId, actor_id: actorId, action_type: type, payload, base_version: version });
    if (error) { if (rollback) setState(rollback(previous)); const remaining = pendingRef.current.filter((item) => item.actionId !== action.actionId); setPending(remaining); writeQueue(queueKey, remaining); setStatus('reconnecting'); throw error; }
    return action.actionId;
  }, [actorId, queueKey, session, version]);

  return { state, setState, version, status, pending, dispatch, replay, reload: load };
}
