import type { Vehicle } from "../types/vehicle";

interface VehicleDetailsModalProps {
  vehicle: Vehicle;
  onClose: () => void;
}

export function VehicleDetailsModal({ vehicle, onClose }: VehicleDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-onyx-200 p-8 rounded-lg shadow min-w-[320px]">
        <h3 className="text-xl font-bold mb-4">Detalhes do Veículo</h3>
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
        <button onClick={onClose} className="mt-4 bg-onyx-400 hover:bg-onyx-600 text-white px-4 py-2 rounded transition-colors">Fechar</button>
      </div>
    </div>
  );
}
