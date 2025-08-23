-- supabase/migrations/20250823040000_unlink_or_delete_child.sql
create or replace function unlink_or_delete_child(p_child_id uuid)
returns text
language plpgsql
security definer
as $$
declare
  v_links int;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  -- garante que este responsável tem vínculo
  if not exists (
    select 1 from parent_children
    where parent_user_id = auth.uid()
      and child_id = p_child_id
  ) then
    raise exception 'forbidden';
  end if;

  select count(*) into v_links
  from parent_children
  where child_id = p_child_id;

  if v_links > 1 then
    -- há outros responsáveis -> apenas desvincula este responsável
    delete from parent_children
    where parent_user_id = auth.uid()
      and child_id = p_child_id;
    return 'unlinked';
  else
    -- último responsável -> exclui o perfil
    delete from child_profiles
    where id = p_child_id;
    return 'deleted';
  end if;
end;
$$;
