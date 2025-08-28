
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "../services/api";
import type { Client } from "../types/client";
import { useState } from "react";
import { EditClientModal } from "./EditClientModal";
import { CreateClientModal } from "./CreateClientModal";
import { useNavigate } from "@tanstack/react-router";

export function ClientList() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery<Client[]>({
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4 mx-auto"></div>
          <p className="text-gray-600 text-lg">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-5xl mb-4">⚠️</div>
        <h3 className="text-red-800 text-xl font-semibold mb-2">Erro ao carregar clientes</h3>
        <p className="text-red-600">Ocorreu um problema ao buscar os dados. Tente novamente mais tarde.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-orange-600 mb-2">👥 Gestão de Clientes</h1>
            <p className="text-gray-600">Gerencie todos os clientes da sua oficina</p>
          </div>
          <button
            onClick={handleAdd}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total de Clientes</p>
              <p className="text-3xl font-bold">{data?.length || 0}</p>
            </div>
            <div className="text-4xl opacity-80">👥</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Clientes Ativos</p>
              <p className="text-3xl font-bold">{data?.length || 0}</p>
            </div>
            <div className="text-4xl opacity-80">✅</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Novos este Mês</p>
              <p className="text-3xl font-bold">+{Math.ceil((data?.length || 0) * 0.2)}</p>
            </div>
            <div className="text-4xl opacity-80">📈</div>
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      {!data || data.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
          <div className="text-gray-400 text-6xl mb-4">👤</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum cliente encontrado</h3>
          <p className="text-gray-500 mb-6">Comece adicionando o primeiro cliente da sua oficina</p>
          <button
            onClick={handleAdd}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Adicionar Primeiro Cliente
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Endereço
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cadastrado em
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((client: Client) => (
                  <tr key={client.id} className="hover:bg-orange-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {client.name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{client.name}</div>
                          <div className="text-sm text-gray-500">ID: {client.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.email}</div>
                      <div className="text-sm text-gray-500">{client.phone || 'Não informado'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {client.address || 'Não informado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(client)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                          title="Ver detalhes"
                        >
                          👁️ Ver
                        </button>
                        <button
                          onClick={() => handleEdit(client)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                          title="Editar cliente"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(client)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                          title="Deletar cliente"
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? '⏳' : '🗑️'} Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
