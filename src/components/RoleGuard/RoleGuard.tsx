import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();
  
  const hasAccess = user && (
    roles.includes(user.role) || 
    user.role === 'ADMIN'
  );
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
