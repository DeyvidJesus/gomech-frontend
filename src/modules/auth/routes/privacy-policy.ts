import { rootRoute } from "../../../app/routes/__root"
import { createRoute } from "@tanstack/react-router"
import PrivacyPolicy from "../pages/privacy-policy"

export const privacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy-policy',
  component: PrivacyPolicy
})