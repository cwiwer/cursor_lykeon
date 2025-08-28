import React from "react";
import { useParams, Link } from "react-router-dom";
import { useStudent } from "@/contexts/StudentContext";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/Layout/AppLayout";

function ProgressBar({ value }: { value: number }) {
  return <Progress value={value} className="h-3" />;
}

export default function AlunoPerfil() {
  const { studentId } = useParams();
  const { children, loading } = useStudent();
  const { t } = useTranslation();
  
  const child = children.find(c => c.id === studentId);

  if (loading) {
    return (
      <AppLayout>
        <div className="bg-gradient-to-br from-kid-green/15 via-kid-blue/10 to-kid-yellow/10 min-h-screen p-6 space-y-6">
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
      </AppLayout>
    );
  }

  if (!child) {
    return (
      <AppLayout>
        <div className="bg-gradient-to-br from-kid-green/15 via-kid-blue/10 to-kid-yellow/10 min-h-screen p-6 space-y-6">
          <Card className="border-2 border-destructive bg-destructive/5">
            <CardContent className="p-6">
              <div className="text-destructive font-bold">{t('studentProfile.studentNotFound')}</div>
              <p className="text-muted-foreground mt-2">
                {t('studentProfile.studentNotFoundDescription')}
              </p>
              <Link 
                to="/pais/dashboard" 
                className="inline-block mt-4 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-full font-semibold transition-all duration-300"
              >
                {t('studentProfile.backToDashboard')}
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-kid-green/15 via-kid-blue/10 to-kid-yellow/10 min-h-screen p-6 space-y-6">
        {/* Header */}
        <Card className="border-2 border-kid-green/20 bg-gradient-card backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-kid-green to-kid-blue flex items-center justify-center text-2xl shadow-lg">
                  👦
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-kid-green to-kid-blue bg-clip-text text-transparent">
                    {child.first_name} {child.last_name || ''}
                  </h1>
                  <p className="text-lg text-kid-green font-medium">{child.grade || t('studentProfile.student')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm px-4 py-2">
                  {t('studentProfile.points')}
                </Badge>
                <Link 
                  to="/calendario" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  {t('studentProfile.calendar')}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs - Placeholder */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2 border-pastel-blue/20 bg-gradient-card backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{t('studentProfile.kpis.attendance')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-pastel-blue mb-2">—%</div>
              <div className="text-xs text-muted-foreground">{t('studentProfile.comingSoon')}</div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-pastel-purple/20 bg-gradient-card backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <CardHeader className="pb-2">
                              <CardTitle className="text-sm text-muted-foreground">Exercícios Corretos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-pastel-purple mb-2">—%</div>
              <div className="text-xs text-muted-foreground">{t('studentProfile.comingSoon')}</div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-primary/20 bg-gradient-card backdrop-blur-sm hover:scale-105 transition-transform duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{t('studentProfile.kpis.hoursPerWeek')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-primary mb-2">—h</div>
              <div className="text-xs text-muted-foreground">{t('studentProfile.comingSoon')}</div>
            </CardContent>
          </Card>
        </section>

        {/* Progresso por matéria - Placeholder */}
        <section>
          <h2 className="mb-4 text-2xl font-extrabold text-foreground">{t('studentProfile.progressBySubject')}</h2>
          <Card className="border-2 border-muted bg-gradient-card backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="text-muted-foreground mb-2">📝 Em desenvolvimento</div>
              <p className="text-sm text-muted-foreground">
                {t('studentProfile.progressDescription')}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Medalhas e Relatórios - Placeholder */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-2 border-pastel-yellow/20 bg-gradient-card backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-extrabold text-foreground">{t('studentProfile.achievements.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {t('studentProfile.achievements.description')}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-pastel-orange/20 bg-gradient-card backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl font-extrabold text-foreground">{t('studentProfile.reports.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {t('studentProfile.reports.description')}
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
            {t('studentProfile.backToParentsDashboard')}
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}