-- Keep anonymous public-room discovery separate, while giving authenticated users
-- one combined SELECT policy to avoid duplicate permissive-policy evaluation.
drop policy if exists game_rooms_public_read on public.game_rooms;
drop policy if exists game_rooms_private_read on public.game_rooms;

create policy game_rooms_public_read
on public.game_rooms
for select
 to anon
using (kind = 'public');

create policy game_rooms_authenticated_read
on public.game_rooms
for select
 to authenticated
using (
  kind = 'public'
  or host_user_id = (select auth.uid())
  or is_admin()
  or private.is_game_room_member(code, (select auth.uid()))
);
