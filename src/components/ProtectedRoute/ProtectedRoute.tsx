import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'USER' | 'ADMIN';
  fallback?: ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  fallback = (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '18px',
      color: '#e74c3c'
    }}>
      Acesso negado - Você não tem permissão para acessar esta página
    </div>
  )
}: ProtectedRouteProps) {
  const { token, user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '18px'
      }}>
        Carregando...
      </div>
    );
  }

  // Se não estiver autenticado, não renderizar nada (redirecionamento já foi feito)
  if (!isAuthenticated) {
    return null;
  }

  // Verificar se tem a role necessária
  if (requiredRole && user?.role !== requiredRole && user?.role !== 'ADMIN') {
    return <>{fallback}</>;
  }

  // Se estiver autenticado e com a role adequada, renderizar os filhos
  return <>{children}</>;
} 
