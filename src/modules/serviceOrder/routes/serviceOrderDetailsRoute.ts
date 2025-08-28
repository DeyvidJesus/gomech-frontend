import { createRoute } from "@tanstack/react-router";
import { serviceOrderRoute } from "./serviceOrderRoute";
import ServiceOrderDetailsPage from "../components/ServiceOrderDetailsPage";

export const serviceOrderDetailsRoute = createRoute({
  getParentRoute: () => serviceOrderRoute,
  path: "/$id",
  component: ServiceOrderDetailsPage
});