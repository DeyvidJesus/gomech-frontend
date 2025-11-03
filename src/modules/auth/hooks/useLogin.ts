import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

import type { AuthResponse, LoginRequest } from '../types/user'
import { authApi } from '../services/api'
import { setCachedAuth } from '../utils/authCache'

interface LoginError {
  message?: string
  mfaRequired?: boolean
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation<AuthResponse, AxiosError<LoginError>, LoginRequest>({
    mutationFn: async credentials => {
      const response = await authApi.login(credentials)
      return response.data
    },
    onSuccess: data => {
      setCachedAuth(data)
      queryClient.setQueryData(['auth'], data)
    },
  })
}
