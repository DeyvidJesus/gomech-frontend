import api from "../../../shared/services/axios";
import type { Part, PartCreateDTO, PartResponse, PartUpdateDTO } from "../types/part";
import { normalizePart } from "../types/part";

export const partsApi = {
  getAll: async (): Promise<Part[]> => {
    const response = await api.get<PartResponse[]>("/parts");
    return response.data.map(normalizePart);
  },
  getById: async (id: number): Promise<Part> => {
    const response = await api.get<PartResponse>(`/parts/${id}`);
    return normalizePart(response.data);
  },
  create: async (payload: PartCreateDTO): Promise<Part> => {
    const response = await api.post<PartResponse>("/parts", payload);
    return normalizePart(response.data);
  },
  update: async (id: number, payload: PartUpdateDTO): Promise<Part> => {
    const response = await api.put<PartResponse>(`/parts/${id}`, payload);
    return normalizePart(response.data);
  },
  delete: (id: number) => api.delete(`/parts/${id}`),
  upload: async (file: File): Promise<Part[]> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<PartResponse[]>("/parts/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.map(normalizePart);
  },
  downloadTemplate: (format: "xlsx" | "csv" = "xlsx") =>
    api.get(`/parts/template?format=${format}`, { responseType: "blob" }),
};
