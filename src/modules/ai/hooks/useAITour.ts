import { useState, useCallback, useEffect } from 'react'

export interface TourStep {
  target: string // Seletor CSS do elemento
  title: string
  content: string
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

export interface AITourState {
  isActive: boolean
  currentStep: number
  steps: TourStep[]
  totalSteps: number
}

export function useAITour() {
  const [tourState, setTourState] = useState<AITourState>({
    isActive: false,
    currentStep: 0,
    steps: [],
    totalSteps: 0,
  })

  const startTour = useCallback((steps: TourStep[]) => {
    if (!steps || steps.length === 0) return

    setTourState({
      isActive: true,
      currentStep: 0,
      steps,
      totalSteps: steps.length,
    })
  }, [])

  const nextStep = useCallback(() => {
    setTourState((prev) => {
      if (prev.currentStep < prev.totalSteps - 1) {
        return { ...prev, currentStep: prev.currentStep + 1 }
      }
      return prev
    })
  }, [])

  const prevStep = useCallback(() => {
    setTourState((prev) => {
      if (prev.currentStep > 0) {
        return { ...prev, currentStep: prev.currentStep - 1 }
      }
      return prev
    })
  }, [])

  const skipTour = useCallback(() => {
    setTourState({
      isActive: false,
      currentStep: 0,
      steps: [],
      totalSteps: 0,
    })
  }, [])

  const endTour = useCallback(() => {
    skipTour()
  }, [skipTour])

  // Scroll para o elemento do passo atual
  useEffect(() => {
    if (tourState.isActive && tourState.steps[tourState.currentStep]) {
      const step = tourState.steps[tourState.currentStep]
      const element = document.querySelector(step.target)
      
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [tourState.isActive, tourState.currentStep, tourState.steps])

  return {
    tourState,
    startTour,
    nextStep,
    prevStep,
    skipTour,
    endTour,
    isLastStep: tourState.currentStep === tourState.totalSteps - 1,
    isFirstStep: tourState.currentStep === 0,
  }
}

