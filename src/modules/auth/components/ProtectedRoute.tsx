import { useEffect, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from '@tanstack/react-router';

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
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !data) {
      navigate({ to: '/login' });
      return;
    }
  }, [data, isLoading]);

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center text-lg'>
        Carregando...
      </div>
    );
  }

  if (!data) {
    return null;
  }

  if (requiredRole) {
    const userRole = data.user.role;
    if (userRole !== requiredRole && userRole !== 'ADMIN') {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
