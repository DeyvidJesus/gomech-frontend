import { useAuth } from './useAuth'
import type { Organization } from '../types/user'

/**
 * Hook para acessar informações da organização do usuário logado
 */
export function useOrganization() {
  const { data: auth } = useAuth()

  return {
    organization: auth?.organization ?? null,
    organizationId: auth?.organization?.id ?? null,
    organizationName: auth?.organization?.name ?? null,
    organizationSlug: auth?.organization?.slug ?? null,
    hasOrganization: !!auth?.organization,
  }
}

/**
 * Hook para obter apenas o organizationId (lança erro se não existir)
 * Use este quando o organizationId for obrigatório
 */
export function useRequiredOrganizationId(): number {
  const { organizationId } = useOrganization()

  if (!organizationId) {
    throw new Error(
      'Organization ID não encontrado. Certifique-se de que o usuário está autenticado e possui uma organização.',
    )
  }

  return organizationId
}

/**
 * Hook para verificar se o usuário pertence a uma organização específica
 */
export function useIsOrganization(targetOrganizationId: number): boolean {
  const { organizationId } = useOrganization()
  return organizationId === targetOrganizationId
}

