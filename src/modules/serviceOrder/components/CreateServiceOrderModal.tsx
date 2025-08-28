import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { serviceOrdersApi } from "../services/api";
import { vehiclesApi } from "../../vehicle/services/api";
import type { ServiceOrder } from "../types/serviceOrder";

interface CreateServiceOrderModalProps {
  onClose: () => void;
}

export default function CreateServiceOrderModal({ onClose }: CreateServiceOrderModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Buscar veículos para o select
  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => vehiclesApi.getAll().then(res => res.data),
  });

  const [form, setForm] = useState<Partial<ServiceOrder>>({
    vehicleId: undefined,
    description: '',
    priority: 'medium',
    status: 'pending',
    estimatedCompletionDate: '',
    notes: ''
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<ServiceOrder>) => serviceOrdersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrders"] });
      onClose();
    },
    onError: (error: any) => {
      setError(error?.response?.data?.message || "Erro ao criar ordem de serviço. Tente novamente.");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ 
      ...form, 
      [name]: name === 'vehicleId' ? (value ? Number(value) : undefined) : value 
    });
  };

  // Definir clientId automaticamente baseado no veículo selecionado
  const selectedVehicle = vehicles.find(v => v.id === form.vehicleId);
  const clientId = selectedVehicle?.clientId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validação básica
    if (!form.vehicleId) {
      setError("Veículo é obrigatório");
      return;
    }
    
    if (!clientId) {
      setError("Não foi possível identificar o cliente do veículo selecionado");
      return;
    }
    
    if (!form.description?.trim()) {
      setError("Descrição é obrigatória");
      return;
    }
    
    // Incluir clientId automaticamente baseado no veículo selecionado
    const orderData = {
      ...form,
      clientId: clientId
    };
    
    console.log('Enviando dados da OS:', orderData); // Para debug
    
    mutation.mutate(orderData);
  };

  return (
    <div className="fixed inset-0 bg-[#242424cb] flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">📋</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Nova Ordem de Serviço</h2>
                <p className="text-orange-100">Crie uma nova OS para um cliente</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:ity-20 rounded-lg p-2 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Exibição de erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-red-600">⚠️</span>
                <span className="text-red-700 text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Veículo e Prioridade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="vehicleId" className="block text-sm font-semibold text-gray-700 mb-2">
                Veículo *
              </label>
              <select
                id="vehicleId"
                name="vehicleId"
                value={form.vehicleId || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                required
              >
                <option value="">Selecione um veículo</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
                    {vehicle.client && ` (${vehicle.client.name})`}
                  </option>
                ))}
              </select>
              {selectedVehicle && (
                <div className="mt-2">
                  {selectedVehicle.client ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            Cliente: {selectedVehicle.client.name}
                          </p>
                          <p className="text-xs text-green-600">
                            {selectedVehicle.client.email} • ID: {selectedVehicle.clientId}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-red-600">⚠️</span>
                        <p className="text-sm font-medium text-red-800">
                          Este veículo não possui proprietário cadastrado
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-gray-700 mb-2">
                Prioridade
              </label>
              <select
                id="priority"
                name="priority"
                value={form.priority || 'medium'}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="low">🔽 Baixa</option>
                <option value="medium">➡️ Média</option>
                <option value="high">🔼 Alta</option>
                <option value="urgent">🚨 Urgente</option>
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Descrição do Serviço *
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description || ''}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
              placeholder="Descreva o problema ou serviço solicitado..."
              required
            />
          </div>

          {/* Data de Previsão */}
          <div>
            <label htmlFor="estimatedCompletionDate" className="block text-sm font-semibold text-gray-700 mb-2">
              Previsão de Conclusão
            </label>
            <input
              id="estimatedCompletionDate"
              name="estimatedCompletionDate"
              type="datetime-local"
              value={form.estimatedCompletionDate || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Observações */}
          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              id="notes"
              name="notes"
              value={form.notes || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
              placeholder="Observações internas, instruções especiais, etc..."
            />
          </div>

          {/* Info */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <span className="text-orange-600 mt-0.5">💡</span>
              <div className="text-sm text-orange-700">
                <p className="font-medium mb-1">Informações importantes:</p>
                <ul className="text-xs space-y-1 text-orange-600">
                  <li>• A OS será criada com status "Pendente"</li>
                  <li>• O cliente será identificado automaticamente pelo veículo selecionado</li>
                  <li>• Você poderá adicionar itens e serviços após a criação</li>
                  <li>• O número da OS será gerado automaticamente</li>
                  {selectedVehicle && selectedVehicle.client && (
                    <li className="text-green-600 font-medium">
                      • OS será criada para: {selectedVehicle.client.name}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Criando...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Criar OS
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}