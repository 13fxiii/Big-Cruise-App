import React from 'react';
import { touchFeedback } from '../lib/feedback';
export type PrimaryTab='home'|'games'|'music'|'community'|'profile';
const items:[PrimaryTab,string,string][]=[['home','⌂','Cruise'],['games','✦','Games'],['music','♫','Music'],['community','◎','Community'],['profile','◉','Profile']];
export function BottomNav({tab,onTab}:{tab:PrimaryTab;onTab:(tab:PrimaryTab)=>void}){return <nav className="bottom-nav" aria-label="Primary navigation">{items.map(([id,icon,label])=><button key={id} className={tab===id?'selected':''} aria-current={tab===id?'page':undefined} aria-label={label} onClick={()=>{touchFeedback('tap');onTab(id)}}><span aria-hidden="true">{icon}</span><small>{label}</small></button>)}</nav>}
