import { useState } from 'react';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, Trophy, Clock, CheckCircle, AlertCircle } from 'lucide-react';

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
    lessonTitle: 'Sistema Solar - Planetas',
    subject: 'Ciências',
    type: 'quiz',
    score: 8,
    maxScore: 10,
    completedAt: '2024-01-20',
    difficulty: 'medium',
    timeLimit: 15
  },
  {
    id: '2', 
    lessonTitle: 'Frações e Decimais',
    subject: 'Matemática',
    type: 'quiz',
    score: 9,
    maxScore: 10,
    completedAt: '2024-01-19',
    difficulty: 'hard',
    timeLimit: 20
  },
  {
    id: '3',
    lessonTitle: 'Texto Narrativo',
    subject: 'Português',
    type: 'upload',
    score: null,
    maxScore: 10,
    completedAt: null,
    difficulty: 'medium'
  },
  {
    id: '4',
    lessonTitle: 'Revolução Industrial',
    subject: 'História', 
    type: 'quiz',
    score: 6,
    maxScore: 10,
    completedAt: '2024-01-18',
    difficulty: 'medium',
    timeLimit: 25
  },
  {
    id: '5',
    lessonTitle: 'Estados Físicos da Matéria',
    subject: 'Ciências',
    type: 'quiz',
    score: null,
    maxScore: 10,
    completedAt: null,
    difficulty: 'easy',
    timeLimit: 10
  },
  {
    id: '6',
    lessonTitle: 'Multiplicação e Divisão',
    subject: 'Matemática',
    type: 'upload',
    score: 7,
    maxScore: 10,
    completedAt: '2024-01-17',
    difficulty: 'easy'
  }
];

export default function Exercicios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  const subjects = ['all', 'Matemática', 'Ciências', 'Português', 'História'];

  const filteredExercises = mockExercises.filter(exercise => {
    const matchesSearch = exercise.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.subject.toLowerCase().includes(searchTerm.toLowerCase());
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
      case 'easy': return 'Fácil';
      case 'medium': return 'Médio';
      case 'hard': return 'Difícil';
      default: return 'Médio';
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
        <div className="flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-kid-green/20">
          <div className="p-3 bg-gradient-to-br from-kid-green to-kid-blue rounded-full">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-kid-green to-kid-blue bg-clip-text text-transparent">
              Lista de Exercícios
            </h1>
            <p className="text-kid-green/70 font-medium text-lg">
              Pratique e reforce seu aprendizado
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockExercises.length}</p>
                <p className="text-sm text-muted-foreground">Total de exercícios</p>
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
                <p className="text-sm text-muted-foreground">Concluídos</p>
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
                <p className="text-sm text-muted-foreground">Média de acertos</p>
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
                <p className="text-sm text-muted-foreground">Pendentes</p>
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
                    placeholder="Buscar exercícios..."
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
                    {subject === 'all' ? 'Todas as matérias' : subject}
                  </Button>
                ))}
              </div>
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
                    <CardTitle className="text-lg">{exercise.lessonTitle}</CardTitle>
                    <p className="text-sm text-muted-foreground">{exercise.subject}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={getDifficultyColor(exercise.difficulty)}>
                      {getDifficultyText(exercise.difficulty)}
                    </Badge>
                    <Badge variant="outline">
                      {exercise.type === 'quiz' ? 'Quiz' : 'Upload'}
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
                        <span className="font-medium">Concluído</span>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${getScoreColor(exercise.score, exercise.maxScore)}`}>
                          {exercise.score}/{exercise.maxScore}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((exercise.score / exercise.maxScore) * 100)}% de acertos
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">Não iniciado</span>
                    </div>
                  )}

                  {/* Exercise Info */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Pontuação máxima: {exercise.maxScore}</span>
                    {exercise.timeLimit && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {exercise.timeLimit} min
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {exercise.score !== null ? (
                      <>
                        <Button variant="outline" className="flex-1">
                          Ver resultado
                        </Button>
                        <Button className="flex-1 bg-secondary hover:bg-secondary/90">
                          Refazer
                        </Button>
                      </>
                    ) : (
                      <Button className="w-full btn-lykeon bg-primary hover:bg-primary/90">
                        {exercise.type === 'quiz' ? 'Iniciar Quiz' : 'Enviar Trabalho'}
                      </Button>
                    )}
                  </div>

                  {exercise.completedAt && (
                    <p className="text-xs text-muted-foreground text-center">
                      Concluído em {new Date(exercise.completedAt).toLocaleDateString('pt-BR')}
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
              <h3 className="text-lg font-semibold mb-2">Nenhum exercício encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou buscar por outros termos.
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
                Parabéns! Você acertou {averagePercentage}% dos exercícios!
              </h3>
              <p className="opacity-90">
                Continue praticando e você se tornará um expert em todas as matérias!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}