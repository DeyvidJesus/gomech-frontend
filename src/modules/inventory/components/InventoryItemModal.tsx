import { useEffect, useState } from "react";

import type { InventoryItem, InventoryItemCreateDTO } from "../types/inventory";

interface InventoryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: InventoryItemCreateDTO) => Promise<void> | void;
  title: string;
  initialData?: InventoryItem | null;
  isSubmitting?: boolean;
}

const emptyItem: InventoryItemCreateDTO = {
  partId: 0,
  availableQuantity: 0,
  minimumQuantity: 0,
  location: "",
  averageCost: 0,
};

export function InventoryItemModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
  isSubmitting = false,
}: InventoryItemModalProps) {
  const [formData, setFormData] = useState<InventoryItemCreateDTO>(emptyItem);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          partId: initialData.partId,
          availableQuantity: initialData.availableQuantity,
          minimumQuantity: initialData.minimumQuantity,
          location: initialData.location ?? "",
          averageCost: initialData.averageCost ?? 0,
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

  const handleChange = (field: keyof InventoryItemCreateDTO, value: string | number) => {
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

    if (formData.availableQuantity < 0 || formData.minimumQuantity < 0) {
      setError("Quantidades devem ser positivas");
      return;
    }

    try {
      await onSubmit({
        ...formData,
        location: formData.location?.trim() || undefined,
        averageCost: formData.averageCost ?? undefined,
      });
      onClose();
    } catch (submitError: any) {
      setError(submitError?.response?.data?.message || "Não foi possível salvar o item de estoque");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">Concilie o catálogo de peças com o estoque físico.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">ID da peça</label>
              <input
                type="number"
                min={1}
                value={formData.partId}
                onChange={event => handleChange("partId", Number(event.target.value))}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                required
              />
              <span className="mt-1 text-xs text-gray-500">Consulte o ID na listagem de peças cadastradas.</span>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Localização (opcional)</label>
              <input
                type="text"
                value={formData.location ?? ""}
                onChange={event => handleChange("location", event.target.value)}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                placeholder="Ex: Prateleira A3"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Quantidade disponível</label>
              <input
                type="number"
                min={0}
                value={formData.availableQuantity}
                onChange={event => handleChange("availableQuantity", Number(event.target.value))}
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
              />
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
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-orangeWheel-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orangeWheel-600 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Salvando...
                </>
              ) : (
                <>💾 Salvar</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
