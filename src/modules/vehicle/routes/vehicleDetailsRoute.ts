import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { rootRoute } from '../../../app/routes/__root'

export const vehicleDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/vehicles/$id',
  component: lazyRouteComponent(() =>
    import('../components/VehicleDetailsPage').then(module => ({ default: module.VehicleDetailsPage })),
  ),
})

