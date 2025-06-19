import React from 'react';
import Link from 'next/link';

export default function ClientesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-100 p-4 space-y-2">
        <nav className="flex flex-col gap-2">
          <Link href="/" className="text-gray-700 hover:underline">Home</Link>
          <Link href="/clientes" className="text-gray-700 hover:underline">Clientes</Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
