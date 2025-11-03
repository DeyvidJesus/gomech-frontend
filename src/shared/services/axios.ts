import { redirect } from '@tanstack/react-router'
import axios, { type AxiosRequestConfig } from 'axios'

import {
  clearStoredAuth,
  getCachedAuth,
  getStoredAccessToken,
  getStoredRefreshToken,
  loadPersistedAuth,
  setCachedAuth,
  setStoredTokens,
} from '../../modules/auth/utils/authCache'
import type { RefreshTokenResponse } from '../../modules/auth/types/user'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

const refreshClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise: Promise<RefreshTokenResponse> | null = null

interface RetryableRequest extends AxiosRequestConfig {
  _retry?: boolean
}

function ensureAuthorizationHeader(config: any) {
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
}

async function refreshTokens(): Promise<RefreshTokenResponse> {
  if (!refreshPromise) {
    const refreshToken = getStoredRefreshToken()
    if (!refreshToken) {
      throw new Error('Refresh token ausente')
    }

    refreshPromise = refreshClient
      .post<RefreshTokenResponse>('/auth/refresh', { refreshToken })
      .then(response => response.data)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

api.interceptors.request.use(ensureAuthorizationHeader, error => Promise.reject(error))

api.interceptors.response.use(
  response => response,
  async error => {
    const status = error.response?.status
    const originalRequest = (error.config ?? {}) as RetryableRequest
    const requestUrl: string = originalRequest?.url ?? ''

    const isAuthEndpoint = ['/auth/login', '/auth/register', '/auth/refresh'].some(path =>
      requestUrl.includes(path),
    )

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true

      try {
        const tokens = await refreshTokens()
        setStoredTokens(tokens)

        const currentAuth = getCachedAuth()
        if (currentAuth) {
          setCachedAuth({ ...currentAuth, ...tokens })
        }

        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`

        return api(originalRequest)
      } catch (refreshError) {
        clearStoredAuth()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        } else {
          redirect({ to: '/login' })
        }
        return Promise.reject(refreshError)
      }
    }

    if (status === 403) {
      console.error('Acesso negado:', error)
      redirect({ to: '/' })
    }

    return Promise.reject(error)
  },
)

export default api
