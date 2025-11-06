import { useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/modules/auth/hooks/useAuth'

import { tutorialApi } from '../services/api'
import type { TutorialKey, TutorialProgress } from '../types/tutorial'

const TUTORIAL_PROGRESS_QUERY_KEY = ['tutorial-progress']

export function usePageTutorial(tutorialKey: TutorialKey) {
  const { data: auth } = useAuth()
  const queryClient = useQueryClient()

  const progressQuery = useQuery({
    queryKey: TUTORIAL_PROGRESS_QUERY_KEY,
    queryFn: () => tutorialApi.getProgress(),
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: Boolean(auth?.id),
  })

  const markMutation = useMutation({
    mutationFn: () => tutorialApi.markAsViewed(tutorialKey),
    onSuccess: progress => {
      if (progress) {
        queryClient.setQueryData<TutorialProgress | undefined>(
          TUTORIAL_PROGRESS_QUERY_KEY,
          progress,
        )
      } else {
        queryClient.setQueryData<TutorialProgress | undefined>(
          TUTORIAL_PROGRESS_QUERY_KEY,
          previous => {
            const completed = new Set(previous?.completedTutorials ?? [])
            completed.add(tutorialKey)
            return {
              completedTutorials: Array.from(completed),
              lastUpdatedAt: new Date().toISOString(),
            }
          },
        )
      }
    },
  })

  const hasSeenTutorial = useMemo(() => {
    if (!progressQuery.data) {
      return false
    }

    return progressQuery.data.completedTutorials.includes(tutorialKey)
  }, [progressQuery.data, tutorialKey])

  const shouldShow = Boolean(auth?.id) && !progressQuery.isLoading && !hasSeenTutorial

  const markAsViewed = useCallback(async () => {
    await markMutation.mutateAsync()
  }, [markMutation])

  return {
    shouldShow,
    markAsViewed,
    isLoading: progressQuery.isLoading,
    isSaving: markMutation.isPending,
    error: progressQuery.error as Error | null,
    saveError: markMutation.error as Error | null,
  }
}
