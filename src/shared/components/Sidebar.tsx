import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <aside
      className={`bg-bg border-r border-gray-200 dark:border-gray-700 transition-all duration-300 h-[calc(100vh-3.5rem)] ${open ? "w-60" : "w-16"
        }`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-text w-full text-left hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {open ? "⬅️ Fechar" : "➡️ Abrir"}
      </button>

      <nav className="flex flex-col gap-2 mt-4">
        <ThemeToggle />

        <a href="/clients" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-text">
          Clientes
        </a>
        <a href="/vehicles" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-text">
          Veículos
        </a>
        <a href="/service-orders" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-text">
          Ordens de Serviço
        </a>
      </nav>
    </aside>
  );
}

export default Sidebar;