# TODO - Security and Feature Enhancements

## ✅ COMPLETED
- Fixed database schema consistency issues
- Added comprehensive input validation with Zod schemas
- Enhanced error handling with security logging
- Implemented rate limiting for notifications and preferences
- Added security monitoring and audit logging
- Enhanced gamification service with proper validation
- Updated profile service with consistent field naming

## 🔴 CRITICAL - Immediate Action Required

### Database Migration
```sql
-- TODO: Execute this migration in Supabase SQL Editor
-- This needs to be run manually as migrations/ folder is read-only in Lovable

-- 1. Fix profiles table schema
ALTER TABLE IF EXISTS profiles RENAME COLUMN id TO user_id;
ALTER TABLE profiles ADD CONSTRAINT check_language_valid CHECK (language IN ('pt', 'en', 'fr'));

-- 2. Add security audit logging
CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- 3. Add rate limiting table
CREATE TABLE IF NOT EXISTS rate_limiting (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  attempts_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  UNIQUE(user_id, action_type)
);

-- 4. Add support tickets with constraints
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL CHECK (char_length(subject) BETWEEN 5 AND 100),
  description text NOT NULL CHECK (char_length(description) BETWEEN 10 AND 2000),
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## 🟡 HIGH PRIORITY

### 1. Cron Jobs & Scheduled Functions
- [ ] Create Supabase Edge Function for daily mission reset
- [ ] Weekly mission reset scheduler
- [ ] Automatic badge granting based on achievements
- [ ] Cleanup old audit logs and rate limiting records

### 2. Backend Security Functions
```sql
-- TODO: Add these functions to Supabase
CREATE OR REPLACE FUNCTION log_security_event(...)
CREATE OR REPLACE FUNCTION check_rate_limit(...)
CREATE OR REPLACE FUNCTION insert_notification_secure(...)
```

### 3. File Upload Security
- [ ] Add secure file upload for support tickets
- [ ] Implement virus scanning for uploads
- [ ] Add file type validation and size limits
- [ ] Store files in Supabase Storage with proper RLS

## 🟢 MEDIUM PRIORITY

### 1. Enhanced Security Monitoring
- [ ] Add real-time security alerts
- [ ] Implement suspicious activity detection
- [ ] Add IP-based rate limiting
- [ ] Create security dashboard for admins

### 2. Additional Validations
- [ ] Add content moderation for user messages
- [ ] Implement profanity filtering
- [ ] Add image content analysis for uploads

### 3. Performance Optimizations
- [ ] Add database indexes for security queries
- [ ] Implement query result caching
- [ ] Add connection pooling configuration

## 🔵 LOW PRIORITY

### 1. Advanced Features
- [ ] Two-factor authentication
- [ ] Single Sign-On (SSO) integration
- [ ] Advanced audit reporting
- [ ] Automated security testing

### 2. UI/UX Enhancements
- [ ] Security status indicators
- [ ] User activity timeline
- [ ] Enhanced error messages with help links

## 🔧 TECHNICAL DEBT

### 1. Code Quality
- [ ] Add unit tests for security functions
- [ ] Add integration tests for services
- [ ] Implement automated security scanning
- [ ] Add TypeScript strict mode compliance

### 2. Documentation
- [ ] Create security runbook
- [ ] Document incident response procedures
- [ ] Add API security documentation

---

## Notes
- All database changes must be executed manually in Supabase SQL Editor
- Security events are currently logged to console - implement proper logging service
- Rate limiting is client-side only - needs server-side enforcement
- File uploads need proper virus scanning before implementing in production