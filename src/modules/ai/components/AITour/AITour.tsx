import AITourTooltip from './AITourTooltip'
import type { AITourState } from '../../hooks/useAITour'

interface AITourProps {
  tourState: AITourState
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

export default function AITour({
  tourState,
  onNext,
  onPrev,
  onSkip,
  isFirstStep,
  isLastStep,
}: AITourProps) {
  if (!tourState.isActive || tourState.steps.length === 0) {
    return null
  }

  const currentStep = tourState.steps[tourState.currentStep]

  if (!currentStep) {
    return null
  }

  return (
    <AITourTooltip
      step={currentStep}
      stepNumber={tourState.currentStep}
      totalSteps={tourState.totalSteps}
      onNext={onNext}
      onPrev={onPrev}
      onSkip={onSkip}
      isFirstStep={isFirstStep}
      isLastStep={isLastStep}
    />
  )
}

