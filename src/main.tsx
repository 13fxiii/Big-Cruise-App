import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase, UNO_FUNCTION_URL } from './lib/supabase';
import './styles.css';
import type { UnoCard } from './lib/games/uno/rules';
import { isMyTurn } from './lib/games/uno/view-model';
import { extractUnoState } from './lib/games/uno/response';
import { getWeeklyTheme } from './lib/theme';

type User = { id: string; email?: string };
type Player = { id: string; displayName: string; avatarUrl?: string | null; hand?: UnoCard[]; handCount: number; ready: boolean };
type State = { phase: 'lobby' | 'playing' | 'finished'; players: Player[]; discardPile: UnoCard[]; drawPileCount: number; currentPlayerIndex: number; currentColor: string; winnerId?: string; pendingUnoPlayerId?: string };

const colorMap: Record<string, string> = { red: '#ef3340', yellow: '#ffd400', green: '#16a34a', blue: '#2563eb', wild: '#111' };
const label = (c: UnoCard) => c.kind === 'number' ? String(c.value) : ({ skip: '⊘', reverse: '↻', draw2: '+2', wild: 'WILD', wild4: '+4' } as Record<string, string>)[c.kind];

async function api(_user: User, action: string, data: Record<string, unknown> = {}) {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data: { session } } = await supabase.auth.getSession();
  const r = await fetch(UNO_FUNCTION_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session?.access_token || ''}`, 'content-type': 'application/json' },
    body: JSON.stringify({ action, ...data }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || 'UNO request failed');
  return j;
}

function ThemeBadge({ theme }: { theme: ReturnType<typeof getWeeklyTheme> }) {
  return <span className="theme-badge" title={theme.displayName} aria-label={`Weekly theme: ${theme.displayName}`}>
    <span aria-hidden="true">{theme.icon}</span>{theme.shortLabel}
  </span>;
}

function Login({ onUser, theme }: { onUser: (u: User) => void; theme: ReturnType<typeof getWeeklyTheme> }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    if (!supabase) {
      setError('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the app environment.');
      setBusy(false);
      return;
    }
    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (result.error) setError(result.error.message);
    else if (result.data.user) onUser({ id: result.data.user.id, email: result.data.user.email });
    setBusy(false);
  };

  return <main className="auth">
    <div className="logo">BIG CRUISE<span>〽️</span></div>
    <ThemeBadge theme={theme} />
    <p className="eyebrow">ONE LOGIN. EVERY GAME.</p>
    <form onSubmit={submit}>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
      <button className="primary" disabled={busy}>{busy ? 'Loading…' : mode === 'login' ? 'Walk in' : 'Create your seat'}</button>
      {error && <p className="error">{error}</p>}
    </form>
    <button className="link" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
      {mode === 'login' ? 'Need an account? Create one' : 'Already cruising? Log in'}
    </button>
  </main>;
}

function WildColorModal({ onChoose, onClose }: { onChoose: (color: string) => void; onClose: () => void }) {
  return <div className="wild-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="wild-modal" role="dialog" aria-modal="true" aria-labelledby="wild-title">
      <h2 id="wild-title">Pick the next color</h2>
      <p>Your Wild card is down. Set the color and keep the cruise moving.</p>
      <div className="wild-options">
        {(['red', 'yellow', 'green', 'blue'] as const).map(color => (
          <button key={color} className={`wild-option wild-${color}`} onClick={() => onChoose(color)}>{color.toUpperCase()}</button>
        ))}
      </div>
      <button className="modal-close" onClick={onClose}>Cancel</button>
    </section>
  </div>;
}

function Uno({ user, theme }: { user: User; theme: ReturnType<typeof getWeeklyTheme> }) {
  const [state, setState] = useState<State | null>(null);
  const [roomId, setRoomId] = useState('');
  const [code, setCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [wildCard, setWildCard] = useState<UnoCard | null>(null);

  const run = async (action: string, data: Record<string, unknown> = {}) => {
    try {
      setBusy(true);
      setError('');
      const j = await api(user, action, data);
      // Accept both { state: {...} } and top-level state shapes from the edge function.
      const nextState = extractUnoState(j);
      if (nextState) setState(nextState as State);
      if (j.roomId) setRoomId(j.roomId);
      if (j.code) setCode(j.code);
      // After join (which may return only roomId/code), immediately refresh full state.
      if (action === 'join' && j.roomId && !nextState) {
        const s = await api(user, 'state', { roomId: j.roomId });
        const joined = extractUnoState(s);
        if (joined) setState(joined as State);
      }
      return j;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!roomId) return;
    const timer = setInterval(() => run('state', { roomId }), 1800);
    return () => clearInterval(timer);
  }, [roomId]);

  if (!state) return <main className="shell">
    <header>
      <div><div className="logo small">BIG CRUISE<span>〽️</span></div><ThemeBadge theme={theme} /></div>
      <button className="ghost" onClick={() => supabase?.auth.signOut()}>Sign out</button>
    </header>
    <section className="hero">
      <p className="eyebrow">GAME FIRST</p>
      <h1>UNO, but make it Cruise.</h1>
      <p>Use your BIG CRUISE login. No second account. No nonsense.</p>
      <div className="actions">
        <button className="primary" onClick={() => run('create')} disabled={busy}>Create room</button>
        <div className="join">
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="ROOM CODE" maxLength={6} aria-label="Room code" />
          <button onClick={() => run('join', { code: joinCode })} disabled={busy || joinCode.length < 4}>Join</button>
        </div>
      </div>
      {error && <p className="error">{error}</p>}
    </section>
  </main>;

  const me = state.players.find(p => p.id === user.id);
  const current = state.players[state.currentPlayerIndex];
  const myTurn = isMyTurn(state, user.id);
  const top = state.discardPile.at(-1);
  const hand = me?.hand || [];

  const play = (card: UnoCard) => {
    if (card.color === 'wild') {
      setWildCard(card);
      return;
    }
    void run('play', { roomId, cardId: card.id });
  };

  const chooseWildColor = (chosenColor: string) => {
    if (!wildCard) return;
    setWildCard(null);
    void run('play', { roomId, cardId: wildCard.id, chosenColor });
  };

  return <main className="game">
    <header>
      <div>
        <div className="logo small">BIG CRUISE<span>〽️</span></div>
        <div className="room">ROOM <b>{code || '—'}</b></div>
        <ThemeBadge theme={theme} />
      </div>
      <button className="ghost" onClick={() => supabase?.auth.signOut()}>Exit</button>
    </header>
    <section className="table">
      <div className="seats">
        {state.players.map((p, i) => <div className={`seat ${i === state.currentPlayerIndex && state.phase === 'playing' ? 'active' : ''}`} key={p.id}>
          <div className="avatar">{p.displayName.slice(0, 1).toUpperCase()}</div>
          <div><b>{p.displayName}</b><span>{p.handCount} cards {i === state.currentPlayerIndex && state.phase === 'playing' ? '• TURN' : ''}</span></div>
        </div>)}
      </div>
      <div className="center">
        <button className="pile draw" onClick={() => run('draw', { roomId })} disabled={!myTurn || busy} aria-label="Draw a card">
          {state.drawPileCount}<small>DRAW</small>
        </button>
        {top && <div className="card big" style={{ background: colorMap[top.color] }} aria-label={`Top card ${label(top)}`}><span>{label(top)}</span></div>}
        <div className="status">
          {state.phase === 'lobby' ? 'WAITING FOR PLAYERS' : state.phase === 'finished' ? `${state.players.find(p => p.id === state.winnerId)?.displayName || 'Someone'} wins!` : myTurn ? 'YOUR TURN' : `${current?.displayName || 'Opponent'}'s turn`}
          <small>{state.phase === 'lobby' ? `${state.players.length}/4 PLAYERS` : `COLOR: ${state.currentColor.toUpperCase()}`}</small>
        </div>
      </div>
      <div className="hand" aria-label="Your hand">
        {hand.map(c => <button key={c.id} className="card" style={{ background: colorMap[c.color] }} onClick={() => play(c)} disabled={!myTurn || busy} aria-label={`Play ${label(c)}`}>
          <span>{label(c)}</span>
        </button>)}
      </div>
      <div className="controls">
        {state.pendingUnoPlayerId === user.id && <button className="primary" onClick={() => run('call_uno', { roomId })}>UNO! 🚨</button>}
        {state.phase === 'lobby' && <button className="primary" onClick={() => run('ready', { roomId, ready: true })}>Ready</button>}
        {state.phase === 'lobby' && state.players.length >= 2 && state.players.every(p => p.ready) && <button onClick={() => run('start', { roomId })}>Start game</button>}
        {state.phase === 'finished' && <button className="primary" onClick={() => run('rematch', { roomId })}>Rematch</button>}
      </div>
      {error && <p className="error">{error}</p>}
    </section>
    {wildCard && <WildColorModal onChoose={chooseWildColor} onClose={() => setWildCard(null)} />}
  </main>;
}

function App() {
  const theme = useMemo(() => getWeeklyTheme(new Date()), []);
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      if (data.session) setUser({ id: data.session.user.id, email: data.session.user.email });
    });
    const sub = supabase?.auth.onAuthStateChange((_e, s) => setUser(s ? { id: s.user.id, email: s.user.email } : null));
    return () => sub?.data.subscription.unsubscribe();
  }, []);

  const themeStyle = {
    '--theme-accent': theme.accent,
    '--theme-accent-strong': theme.accentStrong,
    '--theme-accent-soft': theme.accentSoft,
  } as React.CSSProperties;

  return <div className={theme.typeClass} style={themeStyle} data-theme={theme.id}>
    {user ? <Uno user={user} theme={theme} /> : <Login onUser={setUser} theme={theme} />}
  </div>;
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
