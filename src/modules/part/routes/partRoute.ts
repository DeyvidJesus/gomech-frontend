import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { rootRoute } from "../../../app/routes/__root";

export const partRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/parts",
  component: lazyRouteComponent(() => import("../components/PartList")),
});
