export type DayCell = {
  date: Date;
  inCurrentMonth: boolean;
  iso: string; // YYYY-MM-DD
};

// FIX: Removido - agora sempre domingo primeiro
// export function weekStartsOnFromLocale(locale: string): 0|1 {
//   return /^en(-|$)/i.test(locale) ? 0 : 1;
// }

export function startOfMonth(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  x.setHours(12,0,0,0); // evita efeitos de DST
  return x;
}

export function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  x.setHours(12,0,0,0);
  return x;
}

export function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

// FIX: semana começa no domingo
export const WEEK_STARTS_ON: 0 = 0; // 0 = Sunday

/** Matriz 6x7 do mês, com primeira coluna = Domingo */
export function getMonthMatrix(viewDate: Date): DayCell[][] {
  const first = startOfMonth(viewDate);
  const firstWeekday = first.getDay(); // 0..6 (Sun..Sat)
  const offset = (7 + firstWeekday - WEEK_STARTS_ON) % 7;

  const days: DayCell[] = [];
  const start = new Date(first);
  start.setDate(first.getDate() - offset);
  start.setHours(12,0,0,0);

  for (let i = 0; i < 42; i++) {
    const cur = new Date(start);
    cur.setDate(start.getDate() + i);
    cur.setHours(12,0,0,0);
    days.push({
      date: cur,
      inCurrentMonth: cur.getMonth() === viewDate.getMonth(),
      iso: toISO(cur),
    });
  }

  const matrix: DayCell[][] = [];
  for (let r = 0; r < 6; r++) matrix.push(days.slice(r * 7, r * 7 + 7));
  return matrix;
}

/** Nomes curtos dos dias, sempre Sunday→Saturday, no idioma/locale informado */
export function weekdayNames(locale: string): string[] {
  // Ref: usar datas UTC para "fixar" os dias da semana
  const baseSundayUTC = new Date(Date.UTC(2021, 7, 1)); // 2021-08-01 é domingo
  const fmt = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseSundayUTC);
    d.setUTCDate(baseSundayUTC.getUTCDate() + i); // 0=Sun..6=Sat
    return fmt.format(d);
  });
}
