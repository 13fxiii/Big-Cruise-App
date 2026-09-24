import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase, UNO_FUNCTION_URL } from './lib/supabase';
import './styles.css';
import { getWeeklyTheme } from './lib/theme';
import { GAMES } from './lib/cruise/catalog';
import { addToCart, loadCart, loadStore, placeOrder, setCartQty } from './lib/cruise/store';
import { initializePaystack, verifyPaystack } from './lib/cruise/payments';
import type { CartItem, Product, Variant } from './lib/cruise/store';
import { extractUnoState } from './lib/games/uno/response';
import { clearUnoSession, loadUnoSession, saveUnoSession } from './lib/games/uno/session';
import type { UnoCard } from './lib/games/uno/rules';
import { isMyTurn } from './lib/games/uno/view-model';
import { currentPlayer as ludoCurrentPlayer, legalPieceIds, type LudoState } from './lib/games/ludo/rules';
import { createChessState, legalMoves as chessLegalMoves, makeMove as makeChessMove, type ChessColor, type ChessPieceKind, type ChessState } from './lib/games/chess/rules';

type User={id:string;email?:string};
type Player={id:string;displayName:string;avatarUrl?:string|null;hand?:UnoCard[];handCount:number;ready:boolean};
type State={phase:'lobby'|'playing'|'finished';players:Player[];discardPile:UnoCard[];drawPileCount:number;currentPlayerIndex:number;currentColor:string;winnerId?:string;pendingUnoPlayerId?:string};
type Tab='home'|'games'|'rankings'|'community'|'merch';

async function api(action:string,data:Record<string,unknown>={}){const {data:{session}}=await supabase.auth.getSession();const r=await fetch(UNO_FUNCTION_URL,{method:'POST',headers:{Authorization:`Bearer ${session?.access_token||''}`,'content-type':'application/json'},body:JSON.stringify({action,...data})});const j=await r.json();if(!r.ok)throw new Error(j.error||'Request failed');return j;}
const cardLabel=(c:UnoCard)=>c.kind==='number'?String(c.value):({skip:'⊘',reverse:'↻',draw2:'+2',wild:'WILD',wild4:'+4'} as Record<string,string>)[c.kind];
const cardColor=(c:UnoCard)=>({red:'#ef3340',yellow:'#ffd400',green:'#16a34a',blue:'#2563eb',wild:'#151515'} as Record<string,string>)[c.color];
const naira=(n:number)=>`₦${n.toLocaleString('en-NG')}`;

function ThemeBadge({theme}:{theme:ReturnType<typeof getWeeklyTheme>}){return <span className="theme-badge">{theme.icon} {theme.shortLabel}</span>}
function Header({theme,onTab,onSignOut}:{theme:ReturnType<typeof getWeeklyTheme>;onTab:(t:Tab)=>void;onSignOut:()=>void}){return <header className="app-header"><button className="brand" onClick={()=>onTab('home')}>BIG CRUISE<span>〽️</span></button><div className="header-right"><ThemeBadge theme={theme}/><button className="ghost" onClick={onSignOut}>Exit</button></div></header>}
function Home({theme,onTab}:{theme:ReturnType<typeof getWeeklyTheme>;onTab:(t:Tab)=>void}){const featured=GAMES.filter(g=>theme.featuredGames.includes(g.id));return <main className="page"><section className="today"><div className="eyebrow">TODAY'S CRUISE</div><div className="theme-icon">{theme.icon}</div><h1>{theme.displayName}</h1><p>{theme.description}</p><div className="challenge"><b>🔥 TODAY'S CHALLENGE</b><span>{theme.challenge}</span></div><button className="primary big" onClick={()=>onTab('games')}>PLAY TODAY'S CRUISE →</button></section><section><div className="section-head"><div><span className="eyebrow">FEATURED</span><h2>Games for today</h2></div><button className="link" onClick={()=>onTab('games')}>See all</button></div><div className="game-grid">{featured.map(g=><GameCard key={g.id} game={g} onPlay={()=>onTab('games')}/>)}</div></section><section className="promo-row"><div><span className="eyebrow">7 DAYS OF CRUISE</span><h2>A new reason to pull up every day.</h2><p>Games, challenges and community energy change with the day.</p></div><button onClick={()=>onTab('rankings')}>View rankings</button></section></main>}
function GameCard({game,onPlay}:{game:(typeof GAMES)[number];onPlay:()=>void}){return <button className={`game-card ${game.status}`} onClick={onPlay}><span className="game-art" style={{'--game-accent':game.accent} as React.CSSProperties}>{game.icon}</span><span className="game-meta"><b>{game.name}</b><small>{game.status==='playable'?'PLAY NOW':'COMING SOON'}</small></span><span className="game-arrow">→</span></button>}

function UnoGame({theme,user}:{theme:ReturnType<typeof getWeeklyTheme>;user:User}){
  const [state,setState]=useState<State|null>(null);
  const [roomId,setRoomId]=useState('');
  const [code,setCode]=useState('');
  const [joinCode,setJoinCode]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [selectedColor,setSelectedColor]=useState(false);
  const [reconnecting,setReconnecting]=useState(()=>!!loadUnoSession());

  const run=async(action:string,data:Record<string,unknown>={})=>{
    try{
      setBusy(true);setError('');
      const j=await api(action,data);
      const s=extractUnoState(j);
      if(s)setState(s as State);
      const nextRoomId=typeof j.roomId==='string'?j.roomId:'';
      const nextCode=typeof j.code==='string'?j.code:'';
      if(nextRoomId)setRoomId(nextRoomId);
      if(nextCode)setCode(nextCode);
      const persistId=nextRoomId||roomId;
      const persistCode=nextCode||code;
      if(persistId&&persistCode&&action!=='leave')saveUnoSession({roomId:persistId,code:persistCode});
      if(action==='join'&&j.roomId&&!s){
        const q=await api('state',{roomId:j.roomId});
        const ss=extractUnoState(q);
        if(ss)setState(ss as State);
        if(j.roomId&&(j.code||persistCode))saveUnoSession({roomId:String(j.roomId),code:String(j.code||persistCode)});
      }
      if(action==='leave'){clearUnoSession();setState(null);setRoomId('');setCode('');}
    }catch(e){setError(e instanceof Error?e.message:'Something went wrong')}
    finally{setBusy(false)}
  };

  // Rehydrate after hard refresh / reconnect
  useEffect(()=>{
    const saved=loadUnoSession();
    if(!saved){setReconnecting(false);return;}
    let cancelled=false;
    (async()=>{
      try{
        setBusy(true);setReconnecting(true);
        setRoomId(saved.roomId);setCode(saved.code);
        // Wait for auth token — page refresh restores Supabase session async
        let token='';
        for(let i=0;i<8&&!token&&!cancelled;i++){
          const {data:{session}}=await supabase.auth.getSession();
          token=session?.access_token||'';
          if(!token)await new Promise(r=>setTimeout(r,200));
        }
        if(cancelled)return;
        if(!token){
          // Keep sessionStorage; user may still be signing in
          setReconnecting(false);setBusy(false);
          return;
        }
        const j=await api('state',{roomId:saved.roomId});
        const s=extractUnoState(j);
        if(cancelled)return;
        if(s){
          setState(s as State);
          saveUnoSession(saved);
          if(typeof j.roomId==='string'&&j.roomId)setRoomId(j.roomId);
          if(typeof j.code==='string'&&j.code)setCode(j.code);
        }else{
          clearUnoSession();setRoomId('');setCode('');setState(null);
        }
      }catch(e){
        if(cancelled)return;
        const msg=e instanceof Error?e.message:'';
        // Only drop the saved room when the server says it is gone
        if(/not found|no such room|invalid room|expired|room does not exist/i.test(msg)){
          clearUnoSession();setRoomId('');setCode('');setState(null);
          setError('Could not reconnect to your room. Create or join again.');
        }else{
          // Transient (network / 401 race): keep session so background poll can recover
          setError(msg||'Reconnect failed. Stay on this tab — retrying…');
        }
      }finally{if(!cancelled){setBusy(false);setReconnecting(false);}}
    })();
    return()=>{cancelled=true;};
  },[user.id]);

  useEffect(()=>{if(!roomId)return;const id=setInterval(()=>void run('state',{roomId}),1800);return()=>clearInterval(id);},[roomId]);

  // Prefer reconnect UI while we still hold a roomId from session (poll may recover)
  if((reconnecting||(!!roomId&&!!loadUnoSession()))&&!state)return <section className="uno-entry"><div><span className="eyebrow">UNO ONLINE</span><h2>Reconnecting…</h2><p>Restoring your room after refresh.</p></div>{error&&<p className="error">{error}</p>}<button className="ghost" style={{marginTop:12}} onClick={()=>{clearUnoSession();setRoomId('');setCode('');setError('');}} disabled={busy}>Start over</button></section>;

  if(!state)return <section className="uno-entry"><div><span className="eyebrow">UNO ONLINE</span><h2>Pull up with your people.</h2><p>One BIG CRUISE login. Real rooms. Real players.</p></div><div className="actions"><button className="primary" onClick={()=>run('create')} disabled={busy}>Create room</button><div className="join"><input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="ROOM CODE" maxLength={6}/><button onClick={()=>run('join',{code:joinCode})} disabled={busy||joinCode.length<4}>Join</button></div></div>{error&&<p className="error">{error}</p>}</section>;

  const me=state.players.find(p=>p.id===user.id);const current=state.players[state.currentPlayerIndex];const myTurn=isMyTurn(state,user.id);const top=state.discardPile.at(-1);const hand=me?.hand||[];
  const play=async(c:UnoCard,chosenColor?:string)=>{if(c.color==='wild'&&!chosenColor){setSelectedColor(true);return}await run('play',{roomId,cardId:c.id,...(chosenColor?{chosenColor}:{})});setSelectedColor(false)};
  const leave=()=>{void run('leave',{roomId});clearUnoSession();setState(null);setRoomId('');setCode('');};

  return <section className="uno-table"><div className="room-head"><div><span className="eyebrow">ROOM {code}</span><h1>UNO <span className="yellow">〽️</span></h1><ThemeBadge theme={theme}/></div><button onClick={leave}>Leave room</button></div><div className="seats">{state.players.map((p,i)=><div className={`seat ${i===state.currentPlayerIndex&&state.phase==='playing'?'active':''}`} key={p.id}><span className="avatar">{p.displayName.slice(0,1).toUpperCase()}</span><div><b>{p.displayName}</b><small>{p.handCount} cards {i===state.currentPlayerIndex&&state.phase==='playing'?'• TURN':''}</small></div></div>)}</div><div className="table-center"><button className="draw-pile" disabled={!myTurn||busy} onClick={()=>run('draw',{roomId})}>{state.drawPileCount}<small>DRAW</small></button>{top&&<div className="big-card" style={{background:cardColor(top)}}>{cardLabel(top)}</div>}<div className="status">{state.phase==='lobby'?'WAITING FOR PLAYERS':state.phase==='finished'?`${state.players.find(p=>p.id===state.winnerId)?.displayName||'Someone'} wins!`:myTurn?'YOUR TURN':`${current?.displayName||'Opponent'}'s turn`}<small>{state.phase==='lobby'?`${state.players.length}/4 PLAYERS`:`COLOR: ${state.currentColor.toUpperCase()}`}</small></div></div><div className="hand">{hand.map(c=><button key={c.id} className="uno-card" style={{background:cardColor(c)}} disabled={!myTurn||busy} onClick={()=>void play(c)}>{cardLabel(c)}</button>)}</div><div className="controls">{state.pendingUnoPlayerId===user.id&&<button className="primary" onClick={()=>run('call_uno',{roomId})}>UNO! 🚨</button>}{state.phase==='lobby'&&<button className="primary" onClick={()=>run('ready',{roomId,ready:true})}>Ready</button>}{state.phase==='lobby'&&state.players.length>=2&&state.players.every(p=>p.ready)&&<button onClick={()=>run('start',{roomId})}>Start game</button>}{state.phase==='finished'&&<button className="primary" onClick={()=>run('rematch',{roomId})}>Rematch</button>}</div>{error&&<p className="error">{error}</p>}{selectedColor&&<div className="modal-backdrop"><div className="modal"><h2>Pick your colour</h2><p>BIG CRUISE wild card.</p><div className="color-picks">{['red','yellow','green','blue'].map(c=><button key={c} className="color-pick" style={{background:c==='yellow'?'#ffd400':c}} onClick={()=>{const card=hand.find(x=>x.color==='wild');if(card)void play(card,c)}}>{c}</button>)}</div><button onClick={()=>setSelectedColor(false)}>Cancel</button></div></div>}</section>;
}

function LudoGame({user}:{user:User}){
  const [state,setState]=useState<LudoState|null>(null);const [code,setCode]=useState('');const [joinCode,setJoinCode]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const apiLudo=async(action:string,data:Record<string,unknown>={})=>{const {data:{session}}=await supabase.auth.getSession();const r=await fetch(`${UNO_FUNCTION_URL.replace('/uno','/ludo')}`,{method:'POST',headers:{Authorization:`Bearer ${session?.access_token||''}`,'content-type':'application/json'},body:JSON.stringify({action,code,...data})});const j=await r.json();if(!r.ok)throw new Error(j.error||'Ludo request failed');return j};
  const run=async(action:string,data:Record<string,unknown>={})=>{try{setBusy(true);setError('');const j=await apiLudo(action,data);if(j.code)setCode(j.code);if(j.phase)setState(j as LudoState);if(action==='join'&&!j.phase){const s=await apiLudo('state',{code:j.code||code});setState(s as LudoState)}if(action==='leave'){setState(null);setCode('')}}catch(e){setError(e instanceof Error?e.message:'Ludo request failed')}finally{setBusy(false)}};
  useEffect(()=>{if(!code)return;const id=setInterval(()=>void run('state'),1800);return()=>clearInterval(id)},[code]);
  const cellFor=(row:number,col:number)=>{const path:[number,number][]=[];for(let c=1;c<=13;c++)path.push([6,c]);for(let r=5;r>=1;r--)path.push([r,13]);for(let r=0;r<=5;r++)path.push([r,8]);for(let c=9;c<=13;c++)path.push([6,c]);for(let r=7;r<=13;r++)path.push([r,8]);for(let c=9;c<=13;c++)path.push([8,c]);for(let r=9;r<=13;r++)path.push([r,8]);return path.findIndex(([r,c])=>r===row&&c===col)};
  if(!state)return <section className="ludo-shell"><span className="eyebrow">LUDO ONLINE</span><h1>Race your pieces home.</h1><p className="muted">Authenticated rooms. Server dice. Real turns.</p><div className="actions"><button className="primary" onClick={()=>void run('create')} disabled={busy}>Create room</button><div className="join"><input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="ROOM CODE" maxLength={4}/><button onClick={()=>void run('join',{code:joinCode})} disabled={busy||joinCode.length!==4}>Join</button></div></div>{error&&<p className="error">{error}</p>}</section>;
  const current=ludoCurrentPlayer(state);const legal=legalPieceIds(state,user.id);const boardPieces=state.players.flatMap((player,playerIndex)=>player.pieces.map(piece=>({player,playerIndex,piece})));const runAction=(action:string,data:Record<string,unknown>={})=>void run(action,data);
  return <section className="ludo-shell"><div className="room-head"><div><span className="eyebrow">ROOM {code} · LUDO</span><h1>Ludo <span className="yellow">〽️</span></h1><p className="muted">{state.status==='lobby'?`${state.players.length}/4 players · get everyone ready`:state.status==='finished'?`${state.players.find(p=>p.id===state.winnerId)?.displayName||'Someone'} wins!`:current.id===user.id?'Your turn':'Opponent turn'}</p></div><button onClick={()=>runAction('leave')}>Exit</button></div>{state.status==='lobby'&&<div className="controls">{state.players.map(p=><span className="theme-badge" key={p.id}>{p.displayName} · {p.ready?'READY':'NOT READY'}</span>)}<button className="primary" onClick={()=>runAction('ready',{ready:true})} disabled={busy}>Ready</button>{state.players.length>=2&&state.players.every(p=>p.ready)&&<button onClick={()=>runAction('start')} disabled={busy}>Start match</button>}</div>}{state.status!=='lobby'&&<><div className="ludo-status"><div><b>{state.phase==='await_roll'?'Roll the dice':`Choose a piece · ${state.dice}`}</b><small>{current.displayName}'s turn</small></div><button className="primary dice-button" disabled={busy||state.status==='finished'||state.phase!=='await_roll'||current.id!==user.id} onClick={()=>runAction('roll')}>{state.dice??'ROLL'}<small>DICE</small></button></div><div className="ludo-board" aria-label="Ludo board">{Array.from({length:225},(_,index)=>{const row=Math.floor(index/15),col=index%15,track=cellFor(row,col);const piece=track===-1?undefined:boardPieces.find(({piece:p,playerIndex})=>{const position=p.steps<0?null:p.steps>=52?null:(playerIndex*13+p.steps)%52;return position===track});return <div key={index} className={`ludo-cell ${row<6&&col<6?'base-red':''} ${row<6&&col>8?'base-green':''} ${row>8&&col<6?'base-blue':''} ${row>8&&col>8?'base-yellow':''} ${track>=0?'track':''} ${piece?'occupied':''}`} style={piece?{['--piece-color' as string]:piece.player.color}:undefined}>{piece&&<button aria-label={`${piece.player.displayName} piece`} className="ludo-piece" disabled={!legal.includes(piece.piece.id)} onClick={()=>runAction('move',{pieceId:piece.piece.id})}>{piece.playerIndex+1}</button>}</div>})}</div>{state.status==='finished'&&<div className="controls"><button className="primary" onClick={()=>runAction('rematch')} disabled={busy}>Rematch</button></div>}</>}{error&&<p className="error">{error}</p>}</section>
}

const CHESS_GLYPHS:Record<ChessColor,Record<ChessPieceKind,string>>={white:{king:'♔',queen:'♕',rook:'♖',bishop:'♗',knight:'♘',pawn:'♙'},black:{king:'♚',queen:'♛',rook:'♜',bishop:'♝',knight:'♞',pawn:'♟'}};
type ChessServerState=ChessState & {status:'lobby'|'playing'|'finished';players:{id:string;displayName:string;color:ChessColor;ready:boolean}[]};
function ChessGame({user}:{user:User}){
  const [state,setState]=useState<ChessServerState|null>(null);const [code,setCode]=useState('');const [joinCode,setJoinCode]=useState('');const [selected,setSelected]=useState<{row:number;col:number}|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const apiChess=async(action:string,data:Record<string,unknown>={})=>{const {data:{session}}=await supabase.auth.getSession();const r=await fetch(`${UNO_FUNCTION_URL.replace('/uno','/chess')}`,{method:'POST',headers:{Authorization:`Bearer ${session?.access_token||''}`,'content-type':'application/json'},body:JSON.stringify({action,code,...data})});const j=await r.json();if(!r.ok)throw new Error(j.error||'Chess request failed');return j};
  const run=async(action:string,data:Record<string,unknown>={})=>{try{setBusy(true);setError('');const j=await apiChess(action,data);if(j.code)setCode(j.code);if(j.board)setState(j as ChessServerState);if(action==='join'&&!j.board){const s=await apiChess('state',{code:j.code||code});setState(s as ChessServerState)}if(action==='leave'){setState(null);setCode('')}}catch(e){setError(e instanceof Error?e.message:'Chess request failed')}finally{setBusy(false)}};
  useEffect(()=>{if(!code)return;const id=setInterval(()=>void run('state'),1800);return()=>clearInterval(id)},[code]);
  const moves=selected&&state?.status==='playing'?chessLegalMoves(state,selected):[];const me=state?.players.find(p=>p.id===user.id);const choose=(row:number,col:number)=>{if(!state||state.status!=='playing')return;const target=moves.find(m=>m.to.row===row&&m.to.col===col);if(target&&selected){void run('move',{move:{...target,promotion:target.promotion||'queen'}});setSelected(null);return}const piece=state.board[row][col];if(piece&&piece.color===me?.color&&piece.color===state.turn){setSelected({row,col});return}setSelected(null)};
  if(!state)return <section className="chess-shell"><span className="eyebrow">CHESS ONLINE</span><h1>Think fast. Play sharp.</h1><p className="muted">Authenticated rooms. Server-validated moves. Real match results.</p><div className="actions"><button className="primary" onClick={()=>void run('create')} disabled={busy}>Create room</button><div className="join"><input value={joinCode} onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="ROOM CODE" maxLength={4}/><button onClick={()=>void run('join',{code:joinCode})} disabled={busy||joinCode.length!==4}>Join</button></div></div>{error&&<p className="error" role="alert">{error}</p>}</section>;
  return <section className="chess-shell"><div className="room-head"><div><span className="eyebrow">ROOM {code} · CHESS</span><h1>Chess <span className="yellow">〽️</span></h1><p className="muted">{state.status==='lobby'?`${state.players.length}/2 players · ready up`:state.result==='playing'?`${state.turn==='white'?'White':'Black'} to move`:state.result.replaceAll('_',' ')}</p></div><button onClick={()=>void run('leave')}>Exit</button></div>{state.status==='lobby'&&<div className="controls">{state.players.map(p=><span className="theme-badge" key={p.id}>{p.displayName} · {p.ready?'READY':'NOT READY'}</span>)}<button className="primary" onClick={()=>void run('ready',{ready:true})} disabled={busy}>Ready</button>{state.players.length===2&&state.players.every(p=>p.ready)&&<button onClick={()=>void run('start')} disabled={busy}>Start match</button>}</div>}{state.status!=='lobby'&&<><div className="chess-board" role="grid" aria-label="Chess board">{state.board.map((row,rowIndex)=>row.map((piece,col)=>{const active=selected?.row===rowIndex&&selected.col===col;const legal=moves.some(m=>m.to.row===rowIndex&&m.to.col===col);return <button role="gridcell" aria-label={`${String.fromCharCode(97+col)}${8-rowIndex}${piece?` ${piece.color} ${piece.kind}`:''}`} key={`${rowIndex}-${col}`} className={`chess-square ${(rowIndex+col)%2?'dark':'light'} ${active?'selected':''} ${legal?'legal':''}`} onClick={()=>choose(rowIndex,col)} disabled={state.result!=='playing'}>{piece&&<span className={`chess-piece ${piece.color}`}>{CHESS_GLYPHS[piece.color][piece.kind]}</span>}</button>}))}</div><div className="chess-help"><span>{state.result==='playing'?'Tap a piece, then a highlighted square.':'MATCH COMPLETE'}</span><span>{state.result!=='playing'&&<button className="primary" onClick={()=>void run('rematch')} disabled={busy}>Rematch</button>}</span></div></>}{error&&<p className="error" role="alert">{error}</p>}</section>;
}

function Games({theme,user}:{theme:ReturnType<typeof getWeeklyTheme>;user:User}){const [selected,setSelected]=useState('uno');const game=GAMES.find(g=>g.id===selected)!;if(selected==='ludo')return <main className="page"><button className="link" onClick={()=>setSelected('uno')}>← Back to games</button><LudoGame user={user}/></main>;if(selected==='chess')return <main className="page"><button className="link" onClick={()=>setSelected('uno')}>← Back to games</button><ChessGame user={user}/></main>;if(selected!=='uno')return <main className="page"><div className="section-head"><div><span className="eyebrow">🎮 BIG CRUISE ARCADE</span><h1>{game.icon} {game.name}</h1></div><button onClick={()=>setSelected('uno')}>Back to UNO</button></div><section className="coming"><div className="coming-icon">{game.icon}</div><h2>{game.name} is joining the Cruise.</h2><p>The game slot and weekly-theme integration are ready. Its licensed engine will plug into this same BIG CRUISE identity, rooms and points system.</p><button className="primary" onClick={()=>setSelected('uno')}>Play UNO instead</button></section></main>;return <main className="page"><div className="section-head"><div><span className="eyebrow">🎮 BIG CRUISE ARCADE</span><h1>Choose your game.</h1><p className="muted">{theme.icon} {theme.displayName} · today's featured games are highlighted.</p></div></div><div className="game-grid all">{GAMES.map(g=><GameCard key={g.id} game={g} onPlay={()=>setSelected(g.id)}/>)}</div><UnoGame theme={theme} user={user}/></main>}

function Merch(){const [products,setProducts]=useState<Product[]>([]);const [variants,setVariants]=useState<Variant[]>([]);const [cart,setCart]=useState<CartItem[]>([]);const [selected,setSelected]=useState<Product|null>(null);const [size,setSize]=useState('');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [checkout,setCheckout]=useState(false);const [form,setForm]=useState({name:'',phone:'',address:'',city:'Lagos',email:''});
 const refresh=async()=>{const [store,bag]=await Promise.all([loadStore(),loadCart()]);setProducts(store.products);setVariants(store.variants);setCart(bag)};
 useEffect(()=>{void refresh().catch(e=>setMessage(e instanceof Error?e.message:'Store unavailable'))},[]);
 useEffect(()=>{const params=new URLSearchParams(window.location.search);if(params.get('payment')!=='complete')return;const reference=params.get('reference')||undefined;const verify=async()=>{try{setBusy(true);const orderId=reference;if(!orderId)throw new Error('Missing payment reference.');const result=await verifyPaystack(orderId,reference);setMessage(result.status==='paid'?`Payment confirmed 🎉 Order ${orderId} is paid.`:`Payment status: ${result.status||'pending'}.`);window.history.replaceState({},'',window.location.pathname)}catch(e){setMessage(e instanceof Error?e.message:'Could not verify payment.')}finally{setBusy(false)}};void verify()},[]);
 const availableSizes=(p:Product)=>variants.filter(v=>v.sku===p.sku&&v.stock>0);const cartTotal=cart.reduce((sum,i)=>{const p=products.find(x=>x.sku===i.sku);return sum+(p?.price_ngn||0)*i.qty},0);
 const add=async()=>{if(!selected||!size)return;try{setBusy(true);setMessage('');setCart(await addToCart(selected.sku,size));setSelected(null);setSize('')}catch(e){setMessage(e instanceof Error?e.message:'Could not add to bag')}finally{setBusy(false)}};
 const checkoutOrder=async(e:React.FormEvent)=>{e.preventDefault();try{setBusy(true);setMessage('');const result=await placeOrder(form);const payment=await initializePaystack(result.orderId);setCheckout(false);if(!payment.authorizationUrl)throw new Error('Payment checkout URL was not returned.');window.location.assign(payment.authorizationUrl)}catch(e){setMessage(e instanceof Error?e.message:'Could not start payment')}finally{setBusy(false)}};
 return <main className="page"><section className="merch-hero"><span className="eyebrow">🛍️ BIG CRUISE MERCH</span><h1>Wear the Cruise.</h1><p>Live catalogue and inventory from BIG CRUISE. Choose your size, add to bag and pay securely with Paystack.</p></section>{message&&<div className="store-message">{message}</div>}<div className="store-toolbar"><span>{products.length} products</span><button className="primary" onClick={()=>setCheckout(true)} disabled={!cart.length||busy}>Bag ({cart.reduce((n,i)=>n+i.qty,0)}) · {naira(cartTotal)}</button></div><div className="product-grid">{products.map(p=>{const stock=availableSizes(p);return <article className="product" key={p.sku}><div className="product-art">〽️</div><div><b>{p.name}</b><span>{naira(p.price_ngn)}</span><small>{p.collection} · {p.status==='preorder'?'PRE-ORDER':p.status.toUpperCase()}</small><p>{p.description}</p></div><button className="primary" disabled={!stock.length||p.status!=='preorder'||busy} onClick={()=>{setSelected(p);setSize(stock[0]?.size||'')}}>{stock.length?'Choose size':'Sold out'}</button></article>})}</div>{cart.length>0&&<section className="cart-panel"><div className="section-head"><div><span className="eyebrow">YOUR BAG</span><h2>Ready to Cruise?</h2></div><b>{naira(cartTotal)}</b></div>{cart.map(i=>{const p=products.find(x=>x.sku===i.sku);return <div className="cart-row" key={i.id}><span>{p?.name||i.sku} · {i.size}</span><div><button onClick={async()=>setCart(await setCartQty(i.sku,i.size,Math.max(0,i.qty-1)))} disabled={busy}>−</button><b>{i.qty}</b><button onClick={async()=>setCart(await setCartQty(i.sku,i.size,i.qty+1))} disabled={busy}>+</button></div></div>})}<button className="primary big" onClick={()=>setCheckout(true)} disabled={busy}>Checkout →</button></section>}{selected&&<div className="modal-backdrop"><div className="modal"><h2>{selected.name}</h2><p>{naira(selected.price_ngn)} · Select your size.</p><div className="size-grid">{availableSizes(selected).map(v=><button className={size===v.size?'selected':''} key={v.id} onClick={()=>setSize(v.size)}>{v.size}<small>{v.stock} left</small></button>)}</div><button className="primary" disabled={!size||busy} onClick={()=>void add()}>Add to bag</button><button onClick={()=>setSelected(null)}>Cancel</button></div></div>}{checkout&&<div className="modal-backdrop"><form className="modal checkout" onSubmit={checkoutOrder}><h2>Checkout</h2><p>Total: <b>{naira(cartTotal)}</b></p>{(['name','phone','email','city'] as const).map(k=><input key={k} required={k!=='email'} placeholder={k[0].toUpperCase()+k.slice(1)} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/>)}<textarea required placeholder="Delivery address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/><p className="muted">You’ll be redirected to Paystack to complete payment. BIG CRUISE only marks an order paid after server-side verification.</p><button className="primary" disabled={busy||!cart.length} type="submit">{busy?'Opening secure payment…':'Pay securely with Paystack'}</button><button type="button" onClick={()=>setCheckout(false)}>Cancel</button></form></div>}</main>}
function Simple({title,body}:{title:string;body:string}){return <main className="page"><section className="empty-page"><span className="eyebrow">BIG CRUISE〽️</span><h1>{title}</h1><p>{body}</p></section></main>}

function App(){
  const theme=useMemo(()=>getWeeklyTheme(new Date()),[]);
  const [user,setUser]=useState<User|null>(null);
  const [tab,setTab]=useState<Tab>(()=>{
    if(new URLSearchParams(window.location.search).get('payment')==='complete')return 'merch';
    if(loadUnoSession())return 'games';
    return 'home';
  });
  useEffect(()=>{supabase.auth.getSession().then(({data})=>{if(data.session)setUser({id:data.session.user.id,email:data.session.user.email})});const s=supabase.auth.onAuthStateChange((_e,session)=>setUser(session?{id:session.user.id,email:session.user.email}:null));return()=>s.data.subscription.unsubscribe()},[]);
  if(!user)return <main className="auth"><div className="logo">BIG CRUISE<span>〽️</span></div><ThemeBadge theme={theme}/><p className="eyebrow">ONE LOGIN. EVERY CRUISE.</p><Login onUser={setUser}/></main>;
  return <div className="app"><Header theme={theme} onTab={setTab} onSignOut={()=>void supabase.auth.signOut()}/>{tab==='home'&&<Home theme={theme} onTab={setTab}/>}{tab==='games'&&<Games theme={theme} user={user}/>}{tab==='merch'&&<Merch/>}{tab==='rankings'&&<Simple title="Cruise Rankings" body="Daily, weekly and all-time rankings will aggregate results from every in-app game and weekly challenge."/>}{tab==='community'&&<Simple title="The Cruise" body="Your community layer is where game results, challenges, profiles and weekly culture come back together."/>}<nav className="bottom-nav" aria-label="Primary navigation">{([['home','🏠','Cruise'],['games','🎮','Games'],['rankings','🏆','Rankings'],['community','👥','Community'],['merch','🛍️','Merch']] as const).map(([id,icon,label])=><button key={id} className={tab===id?'selected':''} aria-current={tab===id?'page':undefined} aria-label={label} onClick={()=>setTab(id)}><span aria-hidden="true">{icon}</span><small>{label}</small></button>)}</nav></div>;
}
 function Login({onUser}:{onUser:(u:User)=>void}){const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [signup,setSignup]=useState(false);const [error,setError]=useState('');return <form className="auth-form" aria-label={signup?'Create a BIG CRUISE account':'Sign in to BIG CRUISE'} onSubmit={async e=>{e.preventDefault();const r=signup?await supabase.auth.signUp({email,password}):await supabase.auth.signInWithPassword({email,password});if(r.error)setError(r.error.message);else if(r.data.user)onUser({id:r.data.user.id,email:r.data.user.email})}}><label htmlFor="auth-email">Email</label><input id="auth-email" name="email" type="email" placeholder="Email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/><label htmlFor="auth-password">Password</label><input id="auth-password" name="password" type="password" placeholder="Password" autoComplete={signup?'new-password':'current-password'} minLength={6} value={password} onChange={e=>setPassword(e.target.value)} required/>{error&&<p className="error" role="alert">{error}</p>}<button className="primary" type="submit">{signup?'Create your seat':'Walk in'}</button><button type="button" className="link" onClick={()=>setSignup(!signup)}>{signup?'Already cruising? Log in':'Need an account? Create one'}</button></form>}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
