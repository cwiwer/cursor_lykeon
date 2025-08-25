import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, ArrowLeft, Clock, Trophy, Brain } from 'lucide-react';
import { Quiz, QuizAnswer, QuizResult } from '@/types/quiz';
import { getQuizById, submitQuiz, checkAnswer } from '@/services/quizzes';
import { AppLayout } from '@/components/Layout/AppLayout';

export default function QuizPlay() {
  const { t } = useTranslation();
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const data = await getQuizById(quizId!);
      if (data) {
        setQuiz(data);
        setStartTime(new Date());
      } else {
        navigate('/quizzes');
      }
    } catch (error) {
      console.error('Erro ao carregar quiz:', error);
      navigate('/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) return;

    const currentQuestion = quiz!.questions[currentQuestionIndex];
    const isCorrect = checkAnswer(currentQuestion.id, selectedOption, quiz!);
    
    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedIndex: selectedOption,
      isCorrect,
      timeSpent: 0 // Será calculado no final
    };

    setAnswers(prev => [...prev, answer]);
    setSelectedOption(null);

    if (currentQuestionIndex < quiz!.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const handleFinishQuiz = async () => {
    if (selectedOption === null) return;
    
    const currentQuestion = quiz!.questions[currentQuestionIndex];
    const isCorrect = checkAnswer(currentQuestion.id, selectedOption, quiz!);
    
    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedIndex: selectedOption,
      isCorrect,
      timeSpent: 0
    };

    const finalAnswers = [...answers, answer];
    await finishQuizWithAnswers(finalAnswers);
  };

  const finishQuizWithAnswers = async (finalAnswers: QuizAnswer[]) => {
    try {
      const result = await submitQuiz(quizId!, finalAnswers, timeSpent);
      setQuizResult(result);
      setShowResult(true);
      
      // Aqui você pode integrar com o sistema de gamificação
      // await awardXP(userId, result.xpEarned);
      // await unlockAchievement(userId, "quiz_completed");
      
    } catch (error) {
      console.error('Erro ao finalizar quiz:', error);
    }
  };

  const finishQuiz = () => {
    if (answers.length === quiz!.questions.length) {
      finishQuizWithAnswers(answers);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-8 w-full mb-4" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!quiz) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Quiz não encontrado</h1>
          <Button onClick={() => navigate('/quizzes')}>Voltar aos Quizzes</Button>
        </div>
      </AppLayout>
    );
  }

  if (showResult && quizResult) {
    return (
      <AppLayout>
        <div className="p-6 max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4">
                {quizResult.score >= 70 ? (
                  <div className="p-4 bg-green-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <Trophy className="h-10 w-10 text-green-600" />
                  </div>
                ) : (
                  <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                    <Brain className="h-10 w-10 text-blue-600" />
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl">
                {quizResult.score >= 70 ? 'Parabéns!' : 'Bom trabalho!'}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{quizResult.score}%</div>
                  <div className="text-sm text-blue-600">Pontuação</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{quizResult.xpEarned}</div>
                  <div className="text-sm text-green-600">XP Ganho</div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-lg text-muted-foreground mb-2">
                  {t('quiz.score', 'Você acertou {{correct}} de {{total}}', {
                    correct: quizResult.correctAnswers,
                    total: quizResult.totalQuestions
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tempo: {formatTime(quizResult.timeSpent)}
                </p>
              </div>
              
              <div className="flex gap-3 justify-center">
                <Button 
                  onClick={() => navigate('/quizzes')}
                  variant="outline"
                >
                  Voltar aos Quizzes
                </Button>
                <Button 
                  onClick={() => {
                    setShowResult(false);
                    setCurrentQuestionIndex(0);
                    setAnswers([]);
                    setSelectedOption(null);
                    setStartTime(new Date());
                    setTimeSpent(0);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/quizzes')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-sm text-muted-foreground">
              Questão {currentQuestionIndex + 1} de {quiz.questions.length}
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatTime(timeSpent)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card>
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">{currentQuestion.text}</h2>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedOption === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedOption === index
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedOption === index && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {answers.length} de {quiz.questions.length} respondidas
              </div>
              
              <Button
                onClick={isLastQuestion ? handleFinishQuiz : handleNextQuestion}
                disabled={selectedOption === null}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLastQuestion ? t('quiz.finish', 'Finalizar') : 'Próxima'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
