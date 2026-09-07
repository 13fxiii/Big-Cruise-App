create table if not exists public.uno_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  status text not null default 'lobby' check (status in ('lobby','playing','finished')),
  state jsonb,
  version bigint not null default 0,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.uno_room_players (
  room_id uuid not null references public.uno_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  seat smallint not null check (seat between 0 and 3),
  ready boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (room_id,user_id),
  unique (room_id,seat)
);
create index if not exists uno_room_players_user_idx on public.uno_room_players(user_id);
alter table public.uno_rooms enable row level security;
alter table public.uno_room_players enable row level security;
revoke all on public.uno_rooms from anon, authenticated;
revoke all on public.uno_room_players from anon, authenticated;
drop policy if exists uno_rooms_no_direct_access on public.uno_rooms;
create policy uno_rooms_no_direct_access on public.uno_rooms for all to anon, authenticated using(false) with check(false);
drop policy if exists uno_room_players_no_direct_access on public.uno_room_players;
create policy uno_room_players_no_direct_access on public.uno_room_players for all to anon, authenticated using(false) with check(false);
create or replace function public.uno_touch_room_updated_at() returns trigger language plpgsql security definer set search_path=public as $$ begin new.updated_at=now(); return new; end; $$;
drop trigger if exists uno_rooms_touch_updated_at on public.uno_rooms;
create trigger uno_rooms_touch_updated_at before update on public.uno_rooms for each row execute function public.uno_touch_room_updated_at();
