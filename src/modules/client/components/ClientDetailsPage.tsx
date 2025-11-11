import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { clientsApi } from "../services/api";
import type { Client } from "../types/client";
import { useState } from "react";
import { EditClientModal } from "./EditClientModal";
import Breadcrumbs from "../../../shared/components/Breadcrumbs";
import { PageTutorial } from "@/modules/tutorial/components/PageTutorial";
import { showInfoToast } from "@/shared/utils/errorHandler";

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-orangeWheel-500 mb-4 mx-auto"></div>
          <p className="text-gray-600 text-sm sm:text-lg">Carregando dados do cliente...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-8 text-center">
        <div className="text-red-600 text-4xl sm:text-6xl mb-4">❌</div>
        <h3 className="text-red-800 text-lg sm:text-xl font-semibold mb-2">Cliente não encontrado</h3>
        <p className="text-red-600 mb-6 text-sm sm:text-base">O cliente que você está procurando não existe ou foi removido.</p>
        <button
          onClick={() => navigate({ to: "/clients" })}
          className="bg-orangeWheel-500 hover:bg-orangeWheel-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          ← Voltar à Lista
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageTutorial
        tutorialKey="client-details"
        title="Detalhes completos do cliente"
        description="Revise informações de contato, dados pessoais e histórico relacionado ao cliente."
        steps={[
          {
            title: 'Dados principais',
            description: 'Os cartões exibem telefone, endereço e documentos para validar o cadastro.',
            icon: '👤',
          },
          {
            title: 'Observações e histórico',
            description: 'Utilize o campo de observações para registrar informações relevantes de atendimento.',
            icon: '📝',
          },
          {
            title: 'Veículos vinculados',
            description: 'Confira rapidamente os veículos associados e acesse cada ficha detalhada.',
            icon: '🚗',
          },
        ]}
      />
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Clientes", to: "/clients" },
          { label: client.name }
        ]}
      />

      {/* Header */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate({ to: "/clients" })}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-colors flex-shrink-0"
              title="Voltar à lista"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orangeWheel-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl font-bold text-white">
                {client.name.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-orangeWheel-500 truncate">{client.name}</h1>
              <p className="text-gray-600 text-sm sm:text-base">Cliente ID: {client.id}</p>
            </div>
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="bg-orangeWheel-500 hover:bg-orangeWheel-600 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <span>✏️</span>
            <span className="hidden xs:inline">Editar Cliente</span>
            <span className="xs:hidden">Editar</span>
          </button>
        </div>
      </div>

      {/* Informações Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Informações de Contato */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-base sm:text-lg">📞</span>
            Informações de Contato
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Email</label>
              <div className="text-sm sm:text-lg text-gray-900 font-medium break-all">{client.email}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Telefone</label>
              <div className="text-sm sm:text-lg text-gray-900 font-medium">
                {client.phone || (
                  <span className="text-gray-400 italic">Não informado</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dados Pessoais */}
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-base sm:text-lg">👤</span>
            Dados Pessoais
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Documento (CPF/CNPJ)</label>
              <div className="text-sm sm:text-lg text-gray-900 font-medium">
                {client.document || (
                  <span className="text-gray-400 italic">Não informado</span>
                )}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <label className="text-xs sm:text-sm font-medium text-gray-600">Data de Nascimento</label>
              <div className="text-sm sm:text-lg text-gray-900 font-medium">
                {client.birthDate ? (
                  new Date(client.birthDate).toLocaleDateString('pt-BR')
                ) : (
                  <span className="text-gray-400 italic">Não informado</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-base sm:text-lg">🏠</span>
          Endereço
        </h2>
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <div className="text-sm sm:text-lg text-gray-900">
            {client.address || (
              <span className="text-gray-400 italic">Endereço não informado</span>
            )}
          </div>
        </div>
      </div>

      {/* Observações */}
      {client.observations && (
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-base sm:text-lg">📝</span>
            Observações
          </h2>
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <div className="text-sm sm:text-base text-gray-900 whitespace-pre-wrap">
              {client.observations}
            </div>
          </div>
        </div>
      )}

      {/* Veículos */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-base sm:text-lg">🚗</span>
            Veículos {client.vehicles && client.vehicles.length > 0 && `(${client.vehicles.length})`}
          </h2>
          <button
            className="bg-orangeWheel-500 hover:bg-orangeWheel-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm w-full sm:w-auto"
            onClick={() => showInfoToast('Funcionalidade de adicionar veículo será implementada')}
          >
            + Adicionar Veículo
          </button>
        </div>

        {client.vehicles && client.vehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {client.vehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{vehicle.model}</div>
                  <div className="text-orangeWheel-500 text-lg sm:text-2xl">🚗</div>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 space-y-1">
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
          <div className="text-center py-6 sm:py-8">
            <div className="text-gray-400 text-3xl sm:text-4xl mb-4">🚗</div>
            <p className="text-gray-500 text-sm sm:text-base">Nenhum veículo cadastrado para este cliente</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">Adicione o primeiro veículo para começar</p>
          </div>
        )}
      </div>

      {/* Informações do Sistema */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-base sm:text-lg">📅</span>
          Informações do Sistema
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <label className="text-xs sm:text-sm font-medium text-gray-600">Cadastrado em</label>
            <div className="text-sm sm:text-lg text-gray-900 font-medium">
              {new Date(client.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
            <label className="text-xs sm:text-sm font-medium text-gray-600">Última atualização</label>
            <div className="text-sm sm:text-lg text-gray-900 font-medium">
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
          isOpen={showEdit}
          client={client}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
