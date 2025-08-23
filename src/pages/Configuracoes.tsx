import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/Layout/AppLayout";
import { fetchPrefs, upsertPref, createTicket, ensureDefaultPrefs, type NotifPref } from "@/services/notifications";
import { Settings, Bell, User, HelpCircle, Shield, Accessibility, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export default function Configuracoes() {
  const [prefs, setPrefs] = useState<NotifPref[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState({ subject: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();

  const NOTIFICATION_TYPES = [
    { key: "lesson_reminder", label: t("lesson_reminder") },
    { key: "makeup_class", label: t("makeup_class") },
    { key: "report_ready", label: t("report_ready") },
    { key: "achievement", label: t("achievement") },
    { key: "system", label: t("system") },
  ];

  useEffect(() => {
    (async () => {
      try {
        await ensureDefaultPrefs();
        const preferences = await fetchPrefs();
        setPrefs(preferences);
      } catch (error) {
        console.error("Error fetching preferences:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function toggleNotification(typeKey: string, channel: keyof Pick<NotifPref, 'in_app' | 'email' | 'push' | 'sms'>) {
    try {
      const currentPref = prefs.find(p => p.type_key === typeKey);
      const newValue = !(currentPref?.[channel] ?? true);
      
      await upsertPref({ type_key: typeKey, [channel]: newValue });
      
      // Update local state
      const updatedPrefs = await fetchPrefs();
      setPrefs(updatedPrefs);
      
      toast.success(t("preferenceUpdated"));
    } catch (error) {
      console.error("Error updating preference:", error);
      toast.error(t("errorOccurred"));
    }
  }

  async function handleSubmitTicket() {
    if (!ticket.subject.trim() || !ticket.description.trim()) {
      toast.error(t("fillAllFields"));
      return;
    }

    setSubmitting(true);
    try {
      await createTicket(ticket.subject, ticket.description);
      toast.success(t("ticketSent"));
      setTicket({ subject: "", description: "" });
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error(t("errorOccurred"));
    } finally {
      setSubmitting(false);
    }
  }

  function getPrefValue(typeKey: string, channel: keyof NotifPref) {
    const pref = prefs.find(p => p.type_key === typeKey);
    return pref ? (pref as any)[channel] : true;
  }

  if (loading) return (
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6" />
          <span>{t('loading')}</span>
        </div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-8">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">{t('settings')}</h1>
            <p className="text-muted-foreground">{t('personalizeExperience')}</p>
          </div>
        </div>

        {/* Perfil & Conta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {t('profile')} & {t('account')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">{t('email')}</Label>
                <Input id="email" placeholder={t('enterEmail')} disabled />
              </div>
              <div>
                <Label htmlFor="name">{t('name')}</Label>
                <Input id="name" placeholder={t('enterName')} />
              </div>
            </div>
            <Button variant="outline" className="w-fit">
              <Shield className="w-4 h-4 mr-2" />
              {t('changePassword')}
            </Button>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {t('notifications')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 text-sm font-medium text-muted-foreground">
                <div>Tipo de notificação</div>
                <div className="text-center">{t('inApp')}</div>
                <div className="text-center">{t('email')}</div>
                <div className="text-center">{t('push')}</div>
                <div className="text-center">{t('sms')}</div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                {NOTIFICATION_TYPES.map(type => (
                  <div key={type.key} className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-center">
                    <div className="font-medium">{type.label}</div>
                    
                    {(['in_app', 'email', 'push', 'sms'] as const).map(channel => (
                      <div key={channel} className="flex justify-center">
                        <Switch
                          checked={!!getPrefValue(type.key, channel)}
                          onCheckedChange={() => toggleNotification(type.key, channel)}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h4 className="font-medium">{t('quietHours')}</h4>
                <p className="text-sm text-muted-foreground">
                  Configure um período para não receber notificações push (22:00–07:00)
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-xs">
                  <div>
                    <Label htmlFor="quiet-start" className="text-xs">Início</Label>
                    <Input id="quiet-start" type="time" defaultValue="22:00" />
                  </div>
                  <div>
                    <Label htmlFor="quiet-end" className="text-xs">Fim</Label>
                    <Input id="quiet-end" type="time" defaultValue="07:00" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acessibilidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Accessibility className="w-5 h-5" />
              {t('accessibility')} & UX
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('fontSize')}</Label>
                <Button variant="outline" className="w-full justify-start">
                  {t('normal')}
                </Button>
              </div>
              <div className="space-y-2">
                <Label>{t('contrast')}</Label>
                <Button variant="outline" className="w-full justify-start">
                  {t('standard')}
                </Button>
              </div>
              <div className="space-y-2">
                <Label>{t('language')}</Label>
                <LanguageSwitcher />
              </div>
            </div>
            
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('autoSubtitles')}</Label>
                  <p className="text-sm text-muted-foreground">Exibir legendas em vídeos</p>
                </div>
                <Switch />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suporte Técnico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              {t('support')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="ticket-subject">{t('subject')}</Label>
                <Input
                  id="ticket-subject"
                  placeholder="Descreva brevemente o problema"
                  value={ticket.subject}
                  onChange={e => setTicket({ ...ticket, subject: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ticket-description">{t('description')} detalhada</Label>
                <Textarea
                  id="ticket-description"
                  placeholder="Descreva o problema em detalhes..."
                  rows={4}
                  value={ticket.description}
                  onChange={e => setTicket({ ...ticket, description: e.target.value })}
                />
              </div>
              <Button 
                onClick={handleSubmitTicket} 
                disabled={submitting}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {submitting ? t('sending') + "..." : t('send') + " chamado"}
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h4 className="font-medium">{t('faq')}</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "Como resetar minha senha?",
                  "Como alterar meu plano?",
                  "Problemas com vídeo?",
                  "Como usar as conquistas?",
                  "Configurar notificações?"
                ].map(question => (
                  <Button key={question} variant="outline" size="sm">
                    {question}
                  </Button>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h4 className="font-medium">{t('diagnosis')}</h4>
              <p className="text-sm text-muted-foreground">
                Informações técnicas que ajudam nossa equipe a resolver problemas
              </p>
              <Button variant="outline" size="sm">
                Enviar diagnóstico
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}