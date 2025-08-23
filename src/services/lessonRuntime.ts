// src/services/lessonRuntime.ts
export type Turn = { role: "teacher" | "student"; text: string; at: number };

export type Session = {
  id: string;
  topicIndex: number;
  transcript: Turn[];
  speaking: boolean;
  muted: boolean;
};

let session: Session | null = null;

export function startLesson(opts: { childId: string; subject?: string; language: "pt"|"en"|"fr" }) {
  session = { 
    id: crypto.randomUUID(), 
    topicIndex: 0, 
    transcript: [], 
    speaking: false, 
    muted: false 
  };
  
  const intro = introText(opts.language);
  session.transcript.push({ role: "teacher", text: intro, at: Date.now() });
  
  return sayTeacher(intro);
}

export function getSession() { 
  return session; 
}

export async function nextTurn(userText?: string) {
  if (!session) return;
  
  if (userText?.trim()) {
    session.transcript.push({ role: "student", text: userText, at: Date.now() });
  }
  
  const reply = generateReply(session, userText);
  session.transcript.push({ role: "teacher", text: reply, at: Date.now() });
  
  return sayTeacher(reply);
}

function introText(lang: "pt"|"en"|"fr") {
  if (lang === "fr") return "Salut! Aujourd'hui, on va découvrir la pente m et les équations linéaires. Prêt à explorer l'algèbre?";
  if (lang === "en") return "Hi! Today we'll discover the slope m and linear equations. Ready to explore algebra?";
  return "Olá! Hoje vamos descobrir a inclinação m e as equações lineares. Pronto para explorar a álgebra?";
}

function generateReply(s: Session, user?: string) {
  // Regra simples por tópico; incrementa topicIndex quando terminar
  const topics = [
    "O que é álgebra e a ideia de variáveis.",
    "Fórmula da inclinação: m = (Y - Y1) / (X - X1).",
    "Exemplo: 5x + 2y = 7, resolvendo para y."
  ];
  
  const t = topics[Math.min(s.topicIndex, topics.length - 1)];
  s.topicIndex = Math.min(s.topicIndex + 1, topics.length - 1);
  
  return t + (user ? " Boa pergunta! Vamos conectar com seu exemplo." : "");
}

let utterance: SpeechSynthesisUtterance | null = null;

export function sayTeacher(text: string) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  
  stopTTS();
  utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0; 
  utterance.pitch = 1.0;
  
  // Configurar idioma baseado no texto
  if (text.includes('Salut')) {
    utterance.lang = 'fr-FR';
  } else if (text.includes('Hi')) {
    utterance.lang = 'en-US';
  } else {
    utterance.lang = 'pt-BR';
  }
  
  window.speechSynthesis.speak(utterance);
}

export function pauseTTS() { 
  window.speechSynthesis.pause(); 
}

export function resumeTTS() { 
  window.speechSynthesis.resume(); 
}

export function stopTTS() { 
  try { 
    window.speechSynthesis.cancel(); 
  } catch {} 
}

export function toggleMute() {
  if (!session) return;
  
  session.muted = !session.muted;
  if (session.muted) {
    stopTTS();
  }
}

export function endLesson() {
  if (session) {
    stopTTS();
    session = null;
  }
}
