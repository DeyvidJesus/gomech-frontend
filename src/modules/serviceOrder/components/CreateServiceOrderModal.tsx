import { useState } from "react";
import { clientsApi } from '../../client/services/api';
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { serviceOrdersApi } from "../services/api";
import { vehiclesApi } from "../../vehicle/services/api";
import type { ServiceOrderCreateDTO } from "../types/serviceOrder";
import type { Client } from "../../client/types/client";

interface CreateServiceOrderModalProps {
  onClose: () => void;
}

export default function CreateServiceOrderModal({ onClose }: CreateServiceOrderModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: (): Promise<Client[]> => clientsApi.getAll().then((res: { data: Client[] }) => res.data),
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => vehiclesApi.getAll().then(res => res.data),
  });

  const [form, setForm] = useState<ServiceOrderCreateDTO>({
    vehicleId: 0,
    clientId: 0,
    description: '',
    problemDescription: '',
    laborCost: 0,
    partsCost: 0,
    discount: 0,
    estimatedCompletion: '',
    observations: '',
    technicianName: '',
    currentKilometers: undefined
  });

  const selectedVehicle = vehicles.find(v => v.id === form.vehicleId);
  const clientName = selectedVehicle?.clientId ? (clients.find((c: import("../../client/types/client").Client) => c.id === selectedVehicle.clientId)?.name || '') : '';

  const mutation = useMutation({
    mutationFn: (data: ServiceOrderCreateDTO) => serviceOrdersApi.create(data),
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
      [name]: name === 'vehicleId' || name === 'clientId' || name === 'laborCost' || name === 'partsCost' || name === 'discount' || name === 'currentKilometers'
        ? (value ? Number(value) : (name === 'currentKilometers' ? undefined : 0))
        : value 
    });
  };

  const handleVehicleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vehicleId = Number(e.target.value);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    setForm({
      ...form,
      vehicleId,
      clientId: vehicle?.clientId || 0
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validação básica
    if (!form.vehicleId || form.vehicleId === 0) {
      setError("Selecione um veículo");
      return;
    }
    
    if (!form.description?.trim()) {
      setError("Descrição é obrigatória");
      return;
    }

    if (!form.clientId || form.clientId === 0) {
      setError("Cliente não encontrado para o veículo selecionado");
      return;
    }
    
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 bg-[#242424cb] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-orange-600 text-white p-4 sm:p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl">📋</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Nova Ordem de Serviço</h2>
                <p className="text-orange-100 text-sm sm:text-base">Criar uma nova OS</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-orange-100 hover:text-white p-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Veículo */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Veículo *
              </label>
              <select
                name="vehicleId"
                value={form.vehicleId}
                onChange={handleVehicleChange}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                required
              >
                <option value={0}>Selecione um veículo</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} - {vehicle.licensePlate}
                  </option>
                ))}
              </select>
            </div>

            {/* Cliente (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cliente
              </label>
              <input
                type="text"
                value={clientName}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 text-gray-600 text-sm sm:text-base"
                placeholder="Cliente será preenchido automaticamente"
                readOnly
              />
            </div>

            {/* Técnico */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Técnico Responsável
              </label>
              <input
                type="text"
                name="technicianName"
                value={form.technicianName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                placeholder="Nome do técnico"
              />
            </div>

            {/* Quilometragem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quilometragem Atual
              </label>
              <input
                type="number"
                name="currentKilometers"
                value={form.currentKilometers || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                placeholder="Ex: 85000"
                min="0"
              />
            </div>

            {/* Previsão */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Previsão de Conclusão
              </label>
              <input
                type="datetime-local"
                name="estimatedCompletion"
                value={form.estimatedCompletion}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
              placeholder="Descreva brevemente os serviços a serem realizados"
              required
            />
          </div>

          {/* Descrição do Problema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição do Problema
            </label>
            <textarea
              name="problemDescription"
              value={form.problemDescription}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
              placeholder="Descreva o problema relatado pelo cliente"
            />
          </div>

          {/* Valores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custo de Mão de Obra (R$)
              </label>
              <input
                type="number"
                name="laborCost"
                value={form.laborCost}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custo de Peças (R$)
              </label>
              <input
                type="number"
                name="partsCost"
                value={form.partsCost}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desconto (R$)
              </label>
              <input
                type="number"
                name="discount"
                value={form.discount}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              name="observations"
              value={form.observations}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
              placeholder="Observações adicionais sobre a ordem de serviço"
            />
          </div>

          {/* Resumo de valores */}
          {((form.laborCost || 0) > 0 || (form.partsCost || 0) > 0 || (form.discount || 0) > 0) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-3 text-sm sm:text-base">Resumo Financeiro</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Mão de obra:</span>
                  <span>R$ {(form.laborCost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Peças:</span>
                  <span>R$ {(form.partsCost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {((form.laborCost || 0) + (form.partsCost || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                {(form.discount || 0) > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Desconto:</span>
                    <span>- R$ {(form.discount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-2">
                  <span>Total:</span>
                  <span className="text-orange-600">
                    R$ {((form.laborCost || 0) + (form.partsCost || 0) - (form.discount || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-4 sm:pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 justify-center text-sm sm:text-base order-1 sm:order-2"
            >
              {mutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Criando...
                </>
              ) : (
                <>
                  <span>✅</span>
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