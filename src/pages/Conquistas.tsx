import React, { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Coins, 
  Flame, 
  Heart, 
  Clock,
  Gift,
  Calendar,
  BarChart3,
  Shield,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { bootstrapGamificationForUser, fetchGamification, claimMissionAtomic } from "@/services/gamification";
import { useAuth } from "@/hooks/useAuth";
import { getBadgeRarityStyle, getBadgeCategoryIcon } from '@/ui/gamification';
import type { Mission, Badge as BadgeType, BadgeRarity, XPRecord, CurrencyWallet, Streak, Focus, EventBanner, EngagementMetrics } from '@/types/gamification';
import { useEffect, useCallback } from 'react';

// XPBar Component - será definido dentro da função principal

// MissionCard Component - será definido dentro da função principal
// BadgePill Component - será definido dentro da função principal

export default function Conquistas() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user } = useAuth();

  // XPBar Component - definido dentro da função principal para ter acesso ao hook useTranslation
  function XPBar({ current, target }: { current: number; target: number }) {
    const pct = Math.min(100, Math.round((current / target) * 100));
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
                  <span>{current} {t('gamification.xp')}</span>
        <span>{target} {t('gamification.xp')}</span>
        </div>
        <Progress value={pct} className="h-3" />
      </div>
    );
  }

  // MissionCard Component - definido dentro da função principal para ter acesso ao hook useTranslation
  function MissionCard({ mission, onClaim }: { mission: Mission; onClaim: (id: string) => void }) {
    const resetTime = new Date(mission.resetsAtISO).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <Card className="h-full">
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-sm">{mission.name}</h3>
            <p className="text-xs text-muted-foreground">{mission.description}</p>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>{t('exercisesPage.achievements.mission.progress')}</span>
              <span>{mission.progress}%</span>
            </div>
            <Progress value={mission.progress} className="h-2" />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>🏆 {mission.rewardXP} {t('gamification.xp')}</span>
          <span>💰 {mission.rewardLumis} {t('gamification.lumis')}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={mission.period === 'daily' ? 'default' : 'secondary'} className="text-xs">
                {mission.period === 'daily' ? t('exercisesPage.achievements.mission.daily') : t('exercisesPage.achievements.mission.weekly')}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {mission.status === 'active' ? t('exercisesPage.achievements.mission.active') : 
                 mission.status === 'completed' ? t('exercisesPage.achievements.mission.completed') : t('exercisesPage.achievements.mission.claimed')}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground">
              {t('exercisesPage.achievements.mission.resetTime', { time: resetTime })}
            </span>
          </div>

          {mission.status === 'completed' && (
            <Button 
              onClick={() => onClaim(mission.id)}
              className="w-full"
              size="sm"
            >
              <Gift className="h-4 w-4 mr-2" />
              {t('exercisesPage.achievements.mission.claim')}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // BadgePill Component - definido dentro da função principal para ter acesso ao hook useTranslation
  function BadgePill({ badge }: { badge: BadgeType }) {
    const isLocked = !badge.unlockedAtISO;
    const rarityStyle = getBadgeRarityStyle(badge.rarity);
    const categoryIcon = getBadgeCategoryIcon(badge.category);

    return (
      <Card className={`${isLocked ? 'opacity-50' : ''} transition-all hover:scale-105`}>
        <CardContent className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            {categoryIcon}
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-sm truncate">{badge.name}</h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{badge.category}</span>
                <Badge className={`text-xs ${rarityStyle}`}>
                  {badge.rarity}
                </Badge>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {isLocked 
              ? t('exercisesPage.achievements.badge.locked')
              : t('exercisesPage.achievements.badge.unlockedOn', { date: new Date(badge.unlockedAtISO!).toLocaleDateString() })
            }
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Estados
  const [xp, setXp] = useState<XPRecord>({ currentXP: 0, nextLevelXP: 800, level: 1 });
  const [wallet, setWallet] = useState<CurrencyWallet>({ lumis: 0 });
  const [missions, setMissions] = useState<Mission[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeType[]>([]);
  const [streak, setStreak] = useState<Streak>({ current: 0, best: 0, protectedDays: 0 });
  const [focus, setFocus] = useState<Focus>({ max: 5, remaining: 5 });
  const [eventBanner] = useState<EventBanner>({
    id: "winter-2025",
    title: t('exercisesPage.achievements.event.winter2025'),
    subtitle: t('exercisesPage.achievements.event.exclusiveBadges'),
    cta: t('exercisesPage.achievements.event.participate')
  });
  const [engagementMetrics] = useState<EngagementMetrics>({
    activeDaysThisWeek: 4,
    completedMissions: 8,
    avgXPPerDay: 120
  });

  // Filtros
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRarity, setSelectedRarity] = useState<BadgeRarity | 'all'>('all');

  // Carregamento inicial
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        await bootstrapGamificationForUser(user.id);
        const data = await fetchGamification(user.id);
        
        setXp({
          currentXP: data.xp?.current_xp || 0,
          nextLevelXP: data.xp?.level ? (data.xp.level + 1) * 800 : 800,
          level: data.xp?.level || 1,
          title: data.xp?.title
        });
        setWallet({ lumis: data.wallet?.lumis || 0 });
        setMissions(data.missions);
        setAllBadges(data.badges);
        setStreak({
          current: data.streak?.current || 0,
          best: data.streak?.best || 0,
          protectedDays: data.streak?.protected_days || 0
        });
        setFocus({
          max: data.focus?.max || 5,
          remaining: data.focus?.remaining || 5
        });
      } catch (error) {
        console.error("Error loading gamification data:", error);
        toast({
          title: t("error"),
          description: t("gamificationDataError"),
          variant: "destructive",
        });
      }
    };
    loadData();
  }, [user, t, toast]);

  const handleClaimMission = useCallback(async (missionId: string) => {
    if (!user) return;
    
    try {
      const mission = missions.find(m => m.id === missionId);
      if (!mission || mission.status !== "completed") return;

      await claimMissionAtomic(user.id, missionId);

      // Atualizar estado local
      setMissions(prev => prev.map(m => 
        m.id === missionId ? { ...m, status: "claimed" } : m
      ));

      // Atualizar XP
      const newCurrentXP = xp.currentXP + mission.rewardXP;
      let newLevel = xp.level;
      let newNextLevelXP = xp.nextLevelXP;

      if (newCurrentXP >= xp.nextLevelXP) {
        newLevel++;
        newNextLevelXP = newLevel * 800;
      }

      setXp({
        currentXP: newCurrentXP,
        level: newLevel,
        nextLevelXP: newNextLevelXP,
        title: xp.title
      });

      // Atualizar Lumis
      setWallet(prev => ({
        lumis: prev.lumis + mission.rewardLumis
      }));

      toast({
        title: t("missionClaimed"),
        description: `${t("earned")} ${mission.rewardXP} XP ${t("and")} ${mission.rewardLumis} Lumis!`,
      });
    } catch (error) {
      console.error("Error claiming mission:", error);
      toast({
        title: t("error"),
        description: t("missionClaimError"),
        variant: "destructive",
      });
    }
  }, [missions, xp, user, t, toast]);

  const handleUseProtection = () => {
    if (streak.protectedDays > 0) {
      setStreak(prev => ({ ...prev, protectedDays: prev.protectedDays - 1 }));
              toast({
          title: t("protectorUsed"),
          description: t("streakProtectedToday"),
        });
    }
  };

  const dailyMissions = missions.filter(m => m.period === 'daily');
  const weeklyMissions = missions.filter(m => m.period === 'weekly');

  const filteredBadges = allBadges.filter(badge => {
    const categoryMatch = selectedCategory === 'all' || badge.category === selectedCategory;
    const rarityMatch = selectedRarity === 'all' || badge.rarity === selectedRarity;
    return categoryMatch && rarityMatch;
  });

  const categories = ['all', ...Array.from(new Set(allBadges.map(b => b.category)))];
  const rarities: (BadgeRarity | 'all')[] = ['all', 'common', 'rare', 'legendary', 'seasonal'];

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Header */}
          <Card className="border-2 border-kid-green/20 bg-gradient-card backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-kid-green to-kid-blue flex items-center justify-center text-2xl shadow-lg">
                  🏆
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-kid-green to-kid-blue bg-clip-text text-transparent">
                    {t('exercisesPage.achievements.title')}
                  </h1>
                  <p className="text-lg text-kid-green mt-1">
                    {t('exercisesPage.achievements.subtitle')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* XP & Level */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  {t('exercisesPage.achievements.level', { level: xp.level })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground">{xp.title}</div>
                <XPBar current={xp.currentXP} target={xp.nextLevelXP} />
              </CardContent>
            </Card>

            {/* Lumis */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Coins className="h-5 w-5 text-yellow-600" />
                  {t('exercisesPage.achievements.lumis')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-bold">{wallet.lumis}</div>
                <Button variant="outline" size="sm" className="w-full">
                  {t('exercisesPage.achievements.store')}
                </Button>
              </CardContent>
            </Card>

            {/* Streak */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Flame className="h-5 w-5 text-orange-600" />
                  {t('exercisesPage.achievements.streak')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-2xl font-bold">{t('exercisesPage.achievements.days', { count: streak.current })}</div>
                  <div className="text-sm text-muted-foreground">
                    {t('exercisesPage.achievements.best', { count: streak.best })}
                  </div>
                </div>
                {streak.protectedDays > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleUseProtection}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {t('exercisesPage.achievements.useProtector', { count: streak.protectedDays })}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Focus */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5 text-red-600" />
                  {t('exercisesPage.achievements.focusPoints')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-bold">
                  {focus.remaining}/{focus.max}
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('exercisesPage.achievements.focusDescription')}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Event Banner */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-purple-900">{t('exercisesPage.achievements.event.winter2025')}</h3>
                  <p className="text-purple-700">{t('exercisesPage.achievements.event.exclusiveBadges')}</p>
                </div>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Star className="h-4 w-4 mr-2" />
                  {t('exercisesPage.achievements.event.participate')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Missions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Missions */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t('exercisesPage.achievements.dailyMissions')}
              </h2>
              <div className="grid gap-4">
                {dailyMissions.map(mission => (
                  <MissionCard 
                    key={mission.id} 
                    mission={mission} 
                    onClaim={handleClaimMission}
                  />
                ))}
              </div>
            </div>

            {/* Weekly Missions */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('exercisesPage.achievements.weeklyMissions')}
              </h2>
              <div className="grid gap-4">
                {weeklyMissions.map(mission => (
                  <MissionCard 
                    key={mission.id} 
                    mission={mission} 
                    onClaim={handleClaimMission}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Museu do Estudante (Badges) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{t('exercisesPage.achievements.studentMuseum')}</h2>
              <div className="flex gap-2">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? t('exercisesPage.achievements.allCategories') : cat}
                    </option>
                  ))}
                </select>
                <select 
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value as BadgeRarity | 'all')}
                  className="text-sm border rounded px-2 py-1"
                >
                  {rarities.map(rarity => (
                    <option key={rarity} value={rarity}>
                      {rarity === 'all' ? t('exercisesPage.achievements.allRarities') : rarity}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBadges.map(badge => (
                <BadgePill key={badge.id} badge={badge} />
              ))}
            </div>
          </div>

          {/* Engagement Metrics */}
          <Card>
            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t('exercisesPage.achievements.engagementMetrics')}
                </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {engagementMetrics.activeDaysThisWeek}/7
                  </div>
                  <div className="text-sm text-muted-foreground">{t('exercisesPage.achievements.activeDaysWeek')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {engagementMetrics.completedMissions}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('exercisesPage.achievements.completedMissions')}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {engagementMetrics.avgXPPerDay}
                  </div>
                  <div className="text-sm text-muted-foreground">{t('exercisesPage.achievements.avgXPPerDay')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}