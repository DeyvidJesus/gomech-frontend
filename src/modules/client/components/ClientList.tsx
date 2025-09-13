
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "../services/api";
import type { Client } from "../types/client";
import { useState } from "react";
import { EditClientModal } from "./EditClientModal";
import { CreateClientModal } from "./CreateClientModal";
import { useNavigate } from "@tanstack/react-router";

export function ClientList() {
  const queryClient = useQueryClient();
  const { data: clients, isLoading, error } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await clientsApi.getAll();
      return res.data;
    },
  });

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();

  // Mutations para deletar
  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });

  // Handlers
  const handleAdd = () => {
    setShowCreate(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setShowEdit(true);
  };

  const handleDelete = (client: Client) => {
    const isConfirmed = window.confirm(
      `⚠️ Tem certeza que deseja deletar o cliente "${client.name}"?\n\nEsta ação não pode ser desfeita.`
    );
    if (isConfirmed) {
      deleteMutation.mutate(client.id);
    }
  };

  const handleView = (client: Client) => {
    navigate({ to: `/clients/${client.id}` });
  };

  const handleCloseEdit = () => {
    setShowEdit(false);
    setSelectedClient(null);
  };

  const handleCloseCreate = () => {
    setShowCreate(false);
  };

  // Estados de carregamento e erro
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-orangeWheel-500 mb-4 mx-auto"></div>
          <p className="text-gray-600 text-sm sm:text-lg">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
        <div className="text-red-600 text-4xl sm:text-5xl mb-4">⚠️</div>
        <h3 className="text-red-800 text-lg sm:text-xl font-semibold mb-2">Erro ao carregar clientes</h3>
        <p className="text-red-600 text-sm sm:text-base">Ocorreu um problema ao buscar os dados. Tente novamente mais tarde.</p>
      </div>
    );
  }

  console.log(clients)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-orangeWheel-500 mb-2 flex items-center gap-2">
              <span className="text-lg sm:text-xl md:text-2xl">👥</span>
              Gestão de Clientes
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">Gerencie todos os clientes da sua oficina</p>
          </div>
          <button
            onClick={handleAdd}
            className="bg-orangeWheel-500 hover:bg-orangeWheel-600 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <span className="text-lg">+</span>
            <span className="hidden xs:inline">Novo Cliente</span>
            <span className="xs:hidden">Novo</span>
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-r from-orangeWheel-500 to-orangeWheel-600 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs sm:text-sm font-medium">Total de Clientes</p>
              <p className="text-2xl sm:text-3xl font-bold">{clients?.length || 0}</p>
            </div>
            <div className="text-2xl sm:text-4xl opacity-80">👥</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-xs sm:text-sm font-medium">Clientes Ativos</p>
              <p className="text-2xl sm:text-3xl font-bold">{clients?.length || 0}</p>
            </div>
            <div className="text-2xl sm:text-4xl opacity-80">✅</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orangeWheel-400 to-orangeWheel-500 rounded-lg p-4 sm:p-6 text-white sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs sm:text-sm font-medium">Novos este Mês</p>
              <p className="text-2xl sm:text-3xl font-bold">+{Math.ceil((clients?.length || 0) * 0.2)}</p>
            </div>
            <div className="text-2xl sm:text-4xl opacity-80">📈</div>
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      {!clients || clients.length === 0 ? (
        <div className="bg-white rounded-lg p-8 sm:p-12 text-center shadow-sm border border-gray-200">
          <div className="text-gray-400 text-4xl sm:text-6xl mb-4">👤</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Nenhum cliente encontrado</h3>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">Comece adicionando o primeiro cliente da sua oficina</p>
          <button
            onClick={handleAdd}
            className="bg-orangeWheel-500 hover:bg-orangeWheel-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Adicionar Primeiro Cliente
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed divide-y divide-gray-200">
                <colgroup>
                  <col className="w-1/3" />
                  <col className="w-1/4" />
                  <col className="w-1/6" />
                  <col className="w-1/4" />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client: Client) => (
                    <tr key={client.id} className="hover:bg-orangeWheel-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-orangeWheel-500 flex items-center justify-center">
                              <span className="text-white font-semibold text-xs">
                                {client.name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3 min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900 truncate">{client.name}</div>
                            <div className="text-xs text-gray-500">ID: {client.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 truncate">{client.email}</div>
                        <div className="text-xs text-gray-500 truncate">{client.phone || 'Sem telefone'}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(client)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded text-xs transition-colors"
                            title="Ver detalhes"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleEdit(client)}
                            className="bg-gray-600 hover:bg-gray-700 text-white p-1.5 rounded text-xs transition-colors"
                            title="Editar cliente"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(client)}
                            className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded text-xs transition-colors"
                            title="Deletar cliente"
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? '⏳' : '🗑️'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {clients.map((client: Client) => (
              <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-orangeWheel-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {client.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{client.name}</h3>
                      <p className="text-xs text-gray-500">ID: {client.id}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">📧</span>
                    <span className="text-gray-900 truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">📱</span>
                      <span className="text-gray-900">{client.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">📅</span>
                    <span className="text-gray-500">{new Date(client.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(client)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <span>👁️</span>
                    Ver
                  </button>
                  <button
                    onClick={() => handleEdit(client)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <span>✏️</span>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(client)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1"
                    disabled={deleteMutation.isPending}
                  >
                    <span>{deleteMutation.isPending ? '⏳' : '🗑️'}</span>
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showEdit && selectedClient && (
        <EditClientModal client={selectedClient} onClose={handleCloseEdit} />
      )}
      {showCreate && (
        <CreateClientModal onClose={handleCloseCreate} />
      )}
    </div>
  );
}
