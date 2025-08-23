import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  demoSignUp: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoUser, setDemoUser] = useState<any>(null); // For demo users that bypass auth

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setDemoUser(null); // Clear demo user when real auth happens
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/auth/login`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: name
        }
      }
    });
    return { error };
  };

  const demoSignUp = async (email: string) => {
    // Generate a temporary password for demo accounts
    const tempPassword = `demo_${Math.random().toString(36).slice(-8)}`;
    
    try {
      // First try to sign up (this might fail if user exists or email confirmation is required)
      await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: {
          data: {
            name: email.split('@')[0], // Use email prefix as name
            is_demo: true
          }
        }
      });
    } catch (signUpError) {
      // Ignore signup errors for demo accounts
      console.log('Demo signup error (ignored):', signUpError);
    }

    // Always try to sign in regardless of signup result
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: tempPassword,
      });
      
      // If login fails, create a mock demo user
      if (signInError) {
        const mockDemoUser = {
          id: `demo_${Date.now()}`,
          email,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            name: email.split('@')[0],
            is_demo: true
          }
        };
        
        setDemoUser(mockDemoUser);
        setUser(mockDemoUser as any);
        setLoading(false);
        return { error: null };
      }
      
      return { error: null };
    } catch (error) {
      // Even if everything fails, create a mock demo user
      const mockDemoUser = {
        id: `demo_${Date.now()}`,
        email,
        email_confirmed_at: new Date().toISOString(),
        user_metadata: {
          name: email.split('@')[0],
          is_demo: true
        }
      };
      
      setDemoUser(mockDemoUser);
      setUser(mockDemoUser as any);
      setLoading(false);
      return { error: null };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth/reset-password?mode=reset`;
      
      console.log('Enviando email de reset para:', email);
      console.log('URL de redirecionamento:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      
      if (error) {
        console.error('Erro ao enviar email de reset:', error);
      } else {
        console.log('Email de reset enviado com sucesso para:', email);
      }
      
      return { error };
    } catch (unexpectedError) {
      console.error('Erro inesperado ao enviar email de reset:', unexpectedError);
      return { 
        error: unexpectedError instanceof Error ? unexpectedError : new Error('Erro desconhecido')
      };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error('Erro ao atualizar senha:', error);
        return { error };
      }
      
      // Se a senha foi atualizada com sucesso, forçar refresh da sessão
      const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('Erro ao atualizar sessão após mudança de senha:', refreshError);
        // Mesmo com erro de refresh, a senha foi alterada
        return { error: null };
      }
      
      // Atualizar o estado local se necessário
      if (newSession) {
        setSession(newSession);
        setUser(newSession.user);
      }
      
      return { error: null };
    } catch (unexpectedError) {
      console.error('Erro inesperado ao atualizar senha:', unexpectedError);
      return { 
        error: unexpectedError instanceof Error ? unexpectedError : new Error('Erro desconhecido')
      };
    }
  };

  const signOut = async () => {
    if (demoUser) {
      // Clear demo user
      setDemoUser(null);
      setUser(null);
      setSession(null);
    } else {
      await supabase.auth.signOut();
    }
  };

  const value = {
    user: user || demoUser, // Use demo user if no real user
    session,
    loading,
    signIn,
    signUp,
    demoSignUp,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}