import { rootRoute } from "../../../app/routes/__root";
import { createRoute } from "@tanstack/react-router";
import Dashboard from "../components/Dashboard";

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard
});