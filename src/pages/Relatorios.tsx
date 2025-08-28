import React from "react";
import { useStudent } from "@/contexts/StudentContext";
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Relatorios() {
  const { activeChild } = useStudent();
  const { t } = useTranslation();
  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-kid-green/15 via-kid-blue/10 to-kid-yellow/10 min-h-screen p-6 space-y-6">
        <Card className="border-2 border-kid-green/20 bg-gradient-card backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-kid-green to-kid-blue flex items-center justify-center text-2xl shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-kid-green to-kid-blue bg-clip-text text-transparent">
                  {t('exercisesPage.reports.title')}
                </h1>
                <p className="text-lg text-kid-green mt-1">
                  Acompanhe o progresso acadêmico do seu filho
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-kid-green/20 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-200">
            <CardHeader className="bg-gradient-to-r from-kid-green/10 to-kid-blue/10 border-b border-kid-green/20">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-kid-green to-kid-blue rounded-full">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <span className="text-kid-green font-bold">{t('exercisesPage.reports.completedLessons')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6">
                <p className="text-6xl font-bold bg-gradient-to-r from-kid-green to-kid-blue bg-clip-text text-transparent mb-3">—%</p>
                <p className="text-kid-green/70 font-medium text-lg">
                  {activeChild 
                    ? `${activeChild.first_name} - ${t('exercisesPage.reports.progressInDevelopment')}` 
                    : t('exercisesPage.reports.progressInDevelopment')
                  }
                </p>
                <div className="mt-4 w-full bg-kid-green/20 rounded-full h-4">
                  <div className="bg-gradient-to-r from-kid-green to-kid-blue h-4 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-kid-blue/20 rounded-2xl overflow-hidden hover:scale-105 transition-all duration-200">
            <CardHeader className="bg-gradient-to-r from-kid-blue/10 to-kid-yellow/10 border-b border-kid-blue/20">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-kid-blue to-kid-yellow rounded-full">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <span className="text-kid-blue font-bold">{t('exercisesPage.reports.averageGrade')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6">
                <p className="text-6xl font-bold bg-gradient-to-r from-kid-blue to-kid-yellow bg-clip-text text-transparent mb-3">85</p>
                <p className="text-kid-blue/70 font-medium text-lg">{t('exercisesPage.reports.scoreRange')}</p>
                <div className="mt-4 flex justify-center">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map((star) => (
                      <div key={star} className={`text-2xl ${star <= 4 ? 'text-kid-yellow' : 'text-kid-yellow/30'}`}>⭐</div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-kid-green via-kid-blue to-kid-yellow text-white shadow-xl border-0 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <CardContent className="p-8 text-center relative">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Award className="h-12 w-12 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3 drop-shadow-md">
              {activeChild 
                ? t('exercisesPage.reports.congratulations', { name: activeChild.first_name })
                : t('exercisesPage.reports.keepStudying')
              }
            </h3>
            <p className="opacity-90 text-xl font-medium">
              {activeChild 
                ? t('exercisesPage.reports.doingGreat')
                : t('exercisesPage.reports.reportsWillAppear')
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}