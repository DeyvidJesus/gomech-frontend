import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { rootRoute } from '../../../app/routes/__root'

export const clientDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clients/$id',
  component: lazyRouteComponent(() =>
    import('../components/ClientDetailsPage').then(module => ({ default: module.ClientDetailsPage })),
  ),
})

