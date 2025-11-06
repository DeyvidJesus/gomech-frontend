import { useQuery } from "@tanstack/react-query";
import { vehiclesApi } from "../services/api";
import type { ServiceOrder } from "../../serviceOrder/types/serviceOrder";
import { statusDisplayMapping } from "../../serviceOrder/types/serviceOrder";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

interface VehicleServiceHistoryProps {
  vehicleId: number;
}

export function VehicleServiceHistory({ vehicleId }: VehicleServiceHistoryProps) {
  const [exportingFormat, setExportingFormat] = useState<"csv" | "xlsx" | null>(null);

  const {
    data: serviceHistory = [],
    isLoading,
    error,
  } = useQuery<ServiceOrder[]>({
    queryKey: ["vehicle-service-history", vehicleId],
    queryFn: async () => {
      const res = await vehiclesApi.getServiceHistory(vehicleId);
      return res.data;
    },
    enabled: !!vehicleId,
  });

  const handleExport = async (format: "csv" | "xlsx") => {
    try {
      setExportingFormat(format);
      const response = await vehiclesApi.exportServiceHistory(vehicleId, format);
      
      // Criar blob e fazer download
      const blob = new Blob([response.data], {
        type: format === "xlsx" 
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "text/csv",
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `historico_veiculo_${vehicleId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao exportar histórico:", err);
      alert("Erro ao exportar histórico. Tente novamente.");
    } finally {
      setExportingFormat(null);
    }
  };

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      WAITING_PARTS: "bg-purple-100 text-purple-800",
      WAITING_APPROVAL: "bg-orange-100 text-orange-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      DELIVERED: "bg-emerald-100 text-emerald-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
  };

  const totalSpent = serviceHistory.reduce((sum, order) => sum + (order.totalCost || 0), 0);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="text-center py-6 sm:py-8">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-orangeWheel-500 mb-4 mx-auto"></div>
          <p className="text-gray-600 text-sm sm:text-base">Carregando histórico de serviços...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="text-center py-6 sm:py-8">
          <div className="text-red-400 text-3xl sm:text-4xl mb-4">⚠️</div>
          <p className="text-red-500 text-sm sm:text-base">Erro ao carregar histórico de serviços</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-base sm:text-lg">🔧</span>
            Histórico de Serviços
          </h2>
          {serviceHistory.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Total de {serviceHistory.length} serviço{serviceHistory.length !== 1 ? "s" : ""} • 
              Gasto total: R$ {totalSpent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>

        {serviceHistory.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => handleExport("csv")}
              disabled={exportingFormat !== null}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              {exportingFormat === "csv" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exportando...
                </>
              ) : (
                <>
                  <span>📊</span>
                  Exportar CSV
                </>
              )}
            </button>
            <button
              onClick={() => handleExport("xlsx")}
              disabled={exportingFormat !== null}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
            >
              {exportingFormat === "xlsx" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Exportando...
                </>
              ) : (
                <>
                  <span>📑</span>
                  Exportar Excel
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {serviceHistory.length === 0 ? (
        <div className="text-center py-6 sm:py-8">
          <div className="text-gray-400 text-3xl sm:text-4xl mb-4">🔧</div>
          <p className="text-gray-500 text-sm sm:text-base">Nenhum serviço registrado para este veículo</p>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">O histórico de manutenções aparecerá aqui</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ordem de Serviço
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Técnico
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Valor Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {serviceHistory.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <Link
                        to="/service-orders/$id"
                        params={{ id: String(order.id) }}
                        className="text-orangeWheel-600 hover:text-orangeWheel-700 font-semibold hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                      >
                        {statusDisplayMapping[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-900 truncate">
                          {order.description || order.problemDescription || "Sem descrição"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {order.technicianName || (
                        <span className="text-gray-400 italic">Não informado</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        R$ {order.totalCost?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {serviceHistory.map((order) => (
              <div
                key={order.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-orangeWheel-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <Link
                    to="/service-orders/$id"
                    params={{ id: String(order.id) }}
                    className="text-orangeWheel-600 hover:text-orangeWheel-700 font-bold text-base hover:underline"
                  >
                    {order.orderNumber}
                  </Link>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                  >
                    {statusDisplayMapping[order.status]}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Descrição: </span>
                    <span className="text-gray-900">
                      {order.description || order.problemDescription || "Sem descrição"}
                    </span>
                  </div>

                  {order.technicianName && (
                    <div>
                      <span className="text-gray-600">Técnico: </span>
                      <span className="text-gray-900">{order.technicianName}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="font-bold text-orangeWheel-600">
                      R$ {order.totalCost?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "0,00"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

