import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SecurityBadge } from '@/components/ui/security-badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SecurityLog {
  id: string;
  event_type: string;
  event_data: any;
  created_at: string;
}

export function SecurityStatus() {
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSecurityLogs();
    }
  }, [user]);

  const fetchSecurityLogs = async () => {
    try {
      const { data } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setLogs(data || []);
    } catch (error) {
      console.error('Failed to fetch security logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    if (eventType.includes('login') || eventType.includes('signup')) {
      return <Shield className="h-4 w-4" />;
    }
    if (eventType.includes('rate_limit')) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <Eye className="h-4 w-4" />;
  };

  const getEventBadgeLevel = (eventType: string): "secure" | "warning" | "error" => {
    if (eventType.includes('rate_limit') || eventType.includes('failed')) {
      return 'warning';
    }
    if (eventType.includes('error') || eventType.includes('blocked')) {
      return 'error';
    }
    return 'secure';
  };

  const formatEventTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Status de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Atividade Recente</span>
          <SecurityBadge level="secure" message="Conta Protegida" />
        </div>
        
        {loading ? (
          <div className="text-center text-muted-foreground py-4">
            Carregando atividades...
          </div>
        ) : logs.length > 0 ? (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-2 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2">
                  {getEventTypeIcon(log.event_type)}
                  <span className="text-sm font-medium capitalize">
                    {log.event_type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatEventTime(log.created_at)}
                  </span>
                  <SecurityBadge 
                    level={getEventBadgeLevel(log.event_type)}
                    message={log.event_data?.success ? 'Sucesso' : 'Atenção'}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            Nenhuma atividade registrada
          </div>
        )}

        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>2FA: Inativo</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Sessão Segura</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}