-- Create gamification schema for Lykeon
-- Extensions
create extension if not exists "uuid-ossp";

-- Basic profiles (1-to-1 with auth.users)
create table if not exists gam_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  student_name text,
  grade text,
  created_at timestamptz default now()
);

-- Levels (optional - explicit thresholds)
create table if not exists gam_levels (
  level int primary key,
  required_xp int not null
);

insert into gam_levels(level, required_xp) values
  (1, 0), (2, 200), (3, 500), (4, 900), (5, 1400), (6, 2000), (7, 2700), (8, 3500), (9, 4400), (10, 5400)
on conflict do nothing;

-- User XP progress
create table if not exists gam_xp (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_xp int not null default 0,
  level int not null default 1,
  title text default 'Explorador do Saber',
  updated_at timestamptz default now()
);

-- Virtual currency wallet (Lumis)
create table if not exists gam_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  lumis int not null default 0,
  updated_at timestamptz default now()
);

-- Mission catalog
create type mission_period as enum ('daily','weekly');
create type mission_status as enum ('locked','active','completed','claimed');

create table if not exists gam_missions (
  id uuid primary key default uuid_generate_v4(),
  period mission_period not null,
  name text not null,
  description text,
  reward_xp int not null default 0,
  reward_lumis int not null default 0,
  enabled boolean not null default true
);

-- User missions (state and progress)
create table if not exists gam_user_missions (
  user_id uuid references auth.users(id) on delete cascade,
  mission_id uuid references gam_missions(id) on delete cascade,
  progress int not null default 0,    -- 0..100
  status mission_status not null default 'active',
  resets_at timestamptz not null,
  primary key (user_id, mission_id)
);

-- Badges
create type badge_rarity as enum ('common','rare','legendary','seasonal');

create table if not exists gam_badges (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null, -- 'Conhecimento', 'Esforço'...
  rarity badge_rarity not null default 'common'
);

create table if not exists gam_user_badges (
  user_id uuid references auth.users(id) on delete cascade,
  badge_id uuid references gam_badges(id) on delete cascade,
  unlocked_at timestamptz,
  primary key (user_id, badge_id)
);

-- Streaks and focus
create table if not exists gam_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current int not null default 0,
  best int not null default 0,
  protected_days int not null default 0
);

create table if not exists gam_focus (
  user_id uuid primary key references auth.users(id) on delete cascade,
  max int not null default 5,
  remaining int not null default 5
);

-- Sample data
insert into gam_missions(period,name,description,reward_xp,reward_lumis)
values
 ('daily','Concluir 1 aula hoje','Assista a uma aula completa.',50,5),
 ('daily','Acerte 80% no quiz','Desempenho do dia.',80,8),
 ('weekly','5 dias consecutivos de estudo','Mantenha a sequência.',150,20)
on conflict do nothing;

insert into gam_badges(name,category,rarity)
values
 ('Mestre da Tabuada','Conhecimento','rare'),
 ('Assiduidade Perfeita','Esforço','legendary'),
 ('Cientista Curioso','Explorador','common'),
 ('Medalha Secreta #1','Secreta','seasonal')
on conflict do nothing;

-- RLS (Row Level Security)
alter table gam_profiles enable row level security;
alter table gam_xp enable row level security;
alter table gam_wallets enable row level security;
alter table gam_user_missions enable row level security;
alter table gam_user_badges enable row level security;
alter table gam_streaks enable row level security;
alter table gam_focus enable row level security;

-- RLS Policies for SELECT
create policy "read own profiles" on gam_profiles for select using (user_id = auth.uid());
create policy "read own xp" on gam_xp for select using (user_id = auth.uid());
create policy "read own wallets" on gam_wallets for select using (user_id = auth.uid());
create policy "read own missions" on gam_user_missions for select using (user_id = auth.uid());
create policy "read own badges" on gam_user_badges for select using (user_id = auth.uid());
create policy "read own streaks" on gam_streaks for select using (user_id = auth.uid());
create policy "read own focus" on gam_focus for select using (user_id = auth.uid());

-- RLS Policies for INSERT/UPDATE
create policy "upsert own profiles" on gam_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "upsert own xp" on gam_xp
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "upsert own wallets" on gam_wallets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "upsert own missions" on gam_user_missions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "upsert own badges" on gam_user_badges
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "upsert own streaks" on gam_streaks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "upsert own focus" on gam_focus
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Allow reading missions and badges catalog (public)
create policy "read missions catalog" on gam_missions for select using (true);
create policy "read badges catalog" on gam_badges for select using (true);

-- Atomic RPC: claim_mission(user_id, mission_id)
create or replace function claim_mission(p_user uuid, p_mission uuid)
returns table(new_current_xp int, new_level int, new_next_req int, new_lumis int) 
language plpgsql
security definer
as $$
declare
  v_reward_xp int;
  v_reward_lumis int;
  v_cur_xp int;
  v_level int;
  v_next_req int;
begin
  -- Only allow operating on own account
  if p_user <> auth.uid() then
    raise exception 'not allowed';
  end if;

  -- Ensure mission exists and is completed
  select m.reward_xp, m.reward_lumis
    into v_reward_xp, v_reward_lumis
  from gam_user_missions um
  join gam_missions m on m.id = um.mission_id
  where um.user_id = p_user and um.mission_id = p_mission and um.status = 'completed'::mission_status
  for update;
  
  if not found then
    raise exception 'mission not claimable';
  end if;

  -- Mark as claimed
  update gam_user_missions
     set status = 'claimed'::mission_status
   where user_id = p_user and mission_id = p_mission;

  -- Update wallet
  insert into gam_wallets(user_id, lumis) values (p_user, v_reward_lumis)
  on conflict (user_id) do update set lumis = gam_wallets.lumis + excluded.lumis
  returning lumis into new_lumis;

  -- Update XP and level
  insert into gam_xp(user_id, current_xp, level)
       values (p_user, 0, 1)
  on conflict (user_id) do nothing;

  select current_xp, level into v_cur_xp, v_level from gam_xp where user_id = p_user for update;

  v_cur_xp := v_cur_xp + v_reward_xp;

  -- Get threshold (if exists) or use simple multiplicative progression
  select required_xp into v_next_req from gam_levels where level = v_level + 1;
  if v_next_req is null then
    v_next_req := (v_level+1) * 800; -- simple fallback
  end if;

  while v_cur_xp >= v_next_req loop
    v_level := v_level + 1;
    select required_xp into v_next_req from gam_levels where level = v_level + 1;
    if v_next_req is null then
      v_next_req := (v_level+1) * 800;
    end if;
  end loop;

  update gam_xp
     set current_xp = v_cur_xp, level = v_level, updated_at = now()
   where user_id = p_user;

  new_current_xp := v_cur_xp;
  new_level := v_level;
  new_next_req := v_next_req;
  return next;
end;
$$;