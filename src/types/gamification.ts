export type MissionPeriod = "daily" | "weekly";
export type MissionStatus = "locked" | "active" | "completed" | "claimed";
export type BadgeRarity = "common" | "rare" | "legendary" | "seasonal";

export interface XPRecord {
  currentXP: number;
  nextLevelXP: number;     // alvo do próximo nível
  level: number;           // nível atual
  title?: string;          // ex.: "Explorador do Saber"
}

export interface CurrencyWallet {
  lumis: number;           // saldo atual
}

export interface Mission {
  id: string;
  period: MissionPeriod;   // daily/weekly
  name: string;
  description: string;
  progress: number;        // 0..100
  rewardXP: number;
  rewardLumis: number;
  status: MissionStatus;
  resetsAtISO: string;     // ISO para contagem regressiva
}

export interface Badge {
  id: string;
  name: string;
  category: "Conhecimento" | "Esforço" | "Desempenho" | "Explorador" | "Comportamental" | "Secreta";
  rarity: BadgeRarity;
  unlockedAtISO?: string;
}

export interface Streak {
  current: number;         // dias consecutivos
  best: number;
  protectedDays: number;   // Protetor de sequência
}

export interface Focus {
  max: number;             // pontos de foco por sessão
  remaining: number;       // decresce ao errar; não bloqueia aula
}

export interface EventBanner {
  id: string;
  title: string;
  subtitle: string;
  cta?: string;
}

export interface EngagementMetrics {
  activeDaysThisWeek: number;
  completedMissions: number;
  avgXPPerDay: number;
}