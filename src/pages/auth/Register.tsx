import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { PasswordStrength } from '@/components/ui/password-strength';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { rateLimiter, SECURITY_CONSTANTS, validatePasswordStrength, sanitizeInput } from '@/lib/security';
import { z } from 'zod';
import EmailVerificationRequired from '@/components/EmailVerificationRequired';

const emailSchema = z.string().email('Email inválido').min(1, 'Email é obrigatório');
const passwordSchema = z.string().min(8, 'Senha deve ter pelo menos 8 caracteres');
const nameSchema = z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo');

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const { signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { logAuthEvent, logFormSubmission, logRateLimitHit } = useSecurityMonitoring();

  // Redirect if already logged in but email not confirmed
  if (user && !user.email_confirmed_at) {
    return <EmailVerificationRequired />;
  }

  // Redirect if logged in and email confirmed
  if (user?.email_confirmed_at) {
    navigate('/dashboard-aluno');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Rate limiting
      if (!rateLimiter.isAllowed('signup', SECURITY_CONSTANTS.MAX_SIGNUP_ATTEMPTS, SECURITY_CONSTANTS.SIGNUP_COOLDOWN_MINUTES)) {
        logRateLimitHit('signup', SECURITY_CONSTANTS.MAX_SIGNUP_ATTEMPTS);
        toast({
          title: 'Muitas tentativas',
          description: `Aguarde ${SECURITY_CONSTANTS.SIGNUP_COOLDOWN_MINUTES} minutos antes de tentar novamente.`,
          variant: 'destructive',
        });
        return;
      }

      // Input sanitization and validation
      const cleanEmail = sanitizeInput(email.toLowerCase());
      const cleanName = sanitizeInput(name);
      
      const emailValidation = emailSchema.safeParse(cleanEmail);
      if (!emailValidation.success) {
        logFormSubmission('signup', false, emailValidation.error.errors.map(e => e.message));
        toast({
          title: 'Erro de validação',
          description: emailValidation.error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }

      const nameValidation = nameSchema.safeParse(cleanName);
      if (!nameValidation.success) {
        logFormSubmission('signup', false, nameValidation.error.errors.map(e => e.message));
        toast({
          title: 'Erro de validação',
          description: nameValidation.error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }

      const passwordValidation = passwordSchema.safeParse(password);
      if (!passwordValidation.success) {
        logFormSubmission('signup', false, passwordValidation.error.errors.map(e => e.message));
        toast({
          title: 'Erro de validação',
          description: passwordValidation.error.errors[0].message,
          variant: 'destructive',
        });
        return;
      }

      // Enhanced password strength validation
      const passwordStrength = validatePasswordStrength(password);
      if (!passwordStrength.isValid) {
        logFormSubmission('signup', false, ['Weak password']);
        toast({
          title: 'Senha muito fraca',
          description: 'Use uma senha mais forte com letras maiúsculas, minúsculas, números e símbolos.',
          variant: 'destructive',
        });
        return;
      }
      
      const { error } = await signUp(cleanEmail, password, cleanName);
      logAuthEvent('signup', !error, error ? { error: error.message } : undefined);
      
      if (error) {
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          toast({
            title: 'Usuário já existe',
            description: 'Este email já está cadastrado. Tente fazer login.',
            variant: 'destructive',
          });
        } else if (error.message.includes('Password')) {
          toast({
            title: 'Erro na senha',
            description: 'A senha não atende aos requisitos de segurança.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro no cadastro',
            description: 'Não foi possível criar a conta. Tente novamente.',
            variant: 'destructive',
          });
        }
      } else {
        rateLimiter.reset('signup');
        toast({
          title: '🎉 Conta criada com sucesso!',
          description: 'Verifique seu e-mail para confirmar a conta antes de acessar a plataforma.',
        });
        // Redirect to login with a message about email confirmation
        navigate('/auth/login');
      }
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
            Criar conta!
          </CardTitle>
          <CardDescription className="text-kid-green/70 font-medium text-lg">
            Crie sua conta para começar!
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-kid-green font-medium">Nome completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Digite seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-2 border-kid-green/30 rounded-xl px-4 py-3 focus:border-kid-green focus:ring-2 focus:ring-kid-green/20 transition-colors"
                required
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="email" className="text-kid-green font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-2 border-kid-green/30 rounded-xl px-4 py-3 focus:border-kid-green focus:ring-2 focus:ring-kid-green/20 transition-colors"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-kid-green font-medium">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua senha secreta"
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

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-kid-green to-kid-blue hover:from-kid-blue hover:to-kid-green text-white font-bold py-4 rounded-xl shadow-lg hover:scale-105 transition-all duration-200"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar conta!'}
            </Button>

            <div className="text-center pt-6 border-t border-kid-green/20">
              <p className="text-sm text-kid-green/70 font-medium">
                Já tem uma conta?
              </p>
              <Link
                to="/auth/login"
                className="text-kid-green hover:text-kid-blue font-bold text-base hover:underline transition-colors"
              >
                Fazer login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}