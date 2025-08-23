import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent } from '@/lib/security';

// Enhanced push notification security with monitoring
export const registerPushDevice = async (subscription: PushSubscription) => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      logSecurityEvent('push_registration_no_auth');
      throw new Error('User not authenticated');
    }

    // Log device registration for monitoring
    logSecurityEvent('push_device_registration', {
      userId: user.id,
      endpoint: subscription.endpoint.substring(0, 50) + '...', // Partial endpoint for privacy
      timestamp: new Date().toISOString(),
    });

    const keys = subscription.getKey ? {
      p256dh: subscription.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : '',
      auth: subscription.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : ''
    } : { p256dh: '', auth: '' };

    const { error } = await supabase
      .from('device_push')
      .upsert({
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      });

    if (error) {
      logSecurityEvent('push_registration_error', { error: error.message });
      throw error;
    }

    return { success: true };
  } catch (error) {
    logSecurityEvent('push_registration_failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw error;
  }
};

// Monitor device token access
export const auditDeviceAccess = async (action: string, deviceId?: string) => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    logSecurityEvent('device_access_audit', {
      userId: user.id,
      action,
      deviceId: deviceId ? deviceId.substring(0, 8) + '...' : undefined,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 100),
    });
  } catch (error) {
    console.error('Audit logging failed:', error);
  }
};

// Clean up old device tokens (should be called periodically)
export const cleanupOldDeviceTokens = async () => {
  try {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    // Remove tokens older than 90 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    const { error } = await supabase
      .from('device_push')
      .delete()
      .eq('user_id', user.id)
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      logSecurityEvent('token_cleanup_error', { error: error.message });
    } else {
      logSecurityEvent('token_cleanup_success', { userId: user.id });
    }
  } catch (error) {
    logSecurityEvent('token_cleanup_failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};