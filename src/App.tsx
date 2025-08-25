import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { StudentProvider } from "@/contexts/StudentContext";
import Index from "./pages/Index";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import Onboarding from "./pages/Onboarding";
import DashboardAluno from "./pages/DashboardAluno";
import Calendario from "./pages/Calendario";
import Aula from "./pages/Aula";
import AulaIA from "./pages/AulaIA";
import Exercicios from "./pages/Exercicios";
import Relatorios from "./pages/Relatorios";
import Mensagens from "./pages/Mensagens";
import AlunoPerfil from "./pages/AlunoPerfil";
import PaisDashboard from "./pages/PaisDashboard";
import SelecionarAluno from "./pages/SelecionarAluno";
import Conquistas from "./pages/Conquistas";
import Notificacoes from "./pages/Notificacoes";
import Configuracoes from "./pages/Configuracoes";
import Assinaturas from "./pages/Assinaturas";
import Quizzes from "./pages/Quizzes";
import QuizPlay from "./pages/QuizPlay";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <StudentProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/dashboard-aluno" element={<ProtectedRoute><DashboardAluno /></ProtectedRoute>} />
            <Route path="/calendario" element={<ProtectedRoute><Calendario /></ProtectedRoute>} />
            <Route path="/aula" element={<ProtectedRoute><Aula /></ProtectedRoute>} />
            <Route path="/aula/:lessonId" element={<ProtectedRoute><Aula /></ProtectedRoute>} />
            <Route path="/aulaia" element={<ProtectedRoute><AulaIA /></ProtectedRoute>} />
            <Route path="/aulaia/:lessonId" element={<ProtectedRoute><AulaIA /></ProtectedRoute>} />
            <Route path="/exercicios" element={<ProtectedRoute><Exercicios /></ProtectedRoute>} />
            <Route path="/relatorios" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
            <Route path="/mensagens" element={<ProtectedRoute><Mensagens /></ProtectedRoute>} />
            <Route path="/aluno/:studentId" element={<ProtectedRoute><AlunoPerfil /></ProtectedRoute>} />
            <Route path="/selecionar-aluno" element={<ProtectedRoute><SelecionarAluno /></ProtectedRoute>} />
            <Route path="/pais/dashboard" element={<ProtectedRoute><PaisDashboard /></ProtectedRoute>} />
            <Route path="/conquistas" element={<ProtectedRoute><Conquistas /></ProtectedRoute>} />
            <Route path="/notificacoes" element={<ProtectedRoute><Notificacoes /></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
            <Route path="/assinaturas" element={<ProtectedRoute><Assinaturas /></ProtectedRoute>} />
            <Route path="/quizzes" element={<ProtectedRoute><Quizzes /></ProtectedRoute>} />
            <Route path="/quizzes/:quizId" element={<ProtectedRoute><QuizPlay /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </StudentProvider>
  </AuthProvider>
</QueryClientProvider>
);

export default App;
