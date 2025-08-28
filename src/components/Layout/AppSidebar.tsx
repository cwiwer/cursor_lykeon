import { 
  Home, 
  Calendar, 
  BookOpen, 
  BarChart3, 
  MessageCircle, 
  CreditCard, 
  Settings,
  LogOut,
  User,
  Users,
  UserCheck,
  Trophy,
  Bell,
  Brain
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useStudent } from '@/contexts/StudentContext';
import { Logo } from '@/components/ui/logo';
import { NotificationBadge } from '@/components/ui/notification-badge';
import { useTranslation } from 'react-i18next';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarFooter,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const { children } = useStudent();
  const location = useLocation();
  const { t } = useTranslation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const mainItems = [
    { title: t('sidebar.dashboard'), url: '/dashboard-aluno', icon: Home },
    { title: t('sidebar.calendar'), url: '/calendario', icon: Calendar },
    { title: t('exercises'), url: '/exercicios', icon: BookOpen },
    { title: t('reports'), url: '/relatorios', icon: BarChart3 },
    { title: t('messages'), url: '/mensagens', icon: MessageCircle },
    { title: t('achievements'), url: '/conquistas', icon: Trophy },
    { title: t('notifications'), url: '/notificacoes', icon: Bell },
  ];

  const profileItems = [
    { title: t('parentsDirectory'), url: '/pais/dashboard', icon: Users },
    ...children.map(child => ({
      title: `${child.first_name} ${child.last_name || ''}`.trim(),
      url: `/aluno/${child.id}`,
      icon: UserCheck
    })),
    ...(children.length === 0 ? [
      { title: '➕ Cadastrar Criança', url: '/selecionar-aluno', icon: UserCheck }
    ] : [])
  ];

  const settingsItems = [
    { title: t('sidebar.subscription'), url: '/assinaturas', icon: CreditCard },
    { title: t('parentsDashboard.settings'), url: '/configuracoes', icon: Settings },
  ];

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground';

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <div className="p-4 border-b">
        <Logo 
          variant="dark" 
          size={collapsed ? "sm" : "md"} 
          className={collapsed ? "justify-center" : ""}
        />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('main')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                      {!collapsed && item.title === t('notifications') && <NotificationBadge />}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t('profiles')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {profileItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t('account')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && user && (
          <div className="p-2 border-t">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium truncate">{user.email}</span>
            </div>
            <SidebarMenuButton 
              onClick={signOut}
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>{t('logout')}</span>
            </SidebarMenuButton>
          </div>
        )}
        <SidebarTrigger className="m-2" />
      </SidebarFooter>
    </Sidebar>
  );
}