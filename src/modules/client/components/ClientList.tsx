
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "../services/api";
import type { Client } from "../types/client";
import { useState } from "react";
import { ClientDetailsModal } from "./ClientDetailsModal";
import { EditClientModal } from "./EditClientModal";
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
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const navigate = useNavigate();

  // Mutations para deletar
  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });

  // Handlers
  const handleAdd = () => {
    // Aqui você pode abrir um modal ou navegar para uma página de cadastro
    alert("Funcionalidade de adicionar cliente não implementada.");
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setShowEdit(true);
  };

  const handleDelete = (client: Client) => {
    if (window.confirm(`Deseja realmente deletar o cliente ${client.name}?`)) {
      deleteMutation.mutate(client.id);
    }
  };

  const handleView = (client: Client) => {
    navigate({ to: `/clients/${client.id}` });
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedClient(null);
  };

  const handleCloseEdit = () => {
    setShowEdit(false);
    setSelectedClient(null);
  };

  if (isLoading) return <div className="text-center text-lg text-primary mt-8">Carregando clientes...</div>;
  if (error) return <div className="text-center text-lg text-red-600 mt-8">Erro ao carregar clientes.</div>;
  if (!data || data.length === 0) return <div className="text-center text-lg text-gray-500 mt-8">Nenhum cliente encontrado.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-onyx-100 dark:text-onyx-900">Lista de Clientes</h2>
        <button
          onClick={handleAdd}
          className="bg-orangeWheel-500 hover:bg-orangeWheel-600 text-white font-semibold px-4 py-2 rounded shadow transition-colors"
        >
          Adicionar Cliente
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white dark:bg-onyx-200">
          <thead>
            <tr className="bg-onyx-100 dark:bg-onyx-400 text-white">
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Nome</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Telefone</th>
              <th className="px-4 py-2 text-left">Endereço</th>
              <th className="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((client: Client) => (
              <tr key={client.id} className="border-b border-onyx-200 hover:bg-orangeWheel-100/30 transition text-white">
                <td className="px-4 py-2">{client.id}</td>
                <td className="px-4 py-2">{client.name}</td>
                <td className="px-4 py-2">{client.email}</td>
                <td className="px-4 py-2">{client.phone || '-'}</td>
                <td className="px-4 py-2">{client.address || '-'}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => handleView(client)}
                    className="bg-primary hover:bg-orangeWheel-500 text-white px-3 py-1 rounded text-sm transition-colors"
                  >Ver</button>
                  <button
                    onClick={() => handleEdit(client)}
                    className="bg-onyx-400 hover:bg-onyx-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  >Editar</button>
                  <button
                    onClick={() => handleDelete(client)}
                    className="bg-persimmon-500 hover:bg-persimmon-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  >Deletar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modais separados */}
      {showDetails && selectedClient && (
        <ClientDetailsModal client={selectedClient} onClose={handleCloseDetails} />
      )}
      {showEdit && selectedClient && (
        <EditClientModal client={selectedClient} onClose={handleCloseEdit} />
      )}
    </div>
  );
}
