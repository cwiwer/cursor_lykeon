-- Criar tabela de perfis de crianças
create table if not exists child_profiles (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  grade text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Criar tabela de vínculos entre pais e crianças
create table if not exists parent_children (
  parent_user_id uuid references auth.users(id) on delete cascade,
  child_id uuid references child_profiles(id) on delete cascade,
  relationship text default 'parent',
  primary key (parent_user_id, child_id)
);

-- Habilitar RLS
alter table child_profiles enable row level security;
alter table parent_children enable row level security;

-- Política: um pai só enxerga as suas crianças
create policy "parent_can_read_children"
on child_profiles for select
using (exists (
  select 1 from parent_children pc 
  where pc.child_id = child_profiles.id 
  and pc.parent_user_id = auth.uid()
));

create policy "parent_can_insert_children"
on child_profiles for insert
with check (true);

create policy "parent_can_update_own_children"
on child_profiles for update
using (exists (
  select 1 from parent_children pc 
  where pc.child_id = child_profiles.id 
  and pc.parent_user_id = auth.uid()
));

-- Política: pais podem gerenciar vínculos com suas crianças
create policy "parent_children_read_write_own"
on parent_children for all
using (parent_user_id = auth.uid()) 
with check (parent_user_id = auth.uid());