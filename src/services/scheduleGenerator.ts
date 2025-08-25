import { WeekSchedule, DaySchedule, LessonSlot, SubjectId } from "@/types/schedule";
import { SUBJECTS_GRADE3, SUBJECT_TARGETS, SUBJECT_PREFERRED_ORDER, LANGUAGE_SUBJECT_MAPPING } from "@/mock/subjects-grade3";

// Configurações de horário
const DAY_START_MIN = 8 * 60; // 08:00
const DUR_1 = 45, BREAK_1 = 10, DUR_2 = 45, BREAK_2 = 10, DUR_3 = 30;

// Utilitários de data para evitar problemas de timezone (UTC vs Local)
function toISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function parseISODateLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, (m as number) - 1, d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

// COMPORTAMENTO PADRÃO:
// - weekStart SEMPRE deve ser DOMINGO (0)
// - Aulas APENAS de segunda a sexta (dias úteis: 1,2,3,4,5)
// - Domingo (0) e sábado (6) ficam COMPLETAMENTE vazios (sem aulas)
// - 3 aulas por dia útil (45min + 10min + 45min + 10min + 30min)
// - ORDEM: Domingo(0) → Segunda(1) → Terça(2) → Quarta(3) → Quinta(4) → Sexta(5) → Sábado(6)

// PRNG simples para desempates (xorshift)
class SimplePRNG {
  private state: number;
  
  constructor(seed: string) {
    this.state = this.hashString(seed);
  }
  
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  next(): number {
    this.state ^= this.state << 13;
    this.state ^= this.state >> 17;
    this.state ^= this.state << 5;
    return (this.state >>> 0) / 4294967295; // Normalize to [0,1)
  }
}

// Helper para rotular a matéria no idioma
export function subjectLabel(id: SubjectId, locale: string = 'pt'): string {
  const labels: Record<string, Record<SubjectId, string>> = {
    pt: {
      portugues: "Português",
      matematica: "Matemática",
      ciencias: "Ciências",
      historia: "História",
      geografia: "Geografia",
      ingles: "Inglês",
      frances: "Francês",
      artes: "Artes",
      educacao_fisica: "Educação Física",
      musica: "Música",
      projeto_leitura: "Projeto de Leitura"
    },
    en: {
      portugues: "Portuguese",
      matematica: "Mathematics",
      ciencias: "Science",
      historia: "History",
      geografia: "Geography",
      ingles: "English",
      frances: "French",
      artes: "Arts",
      educacao_fisica: "Physical Education",
      musica: "Music",
      projeto_leitura: "Reading Project"
    },
    fr: {
      portugues: "Portugais",
      matematica: "Mathématiques",
      ciencias: "Sciences",
      historia: "Histoire",
      geografia: "Géographie",
      ingles: "Anglais",
      frances: "Français",
      artes: "Arts",
      educacao_fisica: "Éducation Physique",
      musica: "Musique",
      projeto_leitura: "Projet de Lecture"
    }
  };
  
  return labels[locale]?.[id] || labels.pt[id] || id;
}

// Gerar slots para um dia útil
function generateDaySlots(dateISO: string, subjects: SubjectId[], prng: SimplePRNG, locale: string = 'pt'): LessonSlot[] {
  const slots: LessonSlot[] = [];
  let currentTime = DAY_START_MIN;
  
  // Aula 1 (45 min)
  slots.push({
    id: `${dateISO}-class-1`,
    dateISO,
    startMinOfDay: currentTime,
    durationMin: DUR_1,
    type: "class",
    subjectId: subjects[0],
    title: subjectLabel(subjects[0], locale)
  });
  currentTime += DUR_1;
  
  // Intervalo 1 (10 min)
  slots.push({
    id: `${dateISO}-break-1`,
    dateISO,
    startMinOfDay: currentTime,
    durationMin: BREAK_1,
    type: "break"
  });
  currentTime += BREAK_1;
  
  // Aula 2 (45 min)
  slots.push({
    id: `${dateISO}-class-2`,
    dateISO,
    startMinOfDay: currentTime,
    durationMin: DUR_2,
    type: "class",
    subjectId: subjects[1],
    title: subjectLabel(subjects[1], locale)
  });
  currentTime += DUR_2;
  
  // Intervalo 2 (10 min)
  slots.push({
    id: `${dateISO}-break-2`,
    dateISO,
    startMinOfDay: currentTime,
    durationMin: BREAK_2,
    type: "break"
  });
  currentTime += BREAK_2;
  
  // Aula 3 (30 min)
  slots.push({
    id: `${dateISO}-class-3`,
    dateISO,
    startMinOfDay: currentTime,
    durationMin: DUR_3,
    type: "class",
    subjectId: subjects[2],
    title: subjectLabel(subjects[2], locale)
  });
  
  return slots;
}

// Gerar grade semanal (DOMINGO a SÁBADO, com aulas apenas de segunda a sexta)
// IMPORTANTE: weekStartISO deve ser sempre DOMINGO
export function getWeekSchedule(params: {
  childId: string;
  weekStartISO: string; // DEVE SER DOMINGO
  locale?: string;
  seed?: string;
}): WeekSchedule {
  const { childId, weekStartISO, locale = 'pt', seed } = params;
  const prngSeed = seed || `${childId}-${weekStartISO}`;
  const prng = new SimplePRNG(prngSeed);
  
  // Ajustar disciplinas baseado no idioma do aplicativo
  const appLocale = locale.split('-')[0]; // pt-BR -> pt
  
  // Criar cópia dos contadores e ajustar baseado no idioma
  const adjustedTargets = { ...SUBJECT_TARGETS };
  
  // Resetar todas as línguas para 0 primeiro
  adjustedTargets.portugues = 0;
  adjustedTargets.ingles = 0;
  adjustedTargets.frances = 0;
  
  // Configurar baseado no idioma do app
  switch (appLocale) {
    case 'pt':
      // App em português → 4 aulas de "Português" + 2 de "Inglês" 
      adjustedTargets.portugues = 4;
      adjustedTargets.ingles = 2;
      break;
    case 'en':
      // App em inglês → 4 de "English" + 2 de "French"
      adjustedTargets.ingles = 4;
      adjustedTargets.frances = 2;
      break;
    case 'fr':
      // App em francês → 2 de "Anglais" + 4 de "Français"
      adjustedTargets.ingles = 2;
      adjustedTargets.frances = 4;
      break;
    default:
      // Fallback para português
      adjustedTargets.portugues = 4;
      adjustedTargets.ingles = 2;
      break;
  }
  
  // Gerar lista de disciplinas disponíveis baseada no idioma
  const availableSubjects = SUBJECTS_GRADE3.filter(subject => {
    // Incluir disciplina se tiver carga horária > 0
    return adjustedTargets[subject] > 0;
  });
  
  console.log('Disciplinas disponíveis para', appLocale, ':', availableSubjects);
  console.log('Carga horária ajustada:', adjustedTargets);
  
  // Gerar 7 datas a partir do início da semana (interpretando ISO como data LOCAL)
  const weekStart = parseISODateLocal(weekStartISO);
  const days: DaySchedule[] = [];
  
  // Contadores para balancear a carga semanal
  const weeklyCounts: Record<SubjectId, number> = { ...adjustedTargets };
  
  // Última matéria de cada dia para evitar repetição consecutiva
  let lastSubject: SubjectId | null = null;
  
  // IMPORTANTE: weekStart deve ser DOMINGO, então:
  // i=0 = Domingo (0), i=1 = Segunda (1), i=2 = Terça (2), ..., i=6 = Sábado (6)
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + i);
    const dateISO = toISODateLocal(currentDate);
    const dayOfWeek = currentDate.getDay();
    
    // Debug removido
    
    // REGRA: Apenas Segunda (1) a Sexta (5) têm aulas
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Fim de semana: sem aulas
      days.push({
        dateISO,
        slots: []
      });
      continue;
    }
    
    // Dia útil: gerar aulas
    
    // Para dias úteis, gerar 3 disciplinas
    const dayAvailableSubjects = [...availableSubjects].filter(subject => 
      weeklyCounts[subject] > 0 && subject !== lastSubject
    );
    
    // Se não há disciplinas disponíveis, resetar contadores das disciplinas do idioma
    if (dayAvailableSubjects.length < 3) {
      availableSubjects.forEach(subject => {
        weeklyCounts[subject] = adjustedTargets[subject];
      });
    }
    
    // Escolher 3 disciplinas seguindo prioridades
    const selectedSubjects: SubjectId[] = [];
    const tempAvailable = [...dayAvailableSubjects];
    
    // Primeira aula: priorizar ordem preferencial das disciplinas disponíveis
    const firstSubject = tempAvailable.find(subject => 
      weeklyCounts[subject] > 0 && subject !== lastSubject
    ) || tempAvailable[0];
    
    if (firstSubject) {
      selectedSubjects.push(firstSubject);
      weeklyCounts[firstSubject]--;
      tempAvailable.splice(tempAvailable.indexOf(firstSubject), 1);
    }
    
    // Segunda aula: evitar repetir a primeira
    const secondSubject = tempAvailable.find(subject => 
      weeklyCounts[subject] > 0 && subject !== firstSubject
    ) || tempAvailable[0];
    
    if (secondSubject) {
      selectedSubjects.push(secondSubject);
      weeklyCounts[secondSubject]--;
      tempAvailable.splice(tempAvailable.indexOf(secondSubject), 1);
    }
    
    // Terceira aula: qualquer disponível
    const thirdSubject = tempAvailable.find(subject => 
      weeklyCounts[subject] > 0
    ) || tempAvailable[0];
    
    if (thirdSubject) {
      selectedSubjects.push(thirdSubject);
      weeklyCounts[thirdSubject]--;
    }
    
    // Se ainda faltam disciplinas, preencher com qualquer das disciplinas do idioma
    while (selectedSubjects.length < 3 && availableSubjects.length > 0) {
      const remainingSubject = availableSubjects.find(subject => 
        weeklyCounts[subject] > 0
      );
      
      if (remainingSubject) {
        selectedSubjects.push(remainingSubject);
        weeklyCounts[remainingSubject]--;
      } else {
        // Resetar contadores das disciplinas do idioma se necessário
        availableSubjects.forEach(subject => {
          weeklyCounts[subject] = adjustedTargets[subject];
        });
        const fallbackSubject = availableSubjects[selectedSubjects.length % availableSubjects.length];
        selectedSubjects.push(fallbackSubject);
        weeklyCounts[fallbackSubject]--;
      }
    }
    
    // Atualizar última matéria para evitar repetição no próximo dia
    lastSubject = selectedSubjects[2];
    
    // Gerar slots para o dia
    const slots = generateDaySlots(dateISO, selectedSubjects, prng, locale);
    
    days.push({
      dateISO,
      slots
    });
  }
  
  // Logs de debug removidos após validação
  
  return {
    weekStartISO,
    days
  };
}

// Obter grade de um dia específico (respeita comportamento padrão: fim de semana vazio)
// IMPORTANTE: weekStartISO deve ser sempre DOMINGO da semana
export function getDaySchedule(params: {
  childId: string;
  dateISO: string;
  weekStartISO?: string; // DEVE SER DOMINGO da semana
  locale?: string;
}): DaySchedule {
  const { childId, dateISO, weekStartISO, locale = 'pt' } = params;
  
  // Se não forneceu weekStartISO, calcular a partir da data (interpretando ISO como LOCAL)
  const targetDate = parseISODateLocal(dateISO);
  const dayOfWeek = targetDate.getDay();
  const calculatedWeekStart = new Date(targetDate);
  calculatedWeekStart.setDate(targetDate.getDate() - dayOfWeek);
  
  const weekSchedule = getWeekSchedule({
    childId,
    weekStartISO: weekStartISO || toISODateLocal(calculatedWeekStart),
    locale
  });
  
  // Encontrar o dia específico
  const daySchedule = weekSchedule.days.find(day => day.dateISO === dateISO);
  
  if (!daySchedule) {
    // Retornar dia vazio se não encontrado
    return {
      dateISO,
      slots: []
    };
  }
  
  return daySchedule;
}
