import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { formatDate, getTimePosition, isSameDay, prefersHour12 } from '@/utils/date';

interface DayTimelineProps {
  date: Date;
  events: Array<{
    id: string;
    startTime: string;
    endTime: string;
    subject: string;
    title: string;
    status: string;
  }>;
  now: Date;
  locale: string;
  timeZone?: string;
}

export function DayTimeline({ date, events, now, locale, timeZone }: DayTimelineProps) {
  const { t } = useTranslation();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [timelineHeight, setTimelineHeight] = useState(0);
  
  const startHour = 7;
  const endHour = 21;
  const totalMinutes = (endHour - startHour) * 60;
  const use12Hour = prefersHour12(locale);
  
  const isToday = isSameDay(date, now);
  // Calcular posição do marcador "Agora"
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowPosition = Math.max(0, Math.min(nowMinutes - startHour * 60, totalMinutes)) / totalMinutes * 100;
  
  // Calcular altura da timeline
  useEffect(() => {
    if (timelineRef.current) {
      setTimelineHeight(timelineRef.current.offsetHeight);
    }
  }, []);
  
  // Gerar marcas de hora
  const hourMarks = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    const hourMinutes = hour * 60 - startHour * 60;
    const position = (hourMinutes / totalMinutes) * 100;
    
    hourMarks.push(
      <div
        key={hour}
        className="absolute left-0 right-0 flex items-center text-xs text-slate-500 font-medium"
        style={{ top: `${position}%` }}
      >
        <div className="w-12 text-right pr-2">
          {formatDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour), locale, timeZone, { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: use12Hour 
          })}
        </div>
        <div className="flex-1 h-px bg-slate-200"></div>
      </div>
    );
  }
  
  // Renderizar eventos
  const renderEvents = () => {
    return events.map((event) => {
      const [eventStartHour, eventStartMin] = event.startTime.split(':').map(Number);
      const [eventEndHour, eventEndMin] = event.endTime.split(':').map(Number);
      
      const startTime = new Date(date);
      startTime.setHours(eventStartHour, eventStartMin, 0, 0);
      
      const endTime = new Date(date);
      endTime.setHours(eventEndHour, eventEndMin, 0, 0);
      
      // Calcular posições manualmente
      const startMinutes = eventStartHour * 60 + eventStartMin - startHour * 60;
      const endMinutes = eventEndHour * 60 + eventEndMin - startHour * 60;
      
      const startPosition = Math.max(0, Math.min(startMinutes, totalMinutes)) / totalMinutes * 100;
      const endPosition = Math.max(0, Math.min(endMinutes, totalMinutes)) / totalMinutes * 100;
      const height = endPosition - startPosition;
      
      return (
        <div
          key={event.id}
          className="absolute left-16 right-2 bg-kid-green/20 border border-kid-green/30 rounded-lg p-2 text-xs"
          style={{
            top: `${startPosition}%`,
            height: `${height}%`,
            minHeight: '24px'
          }}
        >
          <div className="font-medium text-kid-green truncate">{event.subject}</div>
          <div className="text-kid-green/60 text-[10px] truncate">{event.title}</div>
          <div className="text-kid-green/60 text-[10px]">
            {event.startTime} - {event.endTime}
          </div>
        </div>
      );
    });
  };
  
  return (
    <div className="relative bg-white/90 backdrop-blur-sm border border-kid-green/20 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-kid-green" />
        <h3 className="font-semibold text-kid-green">
          {formatDate(date, locale, timeZone, { 
            weekday: 'long', 
            day: '2-digit', 
            month: 'long' 
          })}
        </h3>
        {isToday && (
          <span className="px-2 py-1 bg-kid-green/20 text-kid-green text-xs rounded-full">
            {t('calendar.todayLabel')}
          </span>
        )}
      </div>
      
      <div 
        ref={timelineRef}
        className="relative min-h-[600px] border-l border-slate-200 ml-12"
      >
        {/* Marca de hora atual */}
        {isToday && (
          <div 
            className="absolute left-0 right-0 pointer-events-none z-10"
            style={{ top: `${nowPosition}%` }}
          >
            <div className="flex items-center">
              <div className="w-12 text-right pr-2">
                <div className="text-xs font-medium text-rose-600">
                  {t('calendar.now')}
                </div>
              </div>
              <div className="flex-1 h-0.5 bg-rose-500 opacity-80"></div>
              <div className="ml-2 text-xs bg-rose-500 text-white px-2 py-1 rounded-full">
                {formatDate(now, locale, timeZone, { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: use12Hour 
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Marcas de hora */}
        {hourMarks}
        
        {/* Eventos */}
        {renderEvents()}
      </div>
    </div>
  );
}
