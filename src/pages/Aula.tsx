import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  PlayCircle, 
  PauseCircle, 
  FileText, 
  Download, 
  CheckCircle, 
  Upload,
  BookOpen,
  Clock,
  User,
  ArrowLeft
} from 'lucide-react';

export default function Aula() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Simular dados da aula baseado no lessonId
  useEffect(() => {
    if (lessonId) {
      // Aqui você pode fazer uma chamada para a API para buscar os dados da aula
      console.log('Carregando aula com ID:', lessonId);
      setIsLoading(false);
    } else {
      // Se não houver lessonId, usar dados padrão
      setIsLoading(false);
    }
  }, [lessonId]);

  const currentLesson = {
    id: lessonId || '1',
    title: 'Sistema Solar - Planetas e suas características',
    subject: 'Ciências',
    teacher: 'Prof. Maria Santos',
    duration: '45 minutos',
    videoUrl: '#',
    transcript: `Olá! Hoje vamos explorar o fascinante Sistema Solar e conhecer melhor os planetas que o compõem.

Nosso Sistema Solar é formado pelo Sol e todos os corpos celestes que orbitam ao seu redor, incluindo oito planetas principais.

Os planetas são divididos em dois grupos:
1. Planetas rochosos (Mercúrio, Vênus, Terra e Marte)
2. Planetas gasosos (Júpiter, Saturno, Urano e Netuno)

Cada planeta tem características únicas que os tornam especiais. A Terra, por exemplo, é o único planeta conhecido que abriga vida.`,
    materials: [
      { name: 'Guia dos Planetas.pdf', size: '2.5 MB', type: 'pdf' },
      { name: 'Curiosidades sobre o Sistema Solar.pdf', size: '1.8 MB', type: 'pdf' },
      { name: 'Site da NASA (Sistema Solar)', url: 'https://nasa.gov', type: 'link' },
    ],
    exercises: [
      {
        question: 'Quantos planetas principais existem no Sistema Solar?',
        options: ['6 planetas', '7 planetas', '8 planetas', '9 planetas'],
        correct: 2
      },
      {
        question: 'Qual é o maior planeta do Sistema Solar?',
        options: ['Terra', 'Saturno', 'Júpiter', 'Urano'],
        correct: 2
      },
      {
        question: 'Quais são os planetas rochosos?',
        options: [
          'Júpiter, Saturno, Urano, Netuno',
          'Mercúrio, Vênus, Terra, Marte',
          'Terra, Lua, Sol, Marte',
          'Todos os planetas são rochosos'
        ],
        correct: 1
      }
    ]
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    toast({
      title: isPlaying ? 'Vídeo pausado' : 'Reproduzindo vídeo',
      description: isPlaying ? 'Você pode retomar quando quiser!' : 'Boa aula!',
    });
  };

  const handleCompleteLesson = () => {
    setIsCompleted(true);
    toast({
      title: 'Uau! Você terminou mais uma lição! 🎉',
      description: 'Continue assim e você será um expert em ciências!',
    });
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === currentLesson.exercises[index].correct) {
        correct++;
      }
    });
    return correct;
  };

  const handleSubmitExercises = () => {
    const score = calculateScore();
    const total = currentLesson.exercises.length;
    
    toast({
      title: `Você acertou ${score} de ${total}!`,
      description: score >= total * 0.7 ? 'Excelente trabalho! Continue praticando!' : 'Continue praticando! Você está no caminho certo!',
    });
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="bg-gradient-to-br from-kid-green/15 via-kid-blue/10 to-kid-yellow/10 min-h-screen p-6 space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 border-kid-green border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-kid-green font-medium">Carregando aula...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-kid-green/15 via-kid-blue/10 to-kid-yellow/10 min-h-screen p-6 space-y-6">
        {/* Lesson Header */}
        <div className="bg-gradient-to-r from-kid-green via-kid-blue to-kid-yellow/80 text-white rounded-3xl p-8 shadow-xl border-2 border-kid-green/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/calendario')}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar ao Calendário
                </Button>
              </div>
              <Badge className="bg-white/20 text-white mb-3 font-bold rounded-full px-4 py-2">
                🔬 {currentLesson.subject}
              </Badge>
              <h1 className="text-3xl font-bold mb-3 drop-shadow-md">{currentLesson.title}</h1>
              <div className="flex items-center gap-6 text-lg opacity-90 font-medium">
                <span className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  👨‍🏫 {currentLesson.teacher}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  ⏱️ {currentLesson.duration}
                </span>
              </div>
            </div>
            {isCompleted && (
              <div className="text-center bg-white/20 rounded-2xl p-4">
                <CheckCircle className="h-16 w-16 mx-auto mb-2 text-kid-yellow" />
                <p className="font-bold text-lg">✅ Concluída!</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-t-lg flex items-center justify-center relative">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-10 w-10" />
                    </div>
                    <p className="text-lg font-medium mb-2">{currentLesson.teacher}</p>
                    <p className="text-sm opacity-75">Professor Avatar</p>
                  </div>
                  
                  <Button
                    size="lg"
                    className="absolute bottom-4 right-4 bg-primary hover:bg-primary/90"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? (
                      <>
                        <PauseCircle className="h-5 w-5 mr-2" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-5 w-5 mr-2" />
                        Reproduzir
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="p-4 border-t">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: isPlaying ? '60%' : '45%' }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{isPlaying ? '27:30' : '20:15'}</span>
                    <span>45:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lesson Content Tabs */}
            <Card className="mt-6">
              <Tabs defaultValue="roteiro" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="roteiro">Roteiro</TabsTrigger>
                  <TabsTrigger value="materiais">Materiais</TabsTrigger>
                  <TabsTrigger value="exercicios">Exercícios</TabsTrigger>
                </TabsList>
                
                <TabsContent value="roteiro" className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Roteiro da Aula
                    </h3>
                    <div className="prose prose-sm max-w-none">
                      {currentLesson.transcript.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="mb-3 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="materiais" className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Materiais de Apoio
                    </h3>
                    <div className="space-y-3">
                      {currentLesson.materials.map((material, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                              {material.type === 'pdf' ? (
                                <FileText className="h-5 w-5" />
                              ) : (
                                <BookOpen className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{material.name}</p>
                              {material.size && (
                                <p className="text-sm text-muted-foreground">{material.size}</p>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Baixar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="exercicios" className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Exercícios de Fixação
                    </h3>
                    <div className="space-y-6">
                      {currentLesson.exercises.map((exercise, questionIndex) => (
                        <div key={questionIndex} className="p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium mb-3">
                            {questionIndex + 1}. {exercise.question}
                          </h4>
                          <div className="space-y-2">
                            {exercise.options.map((option, optionIndex) => (
                              <label
                                key={optionIndex}
                                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                                  selectedAnswers[questionIndex] === optionIndex
                                    ? 'bg-primary/10 border border-primary'
                                    : 'bg-background border border-border hover:border-primary/50'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${questionIndex}`}
                                  checked={selectedAnswers[questionIndex] === optionIndex}
                                  onChange={() => handleAnswerSelect(questionIndex, optionIndex)}
                                  className="sr-only"
                                />
                                <span>{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      <div className="flex gap-3">
                        <Button 
                          onClick={handleSubmitExercises}
                          className="btn-lykeon bg-secondary hover:bg-secondary/90"
                          disabled={selectedAnswers.length !== currentLesson.exercises.length}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Enviar Respostas
                        </Button>
                        <Button variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Enviar Arquivo
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Complete Lesson Button */}
            <Card>
              <CardContent className="p-6">
                <Button 
                  onClick={handleCompleteLesson}
                  disabled={isCompleted}
                  className={`w-full btn-lykeon ${
                    isCompleted 
                      ? 'bg-green-600 hover:bg-green-600' 
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {isCompleted ? 'Lição Concluída!' : 'Marcar como concluída'}
                </Button>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Progresso da Aula</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Vídeo assistido</span>
                      <span>60%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Exercícios</span>
                      <span>{selectedAnswers.length}/{currentLesson.exercises.length}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-secondary h-2 rounded-full" 
                        style={{ width: `${(selectedAnswers.length / currentLesson.exercises.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Lesson */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Próxima Lição</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">As Luas dos Planetas</p>
                    <p className="text-sm text-muted-foreground">Ciências • Prof. Maria</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Ver detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}