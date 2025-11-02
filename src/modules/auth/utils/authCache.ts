import type { AuthResponse, AuthTokens } from '../types/user'

const AUTH_STORAGE_KEY = 'gomech:auth'

let cachedAuth: AuthResponse | null | undefined

function persistToStorage(value: AuthResponse | null) {
  if (typeof window === 'undefined') {
    return
  }

  if (value) {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(value))
  } else {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

export function loadPersistedAuth(): AuthResponse | null {
  if (cachedAuth !== undefined) {
    return cachedAuth
  }

  if (typeof window === 'undefined') {
    cachedAuth = null
    return cachedAuth
  }

  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY)
    if (!stored) {
      cachedAuth = null
      return cachedAuth
    }

    cachedAuth = JSON.parse(stored) as AuthResponse
  } catch (error) {
    console.error('Erro ao carregar cache de autenticação:', error)
    cachedAuth = null
  }

  return cachedAuth
}

export function getCachedAuth(): AuthResponse | null {
  if (cachedAuth === undefined) {
    return loadPersistedAuth()
  }

  return cachedAuth ?? null
}

export function setCachedAuth(value: AuthResponse | null) {
  cachedAuth = value
  persistToStorage(value)
}

function updateCachedAuth(updater: (prev: AuthResponse | null) => AuthResponse | null) {
  const current = getCachedAuth()
  const next = updater(current)
  cachedAuth = next
  persistToStorage(next)
}

export function getStoredAccessToken(): string | null {
  return getCachedAuth()?.accessToken ?? null
}

export function getStoredRefreshToken(): string | null {
  return getCachedAuth()?.refreshToken ?? null
}

export function setStoredTokens(tokens: AuthTokens) {
  updateCachedAuth(prev => {
    if (!prev) {
      return null
    }

    return { ...prev, ...tokens }
  })
}

export function clearStoredAuth() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    window.localStorage.removeItem('tanstack-query-persist-client')
  }

  cachedAuth = null
}
