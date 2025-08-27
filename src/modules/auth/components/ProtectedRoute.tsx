import { useEffect, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { redirect } from '@tanstack/react-router';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'USER' | 'ADMIN';
  fallback?: ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  fallback = (
    <div className='flex h-screen items-center justify-center text-lg text-[#e74c3c]'>
      Acesso negado - Você não tem permissão para acessar esta página
    </div>
  )
}: ProtectedRouteProps) {
  const { data, isLoading } = useAuth();
  const { user } = data || {};

  useEffect(() => {
    if (!isLoading && !user) {
      redirect({ to: '/login' });
    }
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center text-lg'>
        Carregando...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'ADMIN') {
    return <>{fallback}</>;
  }

  return <>{children}</>;
} 
