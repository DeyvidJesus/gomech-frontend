import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "@tanstack/react-router";
import { serviceOrdersApi, serviceOrderItemsApi } from "../services/api";
import type { ServiceOrder, ServiceOrderItem } from "../types/serviceOrder";
import EditServiceOrderModal from "./EditServiceOrderModal";
import AddServiceOrderItemModal from "./AddServiceOrderItemModal";

export default function ServiceOrderDetailsPage() {
  const navigate = useNavigate();
  const params = useParams({ from: "/service-orders/$id" });
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);

  const serviceOrderId = Number(params.id);

  // Buscar ordem de serviço
  const { data: serviceOrder, isLoading, error } = useQuery({
    queryKey: ["serviceOrder", serviceOrderId],
    queryFn: () => serviceOrdersApi.getById(serviceOrderId).then(res => res.data),
    enabled: !!serviceOrderId,
  });

  // Buscar itens da OS
  const { data: items = [] } = useQuery({
    queryKey: ["serviceOrderItems", serviceOrderId],
    queryFn: () => serviceOrderItemsApi.getByServiceOrder(serviceOrderId).then(res => res.data),
    enabled: !!serviceOrderId,
  });

  // Mutation para atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ServiceOrder['status'] }) =>
      serviceOrdersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrder", serviceOrderId] });
      queryClient.invalidateQueries({ queryKey: ["serviceOrders"] });
    },
  });

  // Mutation para aplicar/desaplicar item
  const toggleItemMutation = useMutation({
    mutationFn: ({ itemId, applied }: { itemId: number; applied: boolean }) =>
      applied ? serviceOrderItemsApi.unapply(itemId) : serviceOrderItemsApi.apply(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrderItems", serviceOrderId] });
      queryClient.invalidateQueries({ queryKey: ["serviceOrder", serviceOrderId] });
    },
  });

  // Mutation para deletar item
  const deleteItemMutation = useMutation({
    mutationFn: (itemId: number) => serviceOrderItemsApi.delete(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["serviceOrderItems", serviceOrderId] });
      queryClient.invalidateQueries({ queryKey: ["serviceOrder", serviceOrderId] });
    },
  });

  const handleStatusChange = (status: ServiceOrder['status']) => {
    updateStatusMutation.mutate({ id: serviceOrderId, status });
  };

  const handleToggleItem = (item: ServiceOrderItem) => {
    toggleItemMutation.mutate({ itemId: item.id, applied: item.applied });
  };

  const handleDeleteItem = (item: ServiceOrderItem) => {
    const isConfirmed = window.confirm(
      `⚠️ Tem certeza que deseja remover "${item.description}"?\n\nEsta ação não pode ser desfeita.`
    );
    if (isConfirmed) {
      deleteItemMutation.mutate(item.id);
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

  // Calcular totais
  const appliedItems = items.filter(item => item.applied);
  const totalValue = appliedItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const serviceItems = appliedItems.filter(item => item.type === 'service');
  const partItems = appliedItems.filter(item => item.type === 'part');

  if (isLoading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando ordem de serviço...</p>
        </div>
      </div>
    );
  }

  if (error || !serviceOrder) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h2 className="text-xl font-semibold text-red-800 mb-2">Ordem de serviço não encontrada</h2>
          <p className="text-red-600 mb-4">
            A ordem de serviço que você está procurando não existe ou foi removida.
          </p>
          <button
            onClick={() => navigate({ to: "/service-orders" })}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Voltar para lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate({ to: "/service-orders" })}
            className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center">
            <span className="text-3xl">📋</span>
          </div>
          <div className="flex-1 ml-4">
            <h1 className="text-3xl font-bold text-orange-600">OS #{serviceOrder.orderNumber}</h1>
            <p className="text-gray-600">
              {serviceOrder.client?.name} • {serviceOrder.vehicle?.brand} {serviceOrder.vehicle?.model}
            </p>
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>✏️</span>
            Editar
          </button>
        </div>

        {/* Status e Prioridade */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(serviceOrder.status)}`}>
              {getStatusLabel(serviceOrder.status)}
            </span>
            <div className={`flex items-center gap-1 font-medium ${getPriorityColor(serviceOrder.priority)}`}>
              <span>{getPriorityIcon(serviceOrder.priority)}</span>
              <span className="text-sm">{serviceOrder.priority?.toUpperCase()}</span>
            </div>
          </div>

          {/* Botões de mudança de status */}
          <div className="flex gap-2 ml-auto">
            {serviceOrder.status === 'pending' && (
              <button
                onClick={() => handleStatusChange('in_progress')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                disabled={updateStatusMutation.isPending}
              >
                Iniciar
              </button>
            )}
            {serviceOrder.status === 'in_progress' && (
              <>
                <button
                  onClick={() => handleStatusChange('waiting_parts')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  disabled={updateStatusMutation.isPending}
                >
                  Aguardar Peças
                </button>
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  disabled={updateStatusMutation.isPending}
                >
                  Concluir
                </button>
              </>
            )}
            {['waiting_parts', 'waiting_approval'].includes(serviceOrder.status) && (
              <button
                onClick={() => handleStatusChange('in_progress')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                disabled={updateStatusMutation.isPending}
              >
                Retomar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              📋 Informações da OS
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-sm font-medium text-gray-600">Descrição</label>
                <div className="text-lg text-gray-900 font-medium">{serviceOrder.description}</div>
              </div>
              {serviceOrder.notes && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-600">Observações</label>
                  <div className="text-lg text-gray-900 font-medium">{serviceOrder.notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Itens da OS */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                🔧 Itens da OS
              </h2>
              <button
                onClick={() => setShowAddItem(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <span>➕</span>
                Adicionar Item
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <span className="text-4xl mb-2 block">🔧</span>
                <p>Nenhum item adicionado ainda</p>
                <button
                  onClick={() => setShowAddItem(true)}
                  className="text-orange-600 hover:text-orange-700 font-medium mt-2"
                >
                  Adicionar primeiro item
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className={`border rounded-lg p-4 transition-colors ${
                      item.applied ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 text-xs rounded ${
                            item.type === 'service' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {item.type === 'service' ? 'Serviço' : 'Peça'}
                          </span>
                          {item.applied && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              Aplicado
                            </span>
                          )}
                        </div>
                        <div className="font-medium text-gray-900">{item.description}</div>
                        <div className="text-sm text-gray-600">
                          Qtd: {item.quantity} × R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} = 
                          <span className="font-medium"> R$ {item.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleItem(item)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            item.applied
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                          disabled={toggleItemMutation.isPending}
                        >
                          {item.applied ? 'Desaplicar' : 'Aplicar'}
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item)}
                          className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          disabled={deleteItemMutation.isPending}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Cliente */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              👤 Cliente
            </h3>
            {serviceOrder.client ? (
              <div className="space-y-3">
                <Link
                  to="/clients/$id"
                  params={{ id: serviceOrder.client.id.toString() }}
                  className="block hover:bg-orange-50 p-3 rounded-lg transition-colors"
                >
                  <div className="font-medium text-gray-900">{serviceOrder.client.name}</div>
                  <div className="text-sm text-gray-600">{serviceOrder.client.email}</div>
                  <div className="text-sm text-gray-600">{serviceOrder.client.phone}</div>
                </Link>
              </div>
            ) : (
              <p className="text-gray-500">Cliente não encontrado</p>
            )}
          </div>

          {/* Veículo */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              🚗 Veículo
            </h3>
            {serviceOrder.vehicle ? (
              <div className="space-y-3">
                <Link
                  to="/vehicles/$id"
                  params={{ id: serviceOrder.vehicle.id.toString() }}
                  className="block hover:bg-orange-50 p-3 rounded-lg transition-colors"
                >
                  <div className="font-medium text-gray-900">
                    {serviceOrder.vehicle.brand} {serviceOrder.vehicle.model}
                  </div>
                  <div className="text-sm text-gray-600">{serviceOrder.vehicle.licensePlate}</div>
                  <div className="text-sm text-gray-600">{serviceOrder.vehicle.color}</div>
                </Link>
              </div>
            ) : (
              <p className="text-gray-500">Veículo não encontrado</p>
            )}
          </div>

          {/* Resumo Financeiro */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              💰 Resumo Financeiro
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Serviços ({serviceItems.length})</span>
                <span className="font-medium">
                  R$ {serviceItems.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Peças ({partItems.length})</span>
                <span className="font-medium">
                  R$ {partItems.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">
                    R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Sistema */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              📅 Informações do Sistema
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <label className="text-sm font-medium text-gray-600">Criada em</label>
                <div className="text-sm text-gray-900">
                  {new Date(serviceOrder.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              {serviceOrder.estimatedCompletionDate && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="text-sm font-medium text-gray-600">Previsão</label>
                  <div className="text-sm text-gray-900">
                    {new Date(serviceOrder.estimatedCompletionDate).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}
              {serviceOrder.completedAt && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="text-sm font-medium text-gray-600">Concluída em</label>
                  <div className="text-sm text-gray-900">
                    {new Date(serviceOrder.completedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEdit && (
        <EditServiceOrderModal 
          serviceOrder={serviceOrder}
          onClose={() => setShowEdit(false)} 
        />
      )}
      {showAddItem && (
        <AddServiceOrderItemModal
          serviceOrderId={serviceOrderId}
          onClose={() => setShowAddItem(false)}
        />
      )}
    </div>
  );
}