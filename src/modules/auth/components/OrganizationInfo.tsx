import { useOrganization } from '../hooks/useOrganization'

/**
 * Componente de exemplo que exibe informações da organização
 * Demonstra o uso do hook useOrganization
 */
export function OrganizationInfo() {
  const { organization, hasOrganization, organizationId, organizationName } = useOrganization()

  if (!hasOrganization) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Nenhuma organização associada</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">Informações da Organização</h3>
      <dl className="space-y-1">
        <div className="flex gap-2">
          <dt className="font-medium text-blue-700">ID:</dt>
          <dd className="text-blue-900">{organizationId}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium text-blue-700">Nome:</dt>
          <dd className="text-blue-900">{organizationName}</dd>
        </div>
        {organization?.slug && (
          <div className="flex gap-2">
            <dt className="font-medium text-blue-700">Slug:</dt>
            <dd className="text-blue-900">{organization.slug}</dd>
          </div>
        )}
        {organization?.contactEmail && (
          <div className="flex gap-2">
            <dt className="font-medium text-blue-700">Email:</dt>
            <dd className="text-blue-900">{organization.contactEmail}</dd>
          </div>
        )}
        {organization?.contactPhone && (
          <div className="flex gap-2">
            <dt className="font-medium text-blue-700">Telefone:</dt>
            <dd className="text-blue-900">{organization.contactPhone}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}

/**
 * Exemplo de uso em um serviço/hook customizado
 */
export function ExampleUsageInService() {
  const { organizationId } = useOrganization()

  async function fetchOrganizationData() {
    if (!organizationId) {
      console.warn('Sem organização - não é possível buscar dados')
      return
    }

    // O organizationId será enviado automaticamente no header X-Organization-ID
    // pela configuração do interceptor do axios
    const response = await fetch(`/api/organization/${organizationId}/data`)
    return response.json()
  }

  return { fetchOrganizationData }
}

