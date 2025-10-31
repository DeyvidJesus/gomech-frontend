import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { rootRoute } from '../../../app/routes/__root'

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: lazyRouteComponent(() => import('../components/Dashboard')),
})
