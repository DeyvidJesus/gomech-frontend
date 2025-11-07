import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { serviceOrdersApi } from "../services/api";
import type { ServiceOrder, ServiceOrderStatus } from "../types/serviceOrder";
import { statusDisplayMapping } from "../types/serviceOrder";
import CreateServiceOrderModal from "./CreateServiceOrderModal";
import { PageTutorial } from "@/modules/tutorial/components/PageTutorial";
import { Pagination } from "../../../shared/components/Pagination";
import type { PageResponse } from "../../../shared/types/pagination";

export default function ServiceOrderList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ServiceOrderStatus | 'all'>('all');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>("orderNumber");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");

  // Query separada para estatísticas (não recarrega ao trocar de página)
  const { data: statsData } = useQuery<PageResponse<ServiceOrder>>({
    queryKey: ["service-orders-stats"],
    queryFn: async () => {
      const res = await serviceOrdersApi.getAllPaginated({ page: 0, size: 1 });
      return res.data;
    },
    staleTime: 60000, // Cache por 1 minuto
  });

  // Query para lista paginada (recarrega ao trocar de página)
  const { data: serviceOrdersPage, isLoading, error } = useQuery<PageResponse<ServiceOrder>>({
    queryKey: ["service-orders-list", page, pageSize, sortBy, sortDirection],
    queryFn: async () => {
      const res = await serviceOrdersApi.getAllPaginated({ page, size: pageSize, sortBy, direction: sortDirection });
      return res.data;
    },
  });

  const serviceOrders = serviceOrdersPage?.content || [];
  const totalServiceOrders = statsData?.totalElements || serviceOrdersPage?.totalElements || 0;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => serviceOrdersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrders"] });
      queryClient.invalidateQueries({ queryKey: ["service-orders-list"] });
      queryClient.invalidateQueries({ queryKey: ["service-orders-stats"] });
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || "Erro ao deletar ordem de serviço");
    },
  });

  const filteredOrders = serviceOrders.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  );

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortDirection("ASC");
    }
    setPage(0); // Reset para primeira página ao mudar ordenação
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return "⇅";
    return sortDirection === "ASC" ? "↑" : "↓";
  };

  const handleView = (order: ServiceOrder) => {
    navigate({ to: `/service-orders/${order.id}` });
  };

  const handleDelete = (order: ServiceOrder) => {
    const isConfirmed = window.confirm(
      `⚠️ Tem certeza que deseja deletar a OS ${order.orderNumber}?\n\nEsta ação não pode ser desfeita.`
    );
    if (isConfirmed) {
      deleteMutation.mutate(order.id);
    }
  };

  const getStatusColor = (status: ServiceOrderStatus) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      WAITING_PARTS: 'bg-purple-100 text-purple-800',
      WAITING_APPROVAL: 'bg-orangeWheel-100 text-orangeWheel-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      DELIVERED: 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: ServiceOrderStatus) => {
    return statusDisplayMapping[status] || status;
  };

  const tutorial = (
    <PageTutorial
      tutorialKey="service-orders"
      title="Como acompanhar as ordens de serviço"
      description="Veja como filtrar, criar e gerenciar as ordens da oficina."
      steps={[
        {
          title: 'Resumo da fila',
          description: 'Os cartões mostram totais por status para priorizar o atendimento.',
          icon: '📊',
        },
        {
          title: 'Criação de OS',
          description: 'Use o botão "Nova OS" para iniciar rapidamente uma ordem e vincular cliente e veículo.',
          icon: '➕',
        },
        {
          title: 'Filtros e ações',
          description: 'Filtre por status, abra detalhes, edite ou cancele cada ordem diretamente na lista.',
          icon: '⚙️',
        },
      ]}
    />
  );

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        {tutorial}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h2 className="text-xl font-semibold text-red-800 mb-2">Erro ao carregar ordens de serviço</h2>
          <p className="text-red-600 mb-4">
            Ocorreu um erro ao buscar as ordens de serviço. Tente recarregar a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {tutorial}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-8 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orangeWheel-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg sm:text-2xl">📋</span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Ordens de Serviço</h1>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">Gerencie todas as ordens de serviço</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-orangeWheel-500 hover:bg-orangeWheel-600 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-colors flex items-center gap-2 justify-center w-full sm:w-auto"
        >
          <span>➕</span>
          <span className="hidden sm:inline">Nova OS</span>
          <span className="sm:hidden">Nova</span>
        </button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-medium">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {totalServiceOrders}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-sm sm:text-lg">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-medium">Em Andamento</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600">
                {serviceOrders.filter(o => o.status === 'IN_PROGRESS').length}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-sm sm:text-lg">⚙️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-medium">Pendentes</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-600">
                {serviceOrders.filter(o => o.status === 'PENDING').length}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-sm sm:text-lg">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-xs sm:text-sm font-medium">Concluídas</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600">
                {serviceOrders.filter(o => o.status === 'COMPLETED').length}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-sm sm:text-lg">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <span className="text-xs sm:text-sm font-medium text-gray-700 flex-shrink-0">Filtrar por status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ServiceOrderStatus | 'all')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orangeWheel-500 focus:border-orangeWheel-500 w-full sm:w-auto min-w-0"
          >
            <option value="all">Todos os status</option>
            <option value="PENDING">Pendente</option>
            <option value="IN_PROGRESS">Em Andamento</option>
            <option value="WAITING_PARTS">Aguardando Peças</option>
            <option value="WAITING_APPROVAL">Aguardando Aprovação</option>
            <option value="COMPLETED">Concluída</option>
            <option value="CANCELLED">Cancelada</option>
            <option value="DELIVERED">Entregue</option>
          </select>
        </div>
      </div>

      {/* Lista de Ordens */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-6 sm:p-8 lg:p-12 text-center">
            <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-orangeWheel-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">Carregando ordens de serviço...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-6 sm:p-8 lg:p-12 text-center">
            <span className="text-3xl sm:text-4xl lg:text-6xl mb-4 block">📋</span>
            <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-2">
              {statusFilter === 'all' ? 'Nenhuma ordem de serviço encontrada' : 'Nenhuma OS com este status'}
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-4 sm:mb-6">
              {statusFilter === 'all' 
                ? 'Comece criando sua primeira ordem de serviço.' 
                : 'Altere o filtro para ver outras ordens de serviço.'
              }
            </p>
            {statusFilter === 'all' && (
              <button
                onClick={() => setShowCreate(true)}
                className="bg-orangeWheel-500 hover:bg-orangeWheel-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors text-sm sm:text-base"
              >
                Criar primeira OS
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop: Tabela */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-1/6" />
                  <col className="w-1/5" />
                  <col className="w-1/5" />
                  <col className="w-1/8" />
                  <col className="w-1/8" />
                  <col className="w-1/8" />
                </colgroup>
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                      onClick={() => handleSort("orderNumber")}
                      title="Clique para ordenar por número da OS"
                    >
                      <div className="flex items-center gap-1">
                        OS <span className="text-orangeWheel-500">{getSortIcon("orderNumber")}</span>
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                      onClick={() => handleSort("clientName")}
                      title="Clique para ordenar por cliente"
                    >
                      <div className="flex items-center gap-1">
                        Cliente <span className="text-orangeWheel-500">{getSortIcon("clientName")}</span>
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                      onClick={() => handleSort("vehicleInfo")}
                      title="Clique para ordenar por veículo"
                    >
                      <div className="flex items-center gap-1">
                        Veículo <span className="text-orangeWheel-500">{getSortIcon("vehicleInfo")}</span>
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                      onClick={() => handleSort("status")}
                      title="Clique para ordenar por status"
                    >
                      <div className="flex items-center gap-1">
                        Status <span className="text-orangeWheel-500">{getSortIcon("status")}</span>
                      </div>
                    </th>
                    <th 
                      className="text-left py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                      onClick={() => handleSort("totalCost")}
                      title="Clique para ordenar por valor"
                    >
                      <div className="flex items-center gap-1">
                        Valor <span className="text-orangeWheel-500">{getSortIcon("totalCost")}</span>
                      </div>
                    </th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700 text-xs uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr
                      key={order.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 text-sm">#{order.orderNumber}</div>
                        {order.description && (
                          <div className="text-xs text-gray-600 truncate">
                            {order.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {order.clientName || 'Cliente não encontrado'}
                        </div>
                        {order.clientPhone && (
                          <div className="text-xs text-gray-600 truncate">{order.clientPhone}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {order.vehicleBrand} {order.vehicleModel}
                        </div>
                        {order.vehicleLicensePlate && (
                          <div className="text-xs text-gray-600">{order.vehicleLicensePlate}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900 text-sm">
                          R$ {order.totalCost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleView(order)}
                            className="text-orangeWheel-600 hover:text-orangeWheel-800 p-1.5 rounded-lg hover:bg-orangeWheel-50 transition-colors"
                            title="Ver detalhes"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleDelete(order)}
                            className="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            disabled={deleteMutation.isPending}
                            title="Deletar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Sorting */}
            <div className="lg:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3 mx-4">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">
                Ordenar por:
              </label>
              <div className="flex gap-2">
                <select 
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(0);
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orangeWheel-500"
                >
                  <option value="orderNumber">Número da OS</option>
                  <option value="clientName">Cliente</option>
                  <option value="status">Status</option>
                  <option value="totalCost">Valor Total</option>
                </select>
                <button
                  onClick={() => setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC")}
                  className="px-4 py-2 bg-orangeWheel-500 text-white rounded-lg text-lg hover:bg-orangeWheel-600 transition-colors"
                  title={`Ordem: ${sortDirection === "ASC" ? "Crescente" : "Decrescente"}`}
                >
                  {sortDirection === "ASC" ? "↑" : "↓"}
                </button>
              </div>
            </div>

            {/* Mobile/Tablet: Cards */}
            <div className="lg:hidden p-4 space-y-4">
              {filteredOrders.map((order) => (
                <div 
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleView(order)}
                >
                  {/* Header do Card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-900 text-lg">
                        #{order.orderNumber}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {order.clientName || 'Cliente não encontrado'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(order);
                        }}
                        className="text-orange-600 hover:text-orange-800 p-2 rounded-lg hover:bg-orange-50 transition-colors"
                        title="Ver detalhes"
                      >
                        👁️
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(order);
                        }}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        disabled={deleteMutation.isPending}
                        title="Deletar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Informações principais */}
                  <div className="space-y-2 mb-3">
                    {order.vehicleId && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Veículo: </span>
                        <span className="text-gray-900">
                          {order.vehicleBrand} {order.vehicleModel}
                        </span>
                        {order.vehicleLicensePlate && (
                          <span className="text-gray-600"> • {order.vehicleLicensePlate}</span>
                        )}
                      </div>
                    )}
                    
                    {order.description && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Descrição: </span>
                        <span className="text-gray-900">{order.description}</span>
                      </div>
                    )}

                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Valor: </span>
                      <span className="text-gray-900 font-bold">
                        R$ {order.totalCost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Criada em: </span>
                      <span className="text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      {order.estimatedCompletion && (
                        <>
                          <br />
                          <span className="font-medium text-gray-700">Previsão: </span>
                          <span className="text-gray-900">
                            {new Date(order.estimatedCompletion).toLocaleDateString('pt-BR')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Paginação */}
      {serviceOrdersPage && serviceOrdersPage.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={serviceOrdersPage.totalPages}
          onPageChange={setPage}
          isLoading={isLoading}
        />
      )}

      {/* Modal de criação */}
      <CreateServiceOrderModal 
        isOpen={showCreate}
        onClose={() => setShowCreate(false)} 
      />
    </div>
  );
}