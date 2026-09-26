import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type LobbyPlayer = { user_id: string; display_name: string; seat: number | null; is_host: boolean; ready: boolean };

type Props = { game: string; user: { id: string }; children: React.ReactNode };

export function RealtimeLobby({ game, user, children }: Props) {
  const [code, setCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [players, setPlayers] = useState<LobbyPlayer[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [error, setError] = useState('');

  const refresh = useCallback(async (roomCode: string) => {
    const [{ data: room, error: roomError }, { data: members, error: membersError }] = await Promise.all([
      supabase.from('game_rooms').select('code,status').eq('code', roomCode).limit(1).maybeSingle(),
      supabase.from('game_players').select('user_id,display_name,seat,is_host,ready').eq('room_code', roomCode).order('seat', { ascending: true }),
    ]);
    if (roomError || membersError || !room) throw roomError ?? membersError ?? new Error('Room is no longer available');
    setPlayers((members ?? []) as LobbyPlayer[]); setStatus('connected');
  }, []);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    const channel = supabase.channel(`cruise-lobby:${code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_players', filter: `room_code=eq.${code}` }, () => { if (!cancelled) void refresh(code); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_rooms', filter: `code=eq.${code}` }, () => { if (!cancelled) void refresh(code); })
      .subscribe();
    void refresh(code).catch((reason) => { if (!cancelled) { setStatus('error'); setError(reason instanceof Error ? reason.message : 'Could not reconnect to room'); } });
    return () => { cancelled = true; void supabase.removeChannel(channel); };
  }, [code, refresh]);

  const create = async () => {
    setStatus('loading'); setError('');
    const { data, error: rpcError } = await supabase.rpc('cruise_create_room', { p_game: game, p_seats: 4, p_kind: 'public', p_name: 'Cruiser' });
    const payload = Array.isArray(data) ? data[0] : data;
    if (rpcError || !payload?.code) { setStatus('error'); setError(rpcError?.message ?? 'Could not create a room'); return; }
    setCode(String(payload.code));
  };
  const join = async () => {
    if (joinCode.trim().length < 4) return;
    setStatus('loading'); setError('');
    const { data, error: rpcError } = await supabase.rpc('cruise_join_room', { p_code: joinCode.trim().toUpperCase(), p_name: 'Cruiser' });
    const payload = Array.isArray(data) ? data[0] : data;
    if (rpcError || !payload?.code) { setStatus('error'); setError(rpcError?.message ?? 'Could not join that room'); return; }
    setCode(String(payload.code));
  };
  const toggleReady = async () => { if (!code) return; await supabase.from('game_players').update({ ready: !players.find((player) => player.user_id === user.id)?.ready }).eq('room_code', code).eq('user_id', user.id); await refresh(code); };

  if (!code) return <section className="realtime-lobby matchmaking-shell"><span className="eyebrow">REALTIME ROOM · {game.toUpperCase()}</span><h2>Pull up with your crew.</h2><p className="muted">Rooms stay synced across mobile networks. Create one or join with a code.</p><div className="matchmaking-options"><button className="primary" onClick={() => void create()} disabled={status === 'loading'}><strong>Create live room</strong><small>Open a synced lobby for up to four players</small></button><label className="lobby-join"><span>Have a room code?</span><input aria-label="Room code" value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} placeholder="ROOM CODE" maxLength={8}/><button onClick={() => void join()} disabled={status === 'loading' || joinCode.length < 4}>Join room</button></label></div>{error && <p className="error" role="alert">{error}</p>}</section>;
  const me = players.find((player) => player.user_id === user.id);
  return <section className="realtime-lobby"><div className="room-code-card"><span className="eyebrow">LIVE ROOM · {status === 'connected' ? 'SYNCED' : 'RECONNECTING'}</span><strong>{code}</strong><small>{players.length}/4 seats · invite your crew</small></div><div className="lobby-player-list">{players.map((player) => <div className="lobby-player" key={player.user_id}><span className="connection-dot"/><b>{player.display_name}{player.user_id === user.id ? ' · You' : ''}</b><small>{player.ready ? 'READY' : 'NOT READY'}</small></div>)}</div><div className="lobby-actions"><button className="primary" onClick={() => void toggleReady()}>{me?.ready ? 'Unready' : 'Ready up'}</button><button onClick={() => { setCode(''); setPlayers([]); }}>Change room</button></div>{error && <p className="error" role="alert">{error}</p>}{players.length > 1 && players.every((player) => player.ready) ? children : <p className="muted lobby-waiting">Waiting for everyone to ready up…</p>}</section>;
}
