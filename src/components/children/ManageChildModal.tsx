import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Trash2, UserMinus, Loader2 } from 'lucide-react';
import { unlinkOrDeleteChild } from '@/services/students';
import { supabase } from '@/integrations/supabase/client';

type ManageChildModalProps = {
  open: boolean;
  onClose: () => void;
  child: { id: string; first_name: string; grade?: string | null };
  onChanged?: () => void; // chamado após unlink/delete
};

export function ManageChildModal({ open, onClose, child, onChanged }: ManageChildModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [action, setAction] = useState<'unlink' | 'delete' | null>(null);
  const [confirmName, setConfirmName] = useState('');
  const [loading, setLoading] = useState(false);

  // Função para testar se a RPC existe
  const testRPCFunction = async () => {
    try {
      console.log('🔍 Testando se a função RPC existe...');
      const { data, error } = await supabase.rpc('unlink_or_delete_child', { 
        p_child_id: '00000000-0000-0000-0000-000000000000' // ID fake para teste
      });
      console.log('Teste RPC - data:', data);
      console.log('Teste RPC - error:', error);
    } catch (error) {
      console.log('Teste RPC - erro capturado:', error);
    }
  };

  // Executar teste quando o modal abrir (apenas para debug)
  React.useEffect(() => {
    if (open) {
      console.log('Modal aberto para criança:', child);
      testRPCFunction(); // Executar teste para debug
    }
  }, [open]);

  const handleUnlink = async () => {
    setLoading(true);
    try {
      const result = await unlinkOrDeleteChild(child.id);
      
      if (result === 'unlinked') {
        toast({
          title: t('children.unlinkSuccess', 'Vínculo removido'),
          description: `${child.first_name} foi removido do seu perfil.`,
        });
        onChanged?.();
        onClose();
      } else {
        // Se retornou 'deleted', significa que era o último responsável
        toast({
          title: t('children.deleteSuccess', 'Criança excluída'),
          description: `${child.first_name} foi excluído definitivamente.`,
        });
        onChanged?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Erro ao remover vínculo:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      if (error.message?.includes('forbidden')) {
        toast({
          title: t('children.errorForbidden', 'Sem permissão'),
          description: t('children.errorForbidden', 'Você não tem permissão para alterar esta criança.'),
          variant: 'destructive',
        });
      } else if (error.message?.includes('function unlink_or_delete_child')) {
        toast({
          title: 'Função não encontrada',
          description: 'A função de exclusão não está disponível. Contate o suporte.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('children.errorGeneric', 'Erro'),
          description: `Erro: ${error.message || 'Não foi possível concluir a ação. Tente novamente.'}`,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
      setAction(null);
      setConfirmName('');
    }
  };

  const handleDelete = async () => {
    if (confirmName.trim().toLowerCase() !== child.first_name.toLowerCase()) {
      toast({
        title: 'Nome incorreto',
        description: 'Digite o primeiro nome da criança para confirmar a exclusão.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await unlinkOrDeleteChild(child.id);
      
      if (result === 'deleted') {
        toast({
          title: t('children.deleteSuccess', 'Criança excluída'),
          description: `${child.first_name} foi excluído definitivamente.`,
        });
        onChanged?.();
        onClose();
      } else {
        // Se retornou 'unlinked', significa que havia outros responsáveis
        toast({
          title: t('children.unlinkSuccess', 'Vínculo removido'),
          description: `${child.first_name} foi removido do seu perfil.`,
        });
        onChanged?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Erro ao excluir criança:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      if (error.message?.includes('forbidden')) {
        toast({
          title: t('children.errorForbidden', 'Sem permissão'),
          description: t('children.errorForbidden', 'Você não tem permissão para alterar esta criança.'),
          variant: 'destructive',
        });
      } else if (error.message?.includes('function unlink_or_delete_child')) {
        toast({
          title: 'Função não encontrada',
          description: 'A função de exclusão não está disponível. Contate o suporte.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: t('children.errorGeneric', 'Erro'),
          description: `Erro: ${error.message || 'Não foi possível concluir a ação. Tente novamente.'}`,
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
      setAction(null);
      setConfirmName('');
    }
  };

  const resetState = () => {
    setAction(null);
    setConfirmName('');
    setLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserMinus className="h-5 w-5 text-kid-blue" />
            {t('children.manageTitle', { name: child.first_name }, `Gerenciar ${child.first_name}`)}
          </DialogTitle>
          <DialogDescription>
            Escolha como deseja gerenciar {child.first_name}:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Ação: Remover do meu perfil */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <UserMinus className="h-5 w-5 text-kid-blue mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-kid-blue">Remover do meu perfil</h4>
                <p className="text-sm text-slate-600 mt-1">
                  {child.first_name} continuará no sistema para outros responsáveis, mas será removido da sua lista.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setAction('unlink')}
              disabled={loading}
              className="w-full border-kid-blue/30 text-kid-blue hover:bg-kid-blue/10"
            >
              {loading && action === 'unlink' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <UserMinus className="h-4 w-4 mr-2" />
              )}
              {t('children.unlink', 'Remover do meu perfil')}
            </Button>
          </div>

          <Separator />

          {/* Ação: Excluir definitivamente */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-600">Excluir definitivamente</h4>
                <p className="text-sm text-slate-600 mt-1">
                  {child.first_name} será removido permanentemente do sistema para todos os responsáveis.
                </p>
              </div>
            </div>
            
            {action === 'delete' && (
              <div className="space-y-2">
                <Label htmlFor="confirmName" className="text-sm font-medium">
                  {t('children.deleteConfirmLabel', 'Para confirmar, digite o primeiro nome')}
                </Label>
                <Input
                  id="confirmName"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder={child.first_name}
                  className="border-red-200 focus:border-red-500"
                />
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={() => setAction('delete')}
              disabled={loading}
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
            >
              {loading && action === 'delete' ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {t('children.delete', 'Excluir definitivamente')}
            </Button>
          </div>

          {/* Aviso de segurança */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                <strong>Atenção:</strong> Estas ações não podem ser desfeitas. 
                Certifique-se de que deseja prosseguir.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          
          {action === 'unlink' && (
            <Button 
              onClick={handleUnlink} 
              disabled={loading}
              className="bg-kid-blue hover:bg-kid-blue/90"
            >
              {loading ? 'Removendo...' : 'Confirmar Remoção'}
            </Button>
          )}
          
          {action === 'delete' && (
            <Button 
              onClick={handleDelete} 
              disabled={loading || confirmName.trim().toLowerCase() !== child.first_name.toLowerCase()}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
