import React, { useMemo, useState } from 'react';
import { BIG_CRUISE_PLAYLIST, CRUISE_ARTISTS, type CruiseArtist } from '../lib/music';
import { touchFeedback } from '../lib/feedback';

export function MusicHub(){
 const [selected,setSelected]=useState<CruiseArtist|null>(null); const [sent,setSent]=useState('');
 const ranked=useMemo(()=>[...CRUISE_ARTISTS].sort((a,b)=>b.rankSignal-a.rankSignal),[]);
 const book=(event:React.FormEvent<HTMLFormElement>)=>{event.preventDefault();touchFeedback('success');setSent(`Booking request prepared for ${selected?.name}. The BIG CRUISE team can follow up with you.`);setSelected(null)};
 return <main className="page music-page">
  <section className="music-hero"><span className="eyebrow">🎵 BIG CRUISE MUSIC</span><h1>{BIG_CRUISE_PLAYLIST.name}</h1><p>{BIG_CRUISE_PLAYLIST.description}</p><div className="music-actions"><a className="primary big" href={BIG_CRUISE_PLAYLIST.url} target="_blank" rel="noreferrer" onClick={()=>touchFeedback('success')}>Open in Spotify →</a><span className="music-stat">{BIG_CRUISE_PLAYLIST.records} records · 1 hr 9 min</span></div></section>
  <section className="playlist-embed" aria-label="BIG CRUISE CONTROL Spotify playlist"><iframe title="BIG CRUISE CONTROL playlist" src={BIG_CRUISE_PLAYLIST.embedUrl} loading="lazy" allow="fullscreen; picture-in-picture"/></section>
  <section className="artist-section"><div className="section-head"><div><span className="eyebrow">THE CRUISE ROSTER</span><h2>Artistes to watch</h2></div><span className="music-note">Playlist signal ranking</span></div><p className="muted">Ranked from the public playlist track presence currently visible on Spotify. Spotify does not expose live stream counts here, so this is a transparent discovery proxy—not a claim about private stream totals.</p><div className="artist-list">{ranked.map((artist,index)=><article className="artist-card" key={artist.name}><div className="artist-rank">#{index+1}</div><div className="artist-avatar" style={{'--artist-accent':artist.accent} as React.CSSProperties}>{artist.name.slice(0,1)}</div><div className="artist-copy"><b>{artist.name}</b><small>{artist.role} · {artist.playlistTracks.join(' · ')}</small><p>{artist.bio}</p></div><button className="book-button" onClick={()=>{touchFeedback('tap');setSelected(artist)}}>Book me</button></article>)}</div></section>
  {sent&&<div className="result-banner" role="status">{sent}</div>}
  {selected&&<div className="modal-backdrop"><form className="modal booking-modal" onSubmit={book}><span className="eyebrow">BOOK THE CRUISE</span><h2>{selected.name}</h2><p>Send a quick brief and the team can follow up about your event, space or session.</p><input required placeholder="Your name" aria-label="Your name"/><input required type="email" placeholder="Your email" aria-label="Your email"/><input required placeholder="Event date or window" aria-label="Event date or window"/><textarea required placeholder="What are you booking them for?" aria-label="Booking brief"/><button className="primary" type="submit">Prepare booking request</button><button type="button" onClick={()=>setSelected(null)}>Cancel</button></form></div>}
 </main>;
}
