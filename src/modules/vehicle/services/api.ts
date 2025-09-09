import api from "../../../shared/services/axios";
import type { Vehicle, VehicleCreateDTO } from "../types/vehicle";

export const vehiclesApi = {
  getAll: () => api.get<Vehicle[]>("/vehicles"),
  getById: (id: number) => api.get<Vehicle>(`/vehicles/${id}`),
  create: (data: VehicleCreateDTO) =>
    api.post<Vehicle>("/vehicles", data),
  update: (id: number, data: Partial<Vehicle>) =>
    api.put<Vehicle>(`/vehicles/${id}`, data),
  delete: (id: number) => api.delete(`/vehicles/${id}`),
};
