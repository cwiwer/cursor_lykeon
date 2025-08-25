import { SubjectId } from "@/types/schedule";

export const SUBJECTS_GRADE3: SubjectId[] = [
  "portugues","matematica","ciencias","historia","geografia",
  "ingles","frances","artes","educacao_fisica","musica","projeto_leitura"
];

// Mapeamento de idiomas para disciplinas de língua materna
export const LANGUAGE_SUBJECT_MAPPING: Record<string, SubjectId> = {
  'pt': 'portugues',
  'en': 'ingles', 
  'fr': 'frances'
};

// Carga horária-alvo semanal (mock simples – poderá ser substituída)
export const SUBJECT_TARGETS: Record<SubjectId, number> = {
  portugues: 4,
  matematica: 4,
  ciencias: 2,
  historia: 2,
  geografia: 2,
  ingles: 2,
  frances: 2,
  artes: 1,
  educacao_fisica: 1,
  musica: 1,
  projeto_leitura: 1
};

// Ordem sugerida preferencial p/ primeiras aulas (mais cognitivas)
export const SUBJECT_PREFERRED_ORDER: SubjectId[] = [
  "matematica","portugues","ciencias","historia","geografia",
  "ingles","frances","projeto_leitura","artes","educacao_fisica","musica"
];
