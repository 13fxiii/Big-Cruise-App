-- Keep the RLS bypass helper out of the PostgREST-exposed public schema.
create schema if not exists private;

create or replace function private.is_game_room_member(p_room_code text, p_user_id uuid)
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

revoke all on function private.is_game_room_member(text, uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_game_room_member(text, uuid) to authenticated;

drop policy if exists game_rooms_private_read on public.game_rooms;
drop policy if exists game_sessions_read on public.game_sessions;

create policy game_rooms_private_read
on public.game_rooms
for select
 to authenticated
using (
  host_user_id = (select auth.uid())
  or is_admin()
  or private.is_game_room_member(code, (select auth.uid()))
);

create policy game_sessions_read
on public.game_sessions
for select
 to authenticated
using (
  host_user_id = (select auth.uid())
  or is_admin()
  or private.is_game_room_member(room_code, (select auth.uid()))
);

drop function if exists public.is_game_room_member(text, uuid);
