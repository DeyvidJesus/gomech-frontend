import { Building2 } from'lucide-react'
import { useAuth } from'../../auth/hooks/useAuth'

export function OrganizationBadge() {
 const { data: authData } = useAuth()

 if (!authData?.organization) {
 return null
 }

 return (
 <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
 <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
 <div className="min-w-0 flex-1">
 <p className="text-xs font-medium text-blue-900 truncate">
 {authData.organization.name}
 </p>
 <p className="text-xs text-blue-600 truncate">
 {authData.organization.slug}
 </p>
 </div>
 </div>
 )
}

