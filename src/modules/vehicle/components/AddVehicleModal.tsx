import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { vehiclesApi } from "../services/api";
import { clientsApi } from "../../client/services/api";
import Modal from "../../../shared/components/Modal";
import Button from "../../../shared/components/Button";
import type { Vehicle } from "../types/vehicle";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddVehicleModal({ isOpen, onClose }: AddVehicleModalProps) {
  const queryClient = useQueryClient();
  
  // Buscar clientes para o select
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsApi.getAll().then(res => res.data),
  });
  
  const [form, setForm] = useState<Partial<Vehicle>>({
    licensePlate: '',
    brand: '',
    model: '',
    manufactureDate: '',
    color: '',
    observations: '',
    kilometers: 0,
    chassisId: '',
    clientId: undefined
  });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Partial<Vehicle>) => vehiclesApi.create(data as Vehicle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles-list"] });
      queryClient.invalidateQueries({ queryKey: ["vehicles-stats"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      onClose();
    },
    onError: (error: any) => {
      console.error('Erro ao criar veículo:', error);
      setError(error?.response?.data?.message || "Erro ao cadastrar veículo. Tente novamente.");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ 
      ...form, 
      [name]: name === 'kilometers' || name === 'clientId' ? (value ? Number(value) : undefined) : value 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validação básica
    if (!form.licensePlate?.trim()) {
      setError("Placa é obrigatória");
      return;
    }
    if (!form.brand?.trim()) {
      setError("Marca é obrigatória");
      return;
    }
    if (!form.model?.trim()) {
      setError("Modelo é obrigatório");
      return;
    }
    if (!form.chassisId?.trim()) {
      setError("VIN/Chassi é obrigatório");
      return;
    }
    if (!form.manufactureDate?.trim()) {
      setError("Data de fabricação é obrigatória");
      return;
    }
    if (form.kilometers === undefined || form.kilometers === null) {
      setError("Quilometragem é obrigatória");
      return;
    }
    
    mutation.mutate(form);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Veículo"
      description="Cadastrar novo veículo no sistema."
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
            form="add-vehicle-form"
            isLoading={mutation.isPending}
            leftIcon={!mutation.isPending && "✅"}
          >
            {mutation.isPending ? "Cadastrando..." : "Cadastrar Veículo"}
          </Button>
        </div>
      }
    >
      <form id="add-vehicle-form" onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-red-600">⚠️</span>
                <span className="text-red-700 text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Cliente */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Proprietário
            </label>
            <select
              name="clientId"
              value={form.clientId || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeWheel-500 focus:border-orangeWheel-500 transition-colors"
            >
              <option value="">Selecione o proprietário (opcional)</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.email}
                </option>
              ))}
            </select>
          </div>

          {/* Placa */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Placa *
            </label>
            <input
              type="text"
              name="licensePlate"
              value={form.licensePlate || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors uppercase"
              placeholder="ABC-1234"
              maxLength={8}
              required
            />
          </div>

          {/* Marca e Cor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Marca *
              </label>
              <input
                type="text"
                name="brand"
                value={form.brand || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeWheel-500 focus:border-orangeWheel-500 transition-colors"
                placeholder="Toyota, Ford, etc."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cor
              </label>
              <input
                type="text"
                name="color"
                value={form.color || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeWheel-500 focus:border-orangeWheel-500 transition-colors"
                placeholder="Branco, Prata, etc."
              />
            </div>
          </div>

          {/* Modelo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Modelo *
            </label>
            <input
              type="text"
              name="model"
              value={form.model || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeWheel-500 focus:border-orangeWheel-500 transition-colors"
              placeholder="Corolla, Focus, etc."
              required
            />
          </div>

          {/* VIN/Chassi */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              VIN / Chassi *
            </label>
            <input
              type="text"
              name="chassisId"
              value={form.chassisId || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors font-mono"
              placeholder="9BW111060T5002156"
              required
            />
          </div>

          {/* Data de Fabricação e Quilometragem */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Data de Fabricação *
              </label>
              <input
                type="date"
                name="manufactureDate"
                value={form.manufactureDate || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeWheel-500 focus:border-orangeWheel-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quilometragem *
              </label>
              <input
                type="number"
                name="kilometers"
                value={form.kilometers || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeWheel-500 focus:border-orangeWheel-500 transition-colors"
                placeholder="120000"
                min="0"
                required
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              name="observations"
              value={form.observations || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
              placeholder="Informações adicionais sobre o veículo..."
            />
          </div>

          {/* Info */}
          <div className="bg-orangeWheel-50 border border-orangeWheel-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-orangeWheel-600 mt-0.5">💡</span>
              <div className="text-orangeWheel-800 text-sm">
                <p className="font-medium mb-1">Dica:</p>
                <p>Você pode vincular o veículo a um proprietário agora ou fazer isso posteriormente através da edição.</p>
              </div>
            </div>
          </div>
        </form>
      </Modal>
  );
}
