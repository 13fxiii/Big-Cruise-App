import React, { useCallback, useEffect, useState } from 'react';
import { touchFeedback } from '../lib/feedback';
import { createCommunityPost, loadCommunityData, subscribeToCommunity, toggleCommunityReaction, type CommunityChallenge, type CommunityLeader, type CommunityPost } from '../lib/cruise/community';

type CommunityTab = 'feed' | 'challenges' | 'leaderboards';
const fallbackPosts: CommunityPost[] = [
  { id: 'fallback-1', author_id: '', author: { display_name: 'The Cruise Club', username: 'thecruiseclub' }, created_at: new Date().toISOString(), body: 'Friday room is live. Pull up if your playlist has range.', reactions: { '🔥': 128, '😂': 24, '💯': 51 } },
  { id: 'fallback-2', author_id: '', author: { display_name: 'Moyo Moves', username: 'moyo.moves' }, created_at: new Date().toISOString(), body: 'Just cleared a clean sweep on Chess. Who is taking the seat?', reactions: { '👏': 42, '🔥': 31, '💯': 12 } },
  { id: 'fallback-3', author_id: '', author: { display_name: 'Lagos After Dark', username: 'lagosafterdark' }, created_at: new Date().toISOString(), body: 'The best thing about BIG CRUISE is that nobody stays a spectator for long.', reactions: { '❤️': 88, '🔥': 67, '😂': 10 } },
];
const fallbackChallenges: CommunityChallenge[] = [
  { id: 'clean-sweep', title: 'THE CLEAN SWEEP', description: 'Win a match without dropping a round.', reward_xp: 250, ends_at: null },
  { id: 'room-starter', title: 'ROOM STARTER', description: 'Create a room and bring three Cruisers in.', reward_xp: 150, ends_at: null },
  { id: 'play-your-vibe', title: 'PLAY YOUR VIBE', description: 'Play one game and open the BIG CRUISE CONTROL playlist.', reward_xp: 100, ends_at: null },
];
const fallbackLeaders: CommunityLeader[] = [
  { id: 'fx', display_name: 'FX〽️', bch_points: 1284, level: 12 },
  { id: 'moyo', display_name: 'Moyo Moves', bch_points: 1110, level: 10 },
  { id: 'club', display_name: 'Cruise Club', bch_points: 982, level: 9 },
  { id: 'seyi', display_name: 'Seyi Plays', bch_points: 864, level: 8 },
];

function relativeTime(value: string) { const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60000)); return minutes < 60 ? `${minutes}m ago` : `${Math.round(minutes / 60)}h ago`; }

export function CommunityHub({ userId }: { userId?: string }) {
  const [tab, setTab] = useState<CommunityTab>('feed');
  const [posts, setPosts] = useState<CommunityPost[]>(fallbackPosts);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>(fallbackChallenges);
  const [leaders, setLeaders] = useState<CommunityLeader[]>(fallbackLeaders);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [live, setLive] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await loadCommunityData();
      if (data.posts.length) setPosts(data.posts);
      if (data.challenges.length) setChallenges(data.challenges);
      if (data.leaders.length) setLeaders(data.leaders);
      setLive(true);
    } catch { setLive(false); }
  }, []);
  useEffect(() => { void refresh(); return subscribeToCommunity(() => { void refresh(); }); }, [refresh]);

  const publish = async () => {
    if (!userId || !draft.trim()) return;
    try { await createCommunityPost(userId, draft); setDraft(''); setComposerOpen(false); touchFeedback('success'); await refresh(); } catch { /* keep draft for retry */ }
  };
  const react = async (post: CommunityPost, emoji: string) => {
    if (!userId || !post.id || post.id.startsWith('fallback-')) return;
    const key = `${post.id}-${emoji}`; const active = !!liked[key];
    setLiked((current) => ({ ...current, [key]: !active }));
    try { await toggleCommunityReaction(post.id, userId, emoji, active); await refresh(); } catch { setLiked((current) => ({ ...current, [key]: active })); }
  };

  return <main className="page community-page">
    <section className="community-hero"><span className="eyebrow">THE CRUISE · COMMUNITY {live && '· LIVE'}</span><h1>Pull up. Say something.</h1><p className="muted">The board for wins, hot takes, challenges and the people making the room move.</p>{userId && <button className="primary" onClick={() => { setComposerOpen(!composerOpen); touchFeedback('tap'); }}>＋ {composerOpen ? 'Close composer' : 'Start a post'}</button>}{composerOpen && <div className="community-composer"><textarea aria-label="Write a community post" maxLength={500} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="What is moving the room?"/><button className="primary" disabled={!draft.trim()} onClick={() => void publish()}>Post it →</button></div>}</section>
    <div className="community-tabs" role="tablist">{([['feed', 'For You'], ['challenges', 'Challenges'], ['leaderboards', 'Leaderboards']] as const).map(([id, label]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => { touchFeedback('tap'); setTab(id); }}>{label}</button>)}</div>
    {tab === 'feed' && <section className="feed-list" aria-label="Community feed">{posts.map((post) => { const name = post.author?.display_name || post.author?.username || 'Cruiser'; const handle = post.author?.username ? `@${post.author.username.replace(/^@/, '')}` : name; return <article className="post-card" key={post.id}><div className="post-head"><span className="post-avatar">{name.slice(0, 1).toUpperCase()}</span><div><b>{handle}</b><small>{relativeTime(post.created_at)} · cruising now</small></div><button className="post-more" aria-label={`More options for ${name}`}>•••</button></div><p>{post.body}</p><div className="reaction-row">{Object.entries(post.reactions).map(([emoji, count]) => { const active = !!liked[`${post.id}-${emoji}`]; return <button key={emoji} className={active ? 'reacted' : ''} onClick={() => void react(post, emoji)}>{emoji} {count + (active ? 1 : 0)}</button>; })}<button>💬 Join in</button><button className="share-post">↗ Share</button></div></article>; })}</section>}
    {tab === 'challenges' && <section className="challenge-list">{challenges.map((challenge, index) => <article className="challenge-card" key={challenge.id}><span className="challenge-mark">{String(index + 1).padStart(2, '0')}</span><div><b>{challenge.title}</b><p>{challenge.description}</p><small>+{challenge.reward_xp} XP · active now</small></div><button className="primary">{userId ? 'Accept' : 'View'}</button></article>)}</section>}
    {tab === 'leaderboards' && <section className="leaderboard-card"><div className="podium">{leaders.slice(0, 3).map((leader, index) => <div key={leader.id} className={index === 0 ? 'podium-first' : ''}><strong>{index + 1}</strong><b>{leader.display_name}</b><small>{leader.bch_points.toLocaleString()} XP</small></div>)}</div><div className="leader-list">{leaders.map((leader, index) => <div key={leader.id}><span>#{index + 1}</span><b>{leader.display_name}</b><small>{leader.bch_points.toLocaleString()} XP · LVL {leader.level}</small></div>)}</div></section>}
  </main>;
}
