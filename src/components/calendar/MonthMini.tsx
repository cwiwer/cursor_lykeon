import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  getMonthMatrix, 
  addMonths, 
  toISO,
  weekdayNames
} from '@/utils/month';

interface MonthMiniProps {
  onSelectDate?: (date: Date) => void;
  selectedDate?: Date;
  className?: string;
}

export function MonthMini({ onSelectDate, selectedDate, className }: MonthMiniProps) {
  const { t, i18n } = useTranslation();
  const [viewMonth, setViewMonth] = useState<Date>(() => new Date());
  
  // Configurações de locale
  const locale = i18n.language || navigator.language;
  
  // Gerar matriz do mês (sempre domingo primeiro)
  const matrix = getMonthMatrix(viewMonth);
  
  // Estados para destacar
  const todayISO = toISO(new Date());
  const selectedISO = selectedDate ? toISO(selectedDate) : null;
  
  // Navegação de meses
  const prevMonth = () => setViewMonth(addMonths(viewMonth, -1));
  const nextMonth = () => setViewMonth(addMonths(viewMonth, +1));
  const goToday = () => {
    const today = new Date();
    setViewMonth(today);
    onSelectDate?.(today);
  };
  
  // Formatar cabeçalho do mês
  const monthTitle = new Intl.DateTimeFormat(locale, { 
    month: 'long', 
    year: 'numeric' 
  }).format(viewMonth);
  
  // Gerar cabeçalho dos dias da semana (Sunday→Saturday)
  const weekDays = weekdayNames(locale);
  
  return (
    <div className={`bg-white/90 backdrop-blur-sm border border-kid-green/20 rounded-xl p-4 shadow-sm ${className || ''}`}>
      <div className="font-bold text-kid-green mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          📅 {monthTitle}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevMonth}
            className="h-8 w-8 p-0"
            aria-label={t('calendar.month.prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToday}
            className="h-8 px-3"
          >
            {t('calendar.today')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
            className="h-8 w-8 p-0"
            aria-label={t('calendar.month.next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 text-[11px] font-semibold text-slate-500 mb-2">
        {weekDays.map((day, index) => (
          <div key={index} className="p-2 text-center">{day}</div>
        ))}
      </div>
      
      {/* Grid dos dias */}
      <div className="grid grid-cols-7 gap-[1px] bg-slate-200 rounded-md overflow-hidden text-xs">
        {matrix.flat().map((cell) => {
          const isToday = cell.iso === todayISO;
          const isSelected = cell.iso === selectedISO;
          
          return (
            <button
              key={cell.iso}
              onClick={() => onSelectDate?.(cell.date)}
              className={[
                "min-h-[68px] bg-white p-2 text-left transition-colors",
                !cell.inCurrentMonth 
                  ? "text-slate-400/70 dark:text-slate-500" 
                  : "text-slate-800 dark:text-slate-100",
                isSelected 
                  ? "bg-indigo-600 text-white" 
                  : "bg-transparent",
                isToday && !isSelected 
                  ? "ring-2 ring-indigo-500" 
                  : "",
                "hover:bg-slate-100 dark:hover:bg-slate-800"
              ].join(" ")}
              aria-pressed={isSelected}
              aria-current={isToday ? "date" : undefined}
            >
              <div className="font-bold mb-1">
                {cell.date.getDate()}
              </div>
              
              {/* Eventos de exemplo (mantidos do código original) */}
              {cell.inCurrentMonth && cell.date.getDate() % 5 === 0 && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-kid-blue/20 text-kid-blue border border-kid-blue/30 text-[10px]">
                  Exercício
                </span>
              )}
              {cell.inCurrentMonth && cell.date.getDate() % 7 === 0 && (
                <span className="inline-block mt-1 ml-1 px-2 py-0.5 rounded bg-kid-orange/20 text-kid-orange border border-kid-orange/30 text-[10px]">
                  Leitura
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
