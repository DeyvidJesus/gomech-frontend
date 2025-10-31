import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import type { Metric } from 'web-vitals'

import { AppProviders } from './app/providers.tsx'
import { rootRoute } from './app/routes/__root.tsx'
import { loginRoute } from './modules/auth/routes/loginRoute.ts'
import { registerRoute } from './modules/auth/routes/registerRoute.ts'
import { clientDetailsRoute } from './modules/client/routes/clientDetailsRoute.ts'
import { clientRoute } from './modules/client/routes/clientRoute.ts'
import { dashboardRoute } from './modules/dashboard/routes/dashboardRoute.ts'
import { serviceOrderDetailsRoute } from './modules/serviceOrder/routes/serviceOrderDetailsRoute.ts'
import { adminRoute } from './modules/admin/routes/adminRoute.ts'
import { Analytics } from "@vercel/analytics/react"
import { serviceOrderRoute } from './modules/serviceOrder/routes/serviceOrderRoute.ts'
import { vehicleDetailsRoute } from './modules/vehicle/routes/vehicleDetailsRoute.ts'
import { vehicleRoute } from './modules/vehicle/routes/vehicleRoute.ts'
import reportWebVitals from './reportWebVitals.ts'

import './styles.css'
import { privacyPolicyRoute } from './modules/auth/routes/privacy-policy.ts'
import { termsOfServiceRoute } from './modules/auth/routes/terms-of-service.ts'

const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  dashboardRoute,
  privacyPolicyRoute,
  termsOfServiceRoute,
  clientRoute.addChildren([clientDetailsRoute]),
  vehicleRoute.addChildren([vehicleDetailsRoute]),
  serviceOrderRoute.addChildren([serviceOrderDetailsRoute]),
  adminRoute
])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <>
      <StrictMode>
        <AppProviders>
          <RouterProvider router={router} />
        </AppProviders>
      </StrictMode>
      <Analytics />
    </>
  )
}

const handleWebVital = (metric: Metric) => {
  if (import.meta.env.PROD && typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    const body = JSON.stringify(metric)
    const blob = new Blob([body], { type: 'application/json' })
    navigator.sendBeacon('/analytics', blob)
  }

  if (import.meta.env.DEV) {
    console.info(`[web-vitals] ${metric.name}`, metric.value, metric)
  }
}

reportWebVitals(handleWebVital)
