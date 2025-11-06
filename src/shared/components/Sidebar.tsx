import { Link, useNavigate } from '@tanstack/react-router'

import RoleGuard from '../../modules/auth/components/RoleGuard'
import { useAuth } from '../../modules/auth/hooks/useAuth'
import { useLogout } from '../../modules/auth/hooks/useLogout'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isDesktop: boolean
}


export default function Sidebar({ isOpen, onClose, isDesktop }: SidebarProps) {
  const { data } = useAuth()
  const { email, role } = data || {}
  const logout = useLogout()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
    onClose()
  }

  const handleLinkClick = () => {
    if (!isDesktop) {
      onClose()
    }
  }

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#242424cb] bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar/Drawer */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          w-full max-w-[280px] lg:max-w-[220px]
          bg-[var(--sidebar-bg)] text-[var(--sidebar-text)]
          h-full lg:h-[calc(100vh-28px)]
          lg:m-3.5 lg:rounded
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header com logo e botão de fechar */}
        <div className="flex items-center justify-between p-4 lg:justify-center">
          <img src="/logo_black.png" alt="GoMech" className="w-16 h-16 lg:w-20 lg:h-20" />
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-[var(--sidebar-text)] hover:bg-[rgba(255,255,255,0.1)] rounded-md transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Informações do usuário */}
        {data && (
          <div className="p-3 mt-0 mx-3 mb-4 bg-[rgba(255,255,255,0.1)] rounded-lg text-xs text-[var(--sidebar-text)]">
            <div className="mb-1.5">
              <strong>{email}</strong>
            </div>
            <div className={`inline-block px-2 py-1 rounded-xl text-xs font-bold text-white ${
              role === 'ADMIN' ? 'bg-red-500' : 'bg-blue-500'
            }`}>
              {role}
            </div>
          </div>
        )}

        <nav className="flex flex-col flex-1 p-3">
          <div className="text-[var(--sidebar-text)] bg-[var(--sidebar-button-bg)] rounded-sm overflow-hidden hover:bg-[#242424e1] my-0.5">
            <Link
              className="no-underline text-[var(--sidebar-text)] block p-3 transition-all duration-200 ease-in-out hover:bg-[#242424e1] font-medium"
              to="/"
              onClick={handleLinkClick}
            >
              Dashboard
            </Link>
          </div>
          <div className="text-[var(--sidebar-text)] bg-[var(--sidebar-button-bg)] rounded-sm overflow-hidden hover:bg-[#242424e1] my-0.5">
            <Link
              className="no-underline text-[var(--sidebar-text)] block p-3 transition-all duration-200 ease-in-out hover:bg-[#242424e1] font-medium"
              to="/clients"
              onClick={handleLinkClick}
            >
              Clientes
            </Link>
          </div>
          <div className="text-[var(--sidebar-text)] bg-[var(--sidebar-button-bg)] rounded-sm overflow-hidden hover:bg-[#242424e1] my-0.5">
            <Link
              className="no-underline text-[var(--sidebar-text)] block p-3 transition-all duration-200 ease-in-out hover:bg-[#242424e1] font-medium"
              to="/vehicles"
              onClick={handleLinkClick}
            >
              Veículos
            </Link>
          </div>
          <div className="text-[var(--sidebar-text)] bg-[var(--sidebar-button-bg)] rounded-sm overflow-hidden hover:bg-[#242424e1] my-0.5">
            <Link
              className="no-underline text-[var(--sidebar-text)] block p-3 transition-all duration-200 ease-in-out hover:bg-[#242424e1] font-medium"
              to="/service-orders"
              onClick={handleLinkClick}
            >
              Ordens de Serviço
            </Link>
          </div>
          <div className="text-[var(--sidebar-text)] bg-[var(--sidebar-button-bg)] rounded-sm overflow-hidden hover:bg-[#242424e1] my-0.5">
            <Link
              className="no-underline text-[var(--sidebar-text)] block p-3 transition-all duration-200 ease-in-out hover:bg-[#242424e1] font-medium"
              to="/inventory"
              onClick={handleLinkClick}
            >
              Estoque e Peças
            </Link>
          </div>

          {/* Menus administrativos apenas para ADMIN */}
          <RoleGuard roles={['ADMIN']}>
            <div className="text-[var(--sidebar-text)] bg-[var(--sidebar-button-bg)] rounded-sm overflow-hidden hover:bg-[#242424e1] my-0.5">
              <Link
                className="no-underline text-[var(--sidebar-text)] block p-3 transition-all duration-200 ease-in-out hover:bg-[#242424e1] font-medium"
                to="/admin"
                onClick={handleLinkClick}
              >
                Administração
              </Link>
            </div>
          </RoleGuard>

          <div className="h-0.25 bg-[rgba(255,255,255,0.2)] my-4"/>

          <div className="text-[var(--sidebar-text)] rounded-sm overflow-hidden hover:bg-[rgba(255,255,255,0.1)]">
            <button
              className="text-[var(--sidebar-text)] bg-[var(--sidebar-button-bg)] font-medium w-full cursor-pointer p-3 justify-start flex hover:bg-[#242424e1]"
              onClick={handleLogout}
            >
              Sair
            </button>
          </div>
        </nav>
      </aside>
    </>
  )
}
