import { vehicleRoute } from "./vehicleRoute";
import { createRoute } from "@tanstack/react-router";
import { VehicleDetailsPage } from "../components/VehicleDetailsPage";

export const vehicleDetailsRoute = createRoute({
  getParentRoute: () => vehicleRoute,
  path: "$id",
  component: VehicleDetailsPage,
});
