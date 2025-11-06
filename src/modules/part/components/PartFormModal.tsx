import { useState, useEffect } from "react";

import type { PartCreateDTO, Part } from "../types/part";

interface PartFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PartCreateDTO) => Promise<void> | void;
  title: string;
  initialData?: Part | null;
  isSubmitting?: boolean;
}

const emptyPart: PartCreateDTO = {
  name: "",
  sku: "",
  manufacturer: "",
  description: "",
  active: true,
  unitCost: 0,
  unitPrice: 0,
};

export function PartFormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData,
  isSubmitting = false,
}: PartFormModalProps) {
  const [formData, setFormData] = useState<PartCreateDTO>(emptyPart);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          sku: initialData.sku,
          manufacturer: initialData.manufacturer ?? "",
          description: initialData.description ?? "",
          active: initialData.active,
          unitCost: initialData.unitCost,
          unitPrice: initialData.unitPrice,
        });
      } else {
        setFormData(emptyPart);
      }
      setError(null);
    }
  }, [isOpen, initialData]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (field: keyof PartCreateDTO, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === "string" && field !== "description" && field !== "manufacturer"
        ? value.trimStart()
        : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.sku.trim()) {
      setError("Informe o nome e o SKU da peça");
      return;
    }

    if ((formData.unitCost && formData.unitCost < 0) || (formData.unitPrice && formData.unitPrice < 0)) {
      setError("Valores de custo e preço devem ser positivos");
      return;
    }

    try {
      await onSubmit({
        ...formData,
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        manufacturer: formData.manufacturer?.trim() || undefined,
        description: formData.description?.trim() || undefined,
      });
      onClose();
    } catch (submitError: any) {
      setError(submitError?.response?.data?.message || "Não foi possível salvar a peça");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">Preencha os dados obrigatórios para controlar o catálogo de peças.</p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            onClick={onClose}
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
              <label className="text-sm font-medium text-gray-700">Nome*</label>
              <input
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                value={formData.name}
                onChange={event => handleChange("name", event.target.value)}
                placeholder="Pastilha de freio dianteira"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">SKU*</label>
              <input
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                value={formData.sku}
                onChange={event => handleChange("sku", event.target.value)}
                placeholder="SKU-1234"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Fabricante</label>
              <input
                className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                value={formData.manufacturer ?? ""}
                onChange={event => handleChange("manufacturer", event.target.value)}
                placeholder="Bosch, Cofap..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Custo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                  value={formData.unitCost ?? 0}
                  onChange={event => handleChange("unitCost", Number(event.target.value))}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                  value={formData.unitPrice ?? 0}
                  onChange={event => handleChange("unitPrice", Number(event.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col md:col-span-1">
              <label className="text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                value={formData.description ?? ""}
                onChange={event => handleChange("description", event.target.value)}
                placeholder="Informações adicionais sobre compatibilidade ou observações."
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
