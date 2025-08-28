import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

interface RoleGuardProps {
  children: ReactNode;
  roles: ('USER' | 'ADMIN')[];
  fallback?: ReactNode;
}

export default function RoleGuard({ 
  children, 
  roles, 
  fallback = null 
}: RoleGuardProps) {
  const { data } = useAuth();
  
  const hasAccess = data && (
    roles.includes(data.role) || 
    data.role === 'ADMIN'
  );
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
