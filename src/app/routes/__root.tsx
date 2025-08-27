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
          <div className="bg-bg text-text min-h-screen flex items-center justify-center">
            <div className="w-full max-w-md p-8">
              <Outlet />
            </div>
          </div>
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