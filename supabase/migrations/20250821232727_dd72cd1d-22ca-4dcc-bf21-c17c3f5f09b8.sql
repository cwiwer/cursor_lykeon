-- Create notifications and support system
create extension if not exists "uuid-ossp";

-- Catalog of notification types
create table if not exists notif_types(
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  default_channels jsonb not null default '{"in_app": true, "email": true, "push": false, "sms": false}'::jsonb
);

insert into notif_types(key) values
 ('lesson_reminder'), ('makeup_class'), ('report_ready'), ('achievement'), ('system')
on conflict do nothing;

-- User notifications
create table if not exists notifications(
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  type_key text not null references notif_types(key),
  title text not null,
  body text,
  data_json jsonb default '{}'::jsonb,
  delivered_at timestamptz default now(),
  read_at timestamptz
);

-- User notification preferences
create table if not exists notif_prefs(
  user_id uuid,
  type_key text references notif_types(key),
  in_app boolean default true,
  email boolean default true,
  push boolean default false,
  sms boolean default false,
  quiet_start time default '22:00',
  quiet_end time default '07:00',
  primary key(user_id, type_key)
);

-- Push notification devices
create table if not exists device_push(
  user_id uuid,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now(),
  primary key(user_id, endpoint)
);

-- Support tickets
create table if not exists support_tickets(
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  subject text not null,
  description text,
  status text not null default 'open',
  created_at timestamptz default now()
);

-- Support ticket attachments
create table if not exists support_attachments(
  ticket_id uuid references support_tickets(id) on delete cascade,
  file_url text not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table notifications enable row level security;
alter table notif_prefs enable row level security;
alter table device_push enable row level security;
alter table support_tickets enable row level security;
alter table support_attachments enable row level security;

-- RLS policies for notifications
create policy "Users can view own notifications" on notifications 
  for select using (user_id = auth.uid());
create policy "Users can update own notifications" on notifications 
  for update using (user_id = auth.uid());

-- RLS policies for preferences
create policy "Users can view own preferences" on notif_prefs 
  for select using (user_id = auth.uid());
create policy "Users can manage own preferences" on notif_prefs 
  for insert with check (user_id = auth.uid());
create policy "Users can update own preferences" on notif_prefs 
  for update using (user_id = auth.uid());

-- RLS policies for push devices
create policy "Users can manage own devices" on device_push 
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- RLS policies for support tickets
create policy "Users can view own tickets" on support_tickets 
  for select using (user_id = auth.uid());
create policy "Users can create own tickets" on support_tickets 
  for insert with check (user_id = auth.uid());

-- RLS policies for support attachments
create policy "Users can view own ticket attachments" on support_attachments 
  for select using (
    exists(select 1 from support_tickets t where t.id = ticket_id and t.user_id = auth.uid())
  );
create policy "Users can create own ticket attachments" on support_attachments 
  for insert with check (
    exists(select 1 from support_tickets t where t.id = ticket_id and t.user_id = auth.uid())
  );

-- Utility RPC functions
create or replace function mark_all_read()
returns void 
language sql 
security definer 
set search_path = public
as $$
  update notifications set read_at = now() where user_id = auth.uid() and read_at is null;
$$;

create or replace function insert_notification(p_user uuid, p_type text, p_title text, p_body text, p_data jsonb)
returns uuid 
language sql 
security definer 
set search_path = public
as $$
  insert into notifications(user_id, type_key, title, body, data_json)
  values (p_user, p_type, p_title, p_body, coalesce(p_data,'{}'::jsonb))
  returning id;
$$;