import type { AuthResponse } from '../types/user'

let cachedAuth: AuthResponse | null | undefined

export function loadPersistedAuth() {
  if (cachedAuth !== undefined) {
    return cachedAuth
  }

  if (typeof window === 'undefined') {
    cachedAuth = null
    return cachedAuth
  }

  try {
    const stored = window.localStorage.getItem('tanstack-query-persist-client')
    if (!stored) {
      cachedAuth = null
      return cachedAuth
    }

    const cache = JSON.parse(stored)
    const authData: AuthResponse | null = cache?.clientState?.queries?.find(
      (query: any) => query.queryKey?.[0] === 'auth',
    )?.state?.data

    cachedAuth = authData ?? null
  } catch (error) {
    console.error('Erro ao carregar cache de autenticação:', error)
    cachedAuth = null
  }

  return cachedAuth
}

export function getCachedAuth() {
  return cachedAuth ?? null
}

export function setCachedAuth(value: AuthResponse | null) {
  cachedAuth = value
}

export function getStoredToken() {
  if (typeof window === 'undefined') return null

  return window.localStorage.getItem('token')
}

export function setStoredToken(token: string) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem('token', token)
}

export function clearStoredAuth() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('token')
    window.localStorage.removeItem('user')
    window.localStorage.removeItem('tanstack-query-persist-client')
  }

  cachedAuth = null
}
