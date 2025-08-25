export type QuizSubject = "math" | "language" | "science" | "history" | "geography";

export type QuizQuestion = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
};

export type Quiz = {
  id: string;
  subject: QuizSubject;
  title: string;
  description?: string;
  difficulty: "easy" | "medium" | "hard";
  questions: QuizQuestion[];
  timeLimit?: number; // em minutos
  xpReward: number; // XP por questão correta
};

export type QuizAnswer = {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
  timeSpent: number; // em segundos
};

export type QuizResult = {
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  xpEarned: number;
  timeSpent: number;
  completedAt: Date;
  answers: QuizAnswer[];
};
