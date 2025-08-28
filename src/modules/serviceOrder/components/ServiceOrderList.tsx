import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { serviceOrdersApi } from "../services/api";
import type { ServiceOrder } from "../types/serviceOrder";
import CreateServiceOrderModal from "./CreateServiceOrderModal";

export default function ServiceOrderList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ServiceOrder['status'] | 'all'>('all');

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

  const getStatusColor = (status: ServiceOrder['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      waiting_parts: 'bg-purple-100 text-purple-800',
      waiting_approval: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      canceled: 'bg-red-100 text-red-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: ServiceOrder['status']) => {
    const labels = {
      pending: 'Pendente',
      in_progress: 'Em Andamento',
      waiting_parts: 'Aguardando Peças',
      waiting_approval: 'Aguardando Aprovação',
      completed: 'Concluída',
      canceled: 'Cancelada',
      overdue: 'Atrasada'
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority: ServiceOrder['priority']) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      urgent: 'text-red-600'
    };
    return colors[priority || 'low'];
  };

  const getPriorityIcon = (priority: ServiceOrder['priority']) => {
    const icons = {
      low: '🔽',
      medium: '➡️',
      high: '🔼',
      urgent: '🚨'
    };
    return icons[priority || 'low'];
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h2 className="text-xl font-semibold text-red-800 mb-2">Erro ao carregar ordens de serviço</h2>
          <p className="text-red-600 mb-4">
            {error instanceof Error ? error.message : "Erro desconhecido"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">📋 Ordens de Serviço</h1>
            <p className="text-gray-600">Gerencie todas as ordens de serviço da oficina</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            Nova OS
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {serviceOrders.length}
            </div>
            <div className="text-sm text-orange-700">Total</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {serviceOrders.filter(o => o.status === 'in_progress').length}
            </div>
            <div className="text-sm text-blue-700">Em Andamento</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {serviceOrders.filter(o => o.status === 'pending').length}
            </div>
            <div className="text-sm text-yellow-700">Pendentes</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {serviceOrders.filter(o => o.status === 'completed').length}
            </div>
            <div className="text-sm text-green-700">Concluídas</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Todas' },
            { value: 'pending', label: 'Pendentes' },
            { value: 'in_progress', label: 'Em Andamento' },
            { value: 'waiting_parts', label: 'Aguardando Peças' },
            { value: 'waiting_approval', label: 'Aguardando Aprovação' },
            { value: 'completed', label: 'Concluídas' },
            { value: 'canceled', label: 'Canceladas' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === value
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Ordens */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando ordens de serviço...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-6xl mb-4 block">📋</span>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {statusFilter === 'all' ? 'Nenhuma ordem de serviço encontrada' : `Nenhuma OS ${getStatusLabel(statusFilter as any).toLowerCase()}`}
            </h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'all' 
                ? 'Comece criando sua primeira ordem de serviço'
                : 'Altere o filtro para ver outras ordens'
              }
            </p>
            {statusFilter === 'all' && (
              <button
                onClick={() => setShowCreate(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Criar primeira OS
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    OS / Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Veículo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status / Prioridade
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          OS #{order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.client?.name || `Cliente ID: ${order.clientId}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.vehicle?.brand} {order.vehicle?.model}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.vehicle?.licensePlate}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        <div className={`text-sm font-medium flex items-center gap-1 ${getPriorityColor(order.priority)}`}>
                          <span>{getPriorityIcon(order.priority)}</span>
                          {order.priority?.toUpperCase()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.totalPrice ? `R$ ${order.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                      {order.estimatedCompletionDate && (
                        <div className="text-xs text-gray-500">
                          Previsão: {new Date(order.estimatedCompletionDate).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(order)}
                          className="text-orange-600 hover:text-orange-700 p-2 rounded-lg hover:bg-orange-50 transition-colors"
                          title="Ver detalhes"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => handleDelete(order)}
                          className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Excluir"
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
        )}
      </div>

      {/* Modal de Criação */}
      {showCreate && (
        <CreateServiceOrderModal onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}