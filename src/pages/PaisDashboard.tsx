import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useStudent } from "../contexts/StudentContext";
import { AddChildModal } from "@/components/children/AddChildModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, MoreVertical, Brain } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ManageChildModal } from "@/components/children/ManageChildModal";
import { AppLayout } from "@/components/Layout/AppLayout";

function KPIBox({ label, value, subtitle }: { label: string; value: string; subtitle?: string }) {
  return (
    <Card className="border border-muted">
      <CardContent className="p-3">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-extrabold text-foreground">{value}</div>
        {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      </CardContent>
    </Card>
  );
}

export default function PaisDashboard() {
  const { t } = useTranslation();
  const { children, loading, refreshChildren, handleChildRemoved } = useStudent();
  const [showAddModal, setShowAddModal] = useState(false);
  const [manageChild, setManageChild] = useState<any>(null);

  const handleChildAdded = async (childId: string) => {
    await refreshChildren();
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="bg-gradient-to-br from-kid-green/15 via-kid-blue/10 to-kid-yellow/10 min-h-screen p-6 space-y-6">
          <Card className="border-2 border-primary/20 bg-gradient-card backdrop-blur-sm">
            <CardContent className="p-6">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-5 w-96" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <Card key={i} className="border-2 border-primary/20 bg-gradient-card backdrop-blur-sm">
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

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-kid-green/15 via-kid-blue/10 to-kid-yellow/10 min-h-screen p-6 space-y-6">
        {/* Header */}
        <Card className="border-2 border-kid-green/20 bg-gradient-card backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-kid-green to-kid-blue flex items-center justify-center text-2xl shadow-lg">
                  👨‍👩‍👧‍👦
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-kid-green to-kid-blue bg-clip-text text-transparent">
                    {t('parentsDashboard.title')}
                  </h1>
                  <p className="text-lg text-kid-green mt-1">{t('parentsDashboard.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link 
                  to="/configuracoes" 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  {t('parentsDashboard.settings')}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cards por criança */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {children.length === 0 ? (
            <Card className="col-span-full border-2 border-muted-foreground/20 bg-muted/20">
              <CardContent className="p-6 text-center">
                <div className="text-lg font-semibold text-muted-foreground mb-2">
                  {t('parentsDashboard.noChildren')}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('parentsDashboard.noChildrenDescription')}
                </p>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg inline-block"
                >
                  {t('parentsDashboard.addChild')}
                </button>
              </CardContent>
            </Card>
          ) : (
            children.map((child) => (
              <Card key={child.id} className="border-2 border-primary/20 bg-gradient-card backdrop-blur-sm hover:scale-[1.02] transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl shadow-lg">
                        👦
                      </div>
                      <div>
                        <CardTitle className="text-xl font-extrabold text-foreground">
                          {child.first_name} {child.last_name || ""}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground font-medium">{child.grade || "—"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/aluno/${child.id}`} 
                        className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-200"
                      >
                        {t('parentsDashboard.viewProfile')}
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setManageChild(child)}
                        className="h-8 w-8 p-0 hover:bg-slate-100"
                        aria-label={t('parentsDashboard.manageChild', { name: child.first_name })}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Placeholder para KPIs futuros */}
                  <div className="grid grid-cols-3 gap-2">
                    <KPIBox label={t('parentsDashboard.kpis.attendance')} value="—%" />
                    <KPIBox label={t('parentsDashboard.kpis.quizzes')} value="—%" />
                    <KPIBox label={t('parentsDashboard.kpis.hoursPerWeek')} value="—h" />
                  </div>

                  {/* Placeholder para alertas */}
                  <div>
                    <h3 className="text-sm font-bold mb-2 text-foreground">{t('parentsDashboard.alerts.title')}</h3>
                    <div className="text-xs text-muted-foreground bg-muted/20 rounded-lg p-2">
                      {t('parentsDashboard.alerts.noAlerts')}
                    </div>
                  </div>

                  {/* Placeholder para progresso */}
                  <div>
                    <h3 className="text-sm font-bold mb-2 text-foreground">{t('parentsDashboard.progress.title')}</h3>
                    <div className="text-xs text-muted-foreground bg-muted/20 rounded-lg p-2">
                      {t('parentsDashboard.progress.comingSoon')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </section>

        {/* Seção de Atividades */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{t('parentsDashboard.activities.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to="/quizzes">
              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-blue-500 flex items-center justify-center">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-800 mb-2">{t('parentsDashboard.activities.quizzes.title')}</h3>
                  <p className="text-sm text-blue-600">
                    {t('parentsDashboard.activities.quizzes.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/calendario">
              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-green-500 flex items-center justify-center">
                    📅
                  </div>
                  <h3 className="text-lg font-bold text-green-800 mb-2">{t('parentsDashboard.activities.calendar.title')}</h3>
                  <p className="text-sm text-green-600">
                    {t('parentsDashboard.activities.calendar.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/relatorios">
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:scale-[1.02] transition-all duration-300 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-purple-500 flex items-center justify-center">
                    📊
                  </div>
                  <h3 className="text-lg font-bold text-purple-800 mb-2">{t('parentsDashboard.activities.reports.title')}</h3>
                  <p className="text-sm text-purple-600">
                    {t('parentsDashboard.activities.reports.description')}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>

        {/* TODO: Integrações futuras */}
        <Card className="border-2 border-muted-foreground/20 bg-muted/20">
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-mono">
              {t('parentsDashboard.todo')}
            </div>
          </CardContent>
        </Card>

        {/* Add Child Modal */}
        <AddChildModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleChildAdded}
        />

        {/* Manage Child Modal */}
        {manageChild && (
          <ManageChildModal
            open={!!manageChild}
            onClose={() => setManageChild(null)}
            child={manageChild}
            onChanged={async () => {
              await handleChildRemoved(manageChild.id);
              setManageChild(null);
            }}
          />
        )}
      </div>
    </AppLayout>
  );
}