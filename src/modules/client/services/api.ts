import api from "@/shared/services/axios";
import type { Client } from "../types/client";

export const clientsApi = {
  getAll: () => api.get<Client[]>("/clients"),
  getById: (id: number) => api.get<Client>(`/clients/${id}`),
  create: (data: Client) => api.post<Client>("/clients", data),
  update: (id: number, data: Partial<Client>) => api.put<Client>(`/clients/${id}`, data),
  delete: (id: number) => api.delete(`/clients/${id}`),
};
