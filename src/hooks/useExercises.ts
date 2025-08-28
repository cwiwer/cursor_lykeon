import { useState, useEffect } from 'react';

export type Exercise = {
  id: string;
  title: string;
  subject?: string;
  grade?: string | number;
  questionCount?: number;
  isTimed?: boolean;
  timeLimitSec?: number | null;
  isAutoGraded?: boolean;
  progress?: number; // 0–100
  status?: 'not_started' | 'in_progress' | 'completed';
  tags?: string[];
  updatedAt?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  type?: 'quiz' | 'upload' | 'exercise';
  score?: number | null;
  maxScore?: number;
  completedAt?: string | null;
};

export function mapLegacyExercise(e: any): Exercise {
  return {
    id: String(e.id),
    title: e.lessonTitle || e.title,
    subject: e.subject,
    grade: e.grade,
    questionCount: e.question_count ?? e.questions?.length,
    isTimed: false,
    timeLimitSec: null,
    isAutoGraded: !!e.is_auto_graded,
    progress: e.progress ?? 0,
    status: e.completedAt ? 'completed' : 'not_started',
    tags: e.tags ?? [],
    updatedAt: e.updatedAt || e.completedAt || e.createdAt,
    difficulty: e.difficulty,
    type: e.type || 'exercise',
    score: e.score,
    maxScore: e.maxScore,
    completedAt: e.completedAt,
  };
}

export function mapLegacyQuiz(q: any): Exercise {
  return {
    id: String(q.id),
    title: q.title,
    subject: q.subject,
    grade: q.grade,
    questionCount: q.question_count ?? q.questions?.length,
    isTimed: !!q.timeLimit || !!q.time_limit_seconds,
    timeLimitSec: q.timeLimit ? q.timeLimit * 60 : q.time_limit_seconds ?? null,
    isAutoGraded: true,
    progress: q.progress ?? 0,
    status: q.status ?? 'not_started',
    tags: q.tags ?? [],
    updatedAt: q.updatedAt || q.updated_at || q.createdAt || q.created_at,
    difficulty: q.difficulty,
    type: 'quiz',
    score: q.score,
    maxScore: q.maxScore || 10,
    completedAt: q.completedAt,
  };
}

export function useExercises(params?: {
  search?: string;
  subject?: string;
  grade?: string | number;
  difficulty?: string;
}) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError(null);

      // Simular carregamento de dados legados
      // TODO: Substituir por fetchers reais
      const mockLegacyExercises = [
        {
          id: '1',
          lessonTitle: 'solarSystem',
          subject: 'sciences',
          type: 'quiz',
          score: 8,
          maxScore: 10,
          completedAt: '2024-01-20',
          difficulty: 'medium',
          timeLimit: 15
        },
        {
          id: '2', 
          lessonTitle: 'fractions',
          subject: 'mathematics',
          type: 'quiz',
          score: 9,
          maxScore: 10,
          completedAt: '2024-01-19',
          difficulty: 'hard',
          timeLimit: 20
        },
        {
          id: '3',
          lessonTitle: 'narrativeText',
          subject: 'portuguese',
          type: 'upload',
          score: null,
          maxScore: 10,
          completedAt: null,
          difficulty: 'medium'
        }
      ];

      const mockLegacyQuizzes = [
        {
          id: 'q1',
          title: 'Matemática Básica',
          subject: 'mathematics',
          difficulty: 'easy',
          question_count: 10,
          timeLimit: 15,
          score: 7,
          maxScore: 10,
          completedAt: '2024-01-21'
        },
        {
          id: 'q2',
          title: 'História do Brasil',
          subject: 'history',
          difficulty: 'medium',
          question_count: 15,
          timeLimit: 20,
          score: 12,
          maxScore: 15,
          completedAt: '2024-01-22'
        }
      ];

      // Mapear e consolidar dados
      const mappedExercises = mockLegacyExercises.map(mapLegacyExercise);
      const mappedQuizzes = mockLegacyQuizzes.map(mapLegacyQuiz);
      
      // Concatenar e ordenar por data mais recente
      const allExercises = [...mappedExercises, ...mappedQuizzes]
        .sort((a, b) => {
          const dateA = new Date(a.updatedAt || '1970-01-01');
          const dateB = new Date(b.updatedAt || '1970-01-01');
          return dateB.getTime() - dateA.getTime();
        });

      setExercises(allExercises);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar exercícios baseado nos parâmetros
  const filteredExercises = exercises.filter(exercise => {
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      const titleLower = exercise.title.toLowerCase();
      const subjectLower = exercise.subject?.toLowerCase() || '';
      if (!titleLower.includes(searchLower) && !subjectLower.includes(searchLower)) {
        return false;
      }
    }

    if (params?.subject && params.subject !== 'all') {
      if (exercise.subject !== params.subject) {
        return false;
      }
    }

    if (params?.grade && params.grade !== 'all') {
      if (exercise.grade !== params.grade) {
        return false;
      }
    }

    if (params?.difficulty && params.difficulty !== 'all') {
      if (exercise.difficulty !== params.difficulty) {
        return false;
      }
    }

    return true;
  });

  return {
    exercises: filteredExercises,
    loading,
    error,
    refetch: loadExercises,
    total: exercises.length,
    completed: exercises.filter(e => e.status === 'completed').length,
    averageAccuracy: exercises.length > 0 
      ? exercises
          .filter(e => e.score !== null && e.maxScore)
          .reduce((acc, e) => acc + (e.score! / e.maxScore!), 0) / 
          exercises.filter(e => e.score !== null && e.maxScore).length * 100
      : 0
  };
}
