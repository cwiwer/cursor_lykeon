-- Enable Row Level Security on tables that have policies but RLS disabled

-- Enable RLS on gam_badges table
ALTER TABLE public.gam_badges ENABLE ROW LEVEL SECURITY;

-- Enable RLS on gam_missions table  
ALTER TABLE public.gam_missions ENABLE ROW LEVEL SECURITY;