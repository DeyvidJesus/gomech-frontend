import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceOrdersApi } from "../services/api";
import Modal from "../../../shared/components/Modal";
import Button from "../../../shared/components/Button";
import type { ServiceOrder, ServiceOrderUpdateDTO } from "../types/serviceOrder";

interface EditServiceOrderModalProps {
  isOpen: boolean;
  serviceOrder: ServiceOrder;
  onClose: () => void;
}

export default function EditServiceOrderModal({ isOpen, serviceOrder, onClose }: EditServiceOrderModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ServiceOrderUpdateDTO>({
    description: serviceOrder.description || '',
    problemDescription: serviceOrder.problemDescription || '',
    diagnosis: serviceOrder.diagnosis || '',
    solutionDescription: serviceOrder.solutionDescription || '',
    laborCost: serviceOrder.laborCost || 0,
    partsCost: serviceOrder.partsCost || 0,
    discount: serviceOrder.discount || 0,
    estimatedCompletion: serviceOrder.estimatedCompletion?.split('.')[0] || '',
    observations: serviceOrder.observations || '',
    technicianName: serviceOrder.technicianName || '',
    currentKilometers: serviceOrder.currentKilometers || undefined
  });

  const mutation = useMutation({
    mutationFn: (data: ServiceOrderUpdateDTO) => serviceOrdersApi.update(serviceOrder.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrder", serviceOrder.id] });
      queryClient.invalidateQueries({ queryKey: ["serviceOrders"] });
      onClose();
    },
    onError: (error: any) => {
      setError(error?.response?.data?.message || "Erro ao atualizar ordem de serviço. Tente novamente.");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ 
      ...form, 
      [name]: name === 'laborCost' || name === 'partsCost' || name === 'discount' || name === 'currentKilometers'
        ? (value ? Number(value) : (name === 'currentKilometers' ? undefined : 0))
        : value 
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validação básica
    if (!form.description?.trim()) {
      setError("Descrição é obrigatória");
      return;
    }
    
    mutation.mutate(form);
  };

  const totalCost = ((form.laborCost || 0) + (form.partsCost || 0)) - (form.discount || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Ordem de Serviço #${serviceOrder.orderNumber}`}
      description="Atualize as informações da ordem de serviço."
      size="xl"
      headerStyle="default"
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="edit-service-order-form"
            isLoading={mutation.isPending}
            leftIcon={!mutation.isPending && "💾"}
          >
            {mutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      }
    >
      <form id="edit-service-order-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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

          {/* Descrições */}
          <div className="space-y-4 sm:space-y-6">
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
                placeholder="Descrição dos serviços a serem realizados"
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
                placeholder="Problema relatado pelo cliente"
              />
            </div>

            {/* Diagnóstico */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnóstico
              </label>
              <textarea
                name="diagnosis"
                value={form.diagnosis}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                placeholder="Diagnóstico técnico do problema"
              />
            </div>

            {/* Descrição da Solução */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição da Solução
              </label>
              <textarea
                name="solutionDescription"
                value={form.solutionDescription}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                placeholder="Solução aplicada ou proposta"
              />
            </div>
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
          {(totalCost > 0 || (form.discount || 0) > 0) && (
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
                  <span>R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                {(form.discount || 0) > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Desconto:</span>
                    <span>- R$ {(form.discount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-2">
                  <span>Total Final:</span>
                  <span className="text-orangeWheel-600">
                    R$ {totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </form>
      </Modal>
  );
}