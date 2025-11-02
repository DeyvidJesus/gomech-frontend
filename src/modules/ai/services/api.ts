import api from '../../shared/services/axios'

interface ChatRequest {
  prompt: string
  includeChart?: boolean
  threadId?: string
  userId?: number
}

export const aiService = {
  chat: (data: ChatRequest) => api.post('/ai/chat', data),
  status: () => api.get('/ai/chat/status'),
}
