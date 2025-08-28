import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../../../app/routes/__root";
import ServiceOrderList from "../components/ServiceOrderList";

export const serviceOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/service-orders",
  component: ServiceOrderList
});