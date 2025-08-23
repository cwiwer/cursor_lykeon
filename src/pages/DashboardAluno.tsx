import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useStudent } from '@/contexts/StudentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BookOpen, 
  Calendar, 
  Trophy, 
  Clock, 
  Star, 
  Users, 
  User,
  ChevronRight,
  Target,
  BarChart3,
  Play
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  name: string;
  age: number;
  grade: string;
  language: string;
}

export default function DashboardAluno() {
  const { children, activeChild, loading } = useStudent();
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    setLoadingData(false);
  }, [children]);

  if (loading || loadingData) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Redirect to onboarding if no students
  if (children.length === 0) {
    return (
      <AppLayout>
        <div className="p-6 text-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-4">Bem-vindo à Lykeon!</h1>
            <p className="text-muted-foreground mb-6">
              Cadastre uma criança para começar o aprendizado.
            </p>
            <Link to="/selecionar-aluno">
              <Button className="bg-primary text-primary-foreground">
                Cadastrar Criança
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-kid-green/15 via-kid-blue/10 to-kid-yellow/10 min-h-screen p-6 space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-kid-green via-kid-blue to-kid-yellow/80 text-white rounded-3xl p-8 shadow-xl border-2 border-kid-green/20">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Star className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold drop-shadow-md">
                Olá{activeChild ? `, ${activeChild.first_name}` : ''}!
              </h1>
              <p className="text-xl opacity-90 font-medium">
                {activeChild 
                  ? 'Vamos continuar o aprendizado!' 
                  : 'Selecione um aluno para começar'
                }
              </p>
            </div>
          </div>
          <Link to="/calendario">
            <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-full px-6 py-3 font-bold shadow-md hover:scale-105 transition-all duration-200">
              <Calendar className="h-5 w-5 mr-2" />
              Ver Calendário
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Continue de onde parei */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-kid-green/20 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-200">
            <CardHeader className="bg-gradient-to-r from-kid-green/10 to-kid-blue/10 border-b border-kid-green/20">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-kid-green to-kid-blue rounded-full">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-kid-green font-bold">Continuar Aprendendo!</span>
              </CardTitle>
              <CardDescription className="text-kid-green/70 font-medium">
                {activeChild 
                  ? `Continue os estudos, ${activeChild.first_name}!`
                  : 'Selecione um aluno para continuar'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {activeChild ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-kid-green/20 to-kid-blue/20 rounded-xl border border-kid-green/30">
                    <p className="font-bold text-kid-green">Progresso Geral</p>
                    <p className="text-sm text-kid-green/70 font-medium">Em desenvolvimento</p>
                    <div className="w-full bg-white/70 rounded-full h-3 mt-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-kid-green to-kid-blue h-3 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <Link to="/calendario">
                    <Button className="w-full bg-gradient-to-r from-kid-green to-kid-blue hover:from-kid-blue hover:to-kid-green text-white font-bold py-3 rounded-full shadow-md hover:scale-105 transition-all duration-200">
                      Ver Calendário
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">Nenhum aluno selecionado</p>
                  <Link to="/selecionar-aluno">
                    <Button>Selecionar Aluno</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Próxima aula */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-kid-blue/20 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-200">
            <CardHeader className="bg-gradient-to-r from-kid-blue/10 to-kid-yellow/10 border-b border-kid-blue/20">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-kid-blue to-kid-yellow rounded-full">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <span className="text-kid-blue font-bold">Próxima Aula</span>
              </CardTitle>
              <CardDescription className="text-kid-blue/70 font-medium">
                Sua agenda de estudos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-6">
                <div className="text-muted-foreground mb-2">Em desenvolvimento</div>
                <p className="text-sm text-muted-foreground">
                  As aulas programadas aparecerão aqui
                </p>
                <Link to="/calendario">
                  <Button variant="outline" className="mt-4">
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver Calendário
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Minhas conquistas */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-kid-yellow/20 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-200">
            <CardHeader className="bg-gradient-to-r from-kid-yellow/10 to-kid-orange/10 border-b border-kid-yellow/20">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-kid-yellow to-kid-orange rounded-full">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <span className="text-kid-orange font-bold">Conquistas</span>
              </CardTitle>
              <CardDescription className="text-kid-orange/70 font-medium">
                Celebre seus sucessos!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-6">
                <div className="text-muted-foreground mb-2">Em desenvolvimento</div>
                <p className="text-sm text-muted-foreground">
                  Suas conquistas aparecerão aqui
                </p>
                <Link to="/conquistas">
                  <Button variant="outline" className="mt-4">
                    <Trophy className="h-4 w-4 mr-2" />
                    Ver Conquistas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats - Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">—</p>
                <p className="text-sm text-muted-foreground">Lições concluídas</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">—</p>
                <p className="text-sm text-muted-foreground">Tempo estudado</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">—</p>
                <p className="text-sm text-muted-foreground">Média de acertos</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">—</p>
                <p className="text-sm text-muted-foreground">Medalhas ganhas</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Links para páginas */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Explore o Lykeon
            </CardTitle>
            <CardDescription>
              Acesse as funcionalidades da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Link to="/pais/dashboard" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-full font-semibold transition-all duration-200 inline-flex items-center gap-2">
                <Users className="h-4 w-4" />
                Dashboard dos Pais
              </Link>
              <Link to="/selecionar-aluno" className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-full font-semibold transition-all duration-200 inline-flex items-center gap-2">
                <User className="h-4 w-4" />
                Selecionar Aluno
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}