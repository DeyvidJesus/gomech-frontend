import { useState, useEffect } from'react'
import { X } from'lucide-react'
import type { Organization, OrganizationCreateRequest } from'../types/organization'

interface OrganizationFormModalProps {
 isOpen: boolean
 onClose: () => void
 onSubmit: (data: OrganizationCreateRequest) => Promise<void>
 organization?: Organization | null
 title: string
}

export function OrganizationFormModal({
 isOpen,
 onClose,
 onSubmit,
 organization,
 title,
}: OrganizationFormModalProps) {
 const [formData, setFormData] = useState<OrganizationCreateRequest>({
 name:'',
 slug:'',
 description:'',
 contactEmail:'',
 contactPhone:'',
 address:'',
 document:'',
 })
 const [isSubmitting, setIsSubmitting] = useState(false)
 const [error, setError] = useState<string | null>(null)

 useEffect(() => {
 if (organization) {
 setFormData({
 name: organization.name,
 slug: organization.slug,
 description: organization.description ||'',
 contactEmail: organization.contactEmail ||'',
 contactPhone: organization.contactPhone ||'',
 address: organization.address ||'',
 document: organization.document ||'',
 })
 } else {
 setFormData({
 name:'',
 slug:'',
 description:'',
 contactEmail:'',
 contactPhone:'',
 address:'',
 document:'',
 })
 }
 setError(null)
 }, [organization, isOpen])

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault()
 setError(null)
 setIsSubmitting(true)

 try {
 await onSubmit(formData)
 onClose()
 } catch (err: any) {
 setError(err.response?.data?.message ||'Erro ao salvar organização')
 } finally {
 setIsSubmitting(false)
 }
 }

 const handleInputChange = (
 e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
 ) => {
 const { name, value } = e.target
 setFormData((prev) => ({ ...prev, [name]: value }))

 // Auto-generate slug from name if creating new organization
 if (name ==='name' && !organization) {
 const slug = value
 .toLowerCase()
 .replace(/[^a-z0-9\s-]/g,'')
 .replace(/\s+/g,'-')
 .replace(/-+/g,'-')
 .trim()
 setFormData((prev) => ({ ...prev, slug }))
 }
 }

 if (!isOpen) return null

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
 <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
 <div className="flex items-center justify-between p-6 border-b">
 <h2 className="text-xl font-semibold text-gray-900">
 {title}
 </h2>
 <button
 onClick={onClose}
 className="text-gray-400 hover:text-gray-500"
 >
 <X size={24} />
 </button>
 </div>

 <form onSubmit={handleSubmit} className="p-6 space-y-4">
 {error && (
 <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
 {error}
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="md:col-span-2">
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Nome da Organização <span className="text-red-500">*</span>
 </label>
 <input
 type="text"
 name="name"
 value={formData.name}
 onChange={handleInputChange}
 required
 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
 placeholder="Ex: Minha Oficina"
 />
 </div>

 <div className="md:col-span-2">
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Slug (URL amigável)
 </label>
 <input
 type="text"
 name="slug"
 value={formData.slug}
 onChange={handleInputChange}
 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
 placeholder="minha-oficina"
 />
 <p className="mt-1 text-sm text-gray-500">
 Gerado automaticamente a partir do nome
 </p>
 </div>

 <div className="md:col-span-2">
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Descrição
 </label>
 <textarea
 name="description"
 value={formData.description}
 onChange={handleInputChange}
 rows={3}
 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
 placeholder="Descrição da organização..."
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Email de Contato
 </label>
 <input
 type="email"
 name="contactEmail"
 value={formData.contactEmail}
 onChange={handleInputChange}
 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
 placeholder="contato@exemplo.com"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Telefone de Contato
 </label>
 <input
 type="tel"
 name="contactPhone"
 value={formData.contactPhone}
 onChange={handleInputChange}
 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
 placeholder="(11) 98765-4321"
 />
 </div>

 <div className="md:col-span-2">
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Endereço
 </label>
 <input
 type="text"
 name="address"
 value={formData.address}
 onChange={handleInputChange}
 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
 placeholder="Rua, número, cidade, estado"
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 CNPJ/CPF
 </label>
 <input
 type="text"
 name="document"
 value={formData.document}
 onChange={handleInputChange}
 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
 placeholder="00.000.000/0000-00"
 />
 </div>
 </div>

 <div className="flex justify-end gap-3 pt-4 border-t">
 <button
 type="button"
 onClick={onClose}
 className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
 >
 Cancelar
 </button>
 <button
 type="submit"
 disabled={isSubmitting}
 className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {isSubmitting ?'Salvando...' :'Salvar'}
 </button>
 </div>
 </form>
 </div>
 </div>
 )
}

