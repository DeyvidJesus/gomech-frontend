import api from "../../../shared/services/axios";
import type { Client } from "../types/client";
import type { PageResponse, PaginationParams } from "../../../shared/types/pagination";

export const clientsApi = {
  getAll: () => api.get<Client[]>("/clients"),
  getAllPaginated: (params: PaginationParams) =>
    api.get<PageResponse<Client>>("/clients/paginated", { params }),
  getById: (id: number) => api.get<Client>(`/clients/${id}`),
  create: (data: Client) => api.post<Client>("/clients", data),
  update: (id: number, data: Partial<Client>) => api.put<Client>(`/clients/${id}`, data),
  delete: (id: number) => api.delete(`/clients/${id}`),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<Client[]>("/clients/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  export: (format: "csv" | "xlsx") =>
    api.get<Blob>(`/clients/export`, {
      params: { format },
      responseType: "blob",
    }),
};
