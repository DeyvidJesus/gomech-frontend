import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { rootRoute } from "../../../app/routes/__root";

export const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/analytics",
  component: lazyRouteComponent(() => import("../components/AnalyticsDashboard")),
});
