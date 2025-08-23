import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { PasswordStrength } from '@/components/ui/password-strength';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { validatePasswordStrength, sanitizeInput } from '@/lib/security';
import { z } from 'zod';
import EmailVerificationRequired from '@/components/EmailVerificationRequired';

const emailSchema = z.string().email('Email inválido').min(1, 'Email é obrigatório');
const passwordSchema = z.string().min(8, 'Senha deve ter pelo menos 8 caracteres');

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const { resetPassword, updatePassword, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logAuthEvent } = useSecurityMonitoring();

  // Função para extrair tokens do hash da URL (formato do Supabase)
  const extractTokensFromHash = () => {
    const hash = window.location.hash.substring(1); // Remove o #
    const params = new URLSearchParams(hash);
    return {
      accessToken: params.get('access_token'),
      refreshToken: params.get('refresh_token'),
      type: params.get('type')
    };
  };

  // Check if we're in password update mode (user clicked reset link)
  useEffect(() => {
    const mode = searchParams.get('mode');
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');
    const hash = window.location.hash;
    
    // Verificar múltiplas formas de detectar o modo de reset
    const isResetMode = 
      mode === 'reset' || // Parâmetro que adicionamos
      (accessToken && refreshToken && type === 'recovery') || // Tokens do Supabase
      (hash && hash.includes('access_token') && hash.includes('refresh_token')); // Hash do Supabase
    
    if (isResetMode) {
      setIsResetMode(true);
      logAuthEvent('password_reset_link_accessed', true, { 
        timestamp: new Date().toISOString() 
      });
      console.log('Modo de reset ativado');
    }
  }, [searchParams, logAuthEvent]);

  // Se estiver no modo de reset, não redirecionar (permitir alteração de senha)
  // Se não estiver no modo de reset e usuário estiver logado, redirecionar para dashboard
  if (!isResetMode && user?.email_confirmed_at) {
    navigate('/dashboard-aluno');
    return null;
  }

  // If user is logged in but email not confirmed, and not in reset mode
  if (user && !user.email_confirmed_at && !isResetMode) {
    return <EmailVerificationRequired />;
  }

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanEmail = sanitizeInput(email.toLowerCase());
      
      const emailValidation = emailSchema.safeParse(cleanEmail);
      if (!emailValidation.success) {
        toast({
          title: 'Erro de validação',
          description: emailValidation.error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }

      const { error } = await resetPassword(cleanEmail);
      
      if (error) {
        logAuthEvent('password_reset_request', false, { 
          email: cleanEmail, 
          error: error.message 
        });
        toast({
          title: 'Erro ao enviar email',
          description: 'Não foi possível enviar o email de redefinição. Tente novamente.',
          variant: 'destructive',
        });
      } else {
        logAuthEvent('password_reset_request', true, { 
          email: cleanEmail 
        });
        toast({
          title: '📧 Email enviado!',
          description: 'Se o email estiver cadastrado, enviamos instruções de redefinição de senha.',
        });
        // Don't navigate away, let user try again if needed
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const passwordValidation = passwordSchema.safeParse(password);
      if (!passwordValidation.success) {
        toast({
          title: 'Erro de validação',
          description: passwordValidation.error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }

      if (password !== confirmPassword) {
        toast({
          title: 'Senhas não coincidem',
          description: 'As senhas digitadas não são iguais.',
          variant: 'destructive',
        });
        return;
      }

      // Enhanced password strength validation
      const passwordStrength = validatePasswordStrength(password);
      if (!passwordStrength.isValid) {
        toast({
          title: 'Senha muito fraca',
          description: 'Use uma senha mais forte com letras maiúsculas, minúsculas, números e símbolos.',
          variant: 'destructive',
        });
        return;
      }

      // Se estamos no modo de reset, precisamos usar os tokens para autenticar antes de alterar a senha
      if (isResetMode) {
        // Extrair tokens do hash se necessário
        let tokens = {
          accessToken: searchParams.get('access_token'),
          refreshToken: searchParams.get('refresh_token')
        };
        
        if (!tokens.accessToken || !tokens.refreshToken) {
          const hashTokens = extractTokensFromHash();
          tokens = hashTokens;
        }
        
        if (tokens.accessToken && tokens.refreshToken) {
          console.log('Usando tokens para autenticação antes de alterar senha');
          // Aqui você pode implementar a lógica para usar os tokens se necessário
        }
      }

      const { error } = await updatePassword(password);
      
      if (error) {
        logAuthEvent('password_reset', false, { 
          error: error.message
        });
        toast({
          title: 'Erro ao redefinir senha',
          description: 'Não foi possível atualizar a senha. Tente novamente.',
          variant: 'destructive',
        });
      } else {
        logAuthEvent('password_reset', true, { 
          timestamp: new Date().toISOString() 
        });
        toast({
          title: '🎉 Senha redefinida!',
          description: 'Sua senha foi atualizada com sucesso. Você será redirecionado.',
        });
        
        // Redirecionar após sucesso
        setTimeout(() => {
          navigate('/dashboard-aluno', { replace: true });
        }, 2000);
      }
    } catch (unexpectedError) {
      logAuthEvent('password_reset_error', false, { 
        error: unexpectedError instanceof Error ? unexpectedError.message : 'Erro desconhecido'
      });
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
            {isResetMode ? 'Nova Senha' : 'Recuperar Senha'}
          </CardTitle>
          <CardDescription className="text-kid-green/70 font-medium text-lg">
            {isResetMode 
              ? 'Digite sua nova senha para continuar 🛡️'
              : 'Digite seu email para receber instruções 📧'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {!isResetMode ? (
            // Send reset email form
            <form onSubmit={handleSendResetEmail} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-kid-green font-medium">Email 📧</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Digite seu email cadastrado"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 border-kid-green/30 rounded-xl px-4 py-3 focus:border-kid-green focus:ring-2 focus:ring-kid-green/20 transition-colors"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-kid-green to-kid-blue hover:from-kid-blue hover:to-kid-green text-white font-bold py-4 rounded-xl shadow-lg hover:scale-105 transition-all duration-200"
                disabled={loading}
              >
                {loading ? '📤 Enviando...' : '📧 Enviar instruções'}
              </Button>

              <div className="text-center pt-6 border-t border-kid-green/20">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-2 text-kid-green hover:text-kid-blue font-medium hover:underline transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar ao login
                </Link>
              </div>
            </form>
          ) : (
            // Update password form
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="password" className="text-kid-green font-medium">Nova Senha 🔐</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua nova senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setShowPasswordStrength(true)}
                    onBlur={() => setShowPasswordStrength(false)}
                    className="border-2 border-kid-green/30 rounded-xl px-4 py-3 pr-12 focus:border-kid-green focus:ring-2 focus:ring-kid-green/20 transition-colors"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-kid-green hover:text-kid-blue"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                
                {/* Password Strength Indicator */}
                {(showPasswordStrength || password.length > 0) && (
                  <PasswordStrength password={password} className="mt-2" />
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-kid-green font-medium">Confirmar Senha ✅</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Digite novamente sua senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-2 border-kid-green/30 rounded-xl px-4 py-3 pr-12 focus:border-kid-green focus:ring-2 focus:ring-kid-green/20 transition-colors"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-kid-green hover:text-kid-blue"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-kid-green to-kid-blue hover:from-kid-blue hover:to-kid-green text-white font-bold py-4 rounded-xl shadow-lg hover:scale-105 transition-all duration-200"
                disabled={loading}
              >
                {loading ? '🔄 Atualizando...' : '🛡️ Redefinir senha'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}