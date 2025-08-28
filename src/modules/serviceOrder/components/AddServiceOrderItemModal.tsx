import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceOrderItemsApi } from "../services/api";
import type { ServiceOrderItem } from "../types/serviceOrder";

interface AddServiceOrderItemModalProps {
  serviceOrderId: number;
  onClose: () => void;
}

export default function AddServiceOrderItemModal({ serviceOrderId, onClose }: AddServiceOrderItemModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<ServiceOrderItem>>({
    type: 'service',
    description: '',
    quantity: 1,
    unitPrice: 0,
    notes: ''
  });

  const mutation = useMutation({
    mutationFn: (data: Partial<ServiceOrderItem>) => 
      serviceOrderItemsApi.create(serviceOrderId, {
        ...data,
        totalPrice: (data.quantity || 1) * (data.unitPrice || 0)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrderItems", serviceOrderId] });
      queryClient.invalidateQueries({ queryKey: ["serviceOrder", serviceOrderId] });
      onClose();
    },
    onError: (error: any) => {
      setError(error?.response?.data?.message || "Erro ao adicionar item. Tente novamente.");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ 
      ...form, 
      [name]: name === 'quantity' || name === 'unitPrice' ? Number(value) : value 
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
    if (!form.quantity || form.quantity <= 0) {
      setError("Quantidade deve ser maior que zero");
      return;
    }
    if (!form.unitPrice || form.unitPrice < 0) {
      setError("Valor unitário deve ser maior ou igual a zero");
      return;
    }
    
    mutation.mutate(form);
  };

  const totalPrice = (form.quantity || 1) * (form.unitPrice || 0);

  return (
    <div className="fixed inset-0 bg-[#242424cb] flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-white">🔧</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Adicionar Item</h2>
                <p className="text-orange-100">Adicione um serviço ou peça à OS</p>
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

          {/* Tipo */}
          <div>
            <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo *
            </label>
            <select
              id="type"
              name="type"
              value={form.type || 'service'}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              required
            >
              <option value="service">🔧 Serviço</option>
              <option value="part">🔩 Peça</option>
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              Descrição *
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
              placeholder={form.type === 'service' ? 'Ex: Troca de óleo e filtro' : 'Ex: Filtro de óleo'}
              required
            />
          </div>

          {/* Quantidade e Valor Unitário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-2">
                Quantidade *
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                step="1"
                value={form.quantity || 1}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="unitPrice" className="block text-sm font-semibold text-gray-700 mb-2">
                Valor Unitário (R$) *
              </label>
              <input
                id="unitPrice"
                name="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={form.unitPrice || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                placeholder="0,00"
                required
              />
            </div>
          </div>

          {/* Total */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-orange-700 font-semibold">Valor Total:</span>
              <span className="text-orange-600 text-xl font-bold">
                R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
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
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
              placeholder="Observações adicionais sobre o item..."
            />
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">💡</span>
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">Informações importantes:</p>
                <ul className="text-xs space-y-1 text-blue-600">
                  <li>• O item será adicionado como "não aplicado"</li>
                  <li>• Você pode aplicar/desaplicar itens na tela de detalhes</li>
                  <li>• Apenas itens aplicados contam no valor total da OS</li>
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
                  Adicionando...
                </>
              ) : (
                <>
                  <span>➕</span>
                  Adicionar Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
