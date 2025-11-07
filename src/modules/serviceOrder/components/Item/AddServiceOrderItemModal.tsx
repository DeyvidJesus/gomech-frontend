import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { serviceOrderItemsApi } from "../../services/api";
import { partsApi } from "../../../part/services/api";
import Modal from "../../../../shared/components/Modal";
import Button from "../../../../shared/components/Button";
import type { ServiceOrderItemCreateDTO } from "../../types/serviceOrder";
import type { PartCreateDTO } from "../../../part/types/part";
import { itemTypeDisplayMapping } from "../../types/serviceOrder";
import { extractErrorMessage } from "@/shared/utils/errorHandler";

interface AddServiceOrderItemModalProps {
  isOpen: boolean;
  serviceOrderId: number;
  onClose: () => void;
}

export default function AddServiceOrderItemModal({ isOpen, serviceOrderId, onClose }: AddServiceOrderItemModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [showPartForm, setShowPartForm] = useState(false);

  const [form, setForm] = useState<ServiceOrderItemCreateDTO>({
    itemType: 'SERVICE',
    description: '',
    quantity: 1,
    unitPrice: 0,
    requiresStock: false,
    observations: '',
    inventoryItemId: undefined,
    partId: undefined,
  });

  const [newPart, setNewPart] = useState<PartCreateDTO>({
    name: '',
    sku: '', // Será gerado pelo backend
    manufacturer: '',
    description: '',
    active: true,
    unitCost: 0,
    unitPrice: 0,
  });

  // Buscar lista de peças
  const { data: partsData = [] } = useQuery({
    queryKey: ["parts"],
    queryFn: partsApi.getAll,
  });

  // Mutation para criar nova peça
  const createPartMutation = useMutation({
    mutationFn: partsApi.create,
    onSuccess: (newPartData) => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
      // Seleciona automaticamente a peça recém-criada
      setForm({ ...form, partId: newPartData.id });
      setShowPartForm(false);
    },
    onError: (error: any) => {
      setError(extractErrorMessage(error, "Erro ao criar peça. Tente novamente."));
    },
  });

  const mutation = useMutation({
    mutationFn: (data: ServiceOrderItemCreateDTO) => 
      serviceOrderItemsApi.create(serviceOrderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrderItems", serviceOrderId] });
      queryClient.invalidateQueries({ queryKey: ["serviceOrder", serviceOrderId] });
      // Atualiza inventário caso item tenha peça/estoque associado
      queryClient.invalidateQueries({ queryKey: ["inventory", "items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "movements"] });
      onClose();
    },
    onError: (error: any) => {
      setError(extractErrorMessage(error, "Erro ao adicionar item. Tente novamente."));
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

  const handlePartChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPart({ 
      ...newPart, 
      [name]: name === 'unitCost' || name === 'unitPrice' ? Number(value) : value 
    });
  };

  const handleCreatePart = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPart.name.trim()) {
      setError("Nome da peça é obrigatório");
      return;
    }

    if (newPart.unitCost && newPart.unitCost < 0) {
      setError("Custo unitário deve ser positivo");
      return;
    }

    if (newPart.unitPrice && newPart.unitPrice < 0) {
      setError("Preço unitário deve ser positivo");
      return;
    }

    const payload = {
      ...newPart,
      name: newPart.name.trim(),
      manufacturer: newPart.manufacturer?.trim() || undefined,
      description: newPart.description?.trim() || undefined,
    };
    
    // Não envia SKU, será gerado pelo backend
    (payload as Partial<typeof payload>).sku = undefined;

    createPartMutation.mutate(payload);
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adicionar Item"
      description="Adicionar item à ordem de serviço."
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
            form="add-service-order-item-form"
            isLoading={mutation.isPending}
            leftIcon={!mutation.isPending && "✅"}
          >
            {mutation.isPending ? "Adicionando..." : "Adicionar Item"}
          </Button>
        </div>
      }
    >
      <form id="add-service-order-item-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Tipo */}
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

          {/* Seleção ou criação de peça (apenas se itemType for PART) */}
          {form.itemType === 'PART' && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Peça
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowPartForm(!showPartForm);
                  }}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  {showPartForm ? '← Selecionar peça existente' : '+ Criar nova peça'}
                </button>
              </div>

              {!showPartForm ? (
                <div>
                  <select
                    name="partId"
                    value={form.partId || ''}
                    onChange={(e) => setForm({ ...form, partId: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm sm:text-base"
                  >
                    <option value="">Selecione uma peça</option>
                    {(Array.isArray(partsData) ? partsData : []).map((part: any) => (
                      <option key={part.id} value={part.id}>
                        {part.name} - {part.sku} {part.unitPrice ? `(R$ ${part.unitPrice.toFixed(2)})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nome da peça *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newPart.name}
                        onChange={handlePartChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Ex: Pastilha de freio"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Fabricante
                      </label>
                      <input
                        type="text"
                        name="manufacturer"
                        value={newPart.manufacturer}
                        onChange={handlePartChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Ex: Bosch"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Custo (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="unitCost"
                        value={newPart.unitCost || 0}
                        onChange={handlePartChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Preço (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        name="unitPrice"
                        value={newPart.unitPrice || 0}
                        onChange={handlePartChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      name="description"
                      value={newPart.description}
                      onChange={handlePartChange}
                      rows={2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Informações adicionais"
                    />
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleCreatePart}
                    isLoading={createPartMutation.isPending}
                    leftIcon={!createPartMutation.isPending && "✅"}
                    className="w-full"
                    size="md"
                  >
                    {createPartMutation.isPending ? "Criando peça..." : "Criar e usar peça"}
                  </Button>
                </div>
              )}
            </div>
          )}

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
                <span className="text-orangeWheel-600">
                  R$ {totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </form>
      </Modal>
  );
}
