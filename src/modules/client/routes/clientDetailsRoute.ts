import { createRoute } from "@tanstack/react-router";
import { ClientDetailsPage } from "../components/ClientDetailsPage";
import { rootRoute } from "../../../app/routes/__root";

export const clientDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/clients/$id",
  component: ClientDetailsPage,
});
