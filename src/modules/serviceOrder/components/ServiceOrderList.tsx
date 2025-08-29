import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { serviceOrdersApi } from "../services/api";
import type { ServiceOrder, ServiceOrderStatus } from "../types/serviceOrder";
import { statusDisplayMapping } from "../types/serviceOrder";
import CreateServiceOrderModal from "./CreateServiceOrderModal";

export default function ServiceOrderList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ServiceOrderStatus | 'all'>('all');

  // Buscar ordens de serviço
  const { data: serviceOrders = [], isLoading, error } = useQuery({
    queryKey: ["serviceOrders"],
    queryFn: () => serviceOrdersApi.getAll().then(res => res.data),
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: (id: number) => serviceOrdersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrders"] });
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || "Erro ao deletar ordem de serviço");
    },
  });

  // Filtrar por status
  const filteredOrders = serviceOrders.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  );

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
      WAITING_APPROVAL: 'bg-orange-100 text-orange-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      DELIVERED: 'bg-emerald-100 text-emerald-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: ServiceOrderStatus) => {
    return statusDisplayMapping[status] || status;
  };

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-8 mb-6 sm:mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
            <span className="text-2xl">📋</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ordens de Serviço</h1>
            <p className="text-sm sm:text-base text-gray-600">Gerencie todas as ordens de serviço</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors flex items-center gap-2 justify-center"
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
                {serviceOrders.length}
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Filtrar por status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ServiceOrderStatus | 'all')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-auto"
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
          <div className="p-8 sm:p-12 text-center">
            <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando ordens de serviço...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <span className="text-4xl sm:text-6xl mb-4 block">📋</span>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              {statusFilter === 'all' ? 'Nenhuma ordem de serviço encontrada' : 'Nenhuma OS com este status'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              {statusFilter === 'all' 
                ? 'Comece criando sua primeira ordem de serviço.' 
                : 'Altere o filtro para ver outras ordens de serviço.'
              }
            </p>
            {statusFilter === 'all' && (
              <button
                onClick={() => setShowCreate(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors"
              >
                Criar primeira OS
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop: Tabela */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">OS</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Cliente</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Veículo</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Valor</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700">Data</th>
                    <th className="text-center py-4 px-6 font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">#{order.orderNumber}</div>
                        {order.description && (
                          <div className="text-sm text-gray-600 truncate max-w-xs">
                            {order.description}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          {order.client?.name || 'Cliente não encontrado'}
                        </div>
                        {order.client?.phone && (
                          <div className="text-sm text-gray-600">{order.client.phone}</div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          {order.vehicle?.brand} {order.vehicle?.model}
                        </div>
                        {order.vehicle?.licensePlate && (
                          <div className="text-sm text-gray-600">{order.vehicle.licensePlate}</div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">
                          R$ {order.finalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                        {order.estimatedCompletion && (
                          <div className="text-xs text-gray-500">
                            Previsão: {new Date(order.estimatedCompletion).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleView(order)}
                            className="text-orange-600 hover:text-orange-800 p-2 rounded-lg hover:bg-orange-50 transition-colors"
                            title="Ver detalhes"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleDelete(order)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
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
                        {order.client?.name || 'Cliente não encontrado'}
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
                    {order.vehicle && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Veículo: </span>
                        <span className="text-gray-900">
                          {order.vehicle.brand} {order.vehicle.model}
                        </span>
                        {order.vehicle.licensePlate && (
                          <span className="text-gray-600"> • {order.vehicle.licensePlate}</span>
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
                        R$ {order.finalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

      {/* Modal de criação */}
      {showCreate && (
        <CreateServiceOrderModal onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}