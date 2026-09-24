import { useState } from 'react';
import { askAiHost } from '../lib/aiHost';

export function AiHost(){
  const [open,setOpen]=useState(false);
  const [message,setMessage]=useState('');
  const [reply,setReply]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  const send=async()=>{
    if(!message.trim()||busy)return;
    setBusy(true);setError('');
    try{const result=await askAiHost(message);setReply(result.message);setMessage('');}
    catch(e){setError(e instanceof Error?e.message:'The Host is unavailable right now.');}
    finally{setBusy(false);}
  };

  return <div className="ai-host">
    {open&&<section className="ai-host-panel" aria-label="BIG CRUISE AI Host">
      <div className="ai-host-head"><div><b>BIG CRUISE HOST 🔥</b><small>Your in-app guide</small></div><button className="ghost" onClick={()=>setOpen(false)} aria-label="Close Host">×</button></div>
      <div className="ai-host-body"><p className="ai-host-welcome">Yo! I’m the Host. Need game help, Cruise info, or a quick move? Ask me.</p>{reply&&<p className="ai-host-reply">{reply}</p>}{error&&<p className="error">{error}</p>}</div>
      <div className="ai-host-compose"><input value={message} maxLength={1000} placeholder="Ask the Host…" onChange={e=>setMessage(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')void send();}}/><button className="primary" disabled={busy||!message.trim()} onClick={()=>void send()}>{busy?'…':'Send'}</button></div>
    </section>}
    <button className="ai-host-launcher" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>🔥 <span>Host</span></button>
  </div>;
}
