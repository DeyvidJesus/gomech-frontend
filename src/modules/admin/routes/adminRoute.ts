import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "../../../app/routes/__root";
import AdminPage from "../components/AdminPage";

export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage
});
