import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '@/contexts/StudentContext';
import { AddChildModal } from '@/components/children/AddChildModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, User, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ManageChildModal } from '@/components/children/ManageChildModal';
import { AppLayout } from '@/components/Layout/AppLayout';
import type { ChildProfile } from '@/services/students';

export default function SelecionarAluno() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { children, activeChild, setActiveChild, loading, refreshChildren, handleChildRemoved } = useStudent();
  const [showAddModal, setShowAddModal] = useState(false);
  const [manageChild, setManageChild] = useState<ChildProfile | null>(null);

  const handleSelectChild = (child: any) => {
    console.log('SelecionarAluno: Selecionando aluno:', child);
    setActiveChild(child);
    console.log('SelecionarAluno: Aluno ativo definido, redirecionando para calendário');
    navigate('/calendario');
  };

  const handleChildAdded = async (childId: string) => {
    await refreshChildren();
    // Find and set the newly created child as active
    const newChild = children.find(child => child.id === childId);
    if (newChild) {
      setActiveChild(newChild);
    } else if (children.length > 0) {
      // Fallback to first child if the new one wasn't found
      setActiveChild(children[0]);
    }
    setShowAddModal(false);
    navigate('/calendario');
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="bg-gradient-to-br from-kid-green/15 via-kid-blue/10 to-kid-yellow/10 min-h-screen p-6 space-y-6">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-16 w-16 rounded-full mb-4" />
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-kid-green/15 via-kid-blue/10 to-kid-yellow/10 min-h-screen p-6 space-y-6">
        <div className="max-w-4xl mx-auto">
        <Card className="border-2 border-kid-green/20 bg-gradient-card backdrop-blur-sm mb-8">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-kid-green to-kid-blue flex items-center justify-center text-2xl shadow-lg">
                  👶
                </div>
              </div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-kid-green to-kid-blue bg-clip-text text-transparent mb-2">
                {t("selectStudent")}
              </h1>
              <p className="text-lg text-kid-green">
                {t("selectStudentDescription")}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <Card 
              key={child.id} 
              className={`relative transition-all hover:scale-[1.02] hover:shadow-lg ${
                activeChild?.id === child.id 
                  ? 'border-2 border-primary bg-primary/5' 
                  : 'border-2 border-muted hover:border-primary/50'
              }`}
            >
              <CardContent className="p-6 text-center">
                <Avatar className="h-16 w-16 mx-auto mb-4 border-2 border-muted">
                  <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 text-lg font-bold">
                    {child.first_name?.[0]}{child.last_name?.[0] || ''}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {child.first_name} {child.last_name || ''}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {child.grade || t('student')}
                </p>
                {activeChild?.id === child.id && (
                  <div className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-1 rounded-full font-semibold">
                    ✓ {t("active")}
                  </div>
                )}
                
                {/* Botão de seleção principal */}
                <Button
                  onClick={() => handleSelectChild(child)}
                  className="w-full mt-3 bg-primary hover:bg-primary/90"
                >
                  {t("select")}
                </Button>
              </CardContent>
              
              {/* Menu de gerenciamento */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setManageChild(child);
                }}
                className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-slate-100"
                aria-label={`Gerenciar ${child.first_name}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </Card>
          ))}

          {/* Card para adicionar nova criança */}
          <Card 
            className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg border-2 border-dashed border-muted hover:border-primary/50"
            onClick={() => setShowAddModal(true)}
          >
            <CardContent className="p-6 text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1">
                {t("children.add")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("children.add")}
              </p>
            </CardContent>
          </Card>
        </div>

        {children.length === 0 && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-4">
              {t("children.noChildren")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("children.add")} para começar.
            </p>
          </div>
        )}
          </div>
        </div>

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
    </AppLayout>
  );
}