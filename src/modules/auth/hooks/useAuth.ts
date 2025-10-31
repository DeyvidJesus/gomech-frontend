import { useQuery } from '@tanstack/react-query'

import type { AuthResponse } from '../types/user'
import { loadPersistedAuth, setCachedAuth } from '../utils/authCache'

export function useAuth() {
  return useQuery<AuthResponse | null>({
    queryKey: ['auth'],
    queryFn: async () => loadPersistedAuth(),
    initialData: () => loadPersistedAuth(),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    onSuccess: data => {
      setCachedAuth(data ?? null)
    },
  })
}
