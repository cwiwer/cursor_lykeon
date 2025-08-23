import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ChildForm } from "./ChildForm";
import { createChild, type ChildFormValues } from "@/services/students";
import { useToast } from "@/hooks/use-toast";

type AddChildModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (childId: string) => void;
};

export function AddChildModal({ isOpen, onClose, onSuccess }: AddChildModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: ChildFormValues) => {
    setSubmitting(true);
    try {
      const childId = await createChild(values);
      toast({
        title: t("children.success"),
        description: `${values.first_name} foi adicionado(a) com sucesso.`,
      });
      onSuccess(childId);
      onClose();
    } catch (error: any) {
      console.error("Erro ao criar criança:", error);
      
      let errorMessage = t("children.error");
      if (error.message?.includes("not authenticated")) {
        errorMessage = t("children.login_required");
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold text-kid-green">
            {t("children.add")}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-4">
          <ChildForm onSubmit={handleSubmit} submitting={submitting} />
          
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={submitting}
            >
              {t("children.cancel")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}