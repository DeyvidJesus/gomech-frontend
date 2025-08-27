import App from "../../App.tsx";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const rootRoute = createRootRoute({
  component: () => (
    <>
      <App />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})