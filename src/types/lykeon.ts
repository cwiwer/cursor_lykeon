export type SubjectKey = "math" | "french" | "history" | "science";

export interface Student {
  id: string;
  name: string;
  grade: string;          // ex. "3º ano"
  avatarUrl?: string;
  points: number;         // gamificação
  medals: string[];       // códigos de medalhas
}

export interface KPI {
  attendancePct: number;  // 0..100
  correctQuizzesPct: number; // 0..100
  studyHoursPerWeek: number; // ex. 6
}

export type LessonStatus =
  | "completed"
  | "no_show"
  | "prepare"
  | "time_to_start"
  | "scheduled";

export interface LessonProgress {
  subject: SubjectKey;
  subjectName: string;
  completedLessons: number;
  totalLessons: number;
  nextTopic?: string;
  lastUpdated: string; // ISO
}

export interface ParentChildSummary {
  student: Student;
  kpi: KPI;
  alerts: string[]; // "Reforço recomendado em Frações"
  progressBySubject: LessonProgress[];
}

export interface MonthlyReport {
  id: string;
  studentId: string;
  month: string;   // "2025-08"
  url: string;     // link PDF
  createdAt: string;
}