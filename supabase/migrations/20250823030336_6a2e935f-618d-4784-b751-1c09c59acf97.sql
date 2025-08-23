-- Fix the search_path security issue for the function
CREATE OR REPLACE FUNCTION create_child_and_link(
  p_first_name text,
  p_last_name text DEFAULT NULL,
  p_grade text DEFAULT NULL,
  p_birthdate date DEFAULT NULL,
  p_avatar_url text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_child uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE exception 'not authenticated';
  END IF;

  INSERT INTO child_profiles(first_name, last_name, grade, birthdate, avatar_url)
  VALUES (p_first_name, p_last_name, p_grade, p_birthdate, p_avatar_url)
  RETURNING id INTO v_child;

  INSERT INTO parent_children(parent_user_id, child_id)
  VALUES (auth.uid(), v_child);

  RETURN v_child;
END;
$$;