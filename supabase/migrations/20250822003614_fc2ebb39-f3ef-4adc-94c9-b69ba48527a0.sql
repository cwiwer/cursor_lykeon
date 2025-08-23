-- Enable Row Level Security on remaining public tables

-- Enable RLS on gam_levels table (level progression table)
ALTER TABLE public.gam_levels ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all authenticated users to read level requirements
-- This is public configuration data that all users need to read
CREATE POLICY "Anyone can read level requirements" 
ON public.gam_levels 
FOR SELECT 
USING (true);