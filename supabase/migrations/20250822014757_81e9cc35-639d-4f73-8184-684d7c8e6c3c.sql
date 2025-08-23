-- Security fixes migration - clean version with proper handling of existing objects

-- 1. Create security audit logging table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'security_audit_log') THEN
        CREATE TABLE security_audit_log (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
            event_type text NOT NULL,
            event_data jsonb DEFAULT '{}'::jsonb,
            ip_address inet,
            user_agent text,
            created_at timestamptz DEFAULT now()
        );
        
        ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own security logs" ON security_audit_log
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- 2. Create rate limiting table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'rate_limiting') THEN
        CREATE TABLE rate_limiting (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            action_type text NOT NULL,
            attempts_count integer DEFAULT 1,
            window_start timestamptz DEFAULT now(),
            UNIQUE(user_id, action_type)
        );
        
        ALTER TABLE rate_limiting ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own rate limits" ON rate_limiting
            FOR ALL USING (auth.uid() = user_id);
    END IF;
END $$;

-- 3. Add constraints to profiles table (if not exists)
DO $$
BEGIN
    -- Add language constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT constraint_name FROM information_schema.check_constraints 
        WHERE constraint_name = 'check_language_valid'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT check_language_valid 
            CHECK (language IN ('pt', 'en', 'fr'));
    END IF;
    
    -- Add role constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT constraint_name FROM information_schema.check_constraints 
        WHERE constraint_name = 'check_role_valid'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT check_role_valid 
            CHECK (role IN ('parent', 'student'));
    END IF;
END $$;

-- 4. Create security logging function
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

-- 5. Create indexes (if not exists)
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_event_type ON security_audit_log(event_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON security_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_limiting_user_action ON rate_limiting(user_id, action_type);