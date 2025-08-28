import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageCircle, Send, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Mensagens() {
  const { t } = useTranslation();
  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-kid-green/15 via-kid-blue/10 to-kid-yellow/10 min-h-screen p-6 space-y-6">
        <Card className="border-2 border-kid-green/20 bg-gradient-card backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-kid-green to-kid-blue flex items-center justify-center text-2xl shadow-lg">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-kid-green to-kid-blue bg-clip-text text-transparent">
                  {t('exercisesPage.messages.title')}
                </h1>
                <p className="text-lg text-kid-green mt-1">
                  Centro de mensagens e comunicação
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-2 border-kid-green/20 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-kid-green/10 to-kid-blue/10 border-b border-kid-green/20">
            <CardTitle className="flex items-center gap-3 text-kid-green font-bold">
              {t('exercisesPage.messages.inbox')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-kid-yellow/20 to-kid-orange/20 rounded-xl border border-kid-yellow/40">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-kid-yellow/50 rounded-full">
                    <Star className="h-4 w-4 text-kid-orange" />
                  </div>
                  <div>
                    <p className="font-bold text-kid-green">{t('exercisesPage.messages.welcome')}</p>
                    <p className="text-sm text-kid-green/70 font-medium">{t('exercisesPage.messages.system')} • {t('exercisesPage.messages.today')}</p>
                  </div>
                </div>
                <p className="text-kid-green/80 font-medium">{t('exercisesPage.messages.welcomeMessage')}</p>
              </div>
              
              <div className="flex gap-3">
                <Input 
                  placeholder={t('exercisesPage.messages.writeMessage')}
                  className="flex-1 border-2 border-kid-green/30 rounded-full px-4 py-3 focus:border-kid-green focus:ring-2 focus:ring-kid-green/20 transition-colors"
                />
                <Button className="bg-gradient-to-r from-kid-green to-kid-blue hover:from-kid-blue hover:to-kid-green text-white rounded-full px-6 py-3 font-bold shadow-md hover:scale-105 transition-all duration-200">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}