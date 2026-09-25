-- Enable client-visible Realtime updates for server-authoritative game sessions.
-- RLS remains the source of truth for which authenticated room members can read rows.
alter publication supabase_realtime add table public.game_sessions;

-- Include the previous row image so clients can detect version gaps and recover safely.
alter table public.game_sessions replica identity full;
