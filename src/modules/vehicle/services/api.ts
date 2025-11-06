import api from "../../../shared/services/axios";
import type { Vehicle, VehicleCreateDTO } from "../types/vehicle";
import type { ServiceOrder } from "../../serviceOrder/types/serviceOrder";
import type { PageResponse, PaginationParams } from "../../../shared/types/pagination";

export const vehiclesApi = {
  getAll: () => api.get<Vehicle[]>("/vehicles"),
  getAllPaginated: (params: PaginationParams) =>
    api.get<PageResponse<Vehicle>>("/vehicles/paginated", { params }),
  getById: (id: number) => api.get<Vehicle>(`/vehicles/${id}`),
  create: (data: VehicleCreateDTO) =>
    api.post<Vehicle>("/vehicles", data),
  update: (id: number, data: Partial<Vehicle>) =>
    api.put<Vehicle>(`/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<Vehicle[]>("/vehicles/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  export: (format: "csv" | "xlsx") =>
    api.get<Blob>(`/vehicles/export`, {
      params: { format },
      responseType: "blob",
    }),
  getServiceHistory: (id: number) =>
    api.get<ServiceOrder[]>(`/vehicles/${id}/service-history`),
  exportServiceHistory: (id: number, format: "csv" | "xlsx") =>
    api.get<Blob>(`/vehicles/${id}/service-history/export`, {
      params: { format },
      responseType: "blob",
    }),
};
