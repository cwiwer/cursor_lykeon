import { XPRecord, CurrencyWallet, Mission, Badge, Streak, Focus, EventBanner, EngagementMetrics } from "../types/gamification";

export const MOCK_XP: XPRecord = { currentXP: 1280, nextLevelXP: 1600, level: 7, title: "Explorador do Saber" };
export const MOCK_WALLET: CurrencyWallet = { lumis: 340 };

export const MOCK_MISSIONS: Mission[] = [
  { 
    id: "m1", 
    period: "daily", 
    name: "Concluir 1 aula hoje",
    description: "Assista a uma aula completa.", 
    progress: 100, 
    rewardXP: 50, 
    rewardLumis: 5, 
    status: "completed", 
    resetsAtISO: new Date(Date.now()+6*3600e3).toISOString() 
  },
  { 
    id: "m2", 
    period: "daily", 
    name: "Acerte 80% no quiz",
    description: "Desempenho em quizzes de hoje.", 
    progress: 60, 
    rewardXP: 80, 
    rewardLumis: 8, 
    status: "active", 
    resetsAtISO: new Date(Date.now()+6*3600e3).toISOString() 
  },
  { 
    id: "m3", 
    period: "weekly", 
    name: "5 dias consecutivos de estudo",
    description: "Mantenha a sequência nesta semana.", 
    progress: 40, 
    rewardXP: 150, 
    rewardLumis: 20, 
    status: "active", 
    resetsAtISO: new Date(Date.now()+3*24*3600e3).toISOString() 
  },
  { 
    id: "m4", 
    period: "daily", 
    name: "Pratique 30 minutos",
    description: "Tempo total de estudo hoje.", 
    progress: 75, 
    rewardXP: 60, 
    rewardLumis: 6, 
    status: "active", 
    resetsAtISO: new Date(Date.now()+6*3600e3).toISOString() 
  },
  { 
    id: "m5", 
    period: "weekly", 
    name: "Complete 10 exercícios",
    description: "Exercícios resolvidos nesta semana.", 
    progress: 90, 
    rewardXP: 120, 
    rewardLumis: 15, 
    status: "active", 
    resetsAtISO: new Date(Date.now()+3*24*3600e3).toISOString() 
  }
];

export const MOCK_BADGES: Badge[] = [
  { id: "b1", name: "Mestre da Tabuada", category: "Conhecimento", rarity: "rare", unlockedAtISO: new Date().toISOString() },
  { id: "b2", name: "Assiduidade Perfeita", category: "Esforço", rarity: "legendary", unlockedAtISO: new Date().toISOString() },
  { id: "b3", name: "Cientista Curioso", category: "Explorador", rarity: "common", unlockedAtISO: new Date().toISOString() },
  { id: "b4", name: "Medalha Secreta #1", category: "Secreta", rarity: "seasonal" },
  { id: "b5", name: "Primeira Aula", category: "Explorador", rarity: "common", unlockedAtISO: new Date().toISOString() },
  { id: "b6", name: "Quiz Master", category: "Desempenho", rarity: "rare" },
  { id: "b7", name: "Comportamento Exemplar", category: "Comportamental", rarity: "common", unlockedAtISO: new Date().toISOString() },
  { id: "b8", name: "Semana Perfeita", category: "Esforço", rarity: "legendary" },
];

export const MOCK_STREAK: Streak = { current: 6, best: 14, protectedDays: 1 };
export const MOCK_FOCUS: Focus = { max: 5, remaining: 3 };

export const MOCK_EVENT: EventBanner = {
  id: "ev1",
  title: "Semana das Ciências",
  subtitle: "Desafios e minijogos temáticos valendo badges sazonais!",
  cta: "Participar"
};

export const MOCK_ENGAGEMENT: EngagementMetrics = {
  activeDaysThisWeek: 5,
  completedMissions: 12,
  avgXPPerDay: 85
};