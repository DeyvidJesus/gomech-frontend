
import { createRoute } from "@tanstack/react-router";
import { VehicleDetailsPage } from "../components/VehicleDetailsPage";
import { rootRoute } from "../../../app/routes/__root";

export const vehicleDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/vehicles/$id",
  component: VehicleDetailsPage,
});
