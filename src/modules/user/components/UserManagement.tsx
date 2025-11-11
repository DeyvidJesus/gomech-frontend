import { useState, useEffect } from'react'
import { Plus, Edit, Trash2, Shield, ShieldOff, Users, Key } from'lucide-react'
import { userApi } from'../services/api'
import { UserFormModal } from'./UserFormModal'
import type { User, CreateUserRequest, UpdateUserRequest, UserCreationWithMfaResponse } from'../types/user'
import { showErrorAlert, showSuccessToast, showInfoToast } from'@/shared/utils/errorHandler'
import { useConfirm } from'@/shared/hooks/useConfirm'
import { ConfirmDialog } from'@/shared/components/ConfirmDialog'

export function UserManagement() {
 const { confirm, confirmState } = useConfirm()
 const [users, setUsers] = useState<User[]>([])
 const [isLoading, setIsLoading] = useState(true)
 const [isModalOpen, setIsModalOpen] = useState(false)
 const [selectedUser, setSelectedUser] = useState<User | null>(null)
 const [error, setError] = useState<string | null>(null)
 const [, setMfaSecret] = useState<string | null>(null)

 const loadUsers = async () => {
 try {
 setIsLoading(true)
 setError(null)
 const response = await userApi.list(0, 100)
 setUsers(response.data.content || [])
 } catch (err: any) {
 setError('Erro ao carregar usuários')
 console.error(err)
 } finally {
 setIsLoading(false)
 }
 }

 useEffect(() => {
 loadUsers()
 }, [])

 const handleCreate = async (data: CreateUserRequest) => {
try {
const response = await userApi.create(data)
 
// Verificar se a resposta contém um segredo MFA
if (response.data && typeof response.data ==='object' &&'mfaSecret' in response.data) {
const mfaResponse = response.data as UserCreationWithMfaResponse
setMfaSecret(mfaResponse.mfaSecret)
showSuccessToast('Usuário criado com sucesso!')
showInfoToast(`Segredo MFA: ${mfaResponse.mfaSecret}\n\nGuarde este código com segurança, ele não será mostrado novamente.`)
}
 
await loadUsers()
} catch (err: any) {
throw err // Repassar o erro para o modal tratar
}
}

 const handleUpdate = async (data: UpdateUserRequest) => {
 if (selectedUser) {
 await userApi.update(selectedUser.id, data)
 await loadUsers()
 }
 }

 const handleDelete = async (id: number) => {
const user = users.find(u => u.id === id)
const isConfirmed = await confirm({
title: 'Excluir Usuário',
message: `Tem certeza que deseja excluir o usuário "${user?.name}"?\n\nEsta ação não pode ser desfeita.`,
confirmText: 'Excluir',
cancelText: 'Cancelar',
variant: 'danger'
})

if (isConfirmed) {
try {
await userApi.delete(id)
await loadUsers()
} catch (err: any) {
showErrorAlert(err, 'Erro ao excluir usuário')
}
}
}

 const openCreateModal = () => {
 setSelectedUser(null)
 setMfaSecret(null)
 setIsModalOpen(true)
 }

 const openEditModal = (user: User) => {
 setSelectedUser(user)
 setMfaSecret(null)
 setIsModalOpen(true)
 }

 const closeModal = () => {
 setIsModalOpen(false)
 setSelectedUser(null)
 setMfaSecret(null)
 }

 const getRoleBadge = (role: string) => {
 if (role ==='ADMIN') {
 return (
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
 <Shield size={12} className="mr-1" />
 Administrador
 </span>
 )
 }
 return (
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
 <Users size={12} className="mr-1" />
 Usuário
 </span>
 )
 }

 const getMfaBadge = (mfaEnabled: boolean) => {
 if (mfaEnabled) {
 return (
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
 <Shield size={12} className="mr-1" />
 MFA Ativo
 </span>
 )
 }
 return (
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
 <ShieldOff size={12} className="mr-1" />
 MFA Inativo
 </span>
 )
 }

 if (isLoading) {
 return (
 <div className="p-6">
 <div className="animate-pulse space-y-4">
 <div className="h-8 bg-gray-200 rounded w-1/4"></div>
 <div className="h-64 bg-gray-200 rounded"></div>
 </div>
 </div>
 )
 }

 return (
 <div className="min-h-screen bg-gray-50">
 <div className="p-4 sm:p-6 lg:p-8">
 <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
 <div>
 <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
 <span className="hidden sm:inline">Gerenciamento de Usuários</span>
 <span className="sm:hidden">Usuários</span>
 </h1>
 <p className="text-sm sm:text-base text-gray-600 mt-1">
 Gerencie os usuários da sua organização
 </p>
 </div>
 <button
 onClick={openCreateModal}
 className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm sm:text-base"
 >
 <Plus size={16} className="mr-1 sm:mr-2" />
 <span className="hidden xs:inline">Novo Usuário</span>
 <span className="xs:hidden">Novo</span>
 </button>
 </div>

 {error && (
 <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
 {error}
 </div>
 )}

 {/* Estatísticas */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
 <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
 <div className="flex items-center">
 <div className="p-2 bg-blue-100 rounded-lg">
 <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
 </div>
 <div className="ml-3 sm:ml-4">
 <p className="text-xs sm:text-sm font-medium text-gray-600">
 Total de Usuários
 </p>
 <p className="text-xl sm:text-2xl font-semibold text-gray-900">
 {users.length}
 </p>
 </div>
 </div>
 </div>

 <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
 <div className="flex items-center">
 <div className="p-2 bg-red-100 rounded-lg">
 <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
 </div>
 <div className="ml-3 sm:ml-4">
 <p className="text-xs sm:text-sm font-medium text-gray-600">
 Administradores
 </p>
 <p className="text-xl sm:text-2xl font-semibold text-gray-900">
 {users.filter(u => u.role ==='ADMIN').length}
 </p>
 </div>
 </div>
 </div>

 <div className="bg-white p-4 sm:p-6 rounded-lg shadow sm:col-span-2 lg:col-span-1">
 <div className="flex items-center">
 <div className="p-2 bg-green-100 rounded-lg">
 <Key className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
 </div>
 <div className="ml-3 sm:ml-4">
 <p className="text-xs sm:text-sm font-medium text-gray-600">
 MFA Habilitado
 </p>
 <p className="text-xl sm:text-2xl font-semibold text-gray-900">
 {users.filter(u => u.mfaEnabled).length}
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Lista de usuários */}
 <div className="bg-white shadow rounded-lg overflow-hidden">
 <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
 <h3 className="text-base sm:text-lg font-medium text-gray-900">
 Usuários ({users.length})
 </h3>
 </div>

 {users.length === 0 ? (
 <div className="p-6 text-center">
 <Users className="mx-auto h-12 w-12 text-gray-400" />
 <h3 className="mt-2 text-sm font-medium text-gray-900">
 Nenhum usuário encontrado
 </h3>
 <p className="mt-1 text-sm text-gray-500">
 Comece criando um novo usuário para sua organização.
 </p>
 <div className="mt-6">
 <button
 onClick={openCreateModal}
 className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
 >
 <Plus size={20} className="mr-2" />
 Novo Usuário
 </button>
 </div>
 </div>
 ) : (
 <>
 {/* Mobile view */}
 <div className="block sm:hidden">
 <div className="divide-y divide-gray-200">
 {users.map((user) => (
 <div key={user.id} className="p-4">
 <div className="flex items-start justify-between">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-2">
 <span className="font-medium text-gray-900 truncate">{user.name}</span>
 {getRoleBadge(user.role)}
 </div>
 <p className="text-sm text-gray-500 mb-2 truncate">{user.email}</p>
 <div className="flex items-center gap-2">
 {getMfaBadge(user.mfaEnabled)}
 </div>
 </div>
 <div className="flex flex-col gap-1 ml-2">
 <button
 onClick={() => openEditModal(user)}
 className="p-2 text-blue-600 hover:text-blue-900:text-blue-300 hover:bg-blue-50 rounded"
 title="Editar usuário"
 >
 <Edit size={16} />
 </button>
 <button
 onClick={() => handleDelete(user.id)}
 className="p-2 text-red-600 hover:text-red-900:text-red-300 hover:bg-red-50 rounded"
 title="Excluir usuário"
 >
 <Trash2 size={16} />
 </button>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Desktop view */}
 <div className="hidden sm:block overflow-x-auto">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50">
 <tr>
 <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 Usuário
 </th>
 <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
 Função
 </th>
 <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
 MFA
 </th>
 <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
 Ações
 </th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200">
 {users.map((user) => (
 <tr key={user.id} className="hover:bg-gray-50">
 <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
 <div>
 <div className="text-sm font-medium text-gray-900">
 {user.name}
 </div>
 <div className="text-sm text-gray-500">
 {user.email}
 </div>
 <div className="flex items-center gap-2 mt-1 lg:hidden">
 {getRoleBadge(user.role)}
 <span className="md:hidden">{getMfaBadge(user.mfaEnabled)}</span>
 </div>
 </div>
 </td>
 <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
 {getRoleBadge(user.role)}
 </td>
 <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
 {getMfaBadge(user.mfaEnabled)}
 </td>
 <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
 <div className="flex justify-end space-x-1 sm:space-x-2">
 <button
 onClick={() => openEditModal(user)}
 className="p-1 sm:p-2 text-blue-600 hover:text-blue-900:text-blue-300 hover:bg-blue-50 rounded"
 title="Editar usuário"
 >
 <Edit size={16} />
 </button>
 <button
 onClick={() => handleDelete(user.id)}
 className="p-1 sm:p-2 text-red-600 hover:text-red-900:text-red-300 hover:bg-red-50 rounded"
 title="Excluir usuário"
 >
 <Trash2 size={16} />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </>
 )}
 </div>

 {/* Modal de formulário */}
 <UserFormModal
 isOpen={isModalOpen}
 onClose={closeModal}
 onSubmit={selectedUser ? handleUpdate : (data) => handleCreate(data as CreateUserRequest)}
        user={selectedUser}
        title={selectedUser ?'Editar Usuário' :'Novo Usuário'}
        />

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        variant={confirmState.variant}
        onConfirm={confirmState.onConfirm}
        onCancel={confirmState.onCancel}
      />
      </div>
    </div>
  )
}
