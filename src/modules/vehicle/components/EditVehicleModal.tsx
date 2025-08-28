import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vehiclesApi } from "../services/api";
import type { Vehicle } from "../types/vehicle";

interface EditVehicleModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export function EditVehicleModal({ vehicle, onClose }: EditVehicleModalProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<Vehicle>>({ ...vehicle });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (data: Partial<Vehicle>) => vehiclesApi.update(vehicle.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      onClose();
    },
    onError: () => setError("Erro ao atualizar veículo."),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    mutation.mutate(form, {
      onSettled: () => setLoading(false),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-onyx-200 p-8 rounded-lg shadow min-w-[320px]">
        <h3 className="text-xl font-bold mb-4">Editar Veículo</h3>
        <label className="block mb-2">Placa:
          <input name="plate" value={form.plate || ''} onChange={handleChange} required className="input input-bordered w-full mt-1" />
        </label>
        <label className="block mb-2">Marca:
          <input name="brand" value={form.brand || ''} onChange={handleChange} required className="input input-bordered w-full mt-1" />
        </label>
        <label className="block mb-2">Modelo:
          <input name="model" value={form.model || ''} onChange={handleChange} required className="input input-bordered w-full mt-1" />
        </label>
        <label className="block mb-2">Ano:
          <input name="year" value={form.year || ''} onChange={handleChange} required className="input input-bordered w-full mt-1" type="number" />
        </label>
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <div className="flex gap-2 mt-4">
          <button type="submit" disabled={loading} className="bg-primary hover:bg-orangeWheel-500 text-white px-4 py-2 rounded transition-colors">
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" onClick={onClose} className="bg-onyx-400 hover:bg-onyx-600 text-white px-4 py-2 rounded transition-colors">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
