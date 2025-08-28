import { useAuth } from "../../modules/auth/hooks/useAuth";
import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "@tanstack/react-router";
import ChatBot from "../../modules/ai/components/ChatBot/ChatBot";
import ProtectedRoute from "../../modules/auth/components/ProtectedRoute";

export function Layout() {
  const location = useLocation();
  const { data } = useAuth();

  const hideChatBotRoutes = ["/login", "/cadastro"];

  const shouldShowChatBot =
    data && !hideChatBotRoutes.includes(location.pathname);

  return (
    <ProtectedRoute>
      <div className="bg-bg text-text min-h-screen flex flex-col">
        {shouldShowChatBot && <ChatBot />}
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
