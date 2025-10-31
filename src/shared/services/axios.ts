import { redirect } from '@tanstack/react-router'
import axios from 'axios'

import {
  clearStoredAuth,
  getCachedAuth,
  getStoredToken,
  loadPersistedAuth,
} from '../../modules/auth/utils/authCache'

const api = axios.create({
  // baseURL: "http://localhost:5080",
  baseURL: 'https://api.go-mech.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
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

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      clearStoredAuth()
      redirect({ to: '/login' })
    } else if (error.response?.status === 403) {
      console.error('Acesso negado:', error)
      redirect({ to: '/' })
    }

    return Promise.reject(error)
  },
)

export default api
