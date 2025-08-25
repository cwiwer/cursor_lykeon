export function startOfWeek(d: Date, weekStartsOn: 0|1 = 0) {
  // FIX: Agora sempre começa no domingo (0) por padrão
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  const res = new Date(d); 
  res.setDate(d.getDate() - diff); 
  res.setHours(0, 0, 0, 0); 
  return res;
}

export function addDays(d: Date, n: number) {
  const res = new Date(d); 
  res.setDate(d.getDate() + n); 
  return res;
}

export function formatDate(
  d: Date, 
  locale: string, 
  timeZone?: string, 
  opts?: Intl.DateTimeFormatOptions
) {
  return new Intl.DateTimeFormat(locale, { timeZone, ...opts }).format(d);
}

export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && 
         a.getMonth() === b.getMonth() && 
         a.getDate() === b.getDate();
}

export function prefersHour12(locale: string) {
  // heurística simples: en-* usa 12h; demais 24h
  return /^en(-|$)/i.test(locale);
}

export function getWeekDays(locale: string, weekStart: number = 0) {
  // FIX: Sempre começar no domingo (0) para primeira coluna
  const baseDate = new Date(2024, 0, 7); // 2024-01-07 é domingo
  const days = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + i);
    days.push({
      date,
      short: formatDate(date, locale, undefined, { weekday: 'short' }),
      long: formatDate(date, locale, undefined, { weekday: 'long' }),
      dayOfWeek: date.getDay()
    });
  }
  
  return days;
}

export function getTimePosition(
  time: Date, 
  startHour: number = 7, 
  endHour: number = 21
) {
  const totalMinutes = (endHour - startHour) * 60;
  const minutes = time.getHours() * 60 + time.getMinutes();
  const clamped = Math.max(0, Math.min(minutes - startHour * 60, totalMinutes));
  return (clamped / totalMinutes) * 100;
}
