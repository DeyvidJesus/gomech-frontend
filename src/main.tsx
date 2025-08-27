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
import { AppProviders } from './app/providers.tsx'

const routeTree = rootRoute.addChildren([loginRoute, registerRoute])
console.log('Route Tree:', routeTree)

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
