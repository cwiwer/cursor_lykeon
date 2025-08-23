import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { createChild } from '@/services/students';

const languages = [
  { value: 'pt-br', label: 'Português (Brasil)' },
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
];

const grades = [
  'Pré-escola',
  '1º ano',
  '2º ano', 
  '3º ano',
  '4º ano',
  '5º ano',
  '6º ano',
  '7º ano',
  '8º ano',
  '9º ano',
  '1º ano EM',
  '2º ano EM',
  '3º ano EM',
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [studentName, setStudentName] = useState('');
  const [studentAge, setStudentAge] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [studentLanguage, setStudentLanguage] = useState('pt-br');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentAge || !studentGrade) {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha todos os campos',
        variant: 'destructive',
      });
      return;
    }
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Create child using the correct service
      await createChild({
        first_name: studentName,
        grade: studentGrade,
      });

      // Create initial subscription
      await supabase
        .from('subscriptions')
        .insert({
          parent_id: user.id,
          plan: 'monthly',
          status: 'trial',
          renewal_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days trial
        });

      toast({
        title: 'Sucesso!',
        description: `${studentName} foi cadastrado(a) com sucesso!`,
      });

      navigate('/dashboard-aluno');
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Erro ao cadastrar estudante: ' + error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl">L</span>
            </div>
            <CardTitle className="text-2xl">Cadastrar filho(a)</CardTitle>
            <CardDescription>
              Vamos começar conhecendo seu filho ou filha
            </CardDescription>
            <div className="flex gap-2 mt-4">
              <div className="h-2 bg-primary rounded-full flex-1"></div>
              <div className="h-2 bg-muted rounded-full flex-1"></div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite o nome do(a) estudante"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="input-lykeon"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Digite a idade"
                  value={studentAge}
                  onChange={(e) => setStudentAge(e.target.value)}
                  className="input-lykeon"
                  min="3"
                  max="18"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Série</Label>
                <Select value={studentGrade} onValueChange={setStudentGrade} required>
                  <SelectTrigger className="input-lykeon">
                    <SelectValue placeholder="Selecione a série" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full btn-lykeon bg-primary hover:bg-primary/90">
                Próximo passo
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center">
            <span className="text-secondary-foreground font-bold text-2xl">🌍</span>
          </div>
          <CardTitle className="text-2xl">Escolher idioma</CardTitle>
          <CardDescription>
            Em que idioma {studentName} gostaria de aprender?
          </CardDescription>
          <div className="flex gap-2 mt-4">
            <div className="h-2 bg-primary rounded-full flex-1"></div>
            <div className="h-2 bg-primary rounded-full flex-1"></div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFinalSubmit} className="space-y-6">
            <div className="space-y-4">
              {languages.map((lang) => (
                <label
                  key={lang.value}
                  className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${
                    studentLanguage === lang.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="language"
                    value={lang.value}
                    checked={studentLanguage === lang.value}
                    onChange={(e) => setStudentLanguage(e.target.value)}
                    className="sr-only"
                  />
                  <span className="font-medium">{lang.label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button 
                type="submit" 
                className="flex-1 btn-lykeon bg-secondary hover:bg-secondary/90"
                disabled={loading}
              >
                {loading ? 'Carregando...' : 'Começar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}