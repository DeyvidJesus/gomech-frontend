import { rootRoute } from "../../../app/routes/__root";
import { createRoute } from "@tanstack/react-router";
import { VehicleList } from "../components/VehicleList";

export const vehicleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "vehicles",
  component: VehicleList,
});
