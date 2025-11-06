import { useState, useEffect } from "react";
import Modal from "../../../shared/components/Modal";
import Button from "../../../shared/components/Button";

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
  sku: "", // Será gerado pelo backend
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
          sku: initialData.sku, // Mantém SKU no modo edição
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

    if (!formData.name.trim()) {
      setError("Informe o nome da peça");
      return;
    }

    if ((formData.unitCost && formData.unitCost < 0) || (formData.unitPrice && formData.unitPrice < 0)) {
      setError("Valores de custo e preço devem ser positivos");
      return;
    }

    try {
      const payload = {
        ...formData,
        name: formData.name.trim(),
        manufacturer: formData.manufacturer?.trim() || undefined,
        description: formData.description?.trim() || undefined,
      };
      
      if (initialData) {
        payload.sku = formData.sku.trim();
      } else {
        (payload as Partial<typeof payload>).sku = undefined;
      }
      
      await onSubmit(payload);
      onClose();
    } catch (submitError: any) {
      setError(submitError?.response?.data?.message || "Não foi possível salvar a peça");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Preencha os dados obrigatórios para controlar o catálogo de peças."
      size="lg"
      headerStyle="default"
      footer={
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
          <Button variant="outline" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            form="part-form"
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

      <form id="part-form" onSubmit={handleSubmit} className="space-y-4">
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

            {initialData && (
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700">SKU</label>
                <input
                  className="mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase bg-gray-100 focus:border-orangeWheel-500 focus:outline-none focus:ring-2 focus:ring-orangeWheel-200"
                  value={formData.sku}
                  disabled
                  placeholder="Gerado automaticamente"
                />
                <span className="mt-1 text-xs text-gray-500">
                  O SKU é gerado automaticamente pelo sistema.
                </span>
              </div>
            )}
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
        </form>
    </Modal>
  );
}
