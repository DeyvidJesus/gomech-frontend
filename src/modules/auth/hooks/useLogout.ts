import { useQueryClient } from '@tanstack/react-query'

import { clearStoredAuth } from '../utils/authCache'

export function useLogout() {
  const queryClient = useQueryClient()
  return () => {
    clearStoredAuth()

    queryClient.removeQueries({ queryKey: ['auth'] })
    queryClient.clear()
  }
}
