create table if not exists public.community_posts (id uuid primary key default gen_random_uuid(), author_id uuid not null references public.profiles(id) on delete cascade, body text not null check (char_length(body) between 1 and 500), created_at timestamptz not null default now());
create index if not exists community_posts_created_at_idx on public.community_posts (created_at desc);
alter table public.community_posts enable row level security;
create policy "community posts are readable" on public.community_posts for select using (true);
create policy "members can create their own posts" on public.community_posts for insert to authenticated with check (auth.uid() = author_id);
create policy "members can edit their own posts" on public.community_posts for update to authenticated using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "members can delete their own posts" on public.community_posts for delete to authenticated using (auth.uid() = author_id);

create table if not exists public.community_reactions (post_id uuid not null references public.community_posts(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade, emoji text not null check (emoji in ('🔥','😂','💯','👏','❤️')), created_at timestamptz not null default now(), primary key (post_id, user_id, emoji));
alter table public.community_reactions enable row level security;
create policy "community reactions are readable" on public.community_reactions for select using (true);
create policy "members manage their reactions" on public.community_reactions for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.community_challenges (id text primary key, title text not null, description text not null, reward_xp integer not null default 100 check (reward_xp >= 0), ends_at timestamptz, active boolean not null default true, created_at timestamptz not null default now());
alter table public.community_challenges enable row level security;
create policy "active challenges are readable" on public.community_challenges for select using (active = true);
insert into public.community_challenges (id,title,description,reward_xp,ends_at) values ('clean-sweep','THE CLEAN SWEEP','Win a match without dropping a round.',250,now()+interval '3 days'),('room-starter','ROOM STARTER','Create a room and bring three Cruisers in.',150,now()+interval '5 days'),('play-your-vibe','PLAY YOUR VIBE','Play one game and open the BIG CRUISE CONTROL playlist.',100,now()+interval '1 day') on conflict (id) do update set title=excluded.title,description=excluded.description,reward_xp=excluded.reward_xp,ends_at=excluded.ends_at,active=true;

create table if not exists public.community_challenge_progress (challenge_id text not null references public.community_challenges(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade, progress integer not null default 0 check (progress >= 0), completed boolean not null default false, updated_at timestamptz not null default now(), primary key (challenge_id,user_id));
alter table public.community_challenge_progress enable row level security;
create policy "members read their challenge progress" on public.community_challenge_progress for select to authenticated using (auth.uid() = user_id);
create policy "members update their challenge progress" on public.community_challenge_progress for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.community_posts replica identity full;
alter table public.community_reactions replica identity full;
alter table public.community_challenges replica identity full;
alter table public.community_challenge_progress replica identity full;
do $$ begin alter publication supabase_realtime add table public.community_posts; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.community_reactions; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.community_challenges; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.community_challenge_progress; exception when duplicate_object then null; end $$;
