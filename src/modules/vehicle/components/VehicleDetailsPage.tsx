import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import { vehiclesApi } from "../services/api";
import type { Vehicle } from "../types/vehicle";

export function VehicleDetailsPage() {
  const { id } = useParams({ from: "/vehicles/$id" });
  const navigate = useNavigate();
  const vehicleId = Number(id);

  const { data: vehicle, isLoading, error } = useQuery<Vehicle>({
    queryKey: ["vehicle", vehicleId],
    queryFn: async () => {
      const res = await vehiclesApi.getById(vehicleId);
      return res.data;
    },
    enabled: !!vehicleId,
  });

  if (isLoading) return <div className="text-center text-lg text-primary mt-8">Carregando veículo...</div>;
  if (error || !vehicle) return <div className="text-center text-lg text-red-600 mt-8">Veículo não encontrado.</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white dark:bg-onyx-200 rounded shadow mt-8">
      <button
        onClick={() => navigate({ to: "/vehicles" })}
        className="mb-4 bg-onyx-400 hover:bg-onyx-600 text-white px-4 py-2 rounded transition-colors"
      >
        Voltar
      </button>
      <h2 className="text-2xl font-bold mb-4 text-onyx-100 dark:text-onyx-900">Detalhes do Veículo</h2>
      <div className="space-y-2">
        <p><b>ID:</b> {vehicle.id}</p>
        <p><b>Placa:</b> {vehicle.plate}</p>
        <p><b>Marca:</b> {vehicle.brand}</p>
        <p><b>Modelo:</b> {vehicle.model}</p>
        <p><b>Ano:</b> {vehicle.year}</p>
        <p><b>Criado em:</b> {new Date(vehicle.createdAt).toLocaleString()}</p>
        <p><b>Atualizado em:</b> {new Date(vehicle.updatedAt).toLocaleString()}</p>
        {vehicle.client && (
          <div>
            <b>Cliente:</b> {vehicle.client.name} ({vehicle.client.email})
          </div>
        )}
      </div>
    </div>
  );
}
