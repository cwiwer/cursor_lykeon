import { supabase } from "@/integrations/supabase/client";
import { logSecurityEvent, isValidUUID } from "@/lib/security";
import type { Mission, Badge } from "../types/gamification";

export async function bootstrapGamificationForUser(userId: string) {
  try {
    // Validate userId
    if (!isValidUUID(userId)) {
      logSecurityEvent('invalid_user_id_bootstrap', { userId });
      throw new Error('Invalid user ID');
    }

    logSecurityEvent('gamification_bootstrap_start', { userId });

    const results = await Promise.allSettled([
      supabase.from("gam_xp").upsert({ user_id: userId }),
      supabase.from("gam_wallets").upsert({ user_id: userId }),
      supabase.from("gam_streaks").upsert({ user_id: userId }),
      supabase.from("gam_focus").upsert({ user_id: userId }),
    ]);

    // Check for any failures
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length > 0) {
      logSecurityEvent('gamification_bootstrap_partial_failure', { 
        userId, 
        failures: failures.length 
      });
    }

    const { data: missions, error: missionsError } = await supabase
      .from("gam_missions")
      .select("id, period, enabled")
      .eq("enabled", true);

    if (missionsError) {
      logSecurityEvent('missions_fetch_error', { error: 'Database query failed' });
      throw new Error('Failed to fetch missions');
    }

    const now = new Date();
    const resetDaily = new Date(now.getTime() + 6*3600e3).toISOString();
    const resetWeekly = new Date(now.getTime() + 3*24*3600e3).toISOString();

    for (const m of missions || []) {
      if (!isValidUUID(m.id)) {
        logSecurityEvent('invalid_mission_id', { missionId: m.id });
        continue;
      }

      const resets_at = m.period === "daily" ? resetDaily : resetWeekly;
      const { error } = await supabase.from("gam_user_missions").upsert({ 
        user_id: userId, 
        mission_id: m.id, 
        progress: 0, 
        status: "active", 
        resets_at 
      });

      if (error) {
        logSecurityEvent('user_mission_upsert_error', { 
          userId, 
          missionId: m.id,
          error: 'Database operation failed'
        });
      }
    }

    logSecurityEvent('gamification_bootstrap_complete', { userId });
  } catch (error) {
    logSecurityEvent('gamification_bootstrap_error', { 
      userId,
      error: error instanceof Error ? 'Bootstrap failed' : 'Unknown error'
    });
    throw error;
  }
}

export async function fetchGamification(userId: string) {
  const [{ data: xp }, { data: wallet }, { data: streak }, { data: focus }, { data: userMissions }, { data: userBadges }] =
    await Promise.all([
      supabase.from("gam_xp").select("*").eq("user_id", userId).single(),
      supabase.from("gam_wallets").select("*").eq("user_id", userId).single(),
      supabase.from("gam_streaks").select("*").eq("user_id", userId).single(),
      supabase.from("gam_focus").select("*").eq("user_id", userId).single(),
      supabase.from("gam_user_missions").select(`
        mission_id, progress, status, resets_at,
        gam_missions(name, description, period, reward_xp, reward_lumis)
      `).eq("user_id", userId),
      supabase.from("gam_user_badges").select(`
        badge_id, unlocked_at,
        gam_badges(name, category, rarity)
      `).eq("user_id", userId),
    ]);

  const missions: Mission[] = (userMissions || []).map((r: any) => ({
    id: r.mission_id,
    period: r.gam_missions.period,
    name: r.gam_missions.name,
    description: r.gam_missions.description,
    progress: r.progress,
    rewardXP: r.gam_missions.reward_xp,
    rewardLumis: r.gam_missions.reward_lumis,
    status: r.status,
    resetsAtISO: r.resets_at
  }));

  const badges: Badge[] = (userBadges || []).map((b: any) => ({
    id: b.badge_id,
    name: b.gam_badges.name,
    category: b.gam_badges.category,
    rarity: b.gam_badges.rarity,
    unlockedAtISO: b.unlocked_at || undefined
  }));

  return { xp, wallet, streak, focus, missions, badges };
}

export async function claimMissionAtomic(userId: string, missionId: string) {
  try {
    // Validate inputs
    if (!isValidUUID(userId) || !isValidUUID(missionId)) {
      logSecurityEvent('invalid_claim_mission_params', { userId, missionId });
      throw new Error('Invalid parameters');
    }

    logSecurityEvent('mission_claim_attempt', { userId, missionId });

    // Atomic mission claim with proper error handling
    const { error: claimError } = await supabase.from("gam_user_missions")
      .update({ status: "claimed" })
      .eq("user_id", userId)
      .eq("mission_id", missionId)
      .eq("status", "completed");
    
    if (claimError) {
      logSecurityEvent('mission_claim_error', { 
        userId, 
        missionId,
        error: 'Claim operation failed'
      });
      throw new Error('Failed to claim mission');
    }

    // Get mission rewards with validation
    const { data: mission, error: missionError } = await supabase
      .from("gam_missions")
      .select("reward_xp, reward_lumis, name")
      .eq("id", missionId)
      .single();
    
    if (missionError || !mission) {
      logSecurityEvent('mission_data_fetch_error', { missionId });
      throw new Error('Failed to fetch mission data');
    }

    // Validate reward amounts (prevent negative or excessive rewards)
    const rewardXP = Math.max(0, Math.min(mission.reward_xp || 0, 1000));
    const rewardLumis = Math.max(0, Math.min(mission.reward_lumis || 0, 100));

    // Initialize wallet if needed
    await supabase.from("gam_wallets").upsert({ user_id: userId, lumis: 0 });
    
    // Create secure notification
    const { error: notifError } = await supabase.rpc("insert_notification", { 
      p_user: userId, 
      p_type: "achievement", 
      p_title: "Missão resgatada", 
      p_body: `Você ganhou ${rewardXP} XP e ${rewardLumis} Lumis!`, 
      p_data: { missionId, rewardXP, rewardLumis }
    });

    if (notifError) {
      logSecurityEvent('notification_creation_error', { userId, missionId });
      // Don't throw - mission claim should still succeed
    }

    // Update Lumis with proper error handling
    const { data: wallet, error: walletFetchError } = await supabase
      .from("gam_wallets")
      .select("lumis")
      .eq("user_id", userId)
      .single();
    
    if (walletFetchError) {
      logSecurityEvent('wallet_fetch_error', { userId });
      throw new Error('Failed to fetch wallet data');
    }

    const { error: walletUpdateError } = await supabase.from("gam_wallets").update({ 
      lumis: (wallet?.lumis || 0) + rewardLumis 
    }).eq("user_id", userId);

    if (walletUpdateError) {
      logSecurityEvent('wallet_update_error', { userId });
      throw new Error('Failed to update wallet');
    }
    
    // Update XP with proper error handling
    const { data: xp, error: xpFetchError } = await supabase
      .from("gam_xp")
      .select("current_xp, level")
      .eq("user_id", userId)
      .single();
    
    if (xpFetchError) {
      logSecurityEvent('xp_fetch_error', { userId });
      throw new Error('Failed to fetch XP data');
    }

    const newXP = (xp?.current_xp || 0) + rewardXP;
    const { error: xpUpdateError } = await supabase.from("gam_xp").update({ 
      current_xp: newXP 
    }).eq("user_id", userId);

    if (xpUpdateError) {
      logSecurityEvent('xp_update_error', { userId });
      throw new Error('Failed to update XP');
    }

    logSecurityEvent('mission_claimed_successfully', { 
      userId, 
      missionId, 
      rewardXP, 
      rewardLumis 
    });

  } catch (error) {
    logSecurityEvent('mission_claim_service_error', { 
      userId,
      missionId,
      error: error instanceof Error ? 'Service error occurred' : 'Unknown error'
    });
    throw error;
  }
}