import type { UserRole } from '../types/user'

/**
 * Helper para trabalhar com roles de usuário
 */
export const RoleHelper = {
  /**
   * Verifica se o role é ADMIN
   */
  isAdmin: (role?: UserRole): boolean => {
    return role === 'ADMIN'
  },

  /**
   * Verifica se o role é USER
   */
  isUser: (role?: UserRole): boolean => {
    return role === 'USER'
  },

  /**
   * Verifica se o role tem permissão de admin
   * (útil para verificações de UI)
   */
  hasAdminPermission: (role?: UserRole): boolean => {
    return role === 'ADMIN'
  },

  /**
   * Retorna o label do role em português
   */
  getRoleLabel: (role?: UserRole): string => {
    switch (role) {
      case 'ADMIN':
        return 'Administrador'
      case 'USER':
        return 'Usuário'
      default:
        return 'Desconhecido'
    }
  },

  /**
   * Retorna a descrição do role
   */
  getRoleDescription: (role?: UserRole): string => {
    switch (role) {
      case 'ADMIN':
        return 'Acesso total ao sistema, pode gerenciar usuários e configurações'
      case 'USER':
        return 'Acesso padrão ao sistema para operações do dia a dia'
      default:
        return 'Role não reconhecido'
    }
  },

  /**
   * Retorna a cor do badge do role (para UI)
   */
  getRoleColor: (role?: UserRole): { bg: string; text: string; border: string } => {
    switch (role) {
      case 'ADMIN':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
        }
      case 'USER':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
        }
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
        }
    }
  },

  /**
   * Lista todos os roles disponíveis
   */
  getAllRoles: (): Array<{ value: UserRole; label: string; description: string }> => {
    return [
      {
        value: 'USER',
        label: 'Usuário',
        description: 'Acesso padrão ao sistema',
      },
      {
        value: 'ADMIN',
        label: 'Administrador',
        description: 'Acesso total e gerenciamento de usuários',
      },
    ]
  },
}

/**
 * Hook personalizado para verificações de role
 * Pode ser usado em componentes React
 */
export const useRoleCheck = (userRole?: UserRole) => {
  return {
    isAdmin: RoleHelper.isAdmin(userRole),
    isUser: RoleHelper.isUser(userRole),
    hasAdminPermission: RoleHelper.hasAdminPermission(userRole),
    roleLabel: RoleHelper.getRoleLabel(userRole),
    roleDescription: RoleHelper.getRoleDescription(userRole),
    roleColor: RoleHelper.getRoleColor(userRole),
  }
}

