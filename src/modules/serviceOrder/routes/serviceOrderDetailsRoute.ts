import { createRoute } from "@tanstack/react-router";
import ServiceOrderDetailsPage from "../components/ServiceOrderDetailsPage";
import { rootRoute } from "../../../app/routes/__root";

export const serviceOrderDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/service-orders/$id",
  component: ServiceOrderDetailsPage
});