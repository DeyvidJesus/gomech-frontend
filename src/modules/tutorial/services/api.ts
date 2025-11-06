import api from '@/shared/services/axios'

import type { TutorialKey, TutorialProgress } from '../types/tutorial'

export const tutorialApi = {
  async getProgress(): Promise<TutorialProgress> {
    const response = await api.get<TutorialProgress>('/users/me/tutorials')
    return response.data
  },
  async markAsViewed(tutorialKey: TutorialKey): Promise<TutorialProgress> {
    const response = await api.post<TutorialProgress>('/users/me/tutorials', { tutorialKey })
    return response.data
  },
}
