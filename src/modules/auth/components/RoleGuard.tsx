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
  
  const userRole = data?.user.role;
  const hasAccess = Boolean(userRole && (roles.includes(userRole) || userRole === 'ADMIN'));

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
