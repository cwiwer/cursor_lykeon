-- Fix security issues from notifications system migration
-- Enable RLS on notif_types table
alter table notif_types enable row level security;
create policy "Anyone can read notification types" on notif_types for select using (true);

-- Add missing foreign key constraints with proper auth schema reference
alter table notifications drop constraint if exists notifications_user_id_fkey;
alter table notifications add constraint notifications_user_id_fkey 
  foreign key (user_id) references auth.users(id) on delete cascade;

alter table notif_prefs drop constraint if exists notif_prefs_user_id_fkey;
alter table notif_prefs add constraint notif_prefs_user_id_fkey 
  foreign key (user_id) references auth.users(id) on delete cascade;

alter table device_push drop constraint if exists device_push_user_id_fkey;
alter table device_push add constraint device_push_user_id_fkey 
  foreign key (user_id) references auth.users(id) on delete cascade;

alter table support_tickets drop constraint if exists support_tickets_user_id_fkey;
alter table support_tickets add constraint support_tickets_user_id_fkey 
  foreign key (user_id) references auth.users(id) on delete cascade;