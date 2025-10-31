import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { rootRoute } from '../../../app/routes/__root'

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: lazyRouteComponent(() => import('../pages/login')),
})
