-- Security fixes migration
-- Fix profiles table schema consistency and add security features

-- 1. Add security audit logging table
CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on security audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can view their own security logs
CREATE POLICY "Users can view own security logs" ON security_audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- 2. Add rate limiting table  
CREATE TABLE IF NOT EXISTS rate_limiting (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  attempts_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  UNIQUE(user_id, action_type)
);

-- Enable RLS on rate limiting
ALTER TABLE rate_limiting ENABLE ROW LEVEL SECURITY;

-- Users can only see their own rate limiting records
CREATE POLICY "Users can view own rate limits" ON rate_limiting
  FOR ALL USING (auth.uid() = user_id);

-- 3. Add constraints to existing tables for data integrity
ALTER TABLE profiles ADD CONSTRAINT check_language_valid 
  CHECK (language IN ('pt', 'en', 'fr'));

ALTER TABLE profiles ADD CONSTRAINT check_role_valid 
  CHECK (role IN ('parent', 'student', 'admin'));

-- 4. Add support tickets table with proper validation
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 5 AND 100),
  description text NOT NULL CHECK (char_length(description) BETWEEN 10 AND 2000),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on support tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can only see their own support tickets
CREATE POLICY "Users can manage own support tickets" ON support_tickets
  FOR ALL USING (auth.uid() = user_id);

-- 5. Create security logging function
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type text,
  p_event_data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO security_audit_log (user_id, event_type, event_data)
  VALUES (auth.uid(), p_event_type, p_event_data)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_event_type ON security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limiting_user_action ON rate_limiting(user_id, action_type);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);