import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/ui/logo';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const { user, loading, demoSignUp } = useAuth();
  const navigate = useNavigate();
  const [demoEmail, setDemoEmail] = useState('');
  const [isSubmittingDemo, setIsSubmittingDemo] = useState(false);

  useEffect(() => {
    // Redirect if already logged in and email not confirmed (but not demo users)
    if (user && !user.email_confirmed_at && !user.user_metadata?.is_demo) {
      navigate('/auth/login');
      return;
    }

    // Redirect logged in users (including demo users) to dashboard
    if (!loading && user) {
      navigate('/dashboard-aluno');
    }
  }, [user, loading, navigate]);

  const handleDemoSignUp = async () => {
    if (!demoEmail.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira seu email para continuar com a demo.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingDemo(true);
    try {
      const { error } = await demoSignUp(demoEmail);
      if (error) {
        toast({
          title: "Erro no cadastro demo",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Demo ativada!",
          description: "Entrando na plataforma...",
        });
        setDemoEmail('');
        // Redirect will happen automatically via useEffect when user state updates
      }
    } finally {
      setIsSubmittingDemo(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kid-green/20 via-kid-blue/10 to-kid-yellow/15 flex items-center justify-center p-4">
      <div className="text-center max-w-md bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 border-kid-green/20">
        <div className="mx-auto mb-8">
          <Logo size="xl" variant="light" className="justify-center" />
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-kid-green to-kid-blue bg-clip-text text-transparent">
          Bem-vindo à Lykeon!
        </h1>
        <p className="text-xl text-kid-green/70 mb-8 font-medium">
          A plataforma educacional que transforma o aprendizado
        </p>
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/auth/login')} 
            className="w-full bg-gradient-to-r from-kid-green to-kid-blue hover:from-kid-blue hover:to-kid-green text-white font-bold py-4 rounded-full shadow-lg hover:scale-105 transition-all duration-200"
          >
            Entrar
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-kid-green/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/90 px-2 text-kid-green/60">ou</span>
            </div>
          </div>

          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Seu email para demo"
              value={demoEmail}
              onChange={(e) => setDemoEmail(e.target.value)}
              className="w-full"
            />
            <Button 
              onClick={handleDemoSignUp}
              disabled={isSubmittingDemo}
              variant="outline"
              className="w-full border-kid-green/30 text-kid-green hover:bg-kid-green/10 font-medium py-3 rounded-full transition-all duration-200"
            >
              {isSubmittingDemo ? 'Processando...' : 'Testar Demo'}
            </Button>
          </div>
          
          <p className="text-sm text-kid-green/60 font-medium">
            Não tem uma conta? <button 
              onClick={() => navigate('/auth/register')} 
              className="text-kid-green hover:text-kid-blue font-bold hover:underline transition-colors"
            >
              Crie uma aqui!
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
