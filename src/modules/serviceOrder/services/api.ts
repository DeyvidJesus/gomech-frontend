import api from "../../../shared/services/axios";
import type { 
  ServiceOrder, 
  ServiceOrderItem, 
  ServiceOrderReport,
  VehicleServiceHistory
} from "../types/serviceOrder";

export const serviceOrdersApi = {
  // CRUD básico
  getAll: () => api.get<ServiceOrder[]>("/service-orders"),
  getById: (id: number) => api.get<ServiceOrder>(`/service-orders/${id}`),
  getByOrderNumber: (orderNumber: string) => 
    api.get<ServiceOrder>(`/service-orders/order-number/${orderNumber}`),
  create: (data: Partial<ServiceOrder>) => api.post<ServiceOrder>("/service-orders", data),
  update: (id: number, data: Partial<ServiceOrder>) =>
    api.put<ServiceOrder>(`/service-orders/${id}`, data),
  delete: (id: number) => api.delete(`/service-orders/${id}`),

  // Busca por filtros
  getByStatus: (status: ServiceOrder['status']) => 
    api.get<ServiceOrder[]>(`/service-orders/status/${status}`),
  getByClient: (clientId: number) => 
    api.get<ServiceOrder[]>(`/service-orders/client/${clientId}`),
  getByVehicle: (vehicleId: number) => 
    api.get<ServiceOrder[]>(`/service-orders/vehicle/${vehicleId}`),

  // Atualização de status
  updateStatus: (id: number, status: ServiceOrder['status']) =>
    api.put<ServiceOrder>(`/service-orders/${id}/status`, { status }),

  // Relatórios
  getOverdueReports: () => 
    api.get<ServiceOrderReport[]>("/service-orders/reports/overdue"),
  getWaitingPartsReports: () => 
    api.get<ServiceOrderReport[]>("/service-orders/reports/waiting-parts"),
  getWaitingApprovalReports: () => 
    api.get<ServiceOrderReport[]>("/service-orders/reports/waiting-approval"),
  getVehicleHistory: (vehicleId: number) =>
    api.get<VehicleServiceHistory>(`/service-orders/vehicle/${vehicleId}/history`),
};

export const serviceOrderItemsApi = {
  // CRUD de itens
  getByServiceOrder: (serviceOrderId: number) =>
    api.get<ServiceOrderItem[]>(`/service-orders/${serviceOrderId}/items`),
  create: (serviceOrderId: number, data: Partial<ServiceOrderItem>) =>
    api.post<ServiceOrderItem>(`/service-orders/${serviceOrderId}/items`, data),
  update: (itemId: number, data: Partial<ServiceOrderItem>) =>
    api.put<ServiceOrderItem>(`/service-orders/items/${itemId}`, data),
  delete: (itemId: number) => api.delete(`/service-orders/items/${itemId}`),

  // Aplicação de itens
  apply: (itemId: number) =>
    api.put<ServiceOrderItem>(`/service-orders/items/${itemId}/apply`),
  unapply: (itemId: number) =>
    api.put<ServiceOrderItem>(`/service-orders/items/${itemId}/unapply`),

  // Controle de estoque (futuro)
  reserveStock: (itemId: number) =>
    api.put<ServiceOrderItem>(`/service-orders/items/${itemId}/reserve-stock`),
  releaseStock: (itemId: number) =>
    api.put<ServiceOrderItem>(`/service-orders/items/${itemId}/release-stock`),
};
