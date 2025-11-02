import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

import { rootRoute } from "../../../app/routes/__root";

export const auditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/audit",
  component: lazyRouteComponent(() => import("../components/AuditEventPage")),
});
