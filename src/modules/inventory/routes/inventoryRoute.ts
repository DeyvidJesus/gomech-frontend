import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { rootRoute } from "../../../app/routes/__root";

export const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inventory",
  component: lazyRouteComponent(() => import("../components/InventoryDashboard")),
});
