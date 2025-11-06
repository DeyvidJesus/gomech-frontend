import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Power, PowerOff, Building2 } from 'lucide-react'
import { organizationApi } from '../services/api'
import { OrganizationFormModal } from './OrganizationFormModal'
import type { Organization } from '../types/organization'

export function OrganizationManagement() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadOrganizations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await organizationApi.list(0, 100)
      setOrganizations(response.data.content || [])
    } catch (err: any) {
      setError('Erro ao carregar organizações')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrganizations()
  }, [])

  const handleCreate = async (data: any) => {
    await organizationApi.create(data)
    await loadOrganizations()
  }

  const handleUpdate = async (data: any) => {
    if (selectedOrganization) {
      await organizationApi.update(selectedOrganization.id, data)
      await loadOrganizations()
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta organização? Esta ação não pode ser desfeita.')) {
      try {
        await organizationApi.delete(id)
        await loadOrganizations()
      } catch (err: any) {
        alert(err.response?.data?.message || 'Erro ao excluir organização')
      }
    }
  }

  const handleToggleActive = async (id: number) => {
    try {
      await organizationApi.toggleActive(id)
      await loadOrganizations()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao alterar status')
    }
  }

  const openCreateModal = () => {
    setSelectedOrganization(null)
    setIsModalOpen(true)
  }

  const openEditModal = (org: Organization) => {
    setSelectedOrganization(org)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedOrganization(null)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-7 h-7" />
              Gerenciar Organizações
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Gerencie as organizações do sistema (multi-tenancy)
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Nova Organização
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Organização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Criada em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {organizations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Nenhuma organização cadastrada
                    </p>
                  </td>
                </tr>
              ) : (
                organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {org.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {org.slug}
                        </div>
                        {org.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {org.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {org.contactEmail && (
                          <div className="text-gray-900 dark:text-white">{org.contactEmail}</div>
                        )}
                        {org.contactPhone && (
                          <div className="text-gray-500 dark:text-gray-400">{org.contactPhone}</div>
                        )}
                        {!org.contactEmail && !org.contactPhone && (
                          <span className="text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          org.active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {org.active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(org.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleActive(org.id)}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                          title={org.active ? 'Desativar' : 'Ativar'}
                        >
                          {org.active ? <PowerOff size={18} /> : <Power size={18} />}
                        </button>
                        <button
                          onClick={() => openEditModal(org)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(org.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Total de organizações: <strong>{organizations.length}</strong>
      </div>

      <OrganizationFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={selectedOrganization ? handleUpdate : handleCreate}
        organization={selectedOrganization}
        title={selectedOrganization ? 'Editar Organização' : 'Nova Organização'}
      />
    </div>
  )
}

