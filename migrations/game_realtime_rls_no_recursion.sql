-- Remove the game_rooms <-> game_players RLS recursion that blocks Realtime apply_rls().
-- The helper is intentionally narrow: it checks membership for one room/user pair,
-- bypasses table RLS as a tightly-scoped owner function, and exposes no data.
create or replace function public.is_game_room_member(p_room_code text, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.game_players gp
    where gp.room_code = p_room_code
      and gp.user_id = p_user_id
  );
$$;

revoke all on function public.is_game_room_member(text, uuid) from public;
grant execute on function public.is_game_room_member(text, uuid) to authenticated;

drop policy if exists game_rooms_read on public.game_rooms;
drop policy if exists game_players_read on public.game_players;
drop policy if exists game_sessions_read on public.game_sessions;

-- Public rooms remain discoverable. Private room visibility is restricted to
-- the host, an admin, or a member checked by the scoped helper above.
create policy game_rooms_public_read
on public.game_rooms
for select
 to anon, authenticated
using (kind = 'public');

create policy game_rooms_private_read
on public.game_rooms
for select
 to authenticated
using (
  host_user_id = (select auth.uid())
  or is_admin()
  or public.is_game_room_member(code, (select auth.uid()))
);

-- A player can read their own row, a host can read all rows in their room,
-- and admins retain their existing visibility.
create policy game_players_read
on public.game_players
for select
 to authenticated
using (
  user_id = (select auth.uid())
  or is_admin()
  or exists (
    select 1
    from public.game_rooms r
    where r.code = game_players.room_code
      and r.host_user_id = (select auth.uid())
  )
);

create policy game_sessions_read
on public.game_sessions
for select
 to authenticated
using (
  host_user_id = (select auth.uid())
  or is_admin()
  or public.is_game_room_member(room_code, (select auth.uid()))
);
