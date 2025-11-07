import { Navigate } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'
import { RoleHelper } from '../utils/roleHelpers'
import type { UserRole } from '../types/user'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  fallbackPath?: string
}

/**
 * Componente para proteger rotas que requerem autenticação
 * e/ou roles específicos
 */
export default function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = '/login',
}: ProtectedRouteProps) {
  const { data: authData, isLoading } = useAuth()

  // Aguarda carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  // Não autenticado
  if (!authData?.accessToken) {
    return <Navigate to={fallbackPath} />
  }

  // Verificar role se necessário
  if (requiredRole && authData.role !== requiredRole) {
    // Se requer ADMIN mas usuário não é ADMIN
    if (requiredRole === 'ADMIN' && !RoleHelper.isAdmin(authData.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚫</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
            <p className="text-gray-600 mb-6">
              Você não tem permissão para acessar esta página.
              <br />
              Esta área é restrita a administradores.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      )
    }
  }

  // Autenticado e autorizado
  return <>{children}</>
}
