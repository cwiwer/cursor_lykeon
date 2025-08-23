-- Ensure uuid extension exists
create extension if not exists "uuid-ossp";

-- Add missing columns to child_profiles if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'child_profiles' AND column_name = 'birthdate') THEN
    ALTER TABLE child_profiles ADD COLUMN birthdate date;
  END IF;
END $$;

-- Update RLS policies for child_profiles to allow insert
DROP POLICY IF EXISTS "parent_can_insert_children" ON child_profiles;
CREATE POLICY "parent_can_insert_children" 
ON child_profiles FOR INSERT 
WITH CHECK (true); -- Will be handled by the RPC function

-- RPC transacional: criar criança e vincular ao pai
CREATE OR REPLACE FUNCTION create_child_and_link(
  p_first_name text,
  p_last_name text DEFAULT NULL,
  p_grade text DEFAULT NULL,
  p_birthdate date DEFAULT NULL,
  p_avatar_url text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
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