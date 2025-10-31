import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { SpeedInsights } from '@vercel/speed-insights/react'

import { ensureQueryClientPersistence, queryClient } from './queryClient'

interface Props {
  children: ReactNode;
}

export function AppProviders({ children }: Props) {
  useEffect(() => {
    ensureQueryClientPersistence()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <SpeedInsights />
    </QueryClientProvider>
  )
}
