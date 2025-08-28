import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceOrdersApi } from "../services/api";
import type { ServiceOrder } from "../types/serviceOrder";

interface EditServiceOrderModalProps {
  serviceOrder: ServiceOrder;
  onClose: () => void;
}

export default function EditServiceOrderModal({ serviceOrder, onClose }: EditServiceOrderModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<ServiceOrder>>({
    description: serviceOrder.description,
    priority: serviceOrder.priority,
    status: serviceOrder.status,
    estimatedCompletionDate: serviceOrder.estimatedCompletionDate?.split('T')[0] + 'T' + serviceOrder.estimatedCompletionDate?.split('T')[1]?.slice(0, 5) || '',
    notes: serviceOrder.notes || ''
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<ServiceOrder>) => serviceOrdersApi.update(serviceOrder.id, data),
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
    setForm({ ...form, [name]: value });
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

  return (
    <div className="fixed inset-0 bg-[#242424cb] flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">✏️</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Editar Ordem de Serviço</h2>
                <p className="text-orange-100">OS #{serviceOrder.orderNumber}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white rounded-lg p-2 transition-colors"
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

          {/* Status e Prioridade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={form.status || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              >
                <option value="pending">Pendente</option>
                <option value="in_progress">Em Andamento</option>
                <option value="waiting_parts">Aguardando Peças</option>
                <option value="waiting_approval">Aguardando Aprovação</option>
                <option value="completed">Concluída</option>
                <option value="canceled">Cancelada</option>
              </select>
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
                  Salvando...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}