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
import { MonthMini } from '@/components/calendar/MonthMini';
import { getWeekSchedule, getDaySchedule } from '@/services/scheduleGenerator';
import { WeekSchedule, DaySchedule } from '@/types/schedule';

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

// REMOVIDO: mock de "Hoje" – passa a usar dados reais da semana

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

// Helper para mapear dias da semana para chaves dos dados mockados
const getDayKey = (dayShort: string, locale: string): string => {
  // Mapear abreviações para chaves em português
  const dayMapping: Record<string, string> = {
    'Dom': 'domingo',
    'Seg': 'segunda', 
    'Ter': 'terça',
    'Qua': 'quarta',
    'Qui': 'quinta',
    'Sex': 'sexta',
    'Sáb': 'sábado',
    // Fallbacks para inglês
    'Sun': 'domingo',
    'Mon': 'segunda',
    'Tue': 'terça', 
    'Wed': 'quarta',
    'Thu': 'quinta',
    'Fri': 'sexta',
    'Sat': 'sábado',
    // Fallbacks para francês
    'dim': 'domingo',
    'lun': 'segunda',
    'mar': 'terça',
    'mer': 'quarta', 
    'jeu': 'quinta',
    'ven': 'sexta',
    'sam': 'sábado'
  };
  
  return dayMapping[dayShort] || 'domingo';
};

// Helper para formatar tempo em minutos para HH:MM
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Helpers locais para ISO (local) e hora por locale
const toISODateLocal = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
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

// weekDays agora é definido dinamicamente usando getWeekDays(locale, 0)

// Subject mapping for SubjectsRow - será definido dentro da função

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

// SubjectsRow Component - será definido dentro da função principal



export default function Calendario() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { activeChild, children } = useStudent();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('quinta');
  const [showMedals, setShowMedals] = useState(false);
  
  // Hooks para tempo real
  const now = useNow(30_000); // atualiza a cada 30s
  const serverOffset = useServerTimeOffset();
  const adjustedNow = new Date(now.getTime() + serverOffset);
  
  // Estado da semana (SEMPRE começa no domingo)
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(adjustedNow, 0));
  const [weekClasses, setWeekClasses] = useState(mockClasses);
  const [draggedDay, setDraggedDay] = useState<string | null>(null);
  const [dropTargetDay, setDropTargetDay] = useState<string | null>(null);

  // Estado da grade semanal gerada
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editableWeek, setEditableWeek] = useState<Record<string, any[]>>({});
  const [originalWeekData, setOriginalWeekData] = useState<Record<string, any[]>>({});
  const [dragSourceDateISO, setDragSourceDateISO] = useState<string | null>(null);
  const [dropTargetDateISO, setDropTargetDateISO] = useState<string | null>(null);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Função para ativar/desativar modo de edição
  const toggleEditMode = () => {
    if (!editMode) {
      // Ativando modo de edição - copiar dados atuais para editableWeek
      const newEditableWeek: Record<string, any[]> = {};
      const newOriginalWeekData: Record<string, any[]> = {};
      
      console.log(t('calendar.activatingEditMode'), !!weekSchedule);
      
      if (weekSchedule) {
        // Usar dados do weekSchedule
        weekSchedule.days.forEach(day => {
          const classes = day.slots.filter(s => s.type === 'class');
          newEditableWeek[day.dateISO] = classes;
          newOriginalWeekData[day.dateISO] = [...classes]; // Cópia profunda
          console.log(t('calendar.dayClassesCount', { date: day.dateISO, count: classes.length }));
        });
      } else {
        // Usar dados mockados
        weekDays.forEach((day, index) => {
          const dayDate = addDays(weekStart, index);
          const dateISO = toISODateLocal(dayDate);
          const dayKey = getDayKey(day.short, locale);
          const classes = weekClasses[dayKey] || [];
          newEditableWeek[dateISO] = classes;
          newOriginalWeekData[dateISO] = [...classes]; // Cópia profunda
          console.log(t('calendar.dayClassesCount', { date: dateISO, count: classes.length }));
        });
      }
      
      console.log(t('calendar.editableWeekCreated'), newEditableWeek);
      setEditableWeek(newEditableWeek);
      setOriginalWeekData(newOriginalWeekData);
    } else {
      // Desativando modo de edição - perguntar se quer aplicar mudanças
      const hasChanges = Object.keys(editableWeek).some(dateISO => {
        const current = editableWeek[dateISO] || [];
        const original = originalWeekData[dateISO] || [];
        return current.length !== original.length || 
               !current.every((item, index) => item.id === original[index]?.id);
      });
      
      if (hasChanges) {
        // Mostrar confirmação para aplicar mudanças
        if (window.confirm(t('calendar.confirmApplyChanges'))) {
          // Aplicar mudanças permanentemente
          if (weekSchedule) {
            // Atualizar weekSchedule com as mudanças
            const updatedWeekSchedule = { ...weekSchedule };
            updatedWeekSchedule.days = updatedWeekSchedule.days.map(day => {
              const editedClasses = editableWeek[day.dateISO] || [];
              return {
                ...day,
                slots: editedClasses.map((cls, index) => ({
                  ...cls,
                  id: cls.id || `edited-${day.dateISO}-${index}`,
                  type: 'class' as const,
                  subjectId: cls.subjectId || 'portugues',
                  title: cls.title || cls.subject || 'Aula Editada',
                  startMinOfDay: (8 * 60) + (index * 55), // 8:00, 8:55, 9:50
                  durationMin: index === 2 ? 30 : 45
                }))
              };
            });
            setWeekSchedule(updatedWeekSchedule);
          } else {
            // Atualizar weekClasses com as mudanças
            const updatedWeekClasses = { ...weekClasses };
            weekDays.forEach((day, index) => {
              const dayDate = addDays(weekStart, index);
              const dateISO = toISODateLocal(dayDate);
              const dayKey = getDayKey(day.short, locale);
              const editedClasses = editableWeek[dateISO] || [];
              
              if (editedClasses.length > 0) {
                updatedWeekClasses[dayKey] = editedClasses.map((cls, idx) => ({
                  ...cls,
                  id: cls.id || `edited-${dayKey}-${idx}`,
                  time: `${8 + Math.floor(idx * 55 / 60)}:${(idx * 55) % 60 === 0 ? '00' : (idx * 55) % 60}`,
                  endTime: `${8 + Math.floor((idx * 55 + (idx === 2 ? 30 : 45)) / 60)}:${((idx * 55 + (idx === 2 ? 30 : 45)) % 60 === 0 ? '00' : (idx * 55 + (idx === 2 ? 30 : 45)) % 60)}`,
                  duration: idx === 2 ? 30 : 45
                }));
              }
            });
            setWeekClasses(updatedWeekClasses);
          }
                  console.log(t('calendar.changesApplied'));
      } else {
        // Descartar mudanças - restaurar dados originais
        setEditableWeek(originalWeekData);
        console.log(t('calendar.changesDiscarded'));
      }
      }
    }
    setEditMode(!editMode);
  };
  
  // Configurações de locale e timezone
  const locale = i18n.language || navigator.language;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const use12Hour = prefersHour12(locale);
  
  // Dias da semana localizados (SEMPRE domingo primeiro na ordem visual)
  const weekDays = getWeekDays(locale, 0);

  // Simples loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Debug simples
  useEffect(() => {
    console.log(t('calendar.debug.activeChild'), !!activeChild);
  }, [activeChild]);

  // Gerar grade semanal quando a semana mudar
  useEffect(() => {
    console.log(t('calendar.debug.useEffectExecuted'), { weekStart, activeChildId: activeChild?.id });
    refreshWeekSchedule();
  }, [weekStart, activeChild?.id]);

  console.log(t('calendar.debug.componentLoaded'), !!activeChild);

  // Função para gerar/atualizar a grade semanal
  const refreshWeekSchedule = () => {
    try {
      setScheduleError(null);

      if (!activeChild?.id) {
        setScheduleError(t('calendar.noActiveStudent'));
        return;
      }

      const weekStartISO = toISODateLocal(weekStart);

      console.log(t('calendar.debug.generatingSchedule'), {
        childId: activeChild.id,
        weekStartISO,
        locale: locale.split('-')[0]
      });

      // Gerar grade
      const schedule = getWeekSchedule({
        childId: activeChild.id,
        weekStartISO,
        locale: locale.split('-')[0] // pt-BR -> pt
      });

      console.log(t('calendar.debug.scheduleGenerated'), schedule);
      setWeekSchedule(schedule);
    } catch (error) {
      console.error(t('calendar.error.generatingSchedule'), error);
              setScheduleError(error instanceof Error ? error.message : t('calendar.error.unknownError'));
      setWeekSchedule(null);
    }
  };

  // Funções de navegação da semana
  const goPrevWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };
  
  const goNextWeek = () => {
    setWeekStart(addDays(weekStart, +7));
  };
  
  const goToCurrentWeek = () => {
    setWeekStart(startOfWeek(adjustedNow, 0));
  };

  // Função para selecionar data no calendário mensal
  const handleSelectDate = (date: Date) => {
    // Atualizar a semana ativa para a semana da data selecionada (SEMPRE domingo)
    setWeekStart(startOfWeek(date, 0));
  };

  // Helper para mapear dias da semana para chaves dos dados mockados
  // getDayKey já está definido acima

  // Helper para formatar tempo em minutos para HH:MM
  // formatTime já está definido acima

  // Helpers locais para ISO (local) e hora por locale
  // toISODateLocal já está definido acima

  // Helper to get time difference in minutes
  // getTimeDifference já está definido acima

  // Helper to format countdown
  // formatCountdown já está definido acima

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
      case 'completed': return t('calendar.status.completed');
      case 'no_show': return t('calendar.status.noShow');
      case 'prepare': return t('calendar.status.prepare');
      case 'time_to_start': return t('calendar.status.timeToStart');
      case 'upcoming': return t('calendar.status.upcoming');
      default: return t('calendar.scheduled');
    }
  };

  // SubjectsRow Component
  const SubjectsRow = ({ schedule }: { schedule: ClassEvent[] }) => {
    // Subject mapping for SubjectsRow
    const SUBJECTS = {
      'Matemática': { name: t('subjects.math'), icon: '📐' },
      'Português': { name: t('subjects.portuguese'), icon: '📖' },
      'Ciências': { name: t('subjects.science'), icon: '🌌' },
      'História': { name: t('subjects.history'), icon: '🏛️' },
      'Geografia': { name: t('subjects.geography'), icon: '🗺️' },
      'Arte': { name: t('subjects.arts'), icon: '🎨' },
      'Inglês': { name: t('subjects.english'), icon: '🇺🇸' },
      'Educação Física': { name: t('subjects.physicalEducation'), icon: '⚽' }
    };
    
    // Count blocks per subject (excluding intervals)
    const counts = schedule
      .filter(event => !event.isInterval)
      .reduce((acc, event) => {
        // Usar subject ou title dependendo da fonte dos dados
        const subjectName = event.subject || event.title;
        if (subjectName) {
          acc[subjectName] = (acc[subjectName] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

    const subjectsWithClasses = Object.keys(counts);

    if (subjectsWithClasses.length === 0) {
      return (
        <div className="bg-white/90 backdrop-blur-sm border border-kid-green/20 rounded-xl p-4 mb-4 shadow-sm">
          <div className="font-bold text-kid-green mb-2">{t('calendar.todaySubjects')}</div>
          <div className="text-xs text-slate-500">{t('calendar.noClasses')}</div>
        </div>
      );
    }

    return (
      <div className="bg-white/90 backdrop-blur-sm border border-kid-green/20 rounded-xl p-4 mb-4 shadow-sm">
        <div className="font-bold text-kid-green mb-3">{t('calendar.todaySubjects')}</div>
        <div className="flex flex-wrap gap-2">
          {subjectsWithClasses.map((key) => {
            const subject = SUBJECTS[key];
            const fallbackColor = 'bg-gray-100 text-gray-700 border-gray-300';
            
            return (
              <span
                key={key}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${subject ? COLORS[key] : fallbackColor} font-semibold whitespace-nowrap`}
                aria-label={`${subject?.name || key} — ${counts[key] ?? 0} bloco(s) hoje`}
                title={`${subject?.name || key} — ${counts[key] ?? 0} bloco(s) hoje`}
              >
                <span className="text-base leading-none">{subject?.icon || '📚'}</span>
                {subject?.name || key}
                <span className="text-xs font-bold opacity-80">· {counts[key] ?? 0}</span>
              </span>
            );
          })}
        </div>
        <div className="text-xs text-slate-500 mt-1">{t('calendar.sequenceNote')}</div>
      </div>
    );
  };

  const handleStartLesson = (lessonId: string) => {
    navigate(`/aulaia/${lessonId}`);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, dateISO: string) => {
    if (!editMode) return;
    setDragSourceDateISO(dateISO);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dateISO);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!editMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, dateISO: string) => {
    if (!editMode) return;
    e.preventDefault();
    setDropTargetDateISO(dateISO);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!editMode) return;
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDropTargetDateISO(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetDateISO: string) => {
    if (!editMode) return;
    e.preventDefault();
    const sourceDateISO = e.dataTransfer.getData('text/plain');
    if (sourceDateISO && sourceDateISO !== targetDateISO) {
      setEditableWeek(prev => {
        const next = { ...prev };
        const source = next[sourceDateISO] || [];
        const target = next[targetDateISO] || [];
        next[targetDateISO] = [...target, ...source];
        next[sourceDateISO] = [];
        return next;
      });
    }
    setDragSourceDateISO(null);
    setDropTargetDateISO(null);
  };

  const handleDragEnd = () => {
    if (!editMode) return;
    setDragSourceDateISO(null);
    setDropTargetDateISO(null);
  };

  // Get today's day key based on current date
  const todayDayIndex = adjustedNow.getDay();
  const todayDayShort = getWeekDays(locale, 0)[todayDayIndex].short;
  const todayDayKey = getDayKey(todayDayShort, locale);
  const todayISO = toISODateLocal(adjustedNow);
  
  // Escolher fonte de dados para "hoje" baseado no estado atual
  let todayClasses: any[] = [];
  
  if (editMode && editableWeek[todayISO]) {
    // Modo de edição ativo - usar dados editáveis
    todayClasses = editableWeek[todayISO] || [];
    console.log(t('calendar.debug.usingEditableWeek'), todayClasses.length, t('calendar.lessonsPlanned'));
  } else if (weekSchedule) {
    // Usar dados do weekSchedule gerado
    const todaySchedule = weekSchedule.days.find(d => d.dateISO === todayISO);
    if (todaySchedule) {
      todayClasses = todaySchedule.slots.filter(s => s.type === 'class');
      console.log(t('calendar.debug.usingWeekSchedule'), todayClasses.length, t('calendar.lessonsPlanned'));
    }
  } else {
    // Fallback para dados mockados
    todayClasses = weekClasses[todayDayKey] || [];
    console.log(t('calendar.debug.usingWeekClasses'), todayClasses.length, t('calendar.lessonsPlanned'));
  }
  
  // Debug logs
  console.log(t('calendar.debug.debugToday'), {
    todayDayIndex,
    todayDayShort,
    todayDayKey,
    todayISO,
    todayClassesLength: todayClasses.length,
    editMode,
    hasWeekSchedule: !!weekSchedule,
    availableKeys: Object.keys(weekClasses)
  });
  
  // Get next class or interval
  const getNextEvent = () => {
    const nowMinutes = adjustedNow.getHours() * 60 + adjustedNow.getMinutes();
    
    for (const event of todayClasses) {
      let eventTime: string | undefined;
      
      // Verificar se é um evento do weekSchedule (tem startMinOfDay) ou dados mockados (tem time)
      if ('startMinOfDay' in event) {
        // Evento do weekSchedule - converter startMinOfDay para HH:MM
        const hours = Math.floor(event.startMinOfDay / 60);
        const minutes = event.startMinOfDay % 60;
        eventTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      } else {
        // Evento dos dados mockados - usar time diretamente
        eventTime = event.time;
      }
      
      if (!eventTime) continue;
      
      const [hours, minutes] = eventTime.split(':').map(Number);
      const eventMinutes = hours * 60 + minutes;
      
      if (eventMinutes > nowMinutes) {
        return { ...event, time: eventTime };
      }
    }
    return null;
  };
  
  const nextEvent = getNextEvent();
  const timeToNext = nextEvent ? getTimeDifference(nextEvent.time, adjustedNow) : 0;

  // Fallback se não houver aluno ativo
  if (!activeChild) {
    console.log(t('calendar.debug.renderingFallback'));
    
    // Se ainda está carregando, mostrar loading
    if (isLoading) {
      return (
        <AppLayout>
          <div className="p-6">
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('common.loading')}</h1>
              <p className="text-gray-600 mb-6">{t('calendar.loadingStudentInfo')}</p>
            </div>
          </div>
        </AppLayout>
      );
    }
    
    // Se não está carregando e não há crianças, redirecionar para selecionar aluno
    if (children.length === 0) {
      console.log(t('calendar.debug.redirectingNoChildren'));
      // Usar setTimeout para evitar erro de renderização durante navegação
      setTimeout(() => navigate('/selecionar-aluno'), 0);
      return (
        <AppLayout>
          <div className="p-6">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('common.redirecting')}</h1>
              <p className="text-gray-600 mb-6">{t('calendar.noChildrenRegistered')}</p>
            </div>
          </div>
        </AppLayout>
      );
    }
    
    // Se há crianças mas nenhuma está ativa, mostrar opção de seleção
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('calendar.title')}</h1>
            <p className="text-gray-600 mb-6">{t('calendar.noStudentSelected')}</p>
            <Button onClick={() => navigate('/selecionar-aluno')}>
              {t('calendar.selectStudent')}
            </Button>
            <div className="mt-4 text-sm text-gray-500">
              {t('calendar.debugInfo')} activeChild = {JSON.stringify(activeChild)}, children = {children.length}
            </div>
            </div>
        </div>
      </AppLayout>
    );
  }

    // Verificar se está carregando
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

  console.log(t('calendar.debug.renderingMainContent'));

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-kid-yellow/5 via-background to-kid-blue/5 min-h-screen">
        {/* Header */}
        <div className="p-6 pb-4">
          <Card className="border-2 border-kid-green/20 bg-gradient-card backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-kid-green to-kid-blue flex items-center justify-center text-2xl shadow-lg">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold bg-gradient-to-r from-kid-green to-kid-blue bg-clip-text text-transparent">
                      {t('calendar.title')}
                    </h1>
                    <p className="text-lg text-kid-green mt-1">{t('calendar.subtitle')}</p>
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
            </CardContent>
          </Card>
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
                        {t('calendar.points')}: —
                      </span>
                      <a href="/conquistas" className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-full font-semibold">
                        {t('calendar.achievements')}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 shadow-lg">
              <CardContent className="p-6 text-center">
                <p className="text-slate-600 mb-4">{t('calendar.noStudentSelected', 'Nenhum aluno selecionado')}</p>
                <Button
                  onClick={() => navigate('/selecionar-aluno')}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  {t('calendar.selectStudent', 'Selecionar Aluno')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="px-6 space-y-6">
        {/* Debug: Mostrar erros de schedule se houver */}
        {scheduleError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <span className="text-sm font-medium">{t('calendar.scheduleError')}</span>
              <span className="text-sm">{scheduleError}</span>
            </div>
            <div className="text-xs text-red-600 mt-1">
              {t('calendar.usingMockData')}
            </div>
          </div>
        )}

        {/* Today's Timeline - Mobile First */}
        <div className="block lg:hidden">
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-kid-green/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-kid-green">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t('calendar.availableToday')}
                </div>
                {todayClasses.length > 0 && (
                  <Button
                    onClick={() => navigate('/aulaia')}
                    className="bg-gradient-to-r from-kid-green to-kid-blue hover:from-kid-green/90 hover:to-kid-blue/90 text-white shadow-md text-sm"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    {t('calendar.startLesson')}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SubjectsRow schedule={todayClasses} />
              {todayClasses.length > 0 ? (
                <div className="space-y-3">
                  {/* Botão principal para iniciar aula */}
                  <div className="bg-gradient-to-r from-kid-green/20 to-kid-blue/20 border border-kid-green/30 rounded-xl p-4 mb-4">
                    <div className="text-center">
                      <h3 className="font-semibold text-kid-green mb-3">
                        🎯 {t('calendar.availableToday')}
                      </h3>
                      <Button
                        onClick={() => navigate('/aulaia')}
                        className="bg-gradient-to-r from-kid-green to-kid-blue hover:from-kid-green/90 hover:to-kid-blue/90 text-white shadow-lg px-6 py-2 text-base font-semibold w-full"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {t('calendar.startLesson')}
                      </Button>
                      <p className="text-sm text-kid-green/70 mt-3">
                        {t('calendar.programmedClasses', { count: todayClasses.filter(c => !c.isInterval).length })}
                      </p>
                    </div>
                  </div>

                  {/* Countdown Card */}
                  {nextEvent && (
                     <div className="bg-gradient-to-r from-kid-green/10 to-kid-blue/10 border border-kid-green/20 rounded-xl p-4 mb-4">
                       <div className="text-center">
                          <h3 className="font-semibold text-kid-green mb-1">
                             {nextEvent.isInterval ? t('calendar.nextInterval') : t('calendar.nextLesson')}
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
                          {!classEvent.isInterval && (
                            <Button
                              size="sm"
                              onClick={() => navigate('/aulaia')}
                              className="bg-primary hover:bg-primary/90"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              {t('calendar.startLesson')}
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
                  <p className="text-muted-foreground">{t('calendar.noClasses')}</p>
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
              <CardTitle className="flex items-center justify-between text-kid-green">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {t('calendar.today')}
                </div>
                {todayClasses.length > 0 && (
                  <Button
                    onClick={() => navigate('/aulaia')}
                    className="bg-gradient-to-r from-kid-green to-kid-blue hover:from-kid-green/90 hover:to-kid-blue/90 text-white shadow-md"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {t('calendar.startLesson')}
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
              <CardContent>
                <SubjectsRow schedule={todayClasses} />
                {todayClasses.length > 0 ? (
                  <div className="space-y-3">
                    {/* Botão principal para iniciar aula */}
                    <div className="bg-gradient-to-r from-kid-green/20 to-kid-blue/20 border border-kid-green/30 rounded-xl p-4 mb-4">
                      <div className="text-center">
                        <h3 className="font-semibold text-kid-green mb-3">
                          🎯 {t('calendar.availableToday')}
                        </h3>
                        <Button
                          onClick={() => navigate('/aulaia')}
                          className="bg-gradient-to-r from-kid-green to-kid-blue hover:from-kid-green/90 hover:to-kid-blue/90 text-white shadow-lg px-8 py-3 text-lg font-semibold"
                        >
                          <Play className="h-5 w-5 mr-2" />
                          {t('calendar.startLesson')}
                        </Button>
                        <p className="text-sm text-kid-green/70 mt-3">
                          {t('calendar.programmedClasses', { count: todayClasses.filter(c => !c.isInterval).length })}
                        </p>
                      </div>
                    </div>

                    {/* Countdown Card */}
                    {nextEvent && (
                      <div className="bg-gradient-to-r from-kid-green/10 to-kid-blue/10 border border-kid-green/20 rounded-xl p-4 mb-4">
                        <div className="text-center">
                           <h3 className="font-semibold text-kid-green mb-1">
                             {nextEvent.isInterval ? t('calendar.nextInterval') : t('calendar.nextLesson')}
                           </h3>
                           <p className="text-sm text-kid-green/70 mb-2">
                             {nextEvent.subject || nextEvent.title} - {nextEvent.time}
                           </p>
                          <div className="text-2xl font-bold text-kid-green">
                            {formatCountdown(timeToNext)}
                          </div>
                        </div>
                      </div>
                    )}

                    {todayClasses.map((classEvent, index) => {
                      // Calcular tempo baseado no tipo de evento
                      let eventTime: string;
                      let eventEndTime: string;
                      let eventDuration: number;
                      
                      if ('startMinOfDay' in classEvent) {
                        // Evento do weekSchedule
                        const startH = Math.floor(classEvent.startMinOfDay / 60);
                        const startM = classEvent.startMinOfDay % 60;
                        eventTime = `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')}`;
                        
                        const endMin = classEvent.startMinOfDay + classEvent.durationMin;
                        const endH = Math.floor(endMin / 60);
                        const endM = endMin % 60;
                        eventEndTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
                        eventDuration = classEvent.durationMin;
                      } else {
                        // Evento dos dados mockados
                        eventTime = classEvent.time || '08:00';
                        eventEndTime = classEvent.endTime || '09:00';
                        eventDuration = classEvent.duration || 45;
                      }
                      
                      const timeDiff = getTimeDifference(eventTime, adjustedNow);
                      
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
                              <span className="text-lg">{classEvent.icon || '📚'}</span>
                            </div>
                             <div className="flex-1">
                               <h3 className="font-semibold text-kid-green">{classEvent.subject || classEvent.title}</h3>
                               <p className="text-sm text-kid-green/70">{classEvent.title || classEvent.subject}</p>
                                <div className="flex items-center gap-2 text-xs text-kid-green/60 mt-1">
                                 <Clock className="h-3 w-3" />
                                 {eventTime} - {eventEndTime} ({eventDuration}min)
                               </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                            {!classEvent.isInterval && (
                              <Badge variant="outline" className={getStatusColor(classEvent.status)}>
                                {getStatusText(classEvent.status)}
                              </Badge>
                            )}
                            {!classEvent.isInterval && (
                               <Button
                                 size="sm"
                                 onClick={() => navigate('/aulaia')}
                                 className="bg-gradient-to-r from-kid-green to-kid-blue hover:from-kid-green/90 hover:to-kid-blue/90 text-white shadow-md"
                               >
                                <Play className="h-3 w-3 mr-1" />
                                {t('calendar.startLesson')}
                              </Button>
                            )}
                            </div>
                          </div>
                          {index < todayClasses.length - 1 && !classEvent.isInterval && (
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
                     <p className="text-kid-green/70">{t('calendar.noClasses')} 🌈</p>
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
                    📅 {t('calendar.weeklySchedule')}
                    <Badge variant="outline" className="text-xs bg-kid-yellow/20 text-kid-orange border-kid-yellow/30">
                      {t('calendar.dragInstructions')}
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
                  {t('calendar.dragInstruction')} 🎪
                </p>
              </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                <div className="col-span-7 flex items-center justify-between mb-2">
                  <div className="text-sm text-muted-foreground">
                    {t('calendar.dragInstruction')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant={editMode ? 'default' : 'outline'} size="sm" onClick={toggleEditMode}>
                      {editMode ? t('calendar.editMode') : t('calendar.activateEdit')}
                    </Button>
                    {editMode && (
                      <div className="text-xs text-muted-foreground">
                        {t('calendar.dragInstructions')}
                      </div>
                    )}
                  </div>
                </div>
                {weekDays.map((day, index) => {
                  try {
                    const dayDate = addDays(weekStart, index);
                    const dateISO = dayDate.toISOString().split('T')[0];

                    const daySchedule = weekSchedule?.days.find(d => d.dateISO === dateISO);
                    let dayClasses: any[] = [];
                    let hasClasses = false;
                    let isDraggedOver = editMode && dropTargetDateISO === dateISO;
                    let isDragging = editMode && dragSourceDateISO === dateISO;

                    // Debug removido

                    if (editMode) {
                      dayClasses = editableWeek[dateISO] || [];
                      hasClasses = dayClasses.length > 0;
                    } else if (weekSchedule && daySchedule) {
                      dayClasses = daySchedule.slots.filter(s => s.type === 'class');
                      hasClasses = dayClasses.length > 0;
                    } else {
                      // Fallback para dados mockados se não houver weekSchedule
                      const dayKey = getDayKey(day.short, locale);
                      dayClasses = weekClasses[dayKey] || [];
                      hasClasses = dayClasses.length > 0;
                    }

                    // Garantir que sempre temos dados para renderizar
                    if (!dayClasses || dayClasses.length === 0) {
                      dayClasses = [];
                      hasClasses = false;
                    }

                    const isToday = isSameDay(dayDate, adjustedNow);

                  return (
                    <div
                      key={day.short}
                      className={`space-y-3 relative transition-all duration-200 ${
                        isToday ? 'ring-2 ring-primary rounded-lg p-3' : 'p-3'
                      } ${isDraggedOver ? 'bg-primary/10 ring-2 ring-primary/50 rounded-lg' : ''} ${isDragging ? 'opacity-50 scale-95' : ''}`}
                      draggable={editMode && hasClasses}
                      onDragStart={(e) => handleDragStart(e, dateISO)}
                      onDragOver={handleDragOver}
                      onDragEnter={(e) => handleDragEnter(e, dateISO)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, dateISO)}
                      onDragEnd={handleDragEnd}
                    >
                      {/* Drop zone indicator - removido pois não há mais drag & drop */}

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
                            📋 {t('calendar.programmedClasses', { count: dayClasses.length })}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 relative z-10">
                        {dayClasses.length > 0 ? (
                          dayClasses.map((classEvent) => {
                            const isGeneratedSchedule = 'startMinOfDay' in classEvent;

                            return (
                              <div
                                key={classEvent.id}
                                className="p-3 bg-card border rounded-lg text-xs space-y-1 hover:shadow-sm transition-shadow cursor-pointer"
                              >
                                <div className="flex items-center gap-1">
                                  <span className="text-sm">
                                    {isGeneratedSchedule ? '📚' : classEvent.icon}
                                  </span>
                                  <span className="font-medium truncate">
                                    {isGeneratedSchedule ? classEvent.title : classEvent.subject}
                                  </span>
                                </div>
                                <div className="text-muted-foreground truncate">
                                  {isGeneratedSchedule
                                    ? `${formatTime(classEvent.startMinOfDay)} - ${formatTime(classEvent.startMinOfDay + classEvent.durationMin)}`
                                    : classEvent.title
                                  }
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">
                                    {isGeneratedSchedule ? `${classEvent.durationMin}min` : classEvent.time}
                                  </span>
                                  <Badge variant="outline" className={`text-[10px] py-0 ${
                                    isGeneratedSchedule
                                      ? 'bg-green-100 text-green-700 border-green-200'
                                      : getStatusColor(classEvent.status)
                                  }`}>
                                    {isGeneratedSchedule ? t('calendar.class') : getStatusText(classEvent.status)}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-4 text-muted-foreground text-xs border-2 border-dashed border-muted/50 rounded-lg">
                            {isDraggedOver && editMode ? (
                              t('calendar.dropHere')
                            ) : (
                              t('calendar.noEvents')
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                  } catch (error) {
                    console.error('Erro ao renderizar dia:', error, { day, index });
                    return (
                      <div key={`error-${index}`} className="p-3 text-red-500 text-xs">
                        {t('calendar.renderError')}
                      </div>
                    );
                  }
                })}
              </div>
            </CardContent>
                          {/* Calendário mensal funcional */}
              <MonthMini
                onSelectDate={handleSelectDate}
                className="mt-6"
              />
          </Card>
          </div>

          {/* Today's Timeline (dados reais da semana) */}
          {(() => {
            const todayISO = toISODateLocal(adjustedNow);
            let todayEvents: { id: string; startTime: string; endTime: string; subject: string; title: string; status: string }[] = [];

            if (weekSchedule) {
              const day = weekSchedule.days.find(d => d.dateISO === todayISO);
              if (day) {
                todayEvents = day.slots
                  .filter(s => s.type === 'class')
                  .map(s => {
                    const startH = Math.floor(s.startMinOfDay / 60).toString().padStart(2, '0');
                    const startM = (s.startMinOfDay % 60).toString().padStart(2, '0');
                    const endMin = s.startMinOfDay + s.durationMin;
                    const endH = Math.floor(endMin / 60).toString().padStart(2, '0');
                    const endM = (endMin % 60).toString().padStart(2, '0');
                                       return {
                    id: s.id,
                    startTime: `${startH}:${startM}`,
                    endTime: `${endH}:${endM}`,
                    subject: s.title || '',
                    title: s.subjectId ? s.subjectId : '',
                    status: 'upcoming'
                  };
                  });
              }
            } else if (editMode) {
              const list = editableWeek[todayISO] || [];
              todayEvents = list.map((ev: any, idx: number) => ({
                id: ev.id || `edit-${idx}`,
                startTime: ev.startTime || '08:00',
                endTime: ev.endTime || '09:00',
                subject: ev.title || ev.subject || 'Aula',
                title: ev.subject || '',
                status: 'upcoming'
              }));
            }

            return (
              <DayTimeline
                date={adjustedNow}
                events={todayEvents}
                now={adjustedNow}
                locale={locale}
                timeZone={timeZone}
              />
            );
          })()}
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
                <p className="text-sm text-muted-foreground">{t('calendar.stats.completedThisWeek')}</p>
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
                <p className="text-sm text-muted-foreground">{t('calendar.stats.remainingClasses')}</p>
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
                <p className="text-sm text-muted-foreground">{t('calendar.stats.differentTeachers')}</p>
              </div>
            </div>
          </Card>
        </div>
        </div>
      </div>
    </AppLayout>
  );
}