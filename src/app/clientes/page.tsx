export default function ClientesPage() {
  const clientes = [
    { id: 1, nome: 'Jo\u00e3o da Silva', email: 'joao@example.com' },
    { id: 2, nome: 'Maria Santos', email: 'maria@example.com' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Adicionar Cliente</button>
      </div>
      <input
        type="text"
        placeholder="Buscar cliente"
        className="border rounded w-full p-2 mb-4"
      />
      <ul className="bg-white shadow rounded divide-y">
        {clientes.map((cliente) => (
          <li key={cliente.id} className="p-4">
            <p className="font-medium">{cliente.nome}</p>
            <p className="text-sm text-gray-500">{cliente.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
