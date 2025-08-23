import React from "react";
import { SubjectKey } from "../types/lykeon";

export const SUBJECT_META: Record<SubjectKey, { name: string; icon: React.ReactNode; color: string }> = {
  math:    { name: "Matemática", icon: <span>📐</span>, color: "text-pastel-blue" },
  french:  { name: "Francês",    icon: <span>📖</span>, color: "text-pastel-purple" },
  history: { name: "História",   icon: <span>📜</span>, color: "text-pastel-orange" },
  science: { name: "Ciências",   icon: <span>🔬</span>, color: "text-primary" },
};