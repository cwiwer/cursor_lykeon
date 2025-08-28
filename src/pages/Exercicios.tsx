import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, Trophy, Clock, CheckCircle, AlertCircle, Brain, Calculator } from 'lucide-react';

interface Exercise {
  id: string;
  lessonTitle: string;
  subject: string;
  type: 'quiz' | 'upload';
  score: number | null;
  maxScore: number;
  completedAt: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number; // em minutos
}

const mockExercises: Exercise[] = [
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
  },
  {
    id: '4',
    lessonTitle: 'industrialRevolution',
    subject: 'history', 
    type: 'quiz',
    score: 6,
    maxScore: 10,
    completedAt: '2024-01-18',
    difficulty: 'medium',
    timeLimit: 25
  },
  {
    id: '5',
    lessonTitle: 'physicalStates',
    subject: 'sciences',
    type: 'quiz',
    score: null,
    maxScore: 10,
    completedAt: null,
    difficulty: 'easy',
    timeLimit: 10
  },
  {
    id: '6',
    lessonTitle: 'multiplication',
    subject: 'mathematics',
    type: 'upload',
    score: 7,
    maxScore: 10,
    completedAt: '2024-01-17',
    difficulty: 'easy'
  }
];

export default function Exercicios() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const subjects = ['all', 'mathematics', 'sciences', 'portuguese', 'history'];

  const filteredExercises = mockExercises.filter(exercise => {
    const lessonTitleText = t(`exercisesPage.exercises.${exercise.lessonTitle}`);
    const subjectText = t(`exercisesPage.subjects.${exercise.subject}`);
    const matchesSearch = lessonTitleText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subjectText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || exercise.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const getDifficultyColor = (difficulty: Exercise['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: Exercise['difficulty']) => {
    switch (difficulty) {
      case 'easy': return t('exercisesPage.difficulty.easy');
      case 'medium': return t('exercisesPage.difficulty.medium');
      case 'hard': return t('exercisesPage.difficulty.hard');
      default: return t('exercisesPage.difficulty.medium');
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const completedExercises = mockExercises.filter(ex => ex.score !== null);
  const totalScore = completedExercises.reduce((sum, ex) => sum + (ex.score || 0), 0);
  const totalMaxScore = completedExercises.reduce((sum, ex) => sum + ex.maxScore, 0);
  const averagePercentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-kid-green/15 via-kid-blue/10 to-kid-yellow/10 min-h-screen p-6 space-y-6">
        {/* Header */}
        <Card className="border-2 border-kid-green/20 bg-gradient-card backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-kid-green to-kid-blue flex items-center justify-center text-2xl shadow-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-kid-green to-kid-blue bg-clip-text text-transparent">
                    {t('exercisesPage.title')}
                  </h1>
                  <p className="text-lg text-kid-green mt-1">
                    {t('exercisesPage.subtitle')}
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={() => navigate('/quizzes')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <Brain className="h-5 w-5 mr-2" />
                {t('exercisesPage.viewAllQuizzes')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockExercises.length}</p>
                <p className="text-sm text-muted-foreground">{t('exercisesPage.stats.totalExercises')}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedExercises.length}</p>
                <p className="text-sm text-muted-foreground">{t('exercisesPage.stats.completed')}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{averagePercentage}%</p>
                <p className="text-sm text-muted-foreground">{t('exercisesPage.stats.averageScore')}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockExercises.length - completedExercises.length}</p>
                <p className="text-sm text-muted-foreground">{t('exercisesPage.stats.pending')}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('exercisesPage.search.placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 input-lykeon"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {subjects.map((subject) => (
                  <Button
                    key={subject}
                    variant={selectedSubject === subject ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSubject(subject)}
                    className={selectedSubject === subject ? "bg-primary" : ""}
                  >
                    {subject === 'all' ? t('exercisesPage.search.allSubjects') : t(`exercisesPage.subjects.${subject}`)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quizzes Disponíveis */}
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-purple-800">{t('exercisesPage.quizzes.title')}</CardTitle>
                <p className="text-purple-600 text-sm">{t('exercisesPage.quizzes.subtitle')}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50"
                onClick={() => navigate('/quizzes/math-1')}
              >
                <Calculator className="h-6 w-6 text-purple-600" />
                <span className="text-sm font-medium">{t('exercisesPage.quizzes.mathematics')}</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 border-green-300 hover:border-green-500 hover:bg-green-50"
                onClick={() => navigate('/quizzes/lang-1')}
              >
                <BookOpen className="h-6 w-6 text-green-600" />
                <span className="text-sm font-medium">{t('exercisesPage.quizzes.language')}</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-20 flex-col gap-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                onClick={() => navigate('/quizzes/sci-1')}
              >
                <Brain className="h-6 w-6 text-blue-600" />
                <span className="text-sm font-medium">{t('exercisesPage.quizzes.sciences')}</span>
              </Button>
            </div>
            
            <div className="mt-4 text-center">
              <Button 
                onClick={() => navigate('/quizzes')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {t('exercisesPage.viewAllQuizzes')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Exercise List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="card-lykeon hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{t(`exercisesPage.exercises.${exercise.lessonTitle}`)}</CardTitle>
                    <p className="text-sm text-muted-foreground">{t(`exercisesPage.subjects.${exercise.subject}`)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getDifficultyColor(exercise.difficulty)}>
                      {getDifficultyText(exercise.difficulty)}
                    </Badge>
                    <Badge variant="outline">
                      {exercise.type === 'quiz' ? t('quiz.quizzes') : t('exercisesPage.actions.upload')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Score Display */}
                  {exercise.score !== null ? (
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">{t('exercisesPage.status.completed')}</span>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getScoreColor(exercise.score, exercise.maxScore)}`}>
                          {exercise.score}/{exercise.maxScore}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('exercisesPage.exercise.scorePercentage', { percentage: Math.round((exercise.score / exercise.maxScore) * 100) })}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">{t('exercisesPage.status.notStarted')}</span>
                    </div>
                  )}

                  {/* Exercise Info */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{t('exercisesPage.exercise.maxScore', { score: exercise.maxScore })}</span>
                    {exercise.timeLimit && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {t('exercisesPage.exercise.timeLimit', { time: exercise.timeLimit })}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {exercise.score !== null ? (
                      <>
                        <Button variant="outline" className="flex-1">
                          {t('exercisesPage.actions.viewResult')}
                        </Button>
                        <Button 
                          className="flex-1 bg-secondary hover:bg-secondary/90"
                          onClick={() => {
                            if (exercise.type === 'quiz') {
                              // Mapear para quiz real baseado na matéria
                              const subjectMap: Record<string, string> = {
                                'mathematics': 'math-1',
                                'sciences': 'sci-1',
                                'portuguese': 'lang-1',
                                'history': 'hist-1'
                              };
                              const quizId = subjectMap[exercise.subject];
                              if (quizId) {
                                navigate(`/quizzes/${quizId}`);
                              } else {
                                navigate('/quizzes');
                              }
                            }
                          }}
                        >
                          {t('exercisesPage.actions.redo')}
                        </Button>
                      </>
                    ) : (
                      <Button 
                        className="w-full btn-lykeon bg-primary hover:bg-primary/90"
                        onClick={() => {
                          if (exercise.type === 'quiz') {
                            // Mapear para quiz real baseado na matéria
                            const subjectMap: Record<string, string> = {
                              'mathematics': 'math-1',
                              'sciences': 'sci-1',
                              'portuguese': 'lang-1',
                              'history': 'hist-1'
                            };
                            const quizId = subjectMap[exercise.subject];
                            if (quizId) {
                              navigate(`/quizzes/${quizId}`);
                            } else {
                              navigate('/quizzes');
                            }
                          }
                        }}
                      >
                        {exercise.type === 'quiz' ? t('exercisesPage.actions.startQuiz') : t('exercisesPage.actions.submitWork')}
                      </Button>
                    )}
                  </div>

                  {exercise.completedAt && (
                    <p className="text-xs text-muted-foreground text-center">
                      {t('exercisesPage.exercise.completedOn', { date: new Date(exercise.completedAt).toLocaleDateString() })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t('exercisesPage.noResults.title')}</h3>
              <p className="text-muted-foreground">
                {t('exercisesPage.noResults.description')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Motivational Message */}
        {averagePercentage >= 70 && completedExercises.length > 0 && (
          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6 text-center">
              <Trophy className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">
                {t('exercisesPage.motivation.congratulations', { percentage: averagePercentage })}
              </h3>
              <p className="opacity-90">
                {t('exercisesPage.motivation.continue')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}