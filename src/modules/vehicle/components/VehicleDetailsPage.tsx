import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { vehiclesApi } from "../services/api";
import type { Vehicle } from "../types/vehicle";
import { useState } from "react";
import { serviceOrdersApi } from '../../serviceOrder/services/api';
import { EditVehicleModal } from "./EditVehicleModal";
import { clientsApi } from "../../client/services/api";
import type { Client } from "../../client/types/client";

export function VehicleDetailsPage() {
  const { id } = useParams({ from: "/vehicles/$id" });
  const navigate = useNavigate();
  const vehicleId = Number(id);
  const [showEdit, setShowEdit] = useState(false);

  const {
    data: vehicleServiceOrders = [],
    isLoading: vehicleOrdersLoading
  } = useQuery({
    queryKey: ["serviceOrders", vehicleId],
    queryFn: async () => {
      const res = await serviceOrdersApi.getByVehicle(vehicleId);
      return res.data;
    },
    enabled: !!vehicleId,
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await clientsApi.getAll();
      return res.data;
    },
  });

  const { data: vehicle, isLoading } = useQuery<Vehicle>({
    queryKey: ["vehicle", vehicleId],
    queryFn: async () => {
      const res = await vehiclesApi.getById(vehicleId);
      return res.data;
    },
    enabled: !!vehicleId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4 mx-auto"></div>
          <p className="text-gray-600 text-lg">Carregando dados do veículo...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🚗</div>
          <p className="text-gray-500 text-lg">Veículo não encontrado</p>
          <button
            onClick={() => navigate({ to: "/vehicles" })}
            className="mt-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Voltar à lista de veículos
          </button>
        </div>
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
              onClick={() => navigate({ to: "/vehicles" })}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-colors"
              title="Voltar à lista"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-3xl">🚗</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-orange-600">{vehicle.brand} {vehicle.model}</h1>
              <p className="text-gray-600">Placa: {vehicle.licensePlate} • ID: {vehicle.id}</p>
            </div>
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            ✏️ Editar Veículo
          </button>
        </div>
      </div>

      {/* Informações Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações do Veículo */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            🚗 Dados do Veículo
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600">Placa</label>
              <div className="text-lg text-gray-900 font-bold">{vehicle.licensePlate}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-600">Marca</label>
                <div className="text-lg text-gray-900 font-medium">{vehicle.brand}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-600">Ano</label>
                <div className="text-lg text-gray-900 font-medium">
                  {new Date(vehicle.manufactureDate).getFullYear()}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600">Modelo</label>
              <div className="text-lg text-gray-900 font-medium">{vehicle.model}</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-600">Cor</label>
                <div className="text-lg text-gray-900 font-medium">{vehicle.color}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-600">Quilometragem</label>
                <div className="text-lg text-gray-900 font-medium">
                  {vehicle.kilometers?.toLocaleString('pt-BR')} km
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600">Chassi</label>
              <div className="text-lg text-gray-900 font-medium font-mono">{vehicle.chassisId}</div>
            </div>
            {vehicle.observations && (
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-600">Observações</label>
                <div className="text-lg text-gray-900 font-medium">{vehicle.observations}</div>
              </div>
            )}
          </div>
        </div>

        {/* Informações do Proprietário */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            👤 Proprietário
          </h2>
          {vehicle.clientId ? (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-600">Nome</label>
                <div className="text-lg text-gray-900 font-medium">{clients?.find(client => client.id === vehicle.clientId)?.name}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-600">Email</label>
                <div className="text-lg text-gray-900 font-medium">{clients?.find(client => client.id === vehicle.clientId)?.email}</div>
              </div>
              {clients?.find(client => client.id === vehicle.clientId)?.phone && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-600">Telefone</label>
                  <div className="text-lg text-gray-900 font-medium">{clients.find(client => client.id === vehicle.clientId)?.phone}</div>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 font-medium">Ver perfil completo do cliente</p>
                    <p className="text-blue-600 text-sm">Acesse todas as informações e histórico</p>
                  </div>
                  <button
                    onClick={() => navigate({ to: `/clients/${vehicle.clientId}` })}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Ver Cliente
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">👤</div>
              <p className="text-gray-500 mb-4">Veículo não vinculado a um cliente</p>
              <button
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                onClick={() => alert('Funcionalidade de vincular cliente será implementada')}
              >
                Vincular Cliente
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Histórico de Serviços */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            🔧 Histórico de Serviços
          </h2>
          <button
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            onClick={() => alert('Funcionalidade de adicionar serviço será implementada')}
          >
            + Nova Ordem de Serviço
          </button>
        </div>

        {vehicleOrdersLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-4 mx-auto"></div>
            <p className="text-gray-600">Carregando histórico de serviços...</p>
          </div>
        ) : vehicleServiceOrders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">🔧</div>
            <p className="text-gray-500">Nenhum serviço registrado para este veículo</p>
            <p className="text-sm text-gray-400 mt-2">O histórico de manutenções aparecerá aqui</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">OS</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Valor</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {vehicleServiceOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-semibold text-gray-900"><Link params={{ id: order.id.toString() }} to={"/service-orders/$id"}>#{order.orderNumber}</Link></td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{order.status}</span>
                    </td>
                    <td className="px-4 py-2 font-medium text-gray-900">R$ {order.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-2 text-gray-900">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            <label className="text-sm font-medium text-gray-600">Data de Fabricação</label>
            <div className="text-lg text-gray-900 font-medium">
              {new Date(vehicle.manufactureDate).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </div>
          </div>
          {vehicle.createdAt && (
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="text-sm font-medium text-gray-600">Cadastrado em</label>
              <div className="text-lg text-gray-900 font-medium">
                {new Date(vehicle.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {showEdit && (
        <EditVehicleModal
          vehicle={vehicle}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}
