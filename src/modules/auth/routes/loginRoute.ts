import { rootRoute } from "../../../app/routes/__root"
import { createRoute } from "@tanstack/react-router"
import Login from "../pages/login"

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login
})