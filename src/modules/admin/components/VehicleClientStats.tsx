import { useQuery } from "@tanstack/react-query";
import { vehiclesApi } from "../../vehicle/services/api";
import { clientsApi } from "../../client/services/api";

export default function VehicleClientStats() {
  const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => vehiclesApi.getAll().then(res => res.data),
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsApi.getAll().then(res => res.data),
  });

  const isLoading = vehiclesLoading || clientsLoading;

  // Calcular estatísticas de vinculação
  const linkedVehicles = vehicles.filter(vehicle => vehicle.clientId);
  const unlinkedVehicles = vehicles.filter(vehicle => !vehicle.clientId);
  const clientsWithVehicles = clients.filter(client => 
    vehicles.some(vehicle => vehicle.clientId === client.id)
  );
  const clientsWithoutVehicles = clients.filter(client => 
    !vehicles.some(vehicle => vehicle.clientId === client.id)
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas de Vinculação</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas de Vinculação</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Estatísticas de Veículos */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700 flex items-center gap-2">
            <span>🚗</span>
            Veículos
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-green-700">Vinculados a clientes</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-800">{linkedVehicles.length}</span>
                <span className="text-xs text-green-600">
                  ({vehicles.length > 0 ? Math.round((linkedVehicles.length / vehicles.length) * 100) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
              <span className="text-sm text-orange-700">Sem vinculação</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-orange-800">{unlinkedVehicles.length}</span>
                <span className="text-xs text-orange-600">
                  ({vehicles.length > 0 ? Math.round((unlinkedVehicles.length / vehicles.length) * 100) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Total de veículos</span>
              <span className="font-semibold text-gray-800">{vehicles.length}</span>
            </div>
          </div>
        </div>

        {/* Estatísticas de Clientes */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700 flex items-center gap-2">
            <span>👥</span>
            Clientes
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700">Com veículos</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-blue-800">{clientsWithVehicles.length}</span>
                <span className="text-xs text-blue-600">
                  ({clients.length > 0 ? Math.round((clientsWithVehicles.length / clients.length) * 100) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm text-purple-700">Sem veículos</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-purple-800">{clientsWithoutVehicles.length}</span>
                <span className="text-xs text-purple-600">
                  ({clients.length > 0 ? Math.round((clientsWithoutVehicles.length / clients.length) * 100) : 0}%)
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Total de clientes</span>
              <span className="font-semibold text-gray-800">{clients.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Progresso de Vinculação */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Taxa de Vinculação Geral</span>
          <span className="text-sm text-gray-600">
            {vehicles.length > 0 ? Math.round((linkedVehicles.length / vehicles.length) * 100) : 0}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
            style={{ 
              width: `${vehicles.length > 0 ? (linkedVehicles.length / vehicles.length) * 100 : 0}%` 
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0% vinculado</span>
          <span>100% vinculado</span>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-medium text-gray-700 mb-3">Ações Rápidas</h4>
        <div className="flex flex-wrap gap-2">
          <button className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1.5 rounded-lg transition-colors">
            Ver Veículos Vinculados
          </button>
          <button className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1.5 rounded-lg transition-colors">
            Ver Veículos Não Vinculados
          </button>
          <button className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1.5 rounded-lg transition-colors">
            Clientes sem Veículos
          </button>
        </div>
      </div>
    </div>
  );
}
