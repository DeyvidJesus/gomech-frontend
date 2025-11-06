import { useEffect, useMemo, useState } from 'react'

import Modal from '@/shared/components/Modal'

import type { TutorialKey } from '../types/tutorial'
import { usePageTutorial } from '../hooks/usePageTutorial'

interface TutorialStep {
  title: string
  description: string
  icon?: string
}

interface PageTutorialProps {
  tutorialKey: TutorialKey
  title: string
  description?: string
  steps: TutorialStep[]
  ctaLabel?: string
}

export function PageTutorial({
  tutorialKey,
  title,
  description,
  steps,
  ctaLabel = 'Entendi, vamos lá!',
}: PageTutorialProps) {
  const { shouldShow, markAsViewed, isSaving, saveError } = usePageTutorial(tutorialKey)
  const [isOpen, setIsOpen] = useState(false)
  const [hasSkipped, setHasSkipped] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const normalizedSteps = useMemo(() => steps.filter(Boolean), [steps])

  useEffect(() => {
    if (shouldShow && !hasSkipped) {
      setIsOpen(true)
    }
  }, [shouldShow, hasSkipped])

  const closeModal = () => {
    setIsOpen(false)
  }

  const handleConfirm = async () => {
    setSubmissionError(null)

    try {
      await markAsViewed()
      setHasSkipped(true)
      closeModal()
    } catch (error) {
      console.error('Erro ao registrar visualização do tutorial', error)
      setSubmissionError('Não foi possível salvar que você concluiu este tutorial. Tente novamente.')
    }
  }

  const handleSkip = () => {
    setHasSkipped(true)
    closeModal()
  }

  if (!shouldShow || hasSkipped) {
    return null
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkip}
      title={title}
      description={description}
      headerStyle="primary"
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-orangeWheel-50 border border-orangeWheel-200 p-4 text-sm text-orangeWheel-800">
          <p className="m-0">
            Este guia rápido aparece apenas na sua primeira visita a esta tela. Quando quiser revisar, procure o botão de ajuda ou consulte a documentação da GoMech.
          </p>
        </div>

        <ol className="space-y-3">
          {normalizedSteps.map((step, index) => (
            <li
              key={`${step.title}-${index}`}
              className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orangeWheel-100 text-orangeWheel-600 text-lg font-semibold">
                {step.icon ?? index + 1}
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        {submissionError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {submissionError}
          </div>
        )}

        {saveError && !submissionError && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
            Houve um problema ao salvar sua confirmação. Você pode tentar novamente ou fechar este guia.
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={handleSkip}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
        >
          Ver depois
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-orangeWheel-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orangeWheel-600 disabled:cursor-not-allowed disabled:bg-orangeWheel-300"
        >
          {isSaving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Salvando...
            </>
          ) : (
            <>{ctaLabel}</>
          )}
        </button>
      </div>
    </Modal>
  )
}
