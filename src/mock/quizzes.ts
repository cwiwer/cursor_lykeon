import { Quiz } from "@/types/quiz";

export const quizzes: Quiz[] = [
  {
    id: "math-1",
    subject: "math",
    title: "Matemática — Frações",
    description: "Teste seus conhecimentos sobre frações e porcentagens",
    difficulty: "easy",
    xpReward: 10,
    questions: [
      {
        id: "q1",
        text: "Quanto é 1/2 + 1/4?",
        options: ["2/4", "3/4", "2/3", "1/6"],
        correctIndex: 1,
        explanation: "1/2 = 2/4, então 2/4 + 1/4 = 3/4"
      },
      {
        id: "q2",
        text: "Qual é 50% de 200?",
        options: ["50", "100", "150", "200"],
        correctIndex: 1,
        explanation: "50% = 0.5, então 0.5 × 200 = 100"
      },
      {
        id: "q3",
        text: "Qual fração é equivalente a 0.75?",
        options: ["1/4", "2/3", "3/4", "4/5"],
        correctIndex: 2,
        explanation: "0.75 = 75/100 = 3/4"
      },
      {
        id: "q4",
        text: "Quanto é 1/3 × 1/2?",
        options: ["1/6", "1/5", "2/3", "1/3"],
        correctIndex: 0,
        explanation: "1/3 × 1/2 = 1/6"
      }
    ]
  },
  {
    id: "lang-1",
    subject: "language",
    title: "Língua Materna — Vocabulário",
    description: "Expanda seu vocabulário com sinônimos e antônimos",
    difficulty: "easy",
    xpReward: 10,
    questions: [
      {
        id: "q1",
        text: "Selecione o sinônimo de 'rápido'",
        options: ["lento", "veloz", "fraco", "forte"],
        correctIndex: 1,
        explanation: "'Veloz' é sinônimo de 'rápido'"
      },
      {
        id: "q2",
        text: "Qual é o plural de 'cão'?",
        options: ["cães", "cãos", "cões", "cãoes"],
        correctIndex: 0,
        explanation: "O plural de 'cão' é 'cães'"
      },
      {
        id: "q3",
        text: "Qual palavra é antônimo de 'grande'?",
        options: ["enorme", "pequeno", "alto", "largo"],
        correctIndex: 1,
        explanation: "'Pequeno' é o antônimo de 'grande'"
      },
      {
        id: "q4",
        text: "Complete: 'O sol é muito ___ hoje'",
        options: ["quente", "frio", "escuro", "claro"],
        correctIndex: 0,
        explanation: "O sol é 'quente', não 'frio'"
      }
    ]
  },
  {
    id: "sci-1",
    subject: "science",
    title: "Ciências — O Corpo Humano",
    description: "Aprenda sobre os órgãos e sistemas do corpo humano",
    difficulty: "medium",
    xpReward: 15,
    questions: [
      {
        id: "q1",
        text: "Qual órgão bombeia o sangue?",
        options: ["Cérebro", "Pulmão", "Coração", "Fígado"],
        correctIndex: 2,
        explanation: "O coração é responsável por bombear o sangue"
      },
      {
        id: "q2",
        text: "Qual gás respiramos para viver?",
        options: ["Oxigênio", "Hidrogênio", "Nitrogênio", "Dióxido de Carbono"],
        correctIndex: 0,
        explanation: "Precisamos do oxigênio para respirar"
      },
      {
        id: "q3",
        text: "Quantos ossos tem o corpo humano adulto?",
        options: ["156", "206", "256", "306"],
        correctIndex: 1,
        explanation: "O corpo humano adulto tem 206 ossos"
      },
      {
        id: "q4",
        text: "Qual é o maior órgão do corpo?",
        options: ["Coração", "Cérebro", "Pele", "Fígado"],
        correctIndex: 2,
        explanation: "A pele é o maior órgão do corpo humano"
      },
      {
        id: "q5",
        text: "O que fazem os glóbulos vermelhos?",
        options: ["Transportam oxigênio", "Combatem doenças", "Coagulam sangue", "Produzem energia"],
        correctIndex: 0,
        explanation: "Os glóbulos vermelhos transportam oxigênio pelo sangue"
      }
    ]
  },
  {
    id: "hist-1",
    subject: "history",
    title: "História — Brasil Colonial",
    description: "Conheça a história do Brasil durante o período colonial",
    difficulty: "medium",
    xpReward: 15,
    questions: [
      {
        id: "q1",
        text: "Em que ano Pedro Álvares Cabral chegou ao Brasil?",
        options: ["1492", "1500", "1501", "1498"],
        correctIndex: 1,
        explanation: "Pedro Álvares Cabral chegou ao Brasil em 1500"
      },
      {
        id: "q2",
        text: "Qual foi a primeira capital do Brasil?",
        options: ["Rio de Janeiro", "São Paulo", "Salvador", "Recife"],
        correctIndex: 2,
        explanation: "Salvador foi a primeira capital do Brasil"
      },
      {
        id: "q3",
        text: "Qual produto foi mais importante na economia colonial?",
        options: ["Café", "Açúcar", "Algodão", "Minérios"],
        correctIndex: 1,
        explanation: "O açúcar foi o produto mais importante da economia colonial"
      }
    ]
  },
  {
    id: "geo-1",
    subject: "geography",
    title: "Geografia — Estados Brasileiros",
    description: "Teste seus conhecimentos sobre a geografia do Brasil",
    difficulty: "easy",
    xpReward: 10,
    questions: [
      {
        id: "q1",
        text: "Qual é a capital do Brasil?",
        options: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"],
        correctIndex: 2,
        explanation: "Brasília é a capital do Brasil desde 1960"
      },
      {
        id: "q2",
        text: "Qual é o maior estado do Brasil?",
        options: ["Amazonas", "Pará", "Mato Grosso", "Minas Gerais"],
        correctIndex: 0,
        explanation: "O Amazonas é o maior estado do Brasil"
      },
      {
        id: "q3",
        text: "Qual região tem mais estados?",
        options: ["Norte", "Nordeste", "Sudeste", "Sul"],
        correctIndex: 1,
        explanation: "O Nordeste tem 9 estados, a região com mais estados"
      }
    ]
  }
];

// Função helper para buscar quizzes por matéria
export function getQuizzesBySubject(subject: string): Quiz[] {
  return quizzes.filter(quiz => quiz.subject === subject);
}

// Função helper para buscar quiz por ID
export function getQuizById(id: string): Quiz | undefined {
  return quizzes.find(quiz => quiz.id === id);
}
