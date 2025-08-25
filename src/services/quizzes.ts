import { Quiz, QuizResult, QuizAnswer } from "@/types/quiz";
import { quizzes, getQuizById as getQuizByIdMock, getQuizzesBySubject as getQuizzesBySubjectMock } from "@/mock/quizzes";

// Função para listar todos os quizzes
export async function getQuizzes(): Promise<Quiz[]> {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 100));
  return quizzes;
}

// Função para buscar quiz por ID
export async function getQuizById(id: string): Promise<Quiz | null> {
  await new Promise(resolve => setTimeout(resolve, 100));
  const quiz = getQuizByIdMock(id);
  return quiz || null;
}

// Função para buscar quizzes por matéria
export async function getQuizzesBySubject(subject: string): Promise<Quiz[]> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return getQuizzesBySubjectMock(subject);
}

// Função para submeter quiz e calcular pontuação
export async function submitQuiz(
  quizId: string, 
  answers: QuizAnswer[], 
  timeSpent: number
): Promise<QuizResult> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const quiz = await getQuizById(quizId);
  if (!quiz) {
    throw new Error("Quiz não encontrado");
  }

  // Calcular pontuação
  let correctAnswers = 0;
  const totalQuestions = quiz.questions.length;
  
  answers.forEach(answer => {
    if (answer.isCorrect) {
      correctAnswers++;
    }
  });

  const score = (correctAnswers / totalQuestions) * 100;
  const xpEarned = correctAnswers * quiz.xpReward;

  const result: QuizResult = {
    quizId,
    score,
    totalQuestions,
    correctAnswers,
    xpEarned,
    timeSpent,
    completedAt: new Date(),
    answers
  };

  // Aqui você pode salvar o resultado no banco de dados
  // await saveQuizResult(result);
  
  // E integrar com o sistema de gamificação
  // await awardXP(userId, xpEarned);
  // await unlockAchievement(userId, "quiz_completed");

  return result;
}

// Função para verificar se uma resposta está correta
export function checkAnswer(
  questionId: string, 
  selectedIndex: number, 
  quiz: Quiz
): boolean {
  const question = quiz.questions.find(q => q.id === questionId);
  if (!question) return false;
  
  return selectedIndex === question.correctIndex;
}

// Função para calcular XP baseado na dificuldade
export function calculateXPReward(difficulty: string, correctAnswers: number): number {
  const baseXP = {
    easy: 10,
    medium: 15,
    hard: 20
  };
  
  return (baseXP[difficulty as keyof typeof baseXP] || 10) * correctAnswers;
}
