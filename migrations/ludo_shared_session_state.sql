alter table public.game_sessions
  add column if not exists state jsonb,
  add column if not exists version bigint not null default 0;

comment on column public.game_sessions.state is 'Server-authoritative state snapshot for games that use the shared session foundation.';
comment on column public.game_sessions.version is 'Optimistic concurrency version for server-authoritative game state.';
