import { rootRoute } from "../../../app/routes/__root";
import { createRoute } from "@tanstack/react-router";
import { ClientList } from "../components/ClientList";

export const clientRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/clients",
  component: ClientList
});