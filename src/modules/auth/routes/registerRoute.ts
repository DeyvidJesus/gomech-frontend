import { rootRoute } from "../../../app/routes/__root"
import { createRoute } from "@tanstack/react-router"
import Register from "../pages/register"

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register
})