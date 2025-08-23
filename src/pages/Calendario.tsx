import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useStudent } from '@/contexts/StudentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, BookOpen, Users, Play, Star, Trophy, Zap, ChevronRight, Medal, Brain, History, Globe, Palette, Dumbbell, ChevronLeft } from 'lucide-react';
import { useNow } from '@/hooks/useNow';
import { useServerTimeOffset } from '@/hooks/useServerTimeOffset';
import { 
  startOfWeek, 
  addDays, 
  formatDate, 
  isSameDay, 
  prefersHour12, 
  getWeekDays, 
  getTimePosition 
} from '@/utils/date';
import { DayTimeline } from '@/components/calendar/DayTimeline';

interface ClassEvent {
  id: string;
  subject: string;
  title: string;
  time: string;
  endTime: string;
  duration: number;
  teacher: string;
  status: 'completed' | 'no_show' | 'prepare' | 'time_to_start' | 'upcoming';
  icon: string;
  canStart: boolean;
  lessonId: string;
  isInterval?: boolean;
  startTime?: string;
}

interface StudentInfo {
  name: string;
  avatar: string;
  points: number;
  medals: number;
}

const studentInfo: StudentInfo = {
  name: 'Maria Silva',
  avatar: 'MS',
  points: 1250,
  medals: 8
};

// Helper to get subject icon
const getSubjectIcon = (subject: string) => {
  const icons: Record<string, any> = {
    'Matemática': Brain,
    'Português': BookOpen,
    'Ciências': Zap,
    'História': History,
    'Geografia': Globe,
    'Inglês': Users,
    'Arte': Palette,
    'Educação Física': Dumbbell
  };
  return icons[subject] || BookOpen;
};

// Função removida - agora usamos useNow hook

// Today's schedule with 4 subjects and intervals
const todaySchedule = [
  {
    id: '1',
    subject: 'Matemática',
    title: 'Frações Decimais',
    time: '14:00',
    startTime: '14:00',
    endTime: '14:25',
    duration: 25,
    teacher: 'Prof. Ana',
    status: 'completed' as const,
    icon: '📐',
    canStart: false,
    lessonId: 'math-001'
  },
  {
    id: 'interval-1',
    subject: 'Intervalo',
    title: 'Pausa',
    time: '14:25',
    startTime: '14:25',
    endTime: '14:35',
    duration: 10,
    teacher: '',
    status: 'completed' as const,
    icon: '☕',
    canStart: false,
    lessonId: '',
    isInterval: true
  },
  {
    id: '2',
    subject: 'Português',
    title: 'Verbos Irregulares',
    time: '14:35',
    startTime: '14:35',
    endTime: '14:57',
    duration: 22,
    teacher: 'Prof. Carlos',
    status: 'completed' as const,
    icon: '📖',
    canStart: false,
    lessonId: 'port-001'
  },
  {
    id: 'interval-2',
    subject: 'Intervalo',
    title: 'Recreio',
    time: '14:57',
    startTime: '14:57',
    endTime: '15:27',
    duration: 30,
    teacher: '',
    status: 'completed' as const,
    icon: '🎮',
    canStart: false,
    lessonId: '',
    isInterval: true
  },
  {
    id: '3',
    subject: 'Ciências',
    title: 'Sistema Solar',
    time: '15:27',
    startTime: '15:27',
    endTime: '15:55',
    duration: 28,
    teacher: 'Prof. Maria',
    status: 'time_to_start' as const,
    icon: '🌌',
    canStart: true,
    lessonId: 'sci-001'
  },
  {
    id: 'interval-3',
    subject: 'Intervalo',
    title: 'Pausa',
    time: '15:55',
    startTime: '15:55',
    endTime: '16:05',
    duration: 10,
    teacher: '',
    status: 'upcoming' as const,
    icon: '☕',
    canStart: false,
    lessonId: '',
    isInterval: true
  },
  {
    id: '4',
    subject: 'História',
    title: 'Descobrimento do Brasil',
    time: '16:05',
    startTime: '16:05',
    endTime: '16:28',
    duration: 23,
    teacher: 'Prof. João',
    status: 'upcoming' as const,
    icon: '🏛️',
    canStart: false,
    lessonId: 'hist-001'
  }
];

// Helper to get time difference in minutes
const getTimeDifference = (targetTime: string, now: Date) => {
  const [hours, minutes] = targetTime.split(':').map(Number);
  const target = new Date(now);
  target.setHours(hours, minutes, 0, 0);
  
  const diffMs = target.getTime() - now.getTime();
  return Math.floor(diffMs / (1000 * 60));
};

// Helper to format countdown
const formatCountdown = (minutes: number) => {
  if (minutes <= 0) return 'Agora';
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}min`;
};

const mockClasses: Record<string, ClassEvent[]> = {
  'segunda': [
    {
      id: '1',
      subject: 'Português',
      title: 'Leitura e Interpretação',
      time: '08:00',
      endTime: '08:45',
      duration: 45,
      teacher: 'Prof. Ana Clara',
      status: 'completed',
      icon: '📖',
      canStart: false,
      lessonId: 'port-001'
    },
    {
      id: '2',
      subject: 'Matemática',
      title: 'Adição e Subtração',
      time: '09:00',
      endTime: '09:45',
      duration: 45,
      teacher: 'Prof. Carlos',
      status: 'completed',
      icon: '🔢',
      canStart: false,
      lessonId: 'math-001'
    },
    {
      id: '3',
      subject: 'Ciências',
      title: 'Os Seres Vivos',
      time: '14:00',
      endTime: '14:45',
      duration: 45,
      teacher: 'Prof. Marina',
      status: 'completed',
      icon: '🔬',
      canStart: false,
      lessonId: 'sci-001'
    },
    {
      id: '4',
      subject: 'Arte',
      title: 'Cores Primárias',
      time: '15:00',
      endTime: '15:45',
      duration: 45,
      teacher: 'Prof. Sofia',
      status: 'completed',
      icon: '🎨',
      canStart: false,
      lessonId: 'art-001'
    }
  ],
  'terça': [
    {
      id: '5',
      subject: 'História',
      title: 'Família e Comunidade',
      time: '08:00',
      endTime: '08:45',
      duration: 45,
      teacher: 'Prof. Roberto',
      status: 'completed',
      icon: '📜',
      canStart: false,
      lessonId: 'hist-001'
    },
    {
      id: '6',
      subject: 'Geografia',
      title: 'Minha Casa, Minha Rua',
      time: '09:00',
      endTime: '09:45',
      duration: 45,
      teacher: 'Prof. Laura',
      status: 'completed',
      icon: '🗺️',
      canStart: false,
      lessonId: 'geo-001'
    },
    {
      id: '7',
      subject: 'Português',
      title: 'Alfabeto e Sílabas',
      time: '14:00',
      endTime: '14:45',
      duration: 45,
      teacher: 'Prof. Ana Clara',
      status: 'completed',
      icon: '📝',
      canStart: false,
      lessonId: 'port-002'
    },
    {
      id: '8',
      subject: 'Inglês',
      title: 'Colors and Numbers',
      time: '15:00',
      endTime: '15:45',
      duration: 45,
      teacher: 'Prof. Michael',
      status: 'completed',
      icon: '🇺🇸',
      canStart: false,
      lessonId: 'eng-001'
    }
  ],
  'quarta': [
    {
      id: '9',
      subject: 'Matemática',
      title: 'Multiplicação Simples',
      time: '08:00',
      endTime: '08:45',
      duration: 45,
      teacher: 'Prof. Carlos',
      status: 'completed',
      icon: '✖️',
      canStart: false,
      lessonId: 'math-002'
    },
    {
      id: '10',
      subject: 'Educação Física',
      title: 'Jogos e Brincadeiras',
      time: '09:00',
      endTime: '09:45',
      duration: 45,
      teacher: 'Prof. João',
      status: 'completed',
      icon: '⚽',
      canStart: false,
      lessonId: 'pe-001'
    },
    {
      id: '11',
      subject: 'Ciências',
      title: 'Plantas e Animais',
      time: '14:00',
      endTime: '14:45',
      duration: 45,
      teacher: 'Prof. Marina',
      status: 'completed',
      icon: '🌱',
      canStart: false,
      lessonId: 'sci-002'
    },
    {
      id: '12',
      subject: 'História',
      title: 'Ontem e Hoje',
      time: '15:00',
      endTime: '15:45',
      duration: 45,
      teacher: 'Prof. Roberto',
      status: 'completed',
      icon: '🕰️',
      canStart: false,
      lessonId: 'hist-002'
    }
  ],
  'quinta': [
    {
      id: '13',
      subject: 'Português',
      title: 'Produção de Texto',
      time: '08:00',
      endTime: '08:45',
      duration: 45,
      teacher: 'Prof. Ana Clara',
      status: 'completed',
      icon: '✍️',
      canStart: false,
      lessonId: 'port-003'
    },
    {
      id: '14',
      subject: 'Geografia',
      title: 'Paisagens Naturais',
      time: '09:00',
      endTime: '09:45',
      duration: 45,
      teacher: 'Prof. Laura',
      status: 'completed',
      icon: '🏔️',
      canStart: false,
      lessonId: 'geo-002'
    },
    {
      id: '15',
      subject: 'Matemática',
      title: 'Formas Geométricas',
      time: '14:00',
      endTime: '14:45',
      duration: 45,
      teacher: 'Prof. Carlos',
      status: 'completed',
      icon: '🔺',
      canStart: false,
      lessonId: 'math-003'
    },
    {
      id: '16',
      subject: 'Arte',
      title: 'Desenho e Pintura',
      time: '15:00',
      endTime: '15:45',
      duration: 45,
      teacher: 'Prof. Sofia',
      status: 'time_to_start',
      icon: '🖌️',
      canStart: true,
      lessonId: 'art-002'
    }
  ],
  'sexta': [
    {
      id: '17',
      subject: 'Ciências',
      title: 'Água e Ar',
      time: '08:00',
      endTime: '08:45',
      duration: 45,
      teacher: 'Prof. Marina',
      status: 'upcoming',
      icon: '💧',
      canStart: false,
      lessonId: 'sci-003'
    },
    {
      id: '18',
      subject: 'Inglês',
      title: 'Family Members',
      time: '09:00',
      endTime: '09:45',
      duration: 45,
      teacher: 'Prof. Michael',
      status: 'upcoming',
      icon: '👨‍👩‍👧‍👦',
      canStart: false,
      lessonId: 'eng-002'
    },
    {
      id: '19',
      subject: 'Educação Física',
      title: 'Movimento e Coordenação',
      time: '14:00',
      endTime: '14:45',
      duration: 45,
      teacher: 'Prof. João',
      status: 'upcoming',
      icon: '🤸',
      canStart: false,
      lessonId: 'pe-002'
    },
    {
      id: '20',
      subject: 'Português',
      title: 'Revisão da Semana',
      time: '15:00',
      endTime: '15:45',
      duration: 45,
      teacher: 'Prof. Ana Clara',
      status: 'upcoming',
      icon: '📚',
      canStart: false,
      lessonId: 'port-004'
    }
  ],
  'sabado': [],
  'domingo': []
};

const weekDays = [
  { key: 'segunda', label: 'Segunda', date: '22/01' },
  { key: 'terça', label: 'Terça', date: '23/01' },
  { key: 'quarta', label: 'Quarta', date: '24/01' },
  { key: 'quinta', label: 'Quinta', date: '25/01' },
  { key: 'sexta', label: 'Sexta', date: '26/01' },
  { key: 'sabado', label: 'Sábado', date: '27/01' },
  { key: 'domingo', label: 'Domingo', date: '28/01' }
];

// Subject mapping for SubjectsRow
const SUBJECTS = {
  'Matemática': { name: 'Matemática', icon: '📐' },
  'Português': { name: 'Português', icon: '📖' },
  'Ciências': { name: 'Ciências', icon: '🌌' },
  'História': { name: 'História', icon: '🏛️' },
  'Geografia': { name: 'Geografia', icon: '🗺️' },
  'Arte': { name: 'Arte', icon: '🎨' },
  'Inglês': { name: 'Inglês', icon: '🇺🇸' },
  'Educação Física': { name: 'Ed. Física', icon: '⚽' }
};

const COLORS = {
  'Matemática': 'bg-kid-green/20 text-kid-green border-kid-green/30',
  'Português': 'bg-kid-blue/20 text-kid-blue border-kid-blue/30',
  'Ciências': 'bg-kid-green/30 text-kid-green border-kid-green/40',
  'História': 'bg-kid-orange/20 text-kid-orange border-kid-orange/30',
  'Geografia': 'bg-kid-blue/30 text-kid-blue border-kid-blue/40',
  'Arte': 'bg-kid-yellow/20 text-kid-yellow border-kid-yellow/30',
  'Inglês': 'bg-kid-green/15 text-kid-green border-kid-green/25',
  'Educação Física': 'bg-kid-blue/15 text-kid-blue border-kid-blue/25'
};

// SubjectsRow Component
function SubjectsRow({ schedule }: { schedule: ClassEvent[] }) {
  // Count blocks per subject (excluding intervals)
  const counts = schedule
    .filter(event => !event.isInterval)
    .reduce((acc, event) => {
      acc[event.subject] = (acc[event.subject] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const subjectsWithClasses = Object.keys(counts);

  if (subjectsWithClasses.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm border border-kid-green/20 rounded-xl p-4 mb-4 shadow-sm">
        <div className="font-bold text-kid-green mb-2">Matérias de Hoje</div>
        <div className="text-xs text-slate-500">Nenhuma aula programada para hoje.</div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-kid-green/20 rounded-xl p-4 mb-4 shadow-sm">
      <div className="font-bold text-kid-green mb-3">Matérias de Hoje</div>
      <div className="flex flex-wrap gap-2">
        {subjectsWithClasses.map((key) => (
          <span
            key={key}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${COLORS[key]} font-semibold whitespace-nowrap`}
            aria-label={`${SUBJECTS[key].name} — ${counts[key] ?? 0} bloco(s) hoje`}
            title={`${SUBJECTS[key].name} — ${counts[key] ?? 0} bloco(s) hoje`}
          >
            <span className="text-base leading-none">{SUBJECTS[key].icon}</span>
            {SUBJECTS[key].name}
            <span className="text-xs font-bold opacity-80">· {counts[key] ?? 0}</span>
          </span>
        ))}
      </div>
      <div className="text-xs text-slate-500 mt-1">A sequência é fixa — o aluno segue a trilha do dia sem reordenar.</div>
    </div>
  );
}

// MonthlyCalendar Component
function MonthlyCalendar() {
  // Versão simples estática para o MVP; futuramente gerar via Date()
  const head = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
  return (
    <div className="mt-6 bg-white/90 backdrop-blur-sm border border-kid-green/20 rounded-xl p-4 shadow-sm">
      <div className="font-bold text-kid-green mb-3 flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        📅 Calendário do Mês
      </div>
      <div className="grid grid-cols-7 text-[11px] font-semibold text-slate-500">
        {head.map((d) => (
          <div key={d} className="p-2 text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-[1px] bg-slate-200 rounded-md overflow-hidden text-xs">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="min-h-[68px] bg-white p-2">
            <div className="font-bold text-slate-700">{i % 30 === 0 ? "" : (i % 30) + 1}</div>
            {i % 5 === 0 && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-kid-blue/20 text-kid-blue border border-kid-blue/30 text-[10px]">Quiz</span>
            )}
            {i % 7 === 0 && (
              <span className="inline-block mt-1 ml-1 px-2 py-0.5 rounded bg-kid-orange/20 text-kid-orange border border-kid-orange/30 text-[10px]">Leitura</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Calendario() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { activeChild } = useStudent();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('quinta');
  const [showMedals, setShowMedals] = useState(false);
  
  // Hooks para tempo real
  const now = useNow(30_000); // atualiza a cada 30s
  const serverOffset = useServerTimeOffset();
  const adjustedNow = new Date(now.getTime() + serverOffset);
  
  // Estado da semana
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(adjustedNow));
  const [weekClasses, setWeekClasses] = useState(mockClasses);
  const [draggedDay, setDraggedDay] = useState<string | null>(null);
  const [dropTargetDay, setDropTargetDay] = useState<string | null>(null);
  
  // Configurações de locale e timezone
  const locale = typeof t('language') === 'string' ? t('language') : navigator.language;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const use12Hour = prefersHour12(locale);
  
  // Dias da semana
  const weekDays = getWeekDays(locale, 1); // Segunda = 1

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
    
    // Sincronizar semana com o tempo atual
    setWeekStart(startOfWeek(adjustedNow));
  }, [adjustedNow]);

  // Funções de navegação da semana
  const goPrevWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };
  
  const goNextWeek = () => {
    setWeekStart(addDays(weekStart, +7));
  };
  
  const goToCurrentWeek = () => {
    setWeekStart(startOfWeek(adjustedNow));
  };
  
  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, dayKey: string) => {
    setDraggedDay(dayKey);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dayKey);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, dayKey: string) => {
    e.preventDefault();
    setDropTargetDay(dayKey);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the container, not just moving to a child
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropTargetDay(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetDayKey: string) => {
    e.preventDefault();
    const sourceDayKey = e.dataTransfer.getData('text/plain');
    
    if (sourceDayKey && sourceDayKey !== targetDayKey) {
      setWeekClasses(prev => {
        const newClasses = { ...prev };
        const sourceClasses = newClasses[sourceDayKey] || [];
        const targetClasses = newClasses[targetDayKey] || [];
        
        // Move source classes to target day
        newClasses[targetDayKey] = [...targetClasses, ...sourceClasses];
        // Clear source day
        newClasses[sourceDayKey] = [];
        
        return newClasses;
      });
    }
    
    setDraggedDay(null);
    setDropTargetDay(null);
  };

  const handleDragEnd = () => {
    setDraggedDay(null);
    setDropTargetDay(null);
  };

  const getStatusColor = (status: ClassEvent['status']) => {
    switch (status) {
      case 'completed': return 'bg-success/20 text-success border-success/30';
      case 'no_show': return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'prepare': return 'bg-warning/20 text-warning border-warning/30';
      case 'time_to_start': return 'bg-primary/20 text-primary border-primary/30';
      case 'upcoming': return 'bg-muted text-muted-foreground border-muted';
      default: return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getStatusText = (status: ClassEvent['status']) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'no_show': return 'Reposição agendada';
      case 'prepare': return 'Prepare-se';
      case 'time_to_start': return 'Hora de começar';
      case 'upcoming': return 'Próxima';
      default: return 'Agendada';
    }
  };

  const handleStartLesson = (lessonId: string) => {
    navigate(`/aulaia/${lessonId}`);
  };

  const todayClasses = weekClasses['quinta'] || [];
  
  // Get next class or interval
  const getNextEvent = () => {
    const nowMinutes = adjustedNow.getHours() * 60 + adjustedNow.getMinutes();
    
    for (const event of todayClasses) {
      const [hours, minutes] = event.time.split(':').map(Number);
      const eventMinutes = hours * 60 + minutes;
      
      if (eventMinutes > nowMinutes) {
        return event;
      }
    }
    return null;
  };
  
  const nextEvent = getNextEvent();
  const timeToNext = nextEvent ? getTimeDifference(nextEvent.time, adjustedNow) : 0;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
          
          {/* Week Skeleton */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          
          {/* Timeline Skeleton */}
          <Skeleton className="h-64" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-kid-yellow/5 via-background to-kid-blue/5 min-h-screen">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 border-kid-green/20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-kid-green to-kid-blue rounded-full shadow-md">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-kid-green to-kid-blue bg-clip-text text-transparent">
                    Meu Calendário
                  </h1>
                  <p className="text-kid-green/70 font-medium">Vamos aprender juntos hoje!</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right bg-gradient-to-br from-kid-green/20 to-kid-blue/20 p-4 rounded-xl border border-kid-green/30">
                <p className="text-sm text-kid-green/70 font-medium">
                  {t('calendar.todayLabel')}, {formatDate(adjustedNow, locale, timeZone, { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-2xl font-bold text-kid-green">
                  {formatDate(adjustedNow, locale, timeZone, { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: use12Hour
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Info Card */}
        <div className="px-6 pb-4">
          {activeChild ? (
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 shadow-lg overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-slate-300 shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 text-lg font-bold">
                        {activeChild.first_name?.[0]}{activeChild.last_name?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-700">
                      {activeChild.first_name} {activeChild.last_name || ''}
                    </h2>
                    <p className="text-slate-600 font-medium">{activeChild.grade || 'Estudante'}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-slate-50 text-slate-700 border border-slate-200 px-2 py-1 rounded-full font-semibold">
                        Pontos: —
                      </span>
                      <a href="/conquistas" className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full font-semibold">
                        Conquistas
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 shadow-lg">
              <CardContent className="p-6 text-center">
                <p className="text-slate-600 mb-4">Nenhum aluno selecionado</p>
                <Button 
                  onClick={() => navigate('/selecionar-aluno')}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  Selecionar Aluno
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="px-6 space-y-6">
        {/* Today's Timeline - Mobile First */}
        <div className="block lg:hidden">
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-kid-green/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-kid-green">
                <Clock className="h-5 w-5" />
                Aulas de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SubjectsRow schedule={todaySchedule} />
              {todayClasses.length > 0 ? (
                <div className="space-y-3">
                  {/* Countdown Card */}
                  {nextEvent && (
                     <div className="bg-gradient-to-r from-kid-green/10 to-kid-blue/10 border border-kid-green/20 rounded-xl p-4 mb-4">
                       <div className="text-center">
                          <h3 className="font-semibold text-kid-green mb-1">
                             {nextEvent.isInterval ? 'Próximo Intervalo' : 'Próxima Aula'}
                          </h3>
                          <p className="text-sm text-kid-green/70 mb-2">
                            {nextEvent.subject} - {nextEvent.time}
                          </p>
                         <div className="text-2xl font-bold text-kid-green">
                          {formatCountdown(timeToNext)}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {todayClasses.map((classEvent, index) => (
                    <div key={classEvent.id}>
                      <div className={`flex items-center gap-4 p-4 border rounded-xl ${
                        classEvent.isInterval ? 'bg-muted/50' : 'bg-card'
                      }`}>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          classEvent.isInterval 
                            ? 'bg-muted text-muted-foreground' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          <span className="text-lg">{classEvent.icon}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{classEvent.subject}</h3>
                          <p className="text-sm text-muted-foreground">{classEvent.title}</p>
                           <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                             <Clock className="h-3 w-3" />
                             {classEvent.time} - {classEvent.endTime} ({classEvent.duration}min)
                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {!classEvent.isInterval && (
                            <Badge variant="outline" className={getStatusColor(classEvent.status)}>
                              {getStatusText(classEvent.status)}
                            </Badge>
                          )}
                          {classEvent.canStart && !classEvent.isInterval && (
                            <Button
                              size="sm"
                              onClick={() => handleStartLesson(classEvent.lessonId)}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Começar
                            </Button>
                          )}
                        </div>
                      </div>
                      {index < todayClasses.length - 1 && !classEvent.isInterval && (
                        <div className="flex justify-center py-2">
                          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Hoje não há aulas programadas. Aproveite o descanso!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
          {/* Today's Timeline */}
          <div className="lg:col-span-1 order-first lg:order-none">
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-kid-green/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-kid-green">
                  <Clock className="h-5 w-5" />
                  Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SubjectsRow schedule={todaySchedule} />
                {todayClasses.length > 0 ? (
                  <div className="space-y-3">
                    {/* Countdown Card */}
                    {nextEvent && (
                      <div className="bg-gradient-to-r from-kid-green/10 to-kid-blue/10 border border-kid-green/20 rounded-xl p-4 mb-4">
                        <div className="text-center">
                           <h3 className="font-semibold text-kid-green mb-1">
                             {nextEvent.isInterval ? 'Próximo Intervalo' : 'Próxima Aula'}
                           </h3>
                           <p className="text-sm text-kid-green/70 mb-2">
                             {nextEvent.subject} - {nextEvent.time}
                           </p>
                          <div className="text-2xl font-bold text-kid-green">
                            {formatCountdown(timeToNext)}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {todaySchedule.map((classEvent, index) => {
                      const timeDiff = getTimeDifference(classEvent.startTime, adjustedNow);
                      return (
                        <div key={classEvent.id}>
                          <div className={`flex items-center gap-4 p-4 border rounded-xl transition-all hover:shadow-md ${
                            classEvent.isInterval ? 'bg-kid-yellow/10 border-kid-yellow/20' : 'bg-white/80 border-kid-green/20'
                          }`}>
                             <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                               classEvent.isInterval 
                                 ? 'bg-kid-yellow/20 text-kid-orange' 
                                 : 'bg-kid-green/10 text-kid-green'
                             }`}>
                              <span className="text-lg">{classEvent.icon}</span>
                            </div>
                             <div className="flex-1">
                               <h3 className="font-semibold text-kid-green">{classEvent.subject}</h3>
                               <p className="text-sm text-kid-green/70">{classEvent.title}</p>
                                <div className="flex items-center gap-2 text-xs text-kid-green/60 mt-1">
                                 <Clock className="h-3 w-3" />
                                 {classEvent.startTime} - {classEvent.endTime} ({classEvent.duration}min)
                               </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                            {!classEvent.isInterval && (
                              <Badge variant="outline" className={getStatusColor(classEvent.status)}>
                                {getStatusText(classEvent.status)}
                              </Badge>
                            )}
                            {classEvent.canStart && !classEvent.isInterval && (
                               <Button
                                 size="sm"
                                 onClick={() => handleStartLesson(classEvent.lessonId)}
                                 className="bg-gradient-to-r from-kid-green to-kid-blue hover:from-kid-green/90 hover:to-kid-blue/90 text-white shadow-md"
                               >
                                <Play className="h-3 w-3 mr-1" />
                                Começar
                              </Button>
                            )}
                            </div>
                          </div>
                          {index < todaySchedule.length - 1 && !classEvent.isInterval && (
                            <div className="flex justify-center py-2">
                              <div className="w-8 h-8 bg-kid-green/20 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-kid-green rounded-full"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                   <div className="text-center py-8">
                     <Calendar className="h-12 w-12 text-kid-green/50 mx-auto mb-3" />
                     <p className="text-kid-green/70">Hoje não há aulas programadas. Aproveite o descanso! 🌈</p>
                   </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Weekly Schedule */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-sm border-2 border-kid-green/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-kid-green">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    📅 Agenda Semanal
                    <Badge variant="outline" className="text-xs bg-kid-yellow/20 text-kid-orange border-kid-yellow/30">
                      Arraste dias para reorganizar
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goPrevWeek}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToCurrentWeek}
                      className="h-8 px-3 text-xs"
                    >
                      {t('calendar.thisWeek')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goNextWeek}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                </CardTitle>
                <p className="text-sm text-kid-green/70">
                  Arraste um dia com aulas para outro dia para mover todas as aulas de uma vez 🎪
                </p>
              </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {weekDays.map((day, index) => {
                  const dayDate = addDays(weekStart, index);
                  const dayClasses = weekClasses[day.short] || [];
                  const isToday = isSameDay(dayDate, adjustedNow);
                  const isDraggedOver = dropTargetDay === day.short;
                  const isDragging = draggedDay === day.short;
                  const hasClasses = dayClasses.length > 0;
                  
                  return (
                    <div 
                      key={day.short} 
                      className={`space-y-3 relative transition-all duration-200 ${
                        isToday ? 'ring-2 ring-primary rounded-lg p-3' : 'p-3'
                      } ${
                        isDraggedOver ? 'bg-primary/10 ring-2 ring-primary/50 rounded-lg' : ''
                      } ${
                        isDragging ? 'opacity-50 scale-95' : ''
                      }`}
                      draggable={hasClasses}
                      onDragStart={(e) => handleDragStart(e, day.short)}
                      onDragOver={handleDragOver}
                      onDragEnter={(e) => handleDragEnter(e, day.short)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day.short)}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Drop zone indicator */}
                      {isDraggedOver && draggedDay !== day.short && (
                        <div className="absolute inset-0 border-2 border-dashed border-primary/50 rounded-lg bg-primary/5 pointer-events-none flex items-center justify-center">
                          <div className="text-primary font-medium text-sm">
                            Soltar aqui
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center relative z-10">
                        <div className={`font-semibold ${isToday ? 'text-primary' : ''}`}>
                          {day.short}
                        </div>
                        <div className={`text-xs ${isToday ? 'text-primary/70' : 'text-muted-foreground'}`}>
                          {formatDate(dayDate, locale, timeZone, { day: '2-digit', month: '2-digit' })}
                        </div>
                        {isToday && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {t('calendar.todayLabel')}
                          </Badge>
                        )}
                        {hasClasses && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            📋 {dayClasses.length} aula{dayClasses.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2 relative z-10">
                        {dayClasses.length > 0 ? (
                          dayClasses.map((classEvent) => (
                            <div
                              key={classEvent.id}
                              className="p-3 bg-card border rounded-lg text-xs space-y-1 hover:shadow-sm transition-shadow cursor-pointer"
                            >
                              <div className="flex items-center gap-1">
                                <span className="text-sm">{classEvent.icon}</span>
                                <span className="font-medium truncate">{classEvent.subject}</span>
                              </div>
                              <div className="text-muted-foreground truncate">{classEvent.title}</div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{classEvent.time}</span>
                                <Badge variant="outline" className={`text-[10px] py-0 ${getStatusColor(classEvent.status)}`}>
                                  {getStatusText(classEvent.status)}
                                </Badge>
                              </div>
                              {classEvent.canStart && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStartLesson(classEvent.lessonId)}
                                  className="w-full h-7 text-xs bg-primary hover:bg-primary/90"
                                >
                                  <Play className="h-3 w-3 mr-1" />
                                  Começar
                                </Button>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-muted-foreground text-xs border-2 border-dashed border-muted/50 rounded-lg">
                            {isDraggedOver && draggedDay !== day.short ? (
                              'Solte as aulas aqui'
                            ) : (
                              'Sem aulas'
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            {/* Optional: calendário mensal visual */}
            <MonthlyCalendar />
          </Card>
          </div>

          {/* Today's Timeline */}
          <DayTimeline
            date={adjustedNow}
            events={todaySchedule.map(event => ({
              id: event.id,
              startTime: event.startTime || event.time,
              endTime: event.endTime,
              subject: event.subject,
              title: event.title,
              status: event.status
            }))}
            now={adjustedNow}
            locale={locale}
            timeZone={timeZone}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success/20 text-success rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">Aulas concluídas esta semana</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">4</p>
                <p className="text-sm text-muted-foreground">Aulas restantes</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/20 text-warning rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">6</p>
                <p className="text-sm text-muted-foreground">Professores diferentes</p>
              </div>
            </div>
          </Card>
        </div>
        </div>
      </div>
    </AppLayout>
  );
}