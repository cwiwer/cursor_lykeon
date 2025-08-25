import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, BookOpen, Calculator, Globe, Palette, Clock, Trophy } from 'lucide-react';
import { Quiz, QuizSubject } from '@/types/quiz';
import { getQuizzes } from '@/services/quizzes';
import { AppLayout } from '@/components/Layout/AppLayout';

const subjectIcons: Record<QuizSubject, React.ReactNode> = {
  math: <Calculator className="h-6 w-6" />,
  language: <BookOpen className="h-6 w-6" />,
  science: <Brain className="h-6 w-6" />,
  history: <Clock className="h-6 w-6" />,
  geography: <Globe className="h-6 w-6" />
};

const subjectColors: Record<QuizSubject, string> = {
  math: "bg-blue-100 text-blue-800 border-blue-200",
  language: "bg-green-100 text-green-800 border-green-200",
  science: "bg-purple-100 text-purple-800 border-purple-200",
  history: "bg-orange-100 text-orange-800 border-orange-200",
  geography: "bg-teal-100 text-teal-800 border-teal-200"
};

const difficultyColors = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800"
};

export default function Quizzes() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<QuizSubject | 'all'>('all');

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      const data = await getQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error('Erro ao carregar quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = selectedSubject === 'all' 
    ? quizzes 
    : quizzes.filter(quiz => quiz.subject === selectedSubject);

  const subjects = ['all', 'math', 'language', 'science', 'history', 'geography'] as const;

  const handleStartQuiz = (quizId: string) => {
    navigate(`/quizzes/${quizId}`);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="text-center">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('quiz.title', 'Quizzes')}
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Teste seus conhecimentos e ganhe pontos com nossos quizzes educativos!
          </p>
        </div>

        {/* Filtros por matéria */}
        <div className="flex flex-wrap gap-2 justify-center">
          {subjects.map(subject => (
            <Button
              key={subject}
              variant={selectedSubject === subject ? "default" : "outline"}
              onClick={() => setSelectedSubject(subject)}
              className="capitalize"
            >
              {subject === 'all' ? 'Todas' : 
               subject === 'math' ? 'Matemática' :
               subject === 'language' ? 'Língua' :
               subject === 'science' ? 'Ciências' :
               subject === 'history' ? 'História' :
               'Geografia'
              }
            </Button>
          ))}
        </div>

        {/* Lista de Quizzes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card 
              key={quiz.id} 
              className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
              onClick={() => handleStartQuiz(quiz.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${subjectColors[quiz.subject]}`}>
                    {subjectIcons[quiz.subject]}
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={difficultyColors[quiz.difficulty]}
                  >
                    {quiz.difficulty === 'easy' ? 'Fácil' :
                     quiz.difficulty === 'medium' ? 'Médio' : 'Difícil'}
                  </Badge>
                </div>
                <CardTitle className="text-lg leading-tight">{quiz.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="pt-0">
                {quiz.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {quiz.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{quiz.questions.length} questões</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-700">
                      +{quiz.xpReward * quiz.questions.length} XP
                    </span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartQuiz(quiz.id);
                  }}
                >
                  {t('quiz.start', 'Iniciar Quiz')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredQuizzes.length === 0 && (
          <div className="text-center py-12">
            <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Nenhum quiz encontrado
            </h3>
            <p className="text-sm text-muted-foreground">
              Tente selecionar outra matéria ou volte mais tarde.
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
