export type SubjectId =
  | "portugues" | "matematica" | "ciencias" | "historia" | "geografia"
  | "ingles" | "frances" | "artes" | "educacao_fisica" | "musica" | "projeto_leitura";

export type LessonSlot = {
  id: string;                 // uuid
  dateISO: string;            // YYYY-MM-DD
  startMinOfDay: number;      // ex.: 8*60
  durationMin: number;        // 45/30/10
  type: "class" | "break";
  subjectId?: SubjectId;      // só em "class"
  title?: string;             // i18n label resolvida
};

export type DaySchedule = {
  dateISO: string;
  slots: LessonSlot[];        // class/break/class/break/class
};

export type WeekSchedule = {
  weekStartISO: string;       // domingo ou segunda, mas manter consistente
  days: DaySchedule[];        // 7 dias
};
