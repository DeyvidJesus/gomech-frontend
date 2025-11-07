import { useState, useEffect } from'react'
import { X, Eye, EyeOff, Shield, ShieldOff } from'lucide-react'
import type { User, CreateUserRequest, UpdateUserRequest } from'../types/user'

interface UserFormModalProps {
 isOpen: boolean
 onClose: () => void
 onSubmit: (data: CreateUserRequest | UpdateUserRequest) => Promise<void>
 user?: User | null
 title: string
}

export function UserFormModal({
 isOpen,
 onClose,
 onSubmit,
 user,
 title,
}: UserFormModalProps) {
 const [formData, setFormData] = useState<CreateUserRequest>({
 name:'',
 email:'',
 password:'',
 role:'USER',
 mfaEnabled: false,
 })
 const [isSubmitting, setIsSubmitting] = useState(false)
 const [error, setError] = useState<string | null>(null)
 const [showPassword, setShowPassword] = useState(false)

 useEffect(() => {
 if (user) {
 setFormData({
 name: user.name,
 email: user.email,
 password:'', // Não mostramos a senha existente
 role: user.role,
 mfaEnabled: user.mfaEnabled,
 })
 } else {
 setFormData({
 name:'',
 email:'',
 password:'',
 role:'USER',
 mfaEnabled: false,
 })
 }
 setError(null)
 setShowPassword(false)
 }, [user, isOpen])

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setError(null)
 setIsSubmitting(true)

 try {
 if (user) {
 // Para atualização, não enviamos a senha se estiver vazia
 const updateData: UpdateUserRequest = {
 name: formData.name,
 email: formData.email,
 role: formData.role,
 mfaEnabled: formData.mfaEnabled,
 }
 await onSubmit(updateData)
 } else {
 // Para criação, a senha é obrigatória
 if (!formData.password) {
 setError('Senha é obrigatória para novos usuários')
 return
 }
 await onSubmit(formData)
 }
 onClose()
 } catch (err: any) {
 setError(err.response?.data?.message ||'Erro ao salvar usuário')
 } finally {
 setIsSubmitting(false)
 }
 }

 const handleInputChange = (
 e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
 ) => {
 const { name, value, type } = e.target
 setFormData(prev => ({
 ...prev,
 [name]: type ==='checkbox' ? (e.target as HTMLInputElement).checked : value,
 }))
 }

 if (!isOpen) return null

 return (
 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
 <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-auto">
 <div className="flex justify-between items-center mb-4">
 <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
 {title}
 </h2>
 <button
 onClick={onClose}
 className="text-gray-400 hover:text-gray-600 p-1"
 >
 <X size={20} />
 </button>
 </div>

 {error && (
 <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
 <div>
 <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
 Nome *
 </label>
 <input
 type="text"
 id="name"
 name="name"
 value={formData.name}
 onChange={handleInputChange}
 required
 className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 placeholder="Digite o nome completo"
 />
 </div>

 <div>
 <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
 Email *
 </label>
 <input
 type="email"
 id="email"
 name="email"
 value={formData.email}
 onChange={handleInputChange}
 required
 className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 placeholder="Digite o email"
 />
 </div>

 {!user && (
 <div>
 <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
 Senha *
 </label>
 <div className="relative">
 <input
 type={showPassword ?'text' :'password'}
 id="password"
 name="password"
 value={formData.password}
 onChange={handleInputChange}
 required
 minLength={6}
 className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 placeholder="Digite a senha (mínimo 6 caracteres)"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
 >
 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
 </button>
 </div>
 </div>
 )}

 <div>
 <label htmlFor="role" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
 Função *
 </label>
 <select
 id="role"
 name="role"
 value={formData.role}
 onChange={handleInputChange}
 required
 className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
 >
 <option value="USER">Usuário</option>
 <option value="ADMIN">Administrador</option>
 </select>
 </div>

 <div className="flex items-start">
 <input
 type="checkbox"
 id="mfaEnabled"
 name="mfaEnabled"
 checked={formData.mfaEnabled}
 onChange={handleInputChange}
 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
 />
 <label htmlFor="mfaEnabled" className="ml-2 block text-xs sm:text-sm text-gray-700">
 <div className="flex items-center">
 {formData.mfaEnabled ? <Shield size={14} className="mr-1" /> : <ShieldOff size={14} className="mr-1" />}
 <span>Habilitar autenticação de dois fatores (MFA)</span>
 </div>
 </label>
 </div>

 <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
 <button
 type="button"
 onClick={onClose}
 className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
 >
 Cancelar
 </button>
 <button
 type="submit"
 disabled={isSubmitting}
 className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
 >
 {isSubmitting ?'Salvando...' : user ?'Atualizar' :'Criar'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )
}
