import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceOrderItemsApi } from "../../services/api";
import type { ServiceOrderItemCreateDTO } from "../../types/serviceOrder";
import { itemTypeDisplayMapping } from "../../types/serviceOrder";

interface AddServiceOrderItemModalProps {
  serviceOrderId: number;
  onClose: () => void;
}

export default function AddServiceOrderItemModal({ serviceOrderId, onClose }: AddServiceOrderItemModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ServiceOrderItemCreateDTO>({
    itemType: 'SERVICE',
    description: '',
    quantity: 1,
    unitPrice: 0,
    productCode: '',
    requiresStock: false,
    observations: '',
    stockProductId: undefined,
  });

  const mutation = useMutation({
    mutationFn: (data: ServiceOrderItemCreateDTO) => 
      serviceOrderItemsApi.create(serviceOrderId, data),
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
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm({ 
      ...form, 
      [name]: type === 'checkbox' ? checked : name === 'quantity' || name === 'unitPrice' ? Number(value) : value 
    });
  };

  const totalPrice = (form.quantity || 1) * (form.unitPrice || 0);

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
      setError("Preço unitário deve ser maior ou igual a zero");
      return;
    }
    
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 bg-[#242424cb] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-orange-600 text-white p-4 sm:p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl">🔧</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Adicionar Item</h2>
                <p className="text-orange-100 text-sm sm:text-base">Adicionar item à ordem de serviço</p>
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

          {/* Tipo e Código do Produto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                name="itemType"
                value={form.itemType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                required
              >
                <option value="SERVICE">Serviço</option>
                <option value="PART">Peça</option>
                <option value="MATERIAL">Material</option>
                <option value="LABOR">Mão de Obra</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código do Produto
              </label>
              <input
                type="text"
                name="productCode"
                value={form.productCode}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                placeholder="Ex: PC001, SRV025"
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
              placeholder="Descreva o item, peça ou serviço"
              required
            />
          </div>

          {/* Quantidade e Preço */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade *
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                min="1"
                step="1"
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço Unitário (R$) *
              </label>
              <input
                type="number"
                name="unitPrice"
                value={form.unitPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                placeholder="0,00"
                required
              />
            </div>
          </div>

          {/* Controle de Estoque */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="requiresStock"
              name="requiresStock"
              checked={form.requiresStock}
              onChange={handleChange}
              className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
            />
            <label htmlFor="requiresStock" className="text-sm font-medium text-gray-700">
              Este item requer controle de estoque
            </label>
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
              placeholder="Observações adicionais sobre o item"
            />
          </div>

          {/* Resumo do item */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3 text-sm sm:text-base">Resumo do Item</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Tipo:</span>
                <span className="font-medium">{itemTypeDisplayMapping[form.itemType]}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantidade:</span>
                <span className="font-medium">{form.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span>Preço unitário:</span>
                <span className="font-medium">R$ {(form.unitPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-2">
                <span>Total:</span>
                <span className="text-orange-600">
                  R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

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
                  Adicionando...
                </>
              ) : (
                <>
                  <span>✅</span>
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
