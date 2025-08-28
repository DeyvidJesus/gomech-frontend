import { createRootRoute, Outlet, useLocation } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Layout } from "../../shared/components/Layout";

export const rootRoute = createRootRoute({
  component: () => {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    
    if (isAuthPage) {
      return (
        <>
          <Outlet />
          <TanStackRouterDevtools />
        </>
      );
    }
    
    return (
      <>
        <Layout />
        <TanStackRouterDevtools />
      </>
    );
  },
})