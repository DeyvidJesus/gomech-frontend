import { createRoute, lazyRouteComponent } from '@tanstack/react-router'

import { rootRoute } from '../../../app/routes/__root'

export const vehicleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'vehicles',
  component: lazyRouteComponent(() =>
    import('../components/VehicleList').then(module => ({ default: module.VehicleList })),
  ),
})

