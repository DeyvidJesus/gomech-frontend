
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "../services/api";
import type { Client } from "../types/client";
import { useState } from "react";
import { EditClientModal } from "./EditClientModal";
import { CreateClientModal } from "./CreateClientModal";
import { useNavigate } from "@tanstack/react-router";
import { ClientImportModal } from "./ClientImportModal";
import { Pagination } from "../../../shared/components/Pagination";
import type { PageResponse } from "../../../shared/types/pagination";
import axios from "../../../shared/services/axios";
import { ImportInstructionsModal } from "../../../shared/components/ImportInstructionsModal";
import { PageTutorial } from "@/modules/tutorial/components/PageTutorial";

export function ClientList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Query separada para estatísticas (não recarrega ao trocar de página)
  const { data: statsData } = useQuery<PageResponse<Client>>({
    queryKey: ["clients-stats"],
    queryFn: async () => {
      const res = await clientsApi.getAllPaginated({ page: 0, size: 1 });
      return res.data;
    },
    staleTime: 60000, // Cache por 1 minuto
  });

  // Query para lista paginada (recarrega ao trocar de página)
  const { data: clientsPage, isLoading: isLoadingList, error } = useQuery<PageResponse<Client>>({
    queryKey: ["clients-list", page, pageSize],
    queryFn: async () => {
      const res = await clientsApi.getAllPaginated({ page, size: pageSize, sortBy: "name", direction: "ASC" });
      return res.data;
    },
  });

  const clients = clientsPage?.content || [];
  const totalClients = statsData?.totalElements || clientsPage?.totalElements || 0;

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState<string | null>(null);
  const navigate = useNavigate();

  const downloadTemplate = async (format: "xlsx" | "csv") => {
    setDownloadingTemplate(format);
    try {
      const response = await axios.get(`/clients/template?format=${format}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `template_clientes.${format}`;
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

  // Mutations para deletar
  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients-list"] });
      queryClient.invalidateQueries({ queryKey: ["clients-stats"] });
    },
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => clientsApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients-list"] });
      queryClient.invalidateQueries({ queryKey: ["clients-stats"] });
    },
  });

  // Handlers
  const handleAdd = () => {
    setShowCreate(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setShowEdit(true);
  };

  const handleDelete = (client: Client) => {
    const isConfirmed = window.confirm(
      `⚠️ Tem certeza que deseja deletar o cliente "${client.name}"?\n\nEsta ação não pode ser desfeita.`
    );
    if (isConfirmed) {
      deleteMutation.mutate(client.id);
    }
  };

  const handleView = (client: Client) => {
    navigate({ to: `/clients/${client.id}` });
  };

  const handleCloseEdit = () => {
    setShowEdit(false);
    setSelectedClient(null);
  };

  const handleCloseCreate = () => {
    setShowCreate(false);
  };

  const handleImportClients = async (file: File) => {
    await importMutation.mutateAsync(file);
  };

  const handleExport = async (format: "csv" | "xlsx") => {
    try {
      setIsExporting(true);
      const response = await clientsApi.export(format);
      const disposition = response.headers["content-disposition"] ?? response.headers["Content-Disposition"];
      let filename = `clientes_${new Date().toISOString().slice(0, 10)}.${format}`;

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
      console.error("Erro ao exportar clientes", exportError);
      window.alert("Não foi possível exportar os clientes. Tente novamente mais tarde.");
    } finally {
      setIsExporting(false);
    }
  };

  // Estado de erro
  const tutorial = (
    <PageTutorial
      tutorialKey="clients-management"
      title="Comece pela gestão de clientes"
      description="Aprenda os pontos principais para cadastrar, importar e acompanhar seus clientes."
      steps={[
        {
          title: 'Cadastro individual',
          description: 'Use o botão "Novo cliente" para registrar dados completos com poucos cliques.',
          icon: '➕',
        },
        {
          title: 'Importação em massa',
          description:
            'Baixe o modelo, preencha sua planilha e utilize Ajuda e Importar para trazer vários clientes de uma vez.',
          icon: '📥',
        },
        {
          title: 'Lista organizada',
          description:
            'Use paginação, pesquisa e ações rápidas para localizar, editar ou remover cadastros rapidamente.',
          icon: '🔍',
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
          <h3 className="text-red-800 text-lg sm:text-xl font-semibold mb-2">Erro ao carregar clientes</h3>
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
              <span className="text-lg sm:text-xl md:text-2xl">👥</span>
              Gestão de Clientes
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">Gerencie todos os clientes da sua oficina</p>
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
              <span className="hidden xs:inline">Novo Cliente</span>
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
              <p className="text-orange-100 text-xs sm:text-sm font-medium">Total de Clientes</p>
              <p className="text-2xl sm:text-3xl font-bold">{totalClients}</p>
            </div>
            <div className="text-2xl sm:text-4xl opacity-80">👥</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-300 text-xs sm:text-sm font-medium">Clientes Ativos</p>
              <p className="text-2xl sm:text-3xl font-bold">{totalClients}</p>
            </div>
            <div className="text-2xl sm:text-4xl opacity-80">✅</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orangeWheel-400 to-orangeWheel-500 rounded-lg p-4 sm:p-6 text-white sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs sm:text-sm font-medium">Itens por Página</p>
              <select 
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(0);
                }}
                className="mt-1 text-white rounded text-xl font-bold"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="text-2xl sm:text-4xl opacity-80">📄</div>
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      {isLoadingList && !clientsPage ? (
        <div className="bg-white rounded-lg p-8 sm:p-12 text-center shadow-sm border border-gray-200">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orangeWheel-500 mb-4 mx-auto"></div>
          <p className="text-gray-600">Carregando clientes...</p>
        </div>
      ) : !clients || clients.length === 0 ? (
        <div className="bg-white rounded-lg p-8 sm:p-12 text-center shadow-sm border border-gray-200">
          <div className="text-gray-400 text-4xl sm:text-6xl mb-4">👤</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Nenhum cliente encontrado</h3>
          <p className="text-gray-500 mb-6 text-sm sm:text-base">Comece adicionando o primeiro cliente da sua oficina</p>
          <button
            onClick={handleAdd}
            className="bg-orangeWheel-500 hover:bg-orangeWheel-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Adicionar Primeiro Cliente
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden relative">
            {isLoadingList && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orangeWheel-500"></div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full table-fixed divide-y divide-gray-200">
                <colgroup>
                  <col className="w-1/3" />
                  <col className="w-1/4" />
                  <col className="w-1/6" />
                  <col className="w-1/4" />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contato
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {clients.map((client: Client) => (
                    <tr key={client.id} className="hover:bg-orangeWheel-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-orangeWheel-500 flex items-center justify-center">
                              <span className="text-white font-semibold text-xs">
                                {client.name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3 min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900 truncate">{client.name}</div>
                            <div className="text-xs text-gray-500">ID: {client.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 truncate">{client.email}</div>
                        <div className="text-xs text-gray-500 truncate">{client.phone || 'Sem telefone'}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(client)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded text-xs transition-colors"
                            title="Ver detalhes"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleEdit(client)}
                            className="bg-gray-600 hover:bg-gray-700 text-white p-1.5 rounded text-xs transition-colors"
                            title="Editar cliente"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(client)}
                            className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded text-xs transition-colors"
                            title="Deletar cliente"
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
          <div className="lg:hidden space-y-3 relative">
            {isLoadingList && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orangeWheel-500"></div>
              </div>
            )}
            {clients.map((client: Client) => (
              <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-orangeWheel-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {client.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{client.name}</h3>
                      <p className="text-xs text-gray-500">ID: {client.id}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">📧</span>
                    <span className="text-gray-900 truncate">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">📱</span>
                      <span className="text-gray-900">{client.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">📅</span>
                    <span className="text-gray-500">{new Date(client.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(client)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <span>👁️</span>
                    Ver
                  </button>
                  <button
                    onClick={() => handleEdit(client)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <span>✏️</span>
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(client)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1"
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

      {/* Paginação */}
      {clientsPage && clientsPage.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={clientsPage.totalPages}
          onPageChange={setPage}
          isLoading={isLoadingList}
        />
      )}

      {showEdit && selectedClient && (
        <EditClientModal
          isOpen={showEdit}
          client={selectedClient}
          onClose={handleCloseEdit}
        />
      )}
      {showCreate && (
        <CreateClientModal
          isOpen={showCreate}
          onClose={handleCloseCreate}
        />
      )}
      {showImport && (
        <ClientImportModal
          isOpen={showImport}
          onClose={() => setShowImport(false)}
          onUpload={handleImportClients}
        />
      )}

      {showInstructions && (
        <ImportInstructionsModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          type="clients"
          onDownloadTemplate={downloadTemplate}
          isDownloading={downloadingTemplate}
        />
      )}
    </div>
  );
}
