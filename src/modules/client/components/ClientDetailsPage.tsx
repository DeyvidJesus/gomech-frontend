import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { clientsApi } from "../services/api";
import type { Client } from "../types/client";
import { useState } from "react";
import { EditClientModal } from "./EditClientModal";

export function ClientDetailsPage() {
  const { id } = useParams({ from: "/clients/$id" });
  const navigate = useNavigate();
  const clientId = Number(id);
  const [showEdit, setShowEdit] = useState(false);

  const { data: client, isLoading, error } = useQuery<Client>({
    queryKey: ["client", clientId],
    queryFn: async () => {
      const res = await clientsApi.getById(clientId);
      return res.data;
    },
    enabled: !!clientId,
  });

  console.log(client);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4 mx-auto"></div>
          <p className="text-gray-600 text-lg">Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <div className="text-red-600 text-6xl mb-4">❌</div>
        <h3 className="text-red-800 text-xl font-semibold mb-2">Cliente não encontrado</h3>
        <p className="text-red-600 mb-6">O cliente que você está procurando não existe ou foi removido.</p>
        <button
          onClick={() => navigate({ to: "/clients" })}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          ← Voltar à Lista
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: "/clients" })}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-colors"
              title="Voltar à lista"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {client.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-orange-600">{client.name}</h1>
              <p className="text-gray-600">Cliente ID: {client.id}</p>
            </div>
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            ✏️ Editar Cliente
          </button>
        </div>
      </div>

      {/* Informações Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações de Contato */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            📞 Informações de Contato
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600">Email</label>
              <div className="text-lg text-gray-900 font-medium">{client.email}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600">Telefone</label>
              <div className="text-lg text-gray-900 font-medium">
                {client.phone || (
                  <span className="text-gray-400 italic">Não informado</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Endereço */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🏠 Endereço
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-lg text-gray-900">
              {client.address || (
                <span className="text-gray-400 italic">Endereço não informado</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Veículos */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            🚗 Veículos {client.vehicles && client.vehicles.length > 0 && `(${client.vehicles.length})`}
          </h2>
          <button
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            onClick={() => alert('Funcionalidade de adicionar veículo será implementada')}
          >
            + Adicionar Veículo
          </button>
        </div>

        {client.vehicles && client.vehicles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {client.vehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-lg font-semibold text-gray-900">{vehicle.model}</div>
                  <div className="text-orange-600 text-2xl">🚗</div>
                </div>
                <div className="text-sm text-gray-600">
                  <div><strong>Placa:</strong> {vehicle.licensePlate}</div>
                  {vehicle.manufactureDate && (
                    <div><strong>Ano:</strong> {new Date(vehicle.manufactureDate).getFullYear()}</div>
                  )}
                  {vehicle.color && <div><strong>Cor:</strong> {vehicle.color}</div>}
                  {vehicle.kilometers && (
                    <div><strong>Km:</strong> {vehicle.kilometers.toLocaleString('pt-BR')}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">🚗</div>
            <p className="text-gray-500">Nenhum veículo cadastrado para este cliente</p>
            <p className="text-sm text-gray-400 mt-2">Adicione o primeiro veículo para começar</p>
          </div>
        )}
      </div>

      {/* Informações do Sistema */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          📅 Informações do Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="text-sm font-medium text-gray-600">Cadastrado em</label>
            <div className="text-lg text-gray-900 font-medium">
              {new Date(client.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="text-sm font-medium text-gray-600">Última atualização</label>
            <div className="text-lg text-gray-900 font-medium">
              {new Date(client.updatedAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {showEdit && (
        <EditClientModal 
          client={client} 
          onClose={() => setShowEdit(false)} 
        />
      )}
    </div>
  );
}
