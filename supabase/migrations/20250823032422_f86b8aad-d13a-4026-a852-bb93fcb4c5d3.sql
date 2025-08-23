-- Add created_at column to parent_children for proper ordering
ALTER TABLE parent_children 
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();