import { Outlet, useLocation } from '@tanstack/react-router'
import { lazy, Suspense, useEffect, useState } from 'react'

import ProtectedRoute from '../../modules/auth/components/ProtectedRoute'
import { useAuth } from '../../modules/auth/hooks/useAuth'
import { useMediaQuery } from '../hooks/useMediaQuery'
import Sidebar from './Sidebar'

const ChatBot = lazy(() => import('../../modules/ai/components/ChatBot/ChatBot'))

const preloadChatBot = () => import('../../modules/ai/components/ChatBot/ChatBot')

export function Layout() {
  const location = useLocation()
  const { data } = useAuth()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const hideChatBotRoutes = ['/login', '/cadastro']
  const shouldShowChatBot = Boolean(data && !hideChatBotRoutes.includes(location.pathname))
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  useEffect(() => {
    if (shouldShowChatBot) {
      void preloadChatBot()
    }
  }, [shouldShowChatBot])

  useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(false)
    }
  }, [isDesktop])

  const containerClassName = `bg-gray-50 text-gray-900 min-h-screen flex flex-col${
    isSidebarOpen && !isDesktop ? ' overflow-hidden' : ''
  }`

  return (
    <ProtectedRoute>
      <div className={containerClassName}>
        {shouldShowChatBot && (
          <Suspense fallback={null}>
            <ChatBot />
          </Suspense>
        )}

        <header className="lg:hidden bg-[var(--sidebar-bg)] shadow-sm px-4 py-3 flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className="p-2 text-[var(--sidebar-text)] hover:bg-[rgba(255,255,255,0.1)] rounded-md transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <img src="/logo_black.png" alt="GoMech" className="w-8 h-8" />
          </div>

          <div className="w-10" /> {/* Spacer para centralizar o logo */}
        </header>

        <div className="flex flex-1">          
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} isDesktop={isDesktop} />

          <main className="flex-1 p-3 sm:p-4 lg:p-6 lg:ml-0">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}