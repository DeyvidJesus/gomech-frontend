import api from "../../../shared/services/axios";
import type { ServiceOrderResponseDTO, ServiceOrderCreateDTO, ServiceOrderUpdateDTO, ServiceOrderStatus, ServiceOrderItemResponseDTO, ServiceOrderItemCreateDTO } from "../types/serviceOrder";

export const serviceOrdersApi = {
  getAll: () => api.get<ServiceOrderResponseDTO[]>("/service-orders"),
  getById: (id: number) => api.get<ServiceOrderResponseDTO>(`/service-orders/${id}`),
  getByOrderNumber: (orderNumber: string) =>
    api.get<ServiceOrderResponseDTO>(`/service-orders/order-number/${orderNumber}`),
  create: (data: ServiceOrderCreateDTO) =>
    api.post<ServiceOrderResponseDTO>("/service-orders", data),
  update: (id: number, data: ServiceOrderUpdateDTO) =>
    api.put<ServiceOrderResponseDTO>(`/service-orders/${id}`, data),
  delete: (id: number) => api.delete(`/service-orders/${id}`),

  getByStatus: (status: ServiceOrderStatus) =>
    api.get<ServiceOrderResponseDTO[]>(`/service-orders/status/${status}`),
  getByClient: (clientId: number) =>
    api.get<ServiceOrderResponseDTO[]>(`/service-orders/client/${clientId}`),
  // getByVehicle: (vehicleId: number) =>
  //   api.get<ServiceOrderResponseDTO[]>(`/service-orders/vehicle/${vehicleId}`),
  // getVehicleHistory: (vehicleId: number) =>
  //   api.get<ServiceOrderResponseDTO[]>(`/service-orders/vehicle/${vehicleId}/history`),

  updateStatus: (id: number, status: ServiceOrderStatus) =>
    api.put<ServiceOrderResponseDTO>(`/service-orders/${id}/status`, { status }),

  getOverdueReports: () => api.get<ServiceOrderResponseDTO[]>("/service-orders/reports/overdue"),
  getWaitingPartsReports: () =>
    api.get<ServiceOrderResponseDTO[]>("/service-orders/reports/waiting-parts"),
  getWaitingApprovalReports: () =>
    api.get<ServiceOrderResponseDTO[]>("/service-orders/reports/waiting-approval"),
};

export const serviceOrderItemsApi = {
  getByServiceOrder: (serviceOrderId: number) =>
    api.get<ServiceOrderItemResponseDTO[]>(`/service-orders/${serviceOrderId}/items`),
  create: (serviceOrderId: number, data: ServiceOrderItemCreateDTO) =>
    api.post<ServiceOrderItemResponseDTO>(`/service-orders/${serviceOrderId}/items`, data),
  update: (itemId: number, data: ServiceOrderItemCreateDTO) =>
    api.put<ServiceOrderItemResponseDTO>(`/service-orders/items/${itemId}`, data),
  delete: (itemId: number) => api.delete(`/service-orders/items/${itemId}`),

  apply: (itemId: number) =>
    api.put<ServiceOrderItemResponseDTO>(`/service-orders/items/${itemId}/apply`),
  unapply: (itemId: number) =>
    api.put<ServiceOrderItemResponseDTO>(`/service-orders/items/${itemId}/unapply`),

  reserveStock: (itemId: number) =>
    api.put<ServiceOrderItemResponseDTO>(`/service-orders/items/${itemId}/reserve-stock`),
  releaseStock: (itemId: number) =>
    api.put<ServiceOrderItemResponseDTO>(`/service-orders/items/${itemId}/release-stock`),
};