import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, RefreshCw, LogOut } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { supabase } from '@/integrations/supabase/client';

export default function EmailVerificationRequired() {
  const [loading, setLoading] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleResendConfirmation = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/login`
        }
      });

      if (error) {
        toast({
          title: 'Erro ao reenviar',
          description: 'Não foi possível reenviar o e-mail de confirmação. Tente novamente.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: '📧 E-mail reenviado!',
          description: 'Verifique sua caixa de entrada para confirmar sua conta.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.',
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-kid-green/20 via-kid-blue/10 to-kid-yellow/15 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-xl border-2 border-kid-green/20 rounded-3xl overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-r from-kid-green/10 to-kid-blue/10 border-b border-kid-green/20 pb-6">
          <div className="mx-auto mb-4">
            <Logo size="lg" variant="light" className="justify-center" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-kid-green to-kid-blue bg-clip-text text-transparent">
            📧 Confirme seu e-mail
          </CardTitle>
          <CardDescription className="text-kid-green/70 font-medium text-lg">
            Verifique sua caixa de entrada para confirmar sua conta antes de acessar a plataforma 🔐
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="bg-kid-green/10 rounded-2xl p-6 border border-kid-green/20">
              <Mail className="h-16 w-16 text-kid-green mx-auto mb-4" />
              <h3 className="text-xl font-bold text-kid-green mb-2">
                E-mail enviado para:
              </h3>
              <p className="text-kid-green/70 font-medium break-all">
                {user?.email}
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-kid-green/70">
                Clique no link do e-mail para confirmar sua conta e fazer login na plataforma.
              </p>
              
              <Button 
                onClick={handleResendConfirmation}
                disabled={loading}
                variant="outline"
                className="w-full border-2 border-kid-green text-kid-green hover:bg-kid-green hover:text-white rounded-xl py-3"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reenviar e-mail
                  </>
                )}
              </Button>

              <Button 
                onClick={handleSignOut}
                variant="ghost"
                className="w-full text-kid-green/70 hover:text-kid-green rounded-xl py-3"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair da conta
              </Button>
            </div>

            <div className="text-xs text-kid-green/50 space-y-2">
              <p>💡 Verifique também sua pasta de spam</p>
              <p>🕐 O link de confirmação expira em 24 horas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}