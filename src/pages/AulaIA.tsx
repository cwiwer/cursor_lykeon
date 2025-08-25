import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TeacherAvatar } from '@/components/aula/TeacherAvatar';
import { SpeechBubble } from '@/components/aula/SpeechBubble';
import { SessionControls } from '@/components/aula/SessionControls';
import VerticalDayTimeline, { TimelineBlock } from '@/components/aula/VerticalDayTimeline';
import { useStudent } from '@/contexts/StudentContext';
import { 
  startLesson, 
  getSession, 
  nextTurn, 
  pauseTTS, 
  resumeTTS, 
  toggleMute, 
  endLesson,
  type Session 
} from '@/services/lessonRuntime';
import { 
  LogOut, 
  Send, 
  MessageSquare,
  Clock
} from 'lucide-react';
import { getDaySchedule } from '@/services/scheduleGenerator';
import { LessonSlot } from '@/types/schedule';

export default function AulaIA() {
  const { lessonId } = useParams<{ lessonId?: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { activeChild: activeStudent } = useStudent();
  
  const [session, setSession] = useState<Session | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  
  const questionInputRef = useRef<HTMLInputElement>(null);

  // Inicializar aula
  useEffect(() => {
    console.log('AulaIA useEffect - activeStudent:', activeStudent);
    console.log('AulaIA useEffect - lessonId:', lessonId);
    
    if (!activeStudent) {
      console.log('AulaIA: Nenhum aluno ativo, redirecionando para seleção');
      navigate('/selecionar-aluno');
      return;
    }

          console.log('AulaIA: Aluno ativo encontrado:', `${activeStudent.first_name} ${activeStudent.last_name || ''}`);
    
    const currentSession = getSession();
    if (!currentSession) {
      // Iniciar nova aula
      const language = 'pt'; // Usar português como padrão por enquanto
      console.log('AulaIA: Iniciando nova aula para idioma:', language);
      
      startLesson({ 
        childId: activeStudent.id, 
        subject: 'Matemática', 
        language: language as 'pt' | 'en' | 'fr'
      });
      setSession(getSession());
    } else {
      console.log('AulaIA: Sessão existente encontrada');
      setSession(currentSession);
    }
  }, [activeStudent, navigate, t]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target === questionInputRef.current) return;
      
      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'h':
          handleHandRaise();
          break;
        case 'm':
          handleToggleMute();
          break;
        case 't':
          setShowTranscript(true);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseTTS();
    } else {
      resumeTTS();
    }
    setIsPlaying(!isPlaying);
  };

  const handleHandRaise = () => {
    if (session) {
      nextTurn("Posso fazer uma pergunta?");
      setSession(getSession());
    }
  };

  const handleToggleMute = () => {
    toggleMute();
    setIsMuted(!isMuted);
  };

  const handleSubmitQuestion = async () => {
    if (!userQuestion.trim() || !session) return;
    
    setIsLoading(true);
    await nextTurn(userQuestion);
    setUserQuestion('');
    setSession(getSession());
    setIsLoading(false);
    
    // Focar no input novamente
    questionInputRef.current?.focus();
  };

  const handleLeaveLesson = () => {
    endLesson();
    navigate('/calendario');
  };

  const currentTeacherText = session?.transcript
    .filter(turn => turn.role === 'teacher')
    .pop()?.text || '';

  if (!activeStudent) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-kid-green border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-kid-green font-medium">Carregando aluno...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-kid-green/15 via-kid-blue/10 to-kid-yellow/10 min-h-screen">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b-2 border-kid-green/20 p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Logo size="md" variant="dark" />
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                  {activeStudent.first_name} {activeStudent.last_name || ''}
                </Badge>
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                  {activeStudent.grade || '1º ano'}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLeaveLesson}
              className="border-kid-red/30 text-kid-red hover:bg-kid-red/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('aula.leave', 'Sair da aula')}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
            
            {/* Left Side - Timeline Vertical */}
            <div className="col-span-2 flex justify-center">
                      <VerticalDayTimeline
          items={(() => {
            if (!activeStudent) return [];
            
            // Obter a grade do dia atual
            const today = new Date();
            const dateISO = today.toISOString().split('T')[0];
            const daySchedule = getDaySchedule({
              childId: activeStudent.id,
              dateISO,
              locale: i18n.language || 'pt'
            });
            
            // Converter slots para formato da timeline
            return daySchedule.slots.map(slot => ({
              type: slot.type as "class" | "break",
              label: slot.type === "class" ? slot.title || "Aula" : t("lesson.break", "Intervalo"),
              minutes: slot.durationMin,
              color: slot.type === "class" ? "bg-indigo-500 dark:bg-indigo-400" : "bg-slate-400/60 dark:bg-slate-500"
            }));
          })()}
          dayStart={{ hour: 8, minute: 0 }}
          rocketSrc="/branding/rocket.svg"
          showRocketMarker={true}
          className="hidden md:flex w-16 h-full py-6"
        />
            </div>

            {/* Center - Quadro Negro */}
            <div className="col-span-6">
              <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-inner h-full flex flex-col">
                {/* Título da aula */}
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-kid-yellow mb-2">
                    Math 101: Introduction to Algebra
                  </h1>
                  <p className="text-slate-300 text-sm">
                                         {t('aula.title', 'Aula')} • {activeStudent.first_name} {activeStudent.last_name || ''}
                  </p>
                </div>

                {/* Área de fórmulas */}
                <div className="flex-1 flex flex-col justify-center space-y-6">
                  <div className="text-center">
                    <div className="text-4xl font-mono text-kid-green mb-4">
                      m = (Y - Y₁) / (X - X₁)
                    </div>
                    <p className="text-slate-300 text-lg">
                      Fórmula da inclinação
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-mono text-kid-blue mb-4">
                      5x + 2y = 7
                    </div>
                    <p className="text-slate-300 text-lg">
                      Equação linear
                    </p>
                  </div>
                </div>

                {/* Input de pergunta */}
                <div className="mt-6">
                  <div className="flex gap-2">
                    <Input
                      ref={questionInputRef}
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      placeholder={t('aula.input.placeholder', 'Digite sua pergunta...')}
                      className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmitQuestion()}
                    />
                    <Button
                      onClick={handleSubmitQuestion}
                      disabled={!userQuestion.trim() || isLoading}
                      className="bg-kid-green hover:bg-kid-green/90"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Avatar + Balão */}
            <div className="col-span-4 flex flex-col items-center justify-center space-y-8">
              <TeacherAvatar className="mb-4" />
              <SpeechBubble 
                text={currentTeacherText} 
                loading={isLoading}
                className="max-w-sm"
              />
            </div>
          </div>

          {/* Session Controls */}
          <div className="mt-8">
            <SessionControls
              isPlaying={isPlaying}
              isMuted={isMuted}
              onPlayPause={handlePlayPause}
              onHandRaise={handleHandRaise}
              onToggleMute={handleToggleMute}
              onTranscript={() => setShowTranscript(true)}
              loading={isLoading}
            />
          </div>
        </div>

        {/* Transcript Sheet */}
        <Sheet open={showTranscript} onOpenChange={setShowTranscript}>
          <SheetContent className="w-96 sm:w-[540px]">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t('aula.controls.transcript', 'Transcrição da Aula')}
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4 max-h-[600px] overflow-y-auto">
              {session?.transcript.map((turn, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    turn.role === 'teacher' 
                      ? 'bg-kid-green/10 border-l-4 border-kid-green' 
                      : 'bg-kid-blue/10 border-l-4 border-kid-blue'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      turn.role === 'teacher' ? 'bg-kid-green' : 'bg-kid-blue'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-medium ${
                          turn.role === 'teacher' ? 'text-kid-green' : 'text-kid-blue'
                        }`}>
                                                     {turn.role === 'teacher' ? 'Professor' : `${activeStudent.first_name} ${activeStudent.last_name || ''}`}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(turn.at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-700">{turn.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </AppLayout>
  );
}
