import Sidebar from "./Sidebar";
import { Outlet } from "@tanstack/react-router";

export function Layout() {
  return (
    <div className="bg-bg text-text min-h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
