import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import {
  RouterProvider,
  createRouter,
} from '@tanstack/react-router'

import reportWebVitals from './reportWebVitals.ts'

import './styles.css'
import { loginRoute } from './modules/auth/routes/loginRoute.ts'
import { rootRoute } from './app/routes/__root.tsx'
import { registerRoute } from './modules/auth/routes/registerRoute.ts'
import { dashboardRoute } from './modules/dashboard/routes/dashboardRoute.ts'
import { AppProviders } from './app/providers.tsx'
import { clientRoute } from './modules/client/routes/clientRoute.ts'
import { clientDetailsRoute } from './modules/client/routes/clientDetailsRoute.ts'
import { vehicleRoute } from './modules/vehicle/routes/vehicleRoute.ts'
import { vehicleDetailsRoute } from './modules/vehicle/routes/vehicleDetailsRoute.ts'
import { serviceOrderRoute } from './modules/serviceOrder/routes/serviceOrderRoute.ts'
import { serviceOrderDetailsRoute } from './modules/serviceOrder/routes/serviceOrderDetailsRoute.ts'
import { adminRoute } from './modules/admin/routes/adminRoute.ts'

const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  dashboardRoute,
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
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
