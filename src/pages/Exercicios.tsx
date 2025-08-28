import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Search, 
  Trophy, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Brain, 
  Calculator,
  Target,
  Timer,
  Zap
} from 'lucide-react';
import { useExercises, type Exercise } from '@/hooks/useExercises';

const subjectIcons: Record<string, React.ReactNode> = {
  mathematics: <Calculator className="h-5 w-5" />,
  sciences: <Brain className="h-5 w-5" />,
  portuguese: <BookOpen className="h-5 w-5" />,
  history: <Clock className="h-5 w-5" />,
  geography: <Target className="h-5 w-5" />
};

const subjectColors: Record<string, string> = {
  mathematics: "bg-blue-100 text-blue-800 border-blue-200",
  sciences: "bg-purple-100 text-purple-800 border-purple-200",
  portuguese: "bg-green-100 text-green-800 border-green-200",
  history: "bg-orange-100 text-orange-800 border-orange-200",
  geography: "bg-teal-100 text-teal-800 border-teal-200"
};

const difficultyColors = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800"
};

export default function Exercicios() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  const { exercises, loading, error, total, completed, averageAccuracy } = useExercises({
    search: searchTerm,
    subject: selectedSubject,
    difficulty: selectedDifficulty
  });

  const subjects = ['all', 'mathematics', 'sciences', 'portuguese', 'history', 'geography'];
  const difficulties = ['all', 'easy', 'medium', 'hard'];

  const handleStartExercise = (exercise: Exercise) => {
    // Todos os exercícios agora vão para a mesma rota
    navigate(`/exercicios/${exercise.id}`);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="bg-gradient-to-br from-kid-green/15 via-kid-blue/10 to-kid-yellow/10 min-h-screen p-6 space-y-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <Card className="border-2 border-kid-green/20 bg-gradient-card backdrop-blur-sm mb-8">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-kid-green to-kid-blue flex items-center justify-center text-2xl shadow-lg">
                      <Target className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="h-8 w-64 mx-auto mb-2 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-96 mx-auto bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>

            {/* KPIs Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="p-6 text-center">
                    <div className="h-8 w-24 mx-auto mb-2 bg-gray-200 rounded animate-pulse" />
                    <div className="h-12 w-16 mx-auto bg-gray-200 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters Skeleton */}
            <div className="flex gap-4 mb-8">
              <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-6 w-48 mb-2 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 w-full mb-2 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-3/4 mb-4 bg-gray-200 rounded animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                      <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="bg-gradient-to-br from-kid-green/15 via-kid-blue/10 to-kid-yellow/10 min-h-screen p-6">
          <div className="max-w-7xl mx-auto text-center">
            <Card className="border-2 border-red-200 bg-red-50">
              <CardContent className="p-12">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-800 mb-2">
                  {t('exercises.error')}
                </h2>
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Tentar Novamente
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-kid-green/15 via-kid-blue/10 to-kid-yellow/10 min-h-screen p-6 space-y-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <Card className="border-2 border-kid-green/20 bg-gradient-card backdrop-blur-sm mb-8">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-kid-green to-kid-blue flex items-center justify-center text-2xl shadow-lg">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-kid-green to-kid-blue bg-clip-text text-transparent mb-2">
                  {t('exercises.title')}
                </h1>
                <p className="text-lg text-kid-green">
                  {t('exercises.subtitle')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-6 w-6 text-kid-blue mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('exercises.kpi.total')}
                  </span>
                </div>
                <div className="text-3xl font-bold text-kid-blue">{total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-6 w-6 text-kid-green mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('exercises.kpi.completed')}
                  </span>
                </div>
                <div className="text-3xl font-bold text-kid-green">{completed}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="h-6 w-6 text-kid-yellow mr-2" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('exercises.kpi.accuracy')}
                  </span>
                </div>
                <div className="text-3xl font-bold text-kid-yellow">
                  {averageAccuracy.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('exercises.filters.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              <option value="all">{t('exercises.filters.subject')}</option>
              {subjects.filter(s => s !== 'all').map(subject => (
                <option key={subject} value={subject}>
                  {t(`subjects.${subject}`)}
                </option>
              ))}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              <option value="all">{t('exercises.filters.difficulty')}</option>
              {difficulties.filter(d => d !== 'all').map(difficulty => (
                <option key={difficulty} value={difficulty}>
                  {t(`exercisesPage.difficulty.${difficulty}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Lista de Exercícios */}
          {exercises.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  {t('exercises.empty')}
                </h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou buscar por outros termos.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exercises.map((exercise) => (
                <Card 
                  key={exercise.id} 
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => handleStartExercise(exercise)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {subjectIcons[exercise.subject || ''] || <BookOpen className="h-5 w-5" />}
                        <Badge 
                          variant="outline" 
                          className={subjectColors[exercise.subject || ''] || "bg-gray-100 text-gray-800 border-gray-200"}
                        >
                          {t(`subjects.${exercise.subject}`)}
                        </Badge>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={difficultyColors[exercise.difficulty || 'medium']}
                      >
                        {t(`exercisesPage.difficulty.${exercise.difficulty || 'medium'}`)}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {exercise.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {exercise.questionCount && (
                        <span className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {t('exercises.card.questions', { count: exercise.questionCount })}
                        </span>
                      )}
                    </div>

                    {/* Badges informativos */}
                    <div className="flex flex-wrap gap-2">
                      {exercise.isTimed && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <Timer className="h-3 w-3 mr-1" />
                          {t('exercises.card.timed')}
                          {exercise.timeLimitSec && (
                            <span className="ml-1">
                              ({formatTime(exercise.timeLimitSec)})
                            </span>
                          )}
                        </Badge>
                      )}
                      
                      {exercise.isAutoGraded && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Zap className="h-3 w-3 mr-1" />
                          {t('exercises.card.auto')}
                        </Badge>
                      )}
                    </div>

                    {/* Progresso ou Score */}
                    {exercise.status === 'completed' && exercise.score !== null && exercise.maxScore && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Score:</span>
                        <span className="font-semibold text-kid-green">
                          {exercise.score}/{exercise.maxScore}
                        </span>
                      </div>
                    )}

                    {/* Botão de ação */}
                    <Button 
                      className="w-full" 
                      variant={exercise.status === 'completed' ? 'outline' : 'default'}
                    >
                      {exercise.status === 'completed' ? 'Ver Resultado' : 'Iniciar'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}