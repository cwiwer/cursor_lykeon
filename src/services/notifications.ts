import { supabase } from "@/integrations/supabase/client";

// Security: Rate limiting for push registration
class PushTokenManager {
  private static instance: PushTokenManager;
  private rateLimiter = new Map<string, number[]>();
  
  static getInstance(): PushTokenManager {
    if (!PushTokenManager.instance) {
      PushTokenManager.instance = new PushTokenManager();
    }
    return PushTokenManager.instance;
  }

  isRateLimited(userId: string): boolean {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxAttempts = 5;
    
    const attempts = this.rateLimiter.get(userId) || [];
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      console.warn(`Rate limit exceeded for user ${userId} in push token registration`);
      return true;
    }
    
    recentAttempts.push(now);
    this.rateLimiter.set(userId, recentAttempts);
    return false;
  }

  // Security: Log token access for monitoring
  logTokenAccess(userId: string, action: string, success: boolean) {
    console.log(`Push token ${action}:`, {
      userId,
      action,
      success,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  }
}

export type Notif = {
  id: string;
  type_key: string;
  title: string;
  body?: string;
  data_json?: any;
  delivered_at: string;
  read_at?: string | null;
};

export async function fetchNotifications() {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("delivered_at", { ascending: false });
  if (error) throw error;
  return data as Notif[];
}

export async function markAsRead(id: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function markAllRead() {
  const { error } = await supabase.rpc("mark_all_read");
  if (error) throw error;
}

export type NotifPref = {
  user_id: string;
  type_key: string;
  in_app: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
  quiet_start: string;
  quiet_end: string;
};

export async function fetchPrefs() {
  const { data, error } = await supabase.from("notif_prefs").select("*");
  if (error) throw error;
  return data as NotifPref[];
}

export async function upsertPref(pref: Partial<NotifPref> & { type_key: string }) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('Unauthorized notification preference update attempt');
      throw new Error("Authentication required");
    }
    
    // Validate input
    if (!pref.type_key || pref.type_key.length > 50) {
      console.warn('Invalid notification preference type_key:', pref.type_key);
      throw new Error("Invalid preference type");
    }
    
    // Security: Rate limiting for preference updates
    const tokenManager = PushTokenManager.getInstance();
    if (tokenManager.isRateLimited(user.id)) {
      console.warn(`Rate limit exceeded for user ${user.id} in preference updates`);
      throw new Error("Too many preference updates. Please try again later.");
    }
    
    // Sanitize and validate preference data
    const sanitizedPref = {
      type_key: pref.type_key.trim(),
      in_app: Boolean(pref.in_app),
      email: Boolean(pref.email),
      push: Boolean(pref.push),
      sms: Boolean(pref.sms),
      quiet_start: typeof pref.quiet_start === 'string' ? pref.quiet_start : '22:00',
      quiet_end: typeof pref.quiet_end === 'string' ? pref.quiet_end : '07:00'
    };
    
    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(sanitizedPref.quiet_start) || !timeRegex.test(sanitizedPref.quiet_end)) {
      throw new Error("Invalid time format");
    }
    
    const row = { user_id: user.id, ...sanitizedPref };
    const { error } = await supabase.from("notif_prefs").upsert(row);
    
    if (error) {
      console.error('Database error updating notification preferences:', error.message);
      throw new Error('Failed to update notification preferences');
    }
    
    tokenManager.logTokenAccess(user.id, 'preference_update', true);
  } catch (error) {
    console.error('Error in upsertPref:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

export async function createTicket(subject: string, description: string, priority: string = 'medium') {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.warn('Unauthorized support ticket creation attempt');
      throw new Error("Authentication required");
    }
    
    // Validate and sanitize inputs
    const sanitizedSubject = subject.trim().substring(0, 100);
    const sanitizedDescription = description.trim().substring(0, 2000);
    const validPriority = ['low', 'medium', 'high', 'urgent'].includes(priority) ? priority : 'medium';
    
    if (sanitizedSubject.length < 5) {
      throw new Error("Subject must be at least 5 characters long");
    }
    
    if (sanitizedDescription.length < 10) {
      throw new Error("Description must be at least 10 characters long");
    }
    
    // Check for potential XSS patterns
    const xssPatterns = [/<script/i, /javascript:/i, /on\w+\s*=/i];
    if (xssPatterns.some(pattern => pattern.test(sanitizedSubject + sanitizedDescription))) {
      console.warn(`Potential XSS attempt in support ticket from user ${user.id}`);
      throw new Error("Invalid content detected");
    }
    
    const { error } = await supabase.from("support_tickets").insert({ 
      user_id: user.id,
      subject: sanitizedSubject, 
      description: sanitizedDescription,
      priority: validPriority,
      status: 'open'
    });
    
    if (error) {
      console.error('Database error creating support ticket:', error.message);
      throw new Error('Failed to create support ticket');
    }
    
    console.log(`Support ticket created successfully for user ${user.id}`);
  } catch (error) {
    console.error('Error in createTicket:', error);
    throw error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

export async function ensureDefaultPrefs() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: types } = await supabase.from("notif_types").select("key");
  if (!types) return;

  for (const type of types) {
    await supabase.from("notif_prefs").upsert({
      user_id: user.id,
      type_key: type.key,
      in_app: true,
      email: true,
      push: false,
      sms: false,
      quiet_start: "22:00",
      quiet_end: "07:00"
    });
  }
}