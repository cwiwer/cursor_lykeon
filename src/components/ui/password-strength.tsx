import { useState, useEffect } from 'react';
import { Progress } from './progress';
import { Shield, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

interface StrengthCriteria {
  label: string;
  met: boolean;
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0);
  const [criteria, setCriteria] = useState<StrengthCriteria[]>([]);

  useEffect(() => {
    const checks = [
      { label: 'Pelo menos 8 caracteres', met: password.length >= 8 },
      { label: 'Uma letra maiúscula', met: /[A-Z]/.test(password) },
      { label: 'Uma letra minúscula', met: /[a-z]/.test(password) },
      { label: 'Um número', met: /\d/.test(password) },
      { label: 'Um caractere especial', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];

    setCriteria(checks);
    const metCount = checks.filter(check => check.met).length;
    setStrength((metCount / checks.length) * 100);
  }, [password]);

  const getStrengthColor = () => {
    if (strength < 40) return 'hsl(var(--destructive))';
    if (strength < 80) return 'hsl(var(--accent))';
    return 'hsl(var(--kid-green))';
  };

  const getStrengthText = () => {
    if (strength < 40) return 'Fraca';
    if (strength < 80) return 'Média';
    return 'Forte';
  };

  if (!password) return null;

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Força da senha: <span style={{ color: getStrengthColor() }}>{getStrengthText()}</span>
        </span>
      </div>
      
      <Progress 
        value={strength} 
        className="h-2"
        style={{
          '--progress-foreground': getStrengthColor(),
        } as React.CSSProperties}
      />
      
      <div className="space-y-1">
        {criteria.map((criterion, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            {criterion.met ? (
              <Check className="h-3 w-3 text-kid-green" />
            ) : (
              <X className="h-3 w-3 text-destructive" />
            )}
            <span className={cn(
              criterion.met ? 'text-kid-green' : 'text-muted-foreground'
            )}>
              {criterion.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}