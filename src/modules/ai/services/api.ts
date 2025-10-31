import axios from 'axios'

import {
  clearStoredAuth,
  getCachedAuth,
  getStoredToken,
  loadPersistedAuth,
} from '../../auth/utils/authCache'

const chatApi = axios.create({
  // baseURL: "http://localhost:5080",
  baseURL: 'https://api.go-mech.com',
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
})

chatApi.interceptors.request.use(
  config => {
    const token = getStoredToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      return config
    }

    const auth = getCachedAuth() ?? loadPersistedAuth()
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`
    }

    return config
  },
  error => Promise.reject(error),
)

chatApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearStoredAuth()
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      console.error('Acesso negado:', error.response.data)
      alert('Você não tem permissão para realizar esta ação')
    }

    return Promise.reject(error)
  },
)

interface ChatRequest {
  prompt: string
  includeChart?: boolean
  threadId?: string
  userId?: number
}

export const aiService = {
  chat: (data: ChatRequest) => chatApi.post('/ai/chat', data),
  status: () => chatApi.get('/ai/chat/status'),
}
