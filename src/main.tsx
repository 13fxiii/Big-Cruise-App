import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase, UNO_FUNCTION_URL } from './lib/supabase';
import './styles.css';
import type { UnoCard } from './lib/games/uno/rules';

type User = { id:string; email?:string };
type Player = { id:string; displayName:string; avatarUrl?:string|null; hand?:UnoCard[]; handCount:number; ready:boolean };
type State = { phase:'lobby'|'playing'|'finished'; players:Player[]; discardPile:UnoCard[]; drawPile:UnoCard[]; currentPlayerIndex:number; currentColor:string; winnerId?:string; pendingUnoPlayerId?:string };

const colorMap:Record<string,string>={red:'#ef3340',yellow:'#ffd400',green:'#16a34a',blue:'#2563eb',wild:'#111'};
const label=(c:UnoCard)=>c.kind==='number'?String(c.value):({skip:'⊘',reverse:'↻',draw2:'+2',wild:'WILD',wild4:'+4'} as Record<string,string>)[c.kind];

async function api(user:User, action:string, data:Record<string,unknown>={}){
  if(!supabase) throw new Error('Supabase is not configured');
  const {data:{session}}=await supabase.auth.getSession();
  const r=await fetch(UNO_FUNCTION_URL,{method:'POST',headers:{Authorization:`Bearer ${session?.access_token||''}`,'content-type':'application/json'},body:JSON.stringify({action,...data})});
  const j=await r.json(); if(!r.ok) throw new Error(j.error||'UNO request failed'); return j;
}

function Login({onUser}:{onUser:(u:User)=>void}){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [mode,setMode]=useState<'login'|'signup'>('login'); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError('');if(!supabase){setError('Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the app environment.');setBusy(false);return}const result=mode==='login'?await supabase.auth.signInWithPassword({email,password}):await supabase.auth.signUp({email,password});if(result.error)setError(result.error.message);else if(result.data.user)onUser({id:result.data.user.id,email:result.data.user.email});setBusy(false)};
  return <main className="auth"><div className="logo">BIG CRUISE<span>〽️</span></div><p className="eyebrow">ONE LOGIN. EVERY GAME.</p><form onSubmit={submit}><input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required/><button className="primary" disabled={busy}>{busy?'Loading…':mode==='login'?'Walk in':'Create your seat'}</button>{error&&<p className="error">{error}</p>}</form><button className="link" onClick={()=>setMode(mode==='login'?'signup':'login')}>{mode==='login'?'Need an account? Create one':'Already cruising? Log in'}</button></main>
}

function Uno({user}:{user:User}){
  const [state,setState]=useState<State|null>(null); const [roomId,setRoomId]=useState(''); const [code,setCode]=useState(''); const [joinCode,setJoinCode]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  const run=async(action:string,data:Record<string,unknown>={})=>{try{setBusy(true);setError('');const j=await api(user,action,data);if(j.state)setState(j.state);if(j.roomId)setRoomId(j.roomId);if(j.code)setCode(j.code);return j}catch(e){setError(e instanceof Error?e.message:'Something went wrong')}finally{setBusy(false)}};
  useEffect(()=>{if(!roomId)return;const timer=setInterval(()=>run('state',{roomId}),1800);return()=>clearInterval(timer)},[roomId]);
  if(!state)return <main className="shell"><header><div className="logo small">BIG CRUISE<span>〽️</span></div><button className="ghost" onClick={()=>supabase?.auth.signOut()}>Sign out</button></header><section className="hero"><p className="eyebrow">GAME FIRST</p><h1>UNO, but make it Cruise.</h1><p>Use your BIG CRUISE login. No second account. No nonsense.</p><div className="actions"><button className="primary" onClick={()=>run('create')}>Create room</button><div className="join"><input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="ROOM CODE" maxLength={6}/><button onClick={()=>run('join',{code:joinCode})}>Join</button></div></div>{error&&<p className="error">{error}</p>}</section></main>;
  const me=state.players.find(p=>p.id===user.id); const current=state.players[state.currentPlayerIndex]; const top=state.discardPile.at(-1); const hand=me?.hand||[];
  const play=(card:UnoCard)=>{if(card.color==='wild'){const chosen=window.prompt('Choose color: red, yellow, green, or blue')?.toLowerCase();if(!['red','yellow','green','blue'].includes(chosen||''))return;run('play',{roomId,cardId:card.id,chosenColor:chosen})}else run('play',{roomId,cardId:card.id})};
  return <main className="game"><header><div><div className="logo small">BIG CRUISE<span>〽️</span></div><div className="room">ROOM <b>{code||'—'}</b></div></div><button className="ghost" onClick={()=>supabase?.auth.signOut()}>Exit</button></header><section className="table"><div className="seats">{state.players.map((p,i)=><div className={`seat ${i===state.currentPlayerIndex?'active':''}`} key={p.id}><div className="avatar">{p.displayName.slice(0,1).toUpperCase()}</div><div><b>{p.displayName}</b><span>{p.handCount} cards {i===state.currentPlayerIndex?'• TURN':''}</span></div></div>)}</div><div className="center"><div className="pile draw" onClick={()=>run('draw',{roomId})}>{state.drawPile.length}<small>DRAW</small></div>{top&&<div className="card big" style={{background:colorMap[top.color]}}><span>{label(top)}</span></div>}<div className="status">{state.phase==='finished'?`${state.players.find(p=>p.id===state.winnerId)?.displayName||'Someone'} wins!`:current.id===user.id?'YOUR TURN':`${current.displayName}'s turn`}<small>COLOR: {state.currentColor.toUpperCase()}</small></div></div><div className="hand">{hand.map(c=><button key={c.id} className="card" style={{background:colorMap[c.color]}} onClick={()=>play(c)} disabled={current.id!==user.id||busy}><span>{label(c)}</span></button>)}</div><div className="controls">{state.pendingUnoPlayerId===user.id&&<button className="primary" onClick={()=>run('call_uno',{roomId})}>UNO! 🚨</button>}{state.phase==='lobby'&&<button className="primary" onClick={()=>run('ready',{roomId,ready:true})}>Ready</button>}{state.phase==='lobby'&&state.players.length>=2&&state.players.every(p=>p.ready)&&<button onClick={()=>run('start',{roomId})}>Start game</button>}{state.phase==='finished'&&<button className="primary" onClick={()=>run('rematch',{roomId})}>Rematch</button>}</div>{error&&<p className="error">{error}</p>}</section></main>
}

function App(){const [user,setUser]=useState<User|null>(null);useEffect(()=>{supabase?.auth.getSession().then(({data})=>{if(data.session)setUser({id:data.session.user.id,email:data.session.user.email})});const sub=supabase?.auth.onAuthStateChange((_e,s)=>setUser(s?{id:s.user.id,email:s.user.email}:null));return()=>sub?.data.subscription.unsubscribe()},[]);return user?<Uno user={user}/>:<Login onUser={setUser}/>}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
