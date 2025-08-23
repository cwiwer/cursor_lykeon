import { supabase } from "@/integrations/supabase/client";
import { sanitizeInput } from "@/lib/security";
import { logSecurityEvent } from "@/lib/security";

export async function getOrCreateProfile() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logSecurityEvent('profile_access_unauthorized');
      return null;
    }
    
    // Use correct field naming (id instead of user_id for profiles table)
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    
    if (error) {
      logSecurityEvent('profile_fetch_error', { error: 'Database query failed' });
      throw new Error('Failed to fetch profile');
    }
    
    if (!data) {
      const sanitizedName = sanitizeInput(user.email || "User");
      const { data: created, error: createError } = await supabase.from("profiles").insert({ 
        id: user.id, 
        name: sanitizedName, 
        role: "parent",
        language: "pt"
      }).select("*").single();
      
      if (createError) {
        logSecurityEvent('profile_creation_error', { error: 'Profile creation failed' });
        throw new Error('Failed to create profile');
      }
      
      logSecurityEvent('profile_created', { userId: user.id });
      return created;
    }
    return data;
  } catch (error) {
    logSecurityEvent('profile_service_error', { 
      error: error instanceof Error ? 'Service error occurred' : 'Unknown error' 
    });
    throw error;
  }
}

export async function updateLanguage(lang: "pt" | "en" | "fr") {
  try {
    // Validate language input
    if (!["pt", "en", "fr"].includes(lang)) {
      logSecurityEvent('invalid_language_attempt', { language: lang });
      throw new Error('Invalid language selection');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logSecurityEvent('language_update_unauthorized');
      return;
    }
    
    // Rate limiting check would be handled by database function if available
    logSecurityEvent('language_update_attempt', { userId: user.id, language: lang });
    
    // Use correct field naming (id instead of user_id for profiles table)
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
      logSecurityEvent('profile_fetch_error', { error: 'Database query failed' });
      throw new Error('Failed to fetch profile');
    }
    
    if (profile) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ language: lang })
        .eq("id", user.id);
      
      if (updateError) {
        logSecurityEvent('language_update_error', { error: 'Update failed' });
        throw new Error('Failed to update language');
      }
    } else {
      const sanitizedName = sanitizeInput(user.email || "User");
      const { error: insertError } = await supabase.from("profiles").insert({ 
        id: user.id, 
        name: sanitizedName,
        role: "parent",
        language: lang 
      });
      
      if (insertError) {
        logSecurityEvent('profile_creation_error', { error: 'Profile creation failed' });
        throw new Error('Failed to create profile');
      }
    }
    
    logSecurityEvent('language_updated', { userId: user.id, language: lang });
  } catch (error) {
    logSecurityEvent('language_update_service_error', { 
      error: error instanceof Error ? 'Service error occurred' : 'Unknown error' 
    });
    throw error;
  }
}

export async function readLanguage(): Promise<"pt" | "en" | "fr"> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return "pt";
    
    // Use correct field naming (id instead of user_id for profiles table)
    const { data, error } = await supabase
      .from("profiles")
      .select("language")
      .eq("id", user.id)
      .maybeSingle();
    
    if (error) {
      logSecurityEvent('language_read_error', { error: 'Database query failed' });
      return "pt"; // Safe fallback
    }
    
    const language = data?.language as "pt" | "en" | "fr";
    
    // Validate language from database
    if (language && ["pt", "en", "fr"].includes(language)) {
      return language;
    }
    
    return "pt"; // Safe fallback
  } catch (error) {
    logSecurityEvent('language_read_service_error', { 
      error: error instanceof Error ? 'Service error occurred' : 'Unknown error' 
    });
    return "pt"; // Safe fallback
  }
}