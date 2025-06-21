import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect, ReactNode } from 'react';

interface AuthRouteProps {
  children: ReactNode;
}

export default function AuthRoute({ children }: AuthRouteProps) {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && token) {
      router.push('/');
    }
  }, [token, loading, router]);

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

  // Se estiver autenticado, não renderizar nada (redirecionamento já foi feito)
  if (token) {
    return null;
  }

  // Se não estiver autenticado, renderizar os filhos (página de login/registro)
  return <>{children}</>;
} 