import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/Layout/AppLayout";
import { fetchNotifications, markAsRead, markAllRead, type Notif } from "@/services/notifications";
import { Bell, Check, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

export default function Notificacoes() {
  const [items, setItems] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'system' | 'lessons' | 'achievements'>('all');
  const { t } = useTranslation();

  useEffect(() => {
    (async () => {
      try {
        const notifications = await fetchNotifications();
        setItems(notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleRead(id: string) {
    try {
      await markAsRead(id);
      setItems(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  }

  async function handleReadAll() {
    try {
      await markAllRead();
      setItems(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  }

  const filteredItems = items.filter(item => {
    if (filter === 'unread') return !item.read_at;
    if (filter === 'system') return item.type_key === 'system';
    if (filter === 'lessons') return item.type_key === 'lesson_reminder' || item.type_key === 'makeup_class';
    if (filter === 'achievements') return item.type_key === 'achievement';
    return true;
  });

  const unreadCount = items.filter(i => !i.read_at).length;

  if (loading) return (
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6" />
          <span>{t('loading')}</span>
        </div>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        <Card className="border-2 border-kid-green/20 bg-gradient-card backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-kid-green to-kid-blue flex items-center justify-center text-2xl shadow-lg">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-kid-green to-kid-blue bg-clip-text text-transparent">
                    {t('notifications')}
                  </h1>
                  <p className="text-lg text-kid-green mt-1">
                    {t('exercisesPage.notifications.unread', { count: unreadCount })}
                  </p>
                </div>
              </div>
              <Button onClick={handleReadAll} variant="outline" className="gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {t('exercisesPage.notifications.markAllAsRead')}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: t('exercisesPage.notifications.all') },
            { key: 'unread', label: t('exercisesPage.notifications.unread', { count: 0 }) },
            { key: 'system', label: t('exercisesPage.notifications.system') },
            { key: 'lessons', label: t('exercisesPage.notifications.lessons') },
            { key: 'achievements', label: t('exercisesPage.notifications.achievements') }
          ].map(filterOption => (
            <Button
              key={filterOption.key}
              variant={filter === filterOption.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(filterOption.key as any)}
            >
              {filterOption.label}
            </Button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">{t('exercisesPage.notifications.noNotifications')}</h3>
              <p className="text-muted-foreground">
                {filter === 'unread' ? t('exercisesPage.notifications.allNotificationsRead') : t('noNotificationsDesc')}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(notification => (
              <Card key={notification.id} className={`transition-colors ${!notification.read_at ? "bg-primary/5 border-primary/20" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-base">{notification.title}</CardTitle>
                        {!notification.read_at && (
                          <div className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      {notification.body && (
                        <p className="text-sm text-muted-foreground">{notification.body}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {notification.type_key === 'lesson_reminder' && t('exercisesPage.notifications.lesson_reminder')}
                          {notification.type_key === 'makeup_class' && t('exercisesPage.notifications.makeup_class')}
                          {notification.type_key === 'report_ready' && t('exercisesPage.notifications.report_ready')}
                          {notification.type_key === 'achievement' && t('exercisesPage.notifications.achievement')}
                          {notification.type_key === 'system' && t('exercisesPage.notifications.system')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(notification.delivered_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    {!notification.read_at && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRead(notification.id)}
                        className="gap-1"
                      >
                        <Check className="w-3 h-3" />
                        {t('exercisesPage.notifications.markAsRead')}
                      </Button>
                    )}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}