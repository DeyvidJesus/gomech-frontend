import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { vehiclesApi } from "../services/api";
import { clientsApi } from "../../client/services/api";
import type { Vehicle } from "../types/vehicle";

interface AddVehicleModalProps {
  onClose: () => void;
}

export function AddVehicleModal({ onClose }: AddVehicleModalProps) {
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
    mutationFn: (data: Partial<Vehicle>) => {
      console.log('Enviando dados do veículo:', data); // Para debug
      return vehiclesApi.create(data as Vehicle);
    },
    onSuccess: (response) => {
      console.log('Veículo criado com sucesso:', response.data); // Para debug
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] }); // Atualizar clientes também
      onClose();
    },
    onError: (error: any) => {
      console.error('Erro ao criar veículo:', error); // Para debug
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
    if (!form.color?.trim()) {
      setError("Cor é obrigatória");
      return;
    }
    
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 bg-[#242424cb] flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orangeWheel-500 to-orangeWheel-600 p-4 sm:p-6 rounded-t-xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-base sm:text-lg font-bold text-white">🚗</span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white">Novo Veículo</h2>
                <p className="text-orange-100 text-sm">Cadastrar novo veículo</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
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
                Cor *
              </label>
              <input
                type="text"
                name="color"
                value={form.color || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeWheel-500 focus:border-orangeWheel-500 transition-colors"
                placeholder="Branco, Prata, etc."
                required
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
                Quilometragem
              </label>
              <input
                type="number"
                name="kilometers"
                value={form.kilometers || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orangeWheel-500 focus:border-orangeWheel-500 transition-colors"
                placeholder="120000"
                min="0"
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
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-orange-600 mt-0.5">💡</span>
              <div className="text-orange-800 text-sm">
                <p className="font-medium mb-1">Dica:</p>
                <p>Você pode vincular o veículo a um proprietário agora ou fazer isso posteriormente através da edição.</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg transition-colors order-2 sm:order-1"
              disabled={mutation.isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-orangeWheel-500 hover:bg-orangeWheel-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Cadastrando...
                </div>
              ) : (
                'Cadastrar Veículo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
