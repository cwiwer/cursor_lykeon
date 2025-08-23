import { supabase } from "@/integrations/supabase/client";

export interface CalendarEvent {
  id: string;
  title: string;
  subject: string;
  date: string;
  time: string;
  status: "completed" | "no_show" | "prepare" | "time_to_start" | "scheduled";
  duration: number;
}

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const { data: classes, error } = await supabase
    .from("classes")
    .select("*")
    .order("date_time", { ascending: true });

  if (error) {
    console.error("Error fetching calendar events:", error);
    return [];
  }

  return (classes || []).map(c => ({
    id: c.id,
    title: `${c.subject} - ${c.grade}`,
    subject: c.subject,
    date: new Date(c.date_time).toISOString().split('T')[0],
    time: new Date(c.date_time).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    status: "scheduled" as const,
    duration: c.duration
  }));
}

export async function createCalendarEvent(event: Omit<CalendarEvent, 'id'>) {
  const dateTime = new Date(`${event.date} ${event.time}`);
  
  const { data, error } = await supabase
    .from("classes")
    .insert({
      subject: event.subject,
      grade: "3º ano", // default grade
      date_time: dateTime.toISOString(),
      duration: event.duration
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}