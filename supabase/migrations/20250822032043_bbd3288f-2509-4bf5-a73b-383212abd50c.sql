-- Fix RLS policies for child_profiles to resolve circular dependency

-- Drop the problematic INSERT policy
DROP POLICY IF EXISTS "parent_can_insert_children" ON child_profiles;

-- Create new INSERT policy that allows direct insertion
CREATE POLICY "parent_can_insert_children" 
ON child_profiles FOR INSERT 
WITH CHECK (true);

-- Ensure SELECT policy is correct (users can only read children linked to them)
DROP POLICY IF EXISTS "parent_can_read_children" ON child_profiles;
CREATE POLICY "parent_can_read_children"
ON child_profiles FOR SELECT
USING (EXISTS (
  SELECT 1 FROM parent_children pc 
  WHERE pc.child_id = child_profiles.id 
  AND pc.parent_user_id = auth.uid()
));