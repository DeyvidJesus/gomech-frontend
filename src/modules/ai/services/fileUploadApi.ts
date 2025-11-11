import axios from 'axios'

import {
  clearStoredAuth,
  getCachedAuth,
  getStoredAccessToken,
  loadPersistedAuth,
} from '../../auth/utils/authCache'
import { showWarningToast } from '@/shared/utils/errorHandler'

const fileUploadApi = axios.create({
  baseURL: 'https://clear-ellene-deyvidgondim-8b8a208e.koyeb.app',
  timeout: 300000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

fileUploadApi.interceptors.request.use(
  config => {
    const token = getStoredAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      return config
    }

    const auth = getCachedAuth() ?? loadPersistedAuth()
    if (auth?.accessToken) {
      config.headers.Authorization = `Bearer ${auth.accessToken}`
    }

    return config
  },
  error => Promise.reject(error),
)

fileUploadApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearStoredAuth()
      window.location.href = '/login'
    } else if (error.response?.status === 403) {
      console.error('Acesso negado:', error.response.data)
      showWarningToast('Você não tem permissão para realizar esta ação')
    }

    return Promise.reject(error)
  },
)

interface FileUploadResponse {
  status: string
  message: string
  documentsProcessed: number
}

interface IngestionStatus {
  status: string
  ai_status: {
    enhanced_ai: boolean
    database_connection: boolean
    embeddings: boolean
    rag_system: boolean
  }
  message: string
}

export const fileUploadService = {
  uploadFile: async (file: File, collectionName?: string): Promise<FileUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    if (collectionName) {
      formData.append('collectionName', collectionName)
    }

    const response = await fileUploadApi.post('/api/files/upload', formData)
    return response.data
  },

  clearData: async (): Promise<{ status: string; message: string }> => {
    const response = await fileUploadApi.post('/api/files/clear')
    return response.data
  },

  getIngestionStatus: async (): Promise<IngestionStatus> => {
    const response = await fileUploadApi.get('/api/files/status')
    return response.data
  },

  uploadFileWithProgress: async (
    file: File,
    onProgress?: (progress: number) => void,
    collectionName?: string,
  ): Promise<FileUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    if (collectionName) {
      formData.append('collectionName', collectionName)
    }

    const response = await fileUploadApi.post('/api/files/upload', formData, {
      onUploadProgress: progressEvent => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress?.(progress)
        }
      },
    })

    return response.data
  },
}
