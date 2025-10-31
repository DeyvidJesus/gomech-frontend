import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { rootRoute } from '../../../app/routes/__root'

export const clientRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clients',
  component: lazyRouteComponent(() =>
    import('../components/ClientList').then(module => ({ default: module.ClientList })),
  ),
})
