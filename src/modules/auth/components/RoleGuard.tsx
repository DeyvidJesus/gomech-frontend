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
  const { user } = data || {};
  
  const hasAccess = user && (
    roles.includes(user.role) || 
    user.role === 'ADMIN'
  );
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
