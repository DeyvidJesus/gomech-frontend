import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { rootRoute } from '../../../app/routes/__root'

export const serviceOrderDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/service-orders/$id',
  component: lazyRouteComponent(() => import('../components/ServiceOrderDetailsPage')),
})
