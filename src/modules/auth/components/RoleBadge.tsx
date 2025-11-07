import type { UserRole } from '../types/user'
import { RoleHelper } from '../utils/roleHelpers'

interface RoleBadgeProps {
  role: UserRole
  size?: 'sm' | 'md' | 'lg'
  showDescription?: boolean
}

export function RoleBadge({ role, size = 'md', showDescription = false }: RoleBadgeProps) {
  const colors = RoleHelper.getRoleColor(role)
  const label = RoleHelper.getRoleLabel(role)
  const description = RoleHelper.getRoleDescription(role)

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  const iconMap = {
    ADMIN: '👑',
    USER: '👤',
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <span
        className={`
          inline-flex items-center gap-1.5 
          rounded-full font-medium border
          ${colors.bg} ${colors.text} ${colors.border}
          ${sizeClasses[size]}
        `}
      >
        <span className="text-sm">{iconMap[role]}</span>
        {label}
      </span>
      {showDescription && (
        <span className="text-xs text-gray-500 ml-1">{description}</span>
      )}
    </div>
  )
}

