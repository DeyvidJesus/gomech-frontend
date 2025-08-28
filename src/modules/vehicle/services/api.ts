import api from "../../../shared/services/axios";
import type { Vehicle } from "../types/vehicle";

export const vehiclesApi = {
  getAll: () => api.get<Vehicle[]>("/vehicles?include=client"),
  getById: (id: number) => api.get<Vehicle>(`/vehicles/${id}?include=client`),
  create: (data: Vehicle) => {
    console.log('API: Criando veículo com dados:', data);
    return api.post<Vehicle>("/vehicles", data);
  },
  update: (id: number, data: Partial<Vehicle>) => {
    console.log('API: Atualizando veículo', id, 'com dados:', data);
    return api.put<Vehicle>(`/vehicles/${id}`, data);
  },
  delete: (id: number) => api.delete(`/vehicles/${id}`),
};
