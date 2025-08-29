import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { vehiclesApi } from "../services/api";
import { clientsApi } from "../../client/services/api";
import type { Vehicle } from "../types/vehicle";

interface VehicleClientLinkModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export default function VehicleClientLinkModal({ vehicle, onClose }: VehicleClientLinkModalProps) {
  const queryClient = useQueryClient();
  const [selectedClientId, setSelectedClientId] = useState<number | undefined>(vehicle.clientId);
  const [error, setError] = useState<string | null>(null);

  // Buscar clientes para o select
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsApi.getAll().then(res => res.data),
  });

  const mutation = useMutation({
    mutationFn: (clientId: number | undefined) => {
      console.log('Vinculando veículo', vehicle.id, 'ao cliente', clientId);
      return vehiclesApi.update(vehicle.id, { clientId: clientId });
    },
    onSuccess: (response) => {
      console.log('Vinculação atualizada com sucesso:', response.data);
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicle.id] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      onClose();
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar vinculação:', error);
      setError(error?.response?.data?.message || "Erro ao vincular cliente. Tente novamente.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate(selectedClientId);
  };

  const currentClient = clients.find(c => c.id === vehicle.clientId);
  const newClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="fixed inset-0 bg-[#242424cb] flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">🔗</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Vincular Cliente</h2>
                <p className="text-blue-100">{vehicle.brand} {vehicle.model} - {vehicle.licensePlate}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              title="Fechar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-red-600">⚠️</span>
                <span className="text-red-700 text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Status Atual */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Status Atual</h3>
            {currentClient ? (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{currentClient.name}</p>
                  <p className="text-sm text-gray-500">{currentClient.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-sm">!</span>
                </div>
                <p className="text-gray-600">Veículo não vinculado a nenhum cliente</p>
              </div>
            )}
          </div>

          {/* Seleção de Cliente */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Novo Cliente
            </label>
            <select
              value={selectedClientId || ''}
              onChange={(e) => setSelectedClientId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Nenhum cliente (desvincular)</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.email}
                </option>
              ))}
            </select>
          </div>

          {/* Preview da Mudança */}
          {selectedClientId !== vehicle.clientId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">Prévia da Alteração</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">De:</span>
                  <span className="text-gray-700">
                    {currentClient ? currentClient.name : 'Sem vinculação'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">→</span>
                  <span className="text-blue-600">Para:</span>
                  <span className="font-medium text-blue-800">
                    {newClient ? newClient.name : 'Sem vinculação'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg transition-colors"
              disabled={mutation.isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={mutation.isPending || selectedClientId === vehicle.clientId}
            >
              {mutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </div>
              ) : selectedClientId === undefined ? (
                'Desvincular Cliente'
              ) : currentClient ? (
                'Alterar Vinculação'
              ) : (
                'Vincular Cliente'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
