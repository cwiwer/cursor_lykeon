import React, { useEffect, useMemo, useState } from "react";

export type TimelineBlock = {
  type: "class" | "break";
  label: string;          // ex.: "Matemática", "Intervalo"
  minutes: number;        // duração
  color?: string;         // tailwind bg-* opcional p/ classes
};

type Props = {
  items: TimelineBlock[]; // em ordem cronológica: Aula1, Int1, Aula2, Int2, Aula3
  className?: string;
  dayStart?: { hour: number; minute: number }; // default 08:00
  showRocketMarker?: boolean;          // default true
  rocketSrc?: string;                  // default "/branding/rocket.svg"
  updateEveryMs?: number;              // default 30000
};

// Hook interno para atualização do tempo
function useNow(ms = 30000) {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export default function VerticalDayTimeline({
  items,
  className,
  dayStart = { hour: 8, minute: 0 },
  showRocketMarker = true,
  rocketSrc = "/branding/rocket.svg",
  updateEveryMs = 30000,
}: Props) {
  const total = items.reduce((acc, it) => acc + it.minutes, 0) || 1;

  // minutos desde 00:00
  const toMin = (d: Date) => d.getHours() * 60 + d.getMinutes();
  const now = useNow(updateEveryMs);
  const dayStartMin = dayStart.hour * 60 + dayStart.minute;
  const nowMin = toMin(now);

  // progresso "ao longo do dia letivo"
  const progressMin = Math.max(0, Math.min(nowMin - dayStartMin, total));
  const percent = Math.max(0, Math.min((progressMin / total) * 100, 100)); // Garantir que seja entre 0% e 100%

  // Debug logs
  useEffect(() => {
    console.log('VerticalDayTimeline Debug:', {
      now: now.toLocaleTimeString(),
      dayStartMin,
      nowMin,
      progressMin,
      percent,
      total,
      showRocketMarker,
      rocketSrc
    });
  }, [now, dayStartMin, nowMin, progressMin, percent, total, showRocketMarker, rocketSrc]);

  // Log adicional para o foguete
  useEffect(() => {
    if (showRocketMarker) {
      console.log('Foguete deve ser visível:', {
        showRocketMarker,
        rocketSrc,
        percent,
        top: `${Math.max(5, Math.min(percent, 95))}%`
      });
    }
  }, [showRocketMarker, rocketSrc, percent]);

  return (
    <aside
      className={`relative flex h-full ${className || ""}`}
      aria-label="Linha do tempo do dia letivo"
    >
      {/* Linha vertical */}
      <div className="relative mx-auto w-[6px] rounded-full bg-slate-200 dark:bg-slate-700">
        {/* Pilha de blocos (de baixo para cima) */}
        <div className="absolute inset-0 flex flex-col-reverse justify-start">
          {items.map((it, idx) => {
            const pct = (it.minutes / total) * 100;
            const isClass = it.type === "class";
            const barColor =
              it.color ||
              (isClass ? "bg-emerald-500 dark:bg-emerald-400" : "bg-slate-400/60 dark:bg-slate-500");

            return (
              <div
                key={idx}
                className="relative flex items-center"
                style={{ height: `${pct}%` }}
                aria-label={`${it.label} - ${it.minutes} min`}
              >
                {/* Marcador no eixo */}
                <div className={`mx-auto h-3 w-3 rounded-full ring-2 ring-white dark:ring-slate-900 ${barColor}`}></div>

                {/* Etiqueta compacta (fora do eixo) */}
                <div
                  className="absolute left-4 -translate-y-1/2 select-none"
                  title={`${it.label} • ${it.minutes} min`}
                >
                  <div
                    className={`rounded-full px-2 py-0.5 text-[10px] leading-none shadow-sm border
                    ${isClass ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800"
                              : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700"}`}
                  >
                    {it.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Marcador foguete - SEMPRE VISÍVEL */}
        {showRocketMarker && (
          <>
            {/* Foguete fixo para debug */}
            <div
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-50"
              style={{ 
                top: '30%',
                transform: 'translateX(-50%)'
              }}
              aria-label="Foguete fixo para debug"
            >
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-xl border-2 border-white"
                style={{
                  backgroundColor: '#f97316',
                  border: '2px solid white',
                  boxShadow: '0 8px 12px -1px rgba(0, 0, 0, 0.3)'
                }}
              >
                🚀
              </div>
            </div>
            
            {/* Foguete com posição calculada */}
            <div
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-40"
              style={{ 
                top: `${Math.max(5, Math.min(percent, 95))}%`,
                transform: 'translateX(-50%)'
              }}
              aria-label="Posição calculada na linha do tempo"
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-blue-500"
                style={{
                  backgroundColor: '#3b82f6',
                  border: '2px solid #1d4ed8'
                }}
              >
                📍
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Teste visual para debug */}
      {showRocketMarker && (
        <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full z-50" />
      )}
    </aside>
  );
}
