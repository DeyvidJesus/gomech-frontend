import api from "@/shared/services/axios";
import type { ServiceOrder } from "../types/serviceOrder";

export const serviceOrdersApi = {
  getAll: () => api.get<ServiceOrder[]>("/service-orders"),
  getById: (id: number) => api.get<ServiceOrder>(`/service-orders/${id}`),
  create: (data: ServiceOrder) => api.post<ServiceOrder>("/service-orders", data),
  update: (id: number, data: Partial<ServiceOrder>) =>
    api.put<ServiceOrder>(`/service-orders/${id}`, data),
  delete: (id: number) => api.delete(`/service-orders/${id}`),
};
