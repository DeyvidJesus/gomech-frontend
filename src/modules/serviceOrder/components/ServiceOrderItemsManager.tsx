import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { serviceOrderItemsApi } from "../services/api";
import type { ServiceOrderItem, ServiceOrderItemCreateDTO, ServiceOrderItemType } from "../types/serviceOrder";

interface ServiceOrderItemsManagerProps {
  serviceOrderId: number;
  items: ServiceOrderItem[];
}

export function ServiceOrderItemsManager({ serviceOrderId, items }: ServiceOrderItemsManagerProps) {
  const queryClient = useQueryClient();
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<ServiceOrderItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<ServiceOrderItem>>({
    itemType: 'SERVICE',
    description: '',
    quantity: 1,
    unitPrice: 0,
  });

  // Mutações
  const createMutation = useMutation({
    mutationFn: (data: ServiceOrderItemCreateDTO) => 
      serviceOrderItemsApi.create(serviceOrderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrderItems", serviceOrderId.toString()] });
      setShowAddItem(false);
      setNewItem({
        itemType: 'SERVICE',
        description: '',
        quantity: 1,
        unitPrice: 0,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ServiceOrderItemCreateDTO }) =>
      serviceOrderItemsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrderItems", serviceOrderId.toString()] });
      setEditingItem(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => serviceOrderItemsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrderItems", serviceOrderId.toString()] });
    },
  });

  const applyMutation = useMutation({
    mutationFn: (id: number) => serviceOrderItemsApi.apply(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrderItems", serviceOrderId.toString()] });
    },
  });

  const unapplyMutation = useMutation({
    mutationFn: (id: number) => serviceOrderItemsApi.unapply(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrderItems", serviceOrderId.toString()] });
    },
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.description?.trim() || !newItem.unitPrice || !newItem.quantity) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    createMutation.mutate({
      description: newItem.description,
      itemType: newItem.itemType as ServiceOrderItemType,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
    });
  };

  const handleUpdateItem = (item: ServiceOrderItem, updates: Partial<ServiceOrderItem>) => {
    updateMutation.mutate({
      id: item.id,
      data: {
        description: updates.description || '',
        itemType: updates.itemType as ServiceOrderItemType,
        quantity: updates.quantity || 0,
        unitPrice: updates.unitPrice || 0,
      },
    });
  };

  const handleDeleteItem = (item: ServiceOrderItem) => {
    if (window.confirm(`Excluir item "${item.description}"?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  const handleToggleApply = (item: ServiceOrderItem) => {
    if (item.applied) {
      unapplyMutation.mutate(item.id);
    } else {
      applyMutation.mutate(item.id);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          🔧 Itens e Serviços
        </h2>
        <button
          onClick={() => setShowAddItem(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          Adicionar Item
        </button>
      </div>

      {/* Formulário para adicionar item */}
      {showAddItem && (
        <form onSubmit={handleAddItem} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-4">Novo Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={newItem.itemType}
                onChange={(e) => setNewItem({ ...newItem, itemType: e.target.value as 'SERVICE' | 'PART' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="SERVICE">🔧 Serviço</option>
                <option value="PART">📦 Peça</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
              <input
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário</label>
              <input
                type="number"
                value={newItem.unitPrice}
                onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
              <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                R$ {((newItem.quantity || 0) * (newItem.unitPrice || 0)).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              placeholder="Descreva o item ou serviço..."
              required
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {createMutation.isPending ? "Adicionando..." : "Adicionar"}
            </button>
            <button
              type="button"
              onClick={() => setShowAddItem(false)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de itens */}
      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl mb-2 block">📋</span>
          <p>Nenhum item adicionado ainda</p>
          <button
            onClick={() => setShowAddItem(true)}
            className="text-orange-600 hover:text-orange-700 font-medium mt-2"
          >
            Adicionar primeiro item
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Item</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Qtd</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Valor Unit.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50 ${item.applied ? 'bg-green-50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">
                        {item.itemType === 'SERVICE' ? '🔧' : '📦'}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">{item.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-900">{item.quantity}</td>
                  <td className="px-4 py-3 text-gray-900">
                    R$ {item.unitPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    R$ {item.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      item.applied 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.applied ? '✅ Aplicado' : '⏳ Pendente'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleApply(item)}
                        disabled={applyMutation.isPending || unapplyMutation.isPending}
                        className={`text-sm font-medium transition-colors ${
                          item.applied
                            ? 'text-yellow-600 hover:text-yellow-700'
                            : 'text-green-600 hover:text-green-700'
                        }`}
                      >
                        {item.applied ? 'Desaplicar' : 'Aplicar'}
                      </button>
                      <button
                        onClick={() => setEditingItem(item)}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de edição inline */}
      {editingItem && (
        <div className="fixed inset-0 bg-[#242424cb] flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Editar Item</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={editingItem.itemType}
                    onChange={(e) => setEditingItem({ ...editingItem, itemType: e.target.value as 'SERVICE' | 'PART' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="SERVICE">🔧 Serviço</option>
                    <option value="PART">📦 Peça</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                    <input
                      type="number"
                      value={editingItem.quantity}
                      onChange={(e) => setEditingItem({ ...editingItem, quantity: Number(e.target.value) })}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitário</label>
                    <input
                      type="number"
                      value={editingItem.unitPrice}
                      onChange={(e) => setEditingItem({ ...editingItem, unitPrice: Number(e.target.value) })}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total: R$ {(editingItem.quantity * editingItem.unitPrice).toFixed(2)}
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleUpdateItem(editingItem, {
                    itemType: editingItem.itemType,
                    description: editingItem.description,
                    quantity: editingItem.quantity,
                    unitPrice: editingItem.unitPrice,
                  })}
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {updateMutation.isPending ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
