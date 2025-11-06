import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { vehiclesApi } from "../services/api";
import { clientsApi } from "../../client/services/api";
import Modal from "../../../shared/components/Modal";
import Button from "../../../shared/components/Button";
import type { Vehicle } from "../types/vehicle";

interface VehicleClientLinkModalProps {
  isOpen: boolean;
  vehicle: Vehicle;
  onClose: () => void;
}

export default function VehicleClientLinkModal({ isOpen, vehicle, onClose }: VehicleClientLinkModalProps) {
  const queryClient = useQueryClient();
  const [selectedClientId, setSelectedClientId] = useState<number | undefined>(vehicle.clientId);
  const [error, setError] = useState<string | null>(null);

  // Buscar clientes para o select
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsApi.getAll().then(res => res.data),
  });

  const mutation = useMutation({
    mutationFn: (clientId: number | undefined) =>
      vehiclesApi.update(vehicle.id, { clientId: clientId }),
    onSuccess: () => {
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Vincular Cliente"
      description={`${vehicle.brand} ${vehicle.model} - ${vehicle.licensePlate}`}
      size="md"
      headerStyle="default"
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <Button variant="outline" onClick={onClose} type="button" disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="link-vehicle-client-form"
            isLoading={mutation.isPending}
            disabled={selectedClientId === vehicle.clientId}
            leftIcon={!mutation.isPending && "🔗"}
          >
            {mutation.isPending ? "Salvando..." : selectedClientId === undefined ? "Desvincular Cliente" : currentClient ? "Alterar Vinculação" : "Vincular Cliente"}
          </Button>
        </div>
      }
    >
      <form id="link-vehicle-client-form" onSubmit={handleSubmit} className="space-y-4">
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
            <div className="bg-orangeWheel-50 border border-orangeWheel-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-orangeWheel-800 mb-2">Prévia da Alteração</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">De:</span>
                  <span className="text-gray-700">
                    {currentClient ? currentClient.name : 'Sem vinculação'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orangeWheel-600">→</span>
                  <span className="text-orangeWheel-600">Para:</span>
                  <span className="font-medium text-orangeWheel-800">
                    {newClient ? newClient.name : 'Sem vinculação'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </form>
    </Modal>
  );
}
