import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "@tanstack/react-router";
import { serviceOrdersApi, serviceOrderItemsApi } from "../services/api";
import type { ServiceOrderItem, ServiceOrderStatus } from "../types/serviceOrder";
import { statusDisplayMapping } from "../types/serviceOrder";
import EditServiceOrderModal from "./EditServiceOrderModal";
import AddServiceOrderItemModal from "./Item/AddServiceOrderItemModal";

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

  console.log('serviceOrder', serviceOrder);

  // Buscar itens da OS
  const { data: items = [] } = useQuery({
    queryKey: ["serviceOrderItems", serviceOrderId],
    queryFn: () => serviceOrderItemsApi.getByServiceOrder(serviceOrderId).then(res => res.data),
    enabled: !!serviceOrderId,
  });

  // Mutation para atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ServiceOrderStatus }) =>
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

  const handleStatusChange = (status: ServiceOrderStatus) => {
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

  const getItemTypeLabel = (itemType: ServiceOrderItem['itemType']) => {
    const labels = {
      SERVICE: 'Serviço',
      PART: 'Peça',
      MATERIAL: 'Material',
      LABOR: 'Mão de Obra'
    };
    return labels[itemType] || itemType;
  };

  const getItemTypeColor = (itemType: ServiceOrderItem['itemType']) => {
    const colors = {
      SERVICE: 'bg-blue-100 text-blue-800',
      PART: 'bg-purple-100 text-purple-800',
      MATERIAL: 'bg-green-100 text-green-800',
      LABOR: 'bg-orange-100 text-orange-800'
    };
    return colors[itemType] || 'bg-gray-100 text-gray-800';
  };

  // Calcular totais baseado nos novos campos
  const appliedItems = items.filter(item => item.applied);
  const serviceItems = appliedItems.filter(item => item.itemType === 'SERVICE');
  const partItems = appliedItems.filter(item => item.itemType === 'PART');
  const materialItems = appliedItems.filter(item => item.itemType === 'MATERIAL');
  const laborItems = appliedItems.filter(item => item.itemType === 'LABOR');

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 sm:w-12 sm:h-12 border-2 border-orangeWheel-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Carregando ordem de serviço...</p>
        </div>
      </div>
    );
  }

  if (error || !serviceOrder) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
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
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/service-orders" })}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-orangeWheel-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-lg sm:text-2xl lg:text-3xl">📋</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-orangeWheel-500 truncate">OS #{serviceOrder.orderNumber}</h1>
              <p className="text-sm sm:text-base text-gray-600">
                {serviceOrder.clientName}
                {serviceOrder.clientPhone ? ` (${serviceOrder.clientPhone})` : ''}
                {' • '}
                {serviceOrder.vehicleBrand} {serviceOrder.vehicleModel}
                {serviceOrder.vehicleLicensePlate ? ` (${serviceOrder.vehicleLicensePlate})` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowEdit(true)}
            className="bg-orangeWheel-500 hover:bg-orangeWheel-600 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-colors flex items-center gap-2 justify-center w-full sm:w-auto"
          >
            <span>✏️</span>
            <span className="hidden sm:inline">Editar</span>
          </button>
        </div>

        {/* Status */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(serviceOrder.status)}`}>
              {getStatusLabel(serviceOrder.status)}
            </span>
          </div>

          {/* Botões de mudança de status - Responsivo */}
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            {serviceOrder.status === 'PENDING' && (
              <button
                onClick={() => handleStatusChange('IN_PROGRESS')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                disabled={updateStatusMutation.isPending}
              >
                Iniciar
              </button>
            )}
            {serviceOrder.status === 'IN_PROGRESS' && (
              <>
                <button
                  onClick={() => handleStatusChange('WAITING_PARTS')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  disabled={updateStatusMutation.isPending}
                >
                  <span className="hidden sm:inline">Aguardar </span>Peças
                </button>
                <button
                  onClick={() => handleStatusChange('WAITING_APPROVAL')}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  disabled={updateStatusMutation.isPending}
                >
                  <span className="hidden sm:inline">Aguardar </span>Aprovação
                </button>
                <button
                  onClick={() => handleStatusChange('COMPLETED')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  disabled={updateStatusMutation.isPending}
                >
                  Concluir
                </button>
              </>
            )}
            {['WAITING_PARTS', 'WAITING_APPROVAL'].includes(serviceOrder.status) && (
              <button
                onClick={() => handleStatusChange('IN_PROGRESS')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                disabled={updateStatusMutation.isPending}
              >
                Retomar
              </button>
            )}
            {serviceOrder.status === 'COMPLETED' && (
              <button
                onClick={() => handleStatusChange('DELIVERED')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded text-sm transition-colors"
                disabled={updateStatusMutation.isPending}
              >
                Entregar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Layout responsivo - Stack em mobile, Grid em desktop */}
      <div className="flex flex-col xl:grid xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Coluna Principal */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              📋 Informações da OS
            </h2>
            <div className="space-y-4">
              {serviceOrder.description && (
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <label className="text-sm font-medium text-gray-600">Descrição</label>
                  <div className="text-sm sm:text-base text-gray-900 font-medium break-words">{serviceOrder.description}</div>
                </div>
              )}
              {serviceOrder.problemDescription && (
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <label className="text-sm font-medium text-gray-600">Descrição do Problema</label>
                  <div className="text-sm sm:text-base text-gray-900 font-medium break-words">{serviceOrder.problemDescription}</div>
                </div>
              )}
              {serviceOrder.diagnosis && (
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <label className="text-sm font-medium text-gray-600">Diagnóstico</label>
                  <div className="text-sm sm:text-base text-gray-900 font-medium break-words">{serviceOrder.diagnosis}</div>
                </div>
              )}
              {serviceOrder.solutionDescription && (
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <label className="text-sm font-medium text-gray-600">Descrição da Solução</label>
                  <div className="text-sm sm:text-base text-gray-900 font-medium break-words">{serviceOrder.solutionDescription}</div>
                </div>
              )}
              {serviceOrder.observations && (
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <label className="text-sm font-medium text-gray-600">Observações</label>
                  <div className="text-sm sm:text-base text-gray-900 font-medium break-words">{serviceOrder.observations}</div>
                </div>
              )}
              {serviceOrder.technicianName && (
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <label className="text-sm font-medium text-gray-600">Técnico Responsável</label>
                  <div className="text-sm sm:text-base text-gray-900 font-medium">{serviceOrder.technicianName}</div>
                </div>
              )}
              {serviceOrder.currentKilometers && (
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <label className="text-sm font-medium text-gray-600">Quilometragem Atual</label>
                  <div className="text-sm sm:text-base text-gray-900 font-medium">
                    {serviceOrder.currentKilometers?.toLocaleString('pt-BR')} km
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Itens da OS */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
                🔧 Itens da OS
              </h2>
              <button
                onClick={() => setShowAddItem(true)}
                className="bg-orangeWheel-500 hover:bg-orangeWheel-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 justify-center w-full sm:w-auto"
              >
                <span>➕</span>
                <span className="hidden sm:inline">Adicionar Item</span>
                <span className="sm:hidden">Adicionar</span>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <span className="text-3xl sm:text-4xl mb-2 block">🔧</span>
                <p className="text-sm sm:text-base">Nenhum item adicionado ainda</p>
                <button
                  onClick={() => setShowAddItem(true)}
                  className="text-orangeWheel-600 hover:text-orangeWheel-700 font-medium mt-2 text-sm sm:text-base"
                >
                  Adicionar primeiro item
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className={`border rounded-lg p-3 sm:p-4 transition-colors ${
                      item.applied ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs rounded ${getItemTypeColor(item.itemType)}`}>
                            {getItemTypeLabel(item.itemType)}
                          </span>
                          {item.applied && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                              Aplicado
                            </span>
                          )}
                          {item.productCode && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {item.productCode}
                            </span>
                          )}
                        </div>
                        <div className="font-medium text-gray-900 text-sm sm:text-base break-words">{item.description}</div>
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">
                          Qtd: {item.quantity} × R$ {item.unitPrice?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} = 
                          <span className="font-medium"> R$ {item.totalPrice?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {item.observations && (
                          <div className="text-xs sm:text-sm text-gray-500 mt-1 break-words">
                            {item.observations}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 justify-end sm:justify-start">
                        <button
                          onClick={() => handleToggleItem(item)}
                          className={`px-3 py-1 rounded text-xs sm:text-sm transition-colors whitespace-nowrap ${
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
        <div className="space-y-4 sm:space-y-6">
          {/* Cliente */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              👤 Cliente
            </h3>
            <div className="space-y-3">
              {serviceOrder.clientId ? (
                <Link
                  to="/clients/$id"
                  params={{ id: serviceOrder.clientId.toString() }}
                  className="block hover:bg-orange-50 p-3 rounded-lg transition-colors"
                >
                  <div className="font-medium text-gray-900 text-sm sm:text-base break-words">{serviceOrder.clientName}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{serviceOrder.clientPhone}</div>
                </Link>
              ) : null}
              {!serviceOrder.clientId && !serviceOrder.clientName && (
                <p className="text-gray-500 text-sm">Cliente não encontrado</p>
              )}
            </div>
          </div>

          {/* Veículo */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              🚗 Veículo
            </h3>
            <div className="space-y-3">
              {serviceOrder.vehicleId ? (
                <Link
                  to="/vehicles/$id"
                  params={{ id: serviceOrder.vehicleId.toString() }}
                  className="block hover:bg-orange-50 p-3 rounded-lg transition-colors"
                >
                  <div className="font-medium text-gray-900 text-sm sm:text-base break-words">
                    {serviceOrder.vehicleBrand} {serviceOrder.vehicleModel}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">{serviceOrder.vehicleLicensePlate}</div>
                </Link>
              ) : null}
              {!serviceOrder.vehicleId && !serviceOrder.vehicleBrand && !serviceOrder.vehicleModel && !serviceOrder.vehicleLicensePlate && (
                <p className="text-gray-500 text-sm">Veículo não encontrado</p>
              )}
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              💰 Resumo Financeiro
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Mão de Obra</span>
                <span className="font-medium">
                  R$ {serviceOrder.laborCost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Peças</span>
                <span className="font-medium">
                  R$ {serviceOrder.partsCost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {serviceItems.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Serviços ({serviceItems.length})</span>
                  <span className="font-medium">
                    R$ {serviceItems.reduce((sum, item) => sum + item.totalPrice, 0)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {partItems.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Itens - Peças ({partItems.length})</span>
                  <span className="font-medium">
                    R$ {partItems.reduce((sum, item) => sum + item.totalPrice, 0)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {materialItems.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Materiais ({materialItems.length})</span>
                  <span className="font-medium">
                    R$ {materialItems.reduce((sum, item) => sum + item.totalPrice, 0)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {laborItems.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Itens - Mão de Obra ({laborItems.length})</span>
                  <span className="font-medium">
                    R$ {laborItems.reduce((sum, item) => sum + item.totalPrice, 0)?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Bruto</span>
                  <span className="font-medium">
                    R$ {serviceOrder.totalCost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {serviceOrder.discount > 0 && (
                  <div className="flex justify-between text-red-600 text-sm">
                    <span>Desconto</span>
                    <span className="font-medium">
                      - R$ {serviceOrder.discount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base sm:text-lg font-bold mt-2">
                  <span>Total Final</span>
                  <span className="text-orange-600">
                    R$ {serviceOrder.totalCost?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Sistema */}
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              📅 Informações do Sistema
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <label className="text-xs sm:text-sm font-medium text-gray-600">Criada em</label>
                <div className="text-xs sm:text-sm text-gray-900">
                  {new Date(serviceOrder.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              {serviceOrder.estimatedCompletion && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="text-xs sm:text-sm font-medium text-gray-600">Previsão</label>
                  <div className="text-xs sm:text-sm text-gray-900">
                    {new Date(serviceOrder.estimatedCompletion).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}
              {serviceOrder.actualCompletion && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="text-xs sm:text-sm font-medium text-gray-600">Concluída em</label>
                  <div className="text-xs sm:text-sm text-gray-900">
                    {new Date(serviceOrder.actualCompletion).toLocaleDateString('pt-BR', {
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