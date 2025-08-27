import RoleGuard from "../../modules/auth/components/RoleGuard";
import { useAuth } from "../../modules/auth/hooks/useAuth";
import { useLogout } from "../../modules/auth/hooks/useLogout";
import { redirect } from "@tanstack/react-router";
import Button from "./Button";

export default function Sidebar() {
  const { data } = useAuth();
  const { user } = data || {};
  const logout = useLogout();

  const handleLogout = () => {
    logout();
    redirect({ to: '/login' });
  };

  return (
    <aside className="w-full max-w-[220px] bg-[var(--sidebar-bg)] text-[var(--sidebar-text)] m-3.5 rounded h-[calc(100vh-36px)] max-h-screen flex flex-col">
      <div className="p-4 text-center">
        <img src="/logo.svg" alt="GoMech" width={80} height={80} />
      </div>

      {/* Informações do usuário */}
      {user && (
        <div className="p-3 mt-0 mx-3 mb-4 bg-[rgba(255, 255, 255, 0.1)] rounded-lg text-xs text-[var(--sidebar-text)]">
          <div className="mb-1.5">
            <strong>{user?.email}</strong>
          </div>
          <div className={`inline-block px-2 py-1 rounded-xl text-xs font-bold text-white ${user?.role === 'ADMIN' ? 'bg-red-500' : 'bg-blue-500'}`}>
            {user?.role}
          </div>
        </div>
      )}

      <nav className="flex flex-col flex-1 p-3">
        <div className="text-[var(--sidebar-text)] bg-[var(--sidebar-button-bg)] rounded-sm overflow-hidden hover:bg-[rgba(255, 255, 255, 0.1)] my-0.5">
          <a className="no-underline text-[var(--sidebar-text)] block p-3 transition-all duration-200 ease-in-out hover:bg-[rgba(255,255,255,0.1)] font-medium" href="/">Dashboard</a>
        </div>
        <div className="text-[var(--sidebar-text)] bg-[var(--sidebar-button-bg)] rounded-sm overflow-hidden hover:bg-[rgba(255, 255, 255, 0.1)] my-0.5">
          <a className="no-underline text-[var(--sidebar-text)] block p-3 transition-all duration-200 ease-in-out hover:bg-[rgba(255,255,255,0.1)] font-medium" href="/clientes">Clientes</a>
        </div>
        <div className="text-[var(--sidebar-text)] bg-[var(--sidebar-button-bg)] rounded-sm overflow-hidden hover:bg-[rgba(255, 255, 255, 0.1)] my-0.5">
          <a className="no-underline text-[var(--sidebar-text)] block p-3 transition-all duration-200 ease-in-out hover:bg-[rgba(255,255,255,0.1)] font-medium" href="/veiculos">Veículos</a>
        </div>
        <div className="text-[var(--sidebar-text)] bg-[var(--sidebar-button-bg)] rounded-sm overflow-hidden hover:bg-[rgba(255, 255, 255, 0.1)] my-0.5">
          <a className="no-underline text-[var(--sidebar-text)] block p-3 transition-all duration-200 ease-in-out hover:bg-[rgba(255,255,255,0.1)] font-medium" href="/os">Ordens de Serviço</a>
        </div>

        {/* Menus administrativos apenas para ADMIN */}
        <RoleGuard roles={['ADMIN']}>
          <div className="text-[var(--sidebar-text)] bg-[var(--sidebar-button-bg)] rounded-sm overflow-hidden hover:bg-[rgba(255, 255, 255, 0.1)] my-0.5">
            <a className="no-underline text-[var(--sidebar-text)] block p-3 transition-all duration-200 ease-in-out hover:bg-[rgba(255,255,255,0.1)] font-medium" href="/admin">Administração</a>
          </div>
        </RoleGuard>

        <div className="h-0.25 bg-[rgba(255,255,255,0.2)] my-4"/>

        <div className="text-[var(--sidebar-text)] rounded-sm overflow-hidden hover:bg-[rgba(255, 255, 255, 0.1)]">
          <Button
            fullWidth
            className="text-[var(--sidebar-text)] bg-[var(--sidebar-button-bg)] font-medium w-full cursor-pointer p-3 justify-start flex"
            onClick={handleLogout}
          >
            Sair
          </Button>
        </div>
      </nav>
    </aside>
  );
}