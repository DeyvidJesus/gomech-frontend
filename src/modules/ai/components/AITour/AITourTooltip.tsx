import { useEffect, useState, useRef } from 'react'
import type { TourStep } from '../../hooks/useAITour'

interface AITourTooltipProps {
  step: TourStep
  stepNumber: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export default function AITourTooltip({
  step,
  stepNumber,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  isFirstStep,
  isLastStep,
}: AITourTooltipProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top')
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const targetElement = document.querySelector(step.target)
    
    if (targetElement && tooltipRef.current) {
      const targetRect = targetElement.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()
      const placement = step.placement || 'bottom'

      let top = 0
      let left = 0
      let arrow: 'top' | 'bottom' | 'left' | 'right' = 'top'

      switch (placement) {
        case 'bottom':
          top = targetRect.bottom + 10
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2)
          arrow = 'top'
          break
        case 'top':
          top = targetRect.top - tooltipRect.height - 10
          left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2)
          arrow = 'bottom'
          break
        case 'right':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2)
          left = targetRect.right + 10
          arrow = 'left'
          break
        case 'left':
          top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2)
          left = targetRect.left - tooltipRect.width - 10
          arrow = 'right'
          break
      }

      // Ajustar se sair da tela
      const margin = 10
      if (left < margin) left = margin
      if (left + tooltipRect.width > window.innerWidth - margin) {
        left = window.innerWidth - tooltipRect.width - margin
      }
      if (top < margin) top = margin
      if (top + tooltipRect.height > window.innerHeight - margin) {
        top = window.innerHeight - tooltipRect.height - margin
      }

      setPosition({ top, left })
      setArrowPosition(arrow)
    }
  }, [step.target, step.placement])

  const arrowClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 border-b-white border-t-transparent border-l-transparent border-r-transparent',
    bottom: 'top-full left-1/2 -translate-x-1/2 border-t-white border-b-transparent border-l-transparent border-r-transparent',
    left: 'right-full top-1/2 -translate-y-1/2 border-r-white border-l-transparent border-t-transparent border-b-transparent',
    right: 'left-full top-1/2 -translate-y-1/2 border-l-white border-r-transparent border-t-transparent border-b-transparent',
  }

  return (
    <>
      {/* Overlay escuro */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
        onClick={onSkip}
      />

      {/* Spotlight no elemento */}
      <style>
        {`
          ${step.target} {
            position: relative;
            z-index: 9999 !important;
            box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(245, 124, 0, 0.8) !important;
            border-radius: 8px;
          }
        `}
      </style>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed bg-white rounded-lg shadow-2xl p-5 z-[10000] max-w-md"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        {/* Arrow */}
        <div
          className={`absolute w-0 h-0 border-8 ${arrowClasses[arrowPosition]}`}
        />

        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-800 m-0">{step.title}</h3>
            <p className="text-sm text-gray-500 m-0">
              Passo {stepNumber + 1} de {totalSteps}
            </p>
          </div>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-0 bg-transparent border-none cursor-pointer"
            aria-label="Fechar tour"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <p className="text-gray-700 mb-4 leading-relaxed">{step.content}</p>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-700 bg-transparent border-none cursor-pointer text-sm"
          >
            Pular tour
          </button>

          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                onClick={onPrev}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md border-none cursor-pointer text-sm transition-colors"
              >
                Anterior
              </button>
            )}
            
            <button
              onClick={isLastStep ? onSkip : onNext}
              className="px-4 py-2 bg-gradient-to-r from-orangeWheel-500 to-persimmon-500 hover:from-orangeWheel-600 hover:to-persimmon-600 text-white rounded-md border-none cursor-pointer text-sm font-medium transition-all"
            >
              {isLastStep ? 'Concluir' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

