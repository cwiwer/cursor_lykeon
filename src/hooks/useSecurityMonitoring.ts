import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/lib/security';

interface SecurityEvent {
  type: string;
  data?: Record<string, any>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export function useSecurityMonitoring() {
  const logEvent = useCallback(async (event: SecurityEvent) => {
    try {
      // Log to browser console for development
      logSecurityEvent(event.type, event.data);
      
      // Log to database for production monitoring
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.rpc('log_security_event', {
          p_event_type: event.type,
          p_event_data: event.data || {}
        });
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, []);

  const logAuthEvent = useCallback((action: string, success: boolean, details?: Record<string, any>) => {
    logEvent({
      type: `auth_${action}`,
      data: {
        success,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ...details
      },
      severity: success ? 'low' : 'medium'
    });
  }, [logEvent]);

  const logFormSubmission = useCallback((formType: string, success: boolean, errors?: string[]) => {
    logEvent({
      type: `form_submission_${formType}`,
      data: {
        success,
        errors,
        timestamp: new Date().toISOString(),
        url: window.location.pathname
      },
      severity: success ? 'low' : 'medium'
    });
  }, [logEvent]);

  const logRateLimitHit = useCallback((action: string, limit: number) => {
    logEvent({
      type: 'rate_limit_exceeded',
      data: {
        action,
        limit,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      },
      severity: 'medium'
    });
  }, [logEvent]);

  return {
    logEvent,
    logAuthEvent,
    logFormSubmission,
    logRateLimitHit
  };
}