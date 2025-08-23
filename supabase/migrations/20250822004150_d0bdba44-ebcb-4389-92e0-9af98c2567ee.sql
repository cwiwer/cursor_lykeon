-- Fix database function security by adding proper search_path settings
-- This prevents potential SQL injection and privilege escalation

-- Update claim_mission function
CREATE OR REPLACE FUNCTION public.claim_mission(p_user uuid, p_mission uuid)
 RETURNS TABLE(new_current_xp integer, new_level integer, new_next_req integer, new_lumis integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
$function$;

-- Update mark_all_read function
CREATE OR REPLACE FUNCTION public.mark_all_read()
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
  update notifications set read_at = now() where user_id = auth.uid() and read_at is null;
$function$;

-- Update insert_notification function
CREATE OR REPLACE FUNCTION public.insert_notification(p_user uuid, p_type text, p_title text, p_body text, p_data jsonb)
 RETURNS uuid
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
  insert into notifications(user_id, type_key, title, body, data_json)
  values (p_user, p_type, p_title, p_body, coalesce(p_data,'{}'::jsonb))
  returning id;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, role, name)
  VALUES (
    NEW.id, 
    'parent', 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;