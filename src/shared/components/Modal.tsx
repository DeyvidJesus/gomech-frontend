import { useEffect, type ReactNode } from 'react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showHeader?: boolean
  headerStyle?: 'default' | 'primary'
  children: ReactNode
  footer?: ReactNode
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-7xl',
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  showHeader = true,
  headerStyle = 'default',
  children,
  footer,
}: ModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-3 sm:px-4 animate-fadeIn m-0"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`
          ${sizeClasses[size]}
          w-full max-h-[95vh] flex flex-col
          bg-white rounded-lg shadow-2xl
          transform transition-all duration-300
          overflow-hidden
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {showHeader && (
          <div
            className={`
              flex-shrink-0
              ${
                headerStyle === 'primary'
                  ? 'bg-orangeWheel-500 text-white'
                  : 'bg-white border-b border-gray-200'
              }
              p-4 sm:p-6
              ${headerStyle === 'primary' ? 'rounded-t-lg' : ''}
            `}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h2
                  id="modal-title"
                  className={`
                    text-lg sm:text-xl font-bold truncate
                    ${headerStyle === 'primary' ? 'text-white' : 'text-gray-900'}
                  `}
                >
                  {title}
                </h2>
                {description && (
                  <p
                    className={`
                      mt-1 text-xs sm:text-sm
                      ${headerStyle === 'primary' ? 'text-orangeWheel-100' : 'text-gray-500'}
                    `}
                  >
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className={`
                  flex-shrink-0 p-2 rounded-lg transition-colors
                  ${
                    headerStyle === 'primary'
                      ? 'text-orangeWheel-100 hover:text-white hover:bg-orangeWheel-600'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }
                  focus:outline-none focus:ring-2 focus:ring-orangeWheel-500
                `}
                aria-label="Fechar modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

