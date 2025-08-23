import React from "react";
import { BadgeRarity } from "../types/gamification";

export const BADGE_RARITY_COLORS: Record<BadgeRarity, string> = {
  common: "border-slate-300 bg-slate-50 text-slate-700",
  rare: "border-blue-300 bg-blue-50 text-blue-700",
  legendary: "border-purple-300 bg-purple-50 text-purple-700",
  seasonal: "border-orange-300 bg-orange-50 text-orange-700",
};

export const BADGE_CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Conhecimento": <span className="text-blue-600">📚</span>,
  "Esforço": <span className="text-green-600">💪</span>,
  "Desempenho": <span className="text-yellow-600">⭐</span>,
  "Explorador": <span className="text-purple-600">🗺️</span>,
  "Comportamental": <span className="text-pink-600">❤️</span>,
  "Secreta": <span className="text-gray-600">🔒</span>,
};

export function getBadgeRarityStyle(rarity: BadgeRarity): string {
  return BADGE_RARITY_COLORS[rarity] || BADGE_RARITY_COLORS.common;
}

export function getBadgeCategoryIcon(category: string): React.ReactNode {
  return BADGE_CATEGORY_ICONS[category] || <span>🏅</span>;
}