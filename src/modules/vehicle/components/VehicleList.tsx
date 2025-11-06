import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehiclesApi } from "../services/api";
import type { Vehicle } from "../types/vehicle";
import { useState } from "react";
import { EditVehicleModal } from "./EditVehicleModal";
import { AddVehicleModal } from "./AddVehicleModal";
import VehicleClientLinkModal from "./VehicleClientLinkModal";
import { useNavigate, Link } from "@tanstack/react-router";
import type { Client } from "../../client/types/client";
import { clientsApi } from "../../client/services/api";
import { VehicleImportModal } from "./VehicleImportModal";
import axios from "../../../shared/services/axios";
import { ImportInstructionsModal } from "../../../shared/components/ImportInstructionsModal";
import { PageTutorial } from "@/modules/tutorial/components/PageTutorial";

export function VehicleList() {
  const queryClient = useQueryClient();
  const { data: clients } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await clientsApi.getAll();
      return res.data;
    },
  });
  const { data, isLoading, error } = useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const res = await vehiclesApi.getAll();
      return res.data;
    },
  });

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState<string | null>(null);
  const navigate = useNavigate();

  const downloadTemplate = async (format: "xlsx" | "csv") => {
    setDownloadingTemplate(format);
    try {
      const response = await axios.get(`/vehicles/template?format=${format}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `template_veiculos.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar template:", error);
      alert("Erro ao baixar template");
    } finally {
      setDownloadingTemplate(null);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => vehiclesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => vehiclesApi.upload(file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehicles"] }),
  });

  const handleAdd = () => {
    setShowAdd(true);
  };

  const handleCloseAdd = () => {
    setShowAdd(false);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowEdit(true);
  };

  const handleLink = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowLink(true);
  };

  const handleView = (vehicle: Vehicle) => {
    navigate({ to: `/vehicles/${vehicle.id}` });
  };

  const handleDelete = (vehicle: Vehicle) => {
    const isConfirmed = window.confirm(
      `⚠️ Tem certeza que deseja deletar o veículo "${vehicle.licensePlate}"?\n\nEsta ação não pode ser desfeita.`
    );
    if (isConfirmed) {
      deleteMutation.mutate(vehicle.id);
    }
  };

  const handleCloseEdit = () => {
    setShowEdit(false);
    setSelectedVehicle(null);
  };

  const handleCloseLink = () => {
    setShowLink(false);
    setSelectedVehicle(null);
  };

  const handleImportVehicles = async (file: File) => {
    await importMutation.mutateAsync(file);
  };

  const handleExport = async (format: "csv" | "xlsx") => {
    try {
      setIsExporting(true);
      const response = await vehiclesApi.export(format);
      const disposition = response.headers["content-disposition"] ?? response.headers["Content-Disposition"];
      let filename = `veiculos_${new Date().toISOString().slice(0, 10)}.${format}`;

      if (disposition) {
        const filenameMatch = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(disposition);
        const rawFilename = filenameMatch?.[1] ?? filenameMatch?.[2];
        if (rawFilename) {
          filename = decodeURIComponent(rawFilename.replace(/"/g, ""));
        }
      }

      const blob = new Blob([response.data], {
        type:
          format === "csv"
            ? "text/csv;charset=utf-8"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (exportError) {
      console.error("Erro ao exportar veículos", exportError);
      window.alert("Não foi possível exportar os veículos. Tente novamente mais tarde.");
    } finally {
      setIsExporting(false);
    }
  };


  // Estados de carregamento e erro
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 sm:h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-orangeWheel-500 mb-4 mx-auto"></div>
          <p className="text-gray-600 text-sm sm:text-lg">Carregando veículos...</p>
        </div>
      </div>
    );
  }

  const tutorial = (
    <PageTutorial
      tutorialKey="vehicles-management"
      title="Tour pela gestão de veículos"
      description="Conheça as ações principais para cadastrar, importar e vincular veículos aos clientes."
      steps={[
        {
          title: 'Cadastro rápido',
          description: 'Clique em "Novo veículo" para registrar dados completos e associá-lo a um cliente.',
          icon: '🚗',
        },
        {
          title: 'Importação em massa',
          description: 'Use o modelo disponível, importe planilhas e consulte o botão Ajuda para orientações.',
          icon: '📥',
        },
        {
          title: 'Ações da lista',
          description: 'Edite, visualize ou exclua veículos e utilize os filtros para encontrar rapidamente o que precisa.',
          icon: '🛠️',
        },
      ]}
    />
  );

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        {tutorial}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
          <div className="text-red-600 text-4xl sm:text-5xl mb-4">⚠️</div>
          <h3 className="text-red-800 text-lg sm:text-xl font-semibold mb-2">Erro ao carregar veículos</h3>
          <p className="text-red-600 text-sm sm:text-base">Ocorreu um problema ao buscar os dados. Tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {tutorial}
      {/* Header */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-orangeWheel-500 mb-2 flex items-center gap-2">
              <span className="text-lg sm:text-xl md:text-2xl">🚗</span>
              Gestão de Veículos
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">Gerencie todos os veículos da sua oficina</p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <button
              onClick={() => setShowInstructions(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 sm:px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
              title="Ver instruções de cadastro em massa"
            >
              ℹ️ Ajuda
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="bg-white text-orangeWheel-600 border border-orangeWheel-200 hover:border-orangeWheel-300 font-semibold px-4 sm:px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
            >
              ⬆️ Importar
            </button>
            <div className="flex items-center gap-2">
              <button
                disabled={isExporting}
                onClick={() => void handleExport("csv")}
                className="bg-white text-orangeWheel-600 border border-orangeWheel-200 hover:border-orangeWheel-300 font-semibold px-4 sm:px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                {isExporting ? "Exportando..." : "CSV"}
              </button>
              <button
                disabled={isExporting}
                onClick={() => void handleExport("xlsx")}
                className="bg-white text-orangeWheel-600 border border-orangeWheel-200 hover:border-orangeWheel-300 font-semibold px-4 sm:px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                XLSX
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="bg-orangeWheel-500 hover:bg-orangeWheel-600 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <span className="text-lg">+</span>
              <span className="hidden xs:inline">Novo Veículo</span>
              <span className="xs:hidden">Novo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-gradient-to-r from-orangeWheel-500 to-orangeWheel-600 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs sm:text-sm font-medium">Total de Veículos</p>
              <p className="text-2xl sm:text-3xl font-bold">{data?.length || 0}</p>
            </div>
            <div className="text-2xl sm:text-4xl opacity-80">🚗</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-xs sm:text-sm font-medium">Veículos Ativos</p>
              <p className="text-2xl sm:text-3xl font-bold">{data?.length || 0}</p>
            </div>
            <div className="text-2xl sm:text-4xl opacity-80">✅</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orangeWheel-400 to-orangeWheel-500 rounded-lg p-4 sm:p-6 text-white sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs sm:text-sm font-medium">Novos este Mês</p>
              <p className="text-2xl sm:text-3xl font-bold">+{Math.ceil((data?.length || 0) * 0.2)}</p>
            </div>
            <div className="text-2xl sm:text-4xl opacity-80">📈</div>
          </div>
        </div>
      </div>

      {/* Lista de Veículos */}
      {!data || data.length === 0 ? (
        <div className="bg-white rounded-lg p-8 sm:p-12 text-center shadow-sm border border-gray-200">
          <div className="text-gray-400 text-4xl sm:text-6xl mb-4">🚗</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Nenhum veículo encontrado</h3>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">Comece adicionando o primeiro veículo da sua oficina</p>
          <button
            onClick={handleAdd}
            className="bg-orangeWheel-500 hover:bg-orangeWheel-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Adicionar Primeiro Veículo
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed divide-y divide-gray-200">
                <colgroup>
                  <col className="w-1/4" />
                  <col className="w-1/4" />
                  <col className="w-1/6" />
                  <col className="w-1/6" />
                  <col className="w-1/6" />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Veículo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Marca/Modelo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ano
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((vehicle: Vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-orangeWheel-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-orangeWheel-500 flex items-center justify-center">
                              <span className="text-white font-semibold text-xs">🚗</span>
                            </div>
                          </div>
                          <div className="ml-3 min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900 truncate">{vehicle.licensePlate}</div>
                            <div className="text-xs text-gray-500">ID: {vehicle.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 font-medium truncate">{vehicle.brand}</div>
                        <div className="text-xs text-gray-500 truncate">{vehicle.model}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 font-medium">
                          {new Date(vehicle.manufactureDate).getFullYear()}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{vehicle.color}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 truncate">
                          {vehicle.clientId ? clients?.find(client => client.id === vehicle.clientId)?.name || 'Cliente não encontrado' : 'Não vinculado'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(vehicle)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded text-xs transition-colors"
                            title="Ver detalhes"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleLink(vehicle)}
                            className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded text-xs transition-colors"
                            title="Vincular cliente"
                          >
                            🔗
                          </button>
                          <button
                            onClick={() => handleEdit(vehicle)}
                            className="bg-gray-600 hover:bg-gray-700 text-white p-1.5 rounded text-xs transition-colors"
                            title="Editar veículo"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(vehicle)}
                            className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded text-xs transition-colors"
                            title="Deletar veículo"
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? '⏳' : '🗑️'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {data.map((vehicle: Vehicle) => (
              <div key={vehicle.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-orangeWheel-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-lg">🚗</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{vehicle.licensePlate}</h3>
                      <p className="text-xs text-gray-500">ID: {vehicle.id}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">🏷️</span>
                    <span className="text-gray-900 font-medium">{vehicle.brand} {vehicle.model}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">📅</span>
                    <span className="text-gray-900">{new Date(vehicle.manufactureDate).getFullYear()} • {vehicle.color}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">👤</span>
                    <span className="text-gray-900 truncate">
                      {vehicle.clientId ? clients?.find(client => client.id === vehicle.clientId)?.name : 'Não vinculado'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">🔧</span>
                    <span className="text-gray-500 font-mono text-xs truncate">{vehicle.chassisId}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleView(vehicle)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <span>👁️</span>
                    Ver
                  </button>
                  <button
                    onClick={() => handleLink(vehicle)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <span>🔗</span>
                    Cliente
                  </button>
                  <button
                    onClick={() => handleEdit(vehicle)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <span>✏️</span>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1"
                    disabled={deleteMutation.isPending}
                  >
                    <span>{deleteMutation.isPending ? '⏳' : '🗑️'}</span>
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {/* Modais de edição e criação */}
      {showAdd && (
        <AddVehicleModal isOpen={showAdd} onClose={handleCloseAdd} />
      )}
      {showEdit && selectedVehicle && (
        <EditVehicleModal isOpen={showEdit} vehicle={selectedVehicle} onClose={handleCloseEdit} />
      )}
  {showLink && selectedVehicle && (
    <VehicleClientLinkModal isOpen={showLink} vehicle={selectedVehicle} onClose={handleCloseLink} />
  )}
      {showImport && (
        <VehicleImportModal
          isOpen={showImport}
          onClose={() => setShowImport(false)}
          onUpload={handleImportVehicles}
        />
      )}

      {showInstructions && (
        <ImportInstructionsModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          type="vehicles"
          onDownloadTemplate={downloadTemplate}
          isDownloading={downloadingTemplate}
        />
      )}
    </div>
  );
}
