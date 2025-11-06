import { createRoute } from '@tanstack/react-router'
import { rootRoute } from '../../../app/routes/__root'
import { OrganizationManagement } from '../components/OrganizationManagement'

export const organizationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/organizations',
  component: OrganizationManagement,
})

