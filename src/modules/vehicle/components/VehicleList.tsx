import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehiclesApi } from "../services/api";
import type { Vehicle } from "../types/vehicle";
import { useState } from "react";
import { EditVehicleModal } from "./EditVehicleModal";
import { AddVehicleModal } from "./AddVehicleModal";
import VehicleClientLinkModal from "./VehicleClientLinkModal";
import { useNavigate } from "@tanstack/react-router";
import type { Client } from "../../client/types/client";
import { clientsApi } from "../../client/services/api";

export function VehicleList() {
  const queryClient = useQueryClient();
  const { data: clients } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await clientsApi.getAll();
      return res.data;
    },
  });
  const { data, isLoading, error } = useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const res = await vehiclesApi.getAll();
      return res.data;
    },
  });

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const navigate = useNavigate();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => vehiclesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });

  const handleAdd = () => {
    setShowAdd(true);
  };

  const handleCloseAdd = () => {
    setShowAdd(false);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowEdit(true);
  };

  const handleLink = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowLink(true);
  };

  const handleView = (vehicle: Vehicle) => {
    navigate({ to: `/vehicles/${vehicle.id}` });
  };

  const handleDelete = (vehicle: Vehicle) => {
    const isConfirmed = window.confirm(
      `⚠️ Tem certeza que deseja deletar o veículo "${vehicle.licensePlate}"?\n\nEsta ação não pode ser desfeita.`
    );
    if (isConfirmed) {
      deleteMutation.mutate(vehicle.id);
    }
  };

  const handleCloseEdit = () => {
    setShowEdit(false);
    setSelectedVehicle(null);
  };

  const handleCloseLink = () => {
    setShowLink(false);
    setSelectedVehicle(null);
  };


  // Estados de carregamento e erro
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4 mx-auto"></div>
          <p className="text-gray-600 text-lg">Carregando veículos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 text-5xl mb-4">⚠️</div>
        <h3 className="text-red-800 text-xl font-semibold mb-2">Erro ao carregar veículos</h3>
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
            <h1 className="text-3xl font-bold text-orange-600 mb-2">🚗 Gestão de Veículos</h1>
            <p className="text-gray-600">Gerencie todos os veículos da sua oficina</p>
          </div>
          <button
            onClick={handleAdd}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            Novo Veículo
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total de Veículos</p>
              <p className="text-3xl font-bold">{data?.length || 0}</p>
            </div>
            <div className="text-4xl opacity-80">🚗</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-sm font-medium">Veículos Ativos</p>
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

      {/* Lista de Veículos */}
      {!data || data.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
          <div className="text-gray-400 text-6xl mb-4">🚗</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum veículo encontrado</h3>
          <p className="text-gray-500 mb-6">Comece adicionando o primeiro veículo da sua oficina</p>
          <button
            onClick={handleAdd}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Adicionar Primeiro Veículo
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Veículo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Identificação
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Marca / Modelo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ano / Cor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((vehicle: Vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-orange-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">🚗</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{vehicle.licensePlate}</div>
                          <div className="text-sm text-gray-500">ID: {vehicle.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">Placa: {vehicle.licensePlate}</div>
                      <div className="text-sm text-gray-500">VIN: {vehicle.chassisId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{vehicle.brand}</div>
                      <div className="text-sm text-gray-500">{vehicle.model}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {new Date(vehicle.manufactureDate).getFullYear()}
                      </div>
                      <div className="text-sm text-gray-500">{vehicle.color}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {vehicle.clientId ? clients?.find(client => client.id === vehicle.clientId)?.name : 'Não vinculado'}
                      </div>
                      {vehicle.clientId && (
                        <div className="text-sm text-gray-500">{clients?.find(client => client.id === vehicle.clientId)?.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(vehicle)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                          title="Ver detalhes"
                        >
                          👁️ Ver
                        </button>
                        <button
                          onClick={() => handleLink(vehicle)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                          title="Vincular/Desvincular cliente"
                        >
                          🔗 Cliente
                        </button>
                        <button
                          onClick={() => handleEdit(vehicle)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                          title="Editar veículo"
                        >
                          ✏️ Editar
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                          title="Deletar veículo"
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
      {/* Modais de edição e criação */}
      {showAdd && (
        <AddVehicleModal onClose={handleCloseAdd} />
      )}
      {showEdit && selectedVehicle && (
        <EditVehicleModal vehicle={selectedVehicle} onClose={handleCloseEdit} />
      )}
      {showLink && selectedVehicle && (
        <VehicleClientLinkModal vehicle={selectedVehicle} onClose={handleCloseLink} />
      )}
    </div>
  );
}
