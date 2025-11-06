import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { vehiclesApi } from "../services/api";
import { clientsApi } from "../../client/services/api";
import type { Vehicle } from "../types/vehicle";

interface EditVehicleModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export function EditVehicleModal({ vehicle, onClose }: EditVehicleModalProps) {
  const queryClient = useQueryClient();
  
  // Buscar clientes para o select
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsApi.getAll().then(res => res.data),
  });
  
  const [form, setForm] = useState<Partial<Vehicle>>({ ...vehicle });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Partial<Vehicle>) => vehiclesApi.update(vehicle.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle", vehicle.id] });
      queryClient.invalidateQueries({ queryKey: ["clients"] }); // Atualizar clientes também
      onClose();
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar veículo:', error); // Para debug
      setError(error?.response?.data?.message || "Erro ao atualizar veículo. Tente novamente.");
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
    <div className="fixed inset-0 bg-[#242424cb] flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">✏️</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Editar Veículo</h2>
                <p className="text-orange-100">{vehicle.licensePlate} - {vehicle.brand} {vehicle.model}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white rounded-lg p-2 transition-colors"
              title="Fechar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            >
              <option value="">Nenhum proprietário</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - {client.email}
                </option>
              ))}
            </select>
            {vehicle.clientId && (
              <p className="text-sm text-gray-600 mt-1">
                Cliente atual: <span className="font-medium">{clients.find(client => client.id === vehicle.clientId)?.name}</span>
              </p>
            )}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
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
                value={form.manufactureDate ? form.manufactureDate.split('T')[0] : ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
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
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </div>
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
