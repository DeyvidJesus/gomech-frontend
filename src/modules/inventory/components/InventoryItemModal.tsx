import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { partsApi } from "../../part/services/api";
import Modal from "../../../shared/components/Modal";
import Button from "../../../shared/components/Button";

import type { InventoryItem } from "../types/inventory";

export interface InventoryItemFormValues {
  partId: number;
  minimumQuantity: number;
  initialQuantity: number;
  location: string;
  averageCost?: number;
  salePrice?: number;
}

interface InventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: InventoryItemFormValues) => Promise<void> | void;
  title: string;
  initialData?: InventoryItem | null;
  isSubmitting?: boolean;
}

const emptyItem: InventoryItemFormValues = {
  partId: 0,
  initialQuantity: 0,
  minimumQuantity: 0,
  location: "",
  averageCost: 0,
  salePrice: 0,
};

export function InventoryItemModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
  isSubmitting = false,
}: InventoryItemModalProps) {
  const [formData, setFormData] = useState<InventoryItemFormValues>(emptyItem);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = Boolean(initialData);

  // Buscar lista de peças
  const { data: partsData = [] } = useQuery({
    queryKey: ["parts"],
    queryFn: partsApi.getAll,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          partId: initialData.partId,
          initialQuantity: initialData.quantity,
          minimumQuantity: initialData.minimumQuantity,
          location: initialData.location ?? "",
          averageCost: initialData.unitCost,
          salePrice: initialData.salePrice ?? 0,
        });
      } else {
        setFormData(emptyItem);
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (field: keyof InventoryItemFormValues, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === "string" ? value : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (formData.partId <= 0) {
      setError("Informe o ID da peça cadastrada");
      return;
    }

    if (formData.initialQuantity < 0 || formData.minimumQuantity < 0) {
      setError("Quantidades devem ser positivas");
      return;
    }

    if ((formData.averageCost ?? 0) < 0 || (formData.salePrice ?? 0) < 0) {
      setError("Valores monetários não podem ser negativos");
      return;
    }

    if (!formData.location?.trim()) {
      setError("Localização é obrigatória");
      return;
    }

    try {
      await onSubmit({
        ...formData,
        location: formData.location!.trim(),
        averageCost: formData.averageCost ?? undefined,
        salePrice: formData.salePrice ?? undefined,
      });
      onClose();
    } catch (submitError: any) {
      setError(submitError?.response?.data?.message || "Não foi possível salvar o item de estoque");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Concilie o catálogo de peças com o estoque físico."
      size="md"
      headerStyle="default"
      footer={
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="inventory-item-form"
            isLoading={isSubmitting}
            leftIcon={!isSubmitting && "💾"}
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <form id="inventory-item-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Peça *</label>
              <select
                value={formData.partId}
                onChange={event => handleChange("partId", Number(event.target.value))}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                required
                disabled={isEditMode}
              >
                <option value={0}>Selecione uma peça</option>
                {partsData.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.name} - {part.sku}
                  </option>
                ))}
              </select>
              {isEditMode && (
                <span className="mt-1 text-xs text-gray-500">
                  Não é possível alterar a peça de um item já cadastrado.
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Localização *</label>
              <input
                type="text"
                value={formData.location ?? ""}
                onChange={event => handleChange("location", event.target.value)}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                placeholder="Ex: Prateleira A3"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Estoque atual</label>
              <input
                type="number"
                min={0}
                value={formData.initialQuantity}
                onChange={event => handleChange("initialQuantity", Number(event.target.value))}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                disabled={isEditMode}
              />
              {isEditMode && (
                <span className="mt-1 text-xs text-gray-500">
                  Ajustes de quantidade devem ser feitos via movimentações.
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Quantidade mínima</label>
              <input
                type="number"
                min={0}
                value={formData.minimumQuantity}
                onChange={event => handleChange("minimumQuantity", Number(event.target.value))}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Custo médio (R$)</label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={formData.averageCost ?? 0}
                onChange={event => handleChange("averageCost", Number(event.target.value))}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Preço de venda (R$)</label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={formData.salePrice ?? 0}
                onChange={event => handleChange("salePrice", Number(event.target.value))}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              />
            </div>
          </div>
        </form>
    </Modal>
  );
}
