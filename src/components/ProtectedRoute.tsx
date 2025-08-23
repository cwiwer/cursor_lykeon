import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import EmailVerificationRequired from './EmailVerificationRequired';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailConfirmation?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireEmailConfirmation = true 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not loading and no user, redirect to login
    if (!loading && !user) {
      navigate('/auth/login');
      return;
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If no user, don't render anything (will redirect)
  if (!user) {
    return null;
  }

  // If email confirmation is required but not confirmed, show verification screen
  // Skip email verification for demo accounts
  if (requireEmailConfirmation && !user.email_confirmed_at && !user.user_metadata?.is_demo) {
    return <EmailVerificationRequired />;
  }

  // All checks passed, render children
  return <>{children}</>;
}