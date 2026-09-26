import { supabase } from '../supabase';

export type CommunityPost = {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: { display_name?: string | null; username?: string | null; avatar_url?: string | null } | null;
  reactions: Record<string, number>;
};

export type CommunityChallenge = {
  id: string;
  title: string;
  description: string;
  reward_xp: number;
  ends_at: string | null;
};

export type CommunityLeader = { id: string; display_name: string; bch_points: number; level: number };

export async function loadCommunityData() {
  const [postsResult, reactionsResult, challengesResult, leadersResult] = await Promise.all([
    supabase.from('community_posts').select('id,author_id,body,created_at,profiles(display_name,username,avatar_url)').order('created_at', { ascending: false }).limit(20),
    supabase.from('community_reactions').select('post_id,emoji').limit(500),
    supabase.from('community_challenges').select('id,title,description,reward_xp,ends_at').eq('active', true).order('created_at', { ascending: true }).limit(10),
    supabase.from('profiles').select('id,display_name,bch_points,level').order('bch_points', { ascending: false }).limit(10),
  ]);
  if (postsResult.error) throw postsResult.error;
  if (reactionsResult.error) throw reactionsResult.error;
  if (challengesResult.error) throw challengesResult.error;
  if (leadersResult.error) throw leadersResult.error;
  const counts = new Map<string, Record<string, number>>();
  for (const row of reactionsResult.data ?? []) {
    const current = counts.get(row.post_id) ?? {};
    current[row.emoji] = (current[row.emoji] ?? 0) + 1;
    counts.set(row.post_id, current);
  }
  return {
    posts: (postsResult.data ?? []).map((row) => ({ ...row, author: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles, reactions: counts.get(row.id) ?? {} })) as CommunityPost[],
    challenges: (challengesResult.data ?? []) as CommunityChallenge[],
    leaders: (leadersResult.data ?? []) as CommunityLeader[],
  };
}

export async function createCommunityPost(userId: string, body: string) {
  const { error } = await supabase.from('community_posts').insert({ author_id: userId, body: body.trim() });
  if (error) throw error;
}

export async function toggleCommunityReaction(postId: string, userId: string, emoji: string, active: boolean) {
  const query = supabase.from('community_reactions');
  const result = active
    ? await query.delete().eq('post_id', postId).eq('user_id', userId).eq('emoji', emoji)
    : await query.insert({ post_id: postId, user_id: userId, emoji });
  if (result.error) throw result.error;
}

export function subscribeToCommunity(onChange: () => void) {
  const channel = supabase.channel('big-cruise-community-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'community_reactions' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'community_challenges' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'community_challenge_progress' }, onChange)
    .subscribe();
  return () => { void supabase.removeChannel(channel); };
}
