import React from "react";
import { useParams, Link } from "react-router-dom";
import { useStudent } from "@/contexts/StudentContext";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function ProgressBar({ value }: { value: number }) {
  return <Progress value={value} className="h-3" />;
}

export default function AlunoPerfil() {
  const { studentId } = useParams();
  const { children, loading } = useStudent();
  
  const child = children.find(c => c.id === studentId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-playful">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          <Card className="border-2 border-primary/20 bg-gradient-card backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-gradient-playful p-4">
        <div className="max-w-6xl mx-auto">
          <Card className="border-2 border-destructive bg-destructive/5">
            <CardContent className="p-6">
              <div className="text-destructive font-bold">🚫 Aluno não encontrado</div>
              <p className="text-muted-foreground mt-2">
                O aluno solicitado não foi encontrado ou você não tem permissão para visualizá-lo.
              </p>
              <Link 
                to="/pais/dashboard" 
                className="inline-block mt-4 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-full font-semibold transition-all duration-300"
              >
                ← Voltar ao Dashboard
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-playful">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <Card className="border-2 border-primary/20 bg-gradient-card backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl shadow-lg">
                  👦
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-foreground">
                    {child.first_name} {child.last_name || ''}
                  </h1>
                  <p className="text-lg text-muted-foreground font-medium">{child.grade || 'Estudante'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  ⭐ — pontos
                </Badge>
                <Link 
                  to="/calendario" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  📅 Calendário
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs - Placeholder */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-pastel-blue/20 bg-gradient-card backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">📊 Presença</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-pastel-blue mb-2">—%</div>
              <div className="text-xs text-muted-foreground">Em breve</div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-pastel-purple/20 bg-gradient-card backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Quizzes corretos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-pastel-purple mb-2">—%</div>
              <div className="text-xs text-muted-foreground">Em breve</div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-primary/20 bg-gradient-card backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">⏰ Horas/semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-primary mb-2">—h</div>
              <div className="text-xs text-muted-foreground">Em breve</div>
            </CardContent>
          </Card>
        </section>

        {/* Progresso por matéria - Placeholder */}
        <section>
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">Progresso por matéria</h2>
          <Card className="border-2 border-muted bg-gradient-card backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-muted-foreground mb-2">📝 Em desenvolvimento</div>
              <p className="text-sm text-muted-foreground">
                O progresso por matéria será exibido aqui quando as aulas forem integradas ao sistema.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Medalhas e Relatórios - Placeholder */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-2 border-pastel-yellow/20 bg-gradient-card backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-extrabold text-foreground">🏆 Conquistas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                As conquistas e medalhas serão exibidas aqui conforme o progresso do aluno.
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-pastel-orange/20 bg-gradient-card backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-extrabold text-foreground">📄 Relatórios (PDF)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Os relatórios mensais serão gerados e disponibilizados aqui.
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Voltar */}
        <div className="text-center">
          <Link 
            to="/pais/dashboard" 
            className="inline-block bg-secondary text-secondary-foreground hover:bg-secondary/80 px-6 py-3 rounded-full font-semibold transition-all duration-300"
          >
            ← Voltar ao Dashboard dos Pais
          </Link>
        </div>
      </div>
    </div>
  );
}