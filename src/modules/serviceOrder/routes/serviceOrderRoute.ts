import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { rootRoute } from '../../../app/routes/__root'

export const serviceOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/service-orders',
  component: lazyRouteComponent(() => import('../components/ServiceOrderList')),
})
