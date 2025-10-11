import { rootRoute } from "../../../app/routes/__root"
import { createRoute } from "@tanstack/react-router"
import TermsOfService from "../pages/terms-of-service"

export const termsOfServiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms-of-service',
  component: TermsOfService
})