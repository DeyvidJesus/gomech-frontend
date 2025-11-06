import api from "../../../shared/services/axios";
import type {
  CriticalPartReport,
  CriticalPartReportResponse,
  InventoryAvailability,
  InventoryAvailabilityResponse,
  InventoryEntryRequest,
  InventoryHistoryEntry,
  InventoryHistoryEntryResponse,
  InventoryItem,
  InventoryItemCreateDTO,
  InventoryItemResponse,
  InventoryItemUpdateDTO,
  InventoryMovement,
  InventoryMovementFilters,
  InventoryMovementResponse,
  InventoryRecommendation,
  InventoryRecommendationResponse,
  RecommendationPipeline,
  StockCancellationRequest,
  StockConsumptionRequest,
  StockReservationRequest,
  StockReturnRequest,
} from "../types/inventory";
import {
  normalizeCriticalPartReport,
  normalizeInventoryAvailability,
  normalizeInventoryHistoryEntry,
  normalizeInventoryItem,
  normalizeInventoryMovement,
  normalizeInventoryRecommendation,
} from "../types/inventory";

export const inventoryApi = {
  getItems: async (params?: { partId?: number }): Promise<InventoryItem[]> => {
    const response = await api.get<InventoryItemResponse[]>("/inventory/items", { params });
    return response.data.map(normalizeInventoryItem);
  },
  getItemById: async (id: number): Promise<InventoryItem> => {
    const response = await api.get<InventoryItemResponse>(`/inventory/items/${id}`);
    return normalizeInventoryItem(response.data);
  },
  createItem: async (payload: InventoryItemCreateDTO): Promise<InventoryItem> => {
    const response = await api.post<InventoryItemResponse>("/inventory/items", payload);
    return normalizeInventoryItem(response.data);
  },
  updateItem: async (id: number, payload: InventoryItemUpdateDTO): Promise<InventoryItem> => {
    const response = await api.put<InventoryItemResponse>(`/inventory/items/${id}`, payload);
    return normalizeInventoryItem(response.data);
  },
  deleteItem: (id: number) => api.delete(`/inventory/items/${id}`),

  registerEntry: async (payload: InventoryEntryRequest) => {
    const response = await api.post<InventoryMovementResponse>("/inventory/movements/entry", payload);
    return normalizeInventoryMovement(response.data);
  },
  reserveStock: async (payload: StockReservationRequest) => {
    const response = await api.post<InventoryMovementResponse>("/inventory/movements/reservations", payload);
    return normalizeInventoryMovement(response.data);
  },
  consumeStock: async (payload: StockConsumptionRequest) => {
    const response = await api.post<InventoryMovementResponse>("/inventory/movements/consumption", payload);
    return normalizeInventoryMovement(response.data);
  },
  cancelReservation: async (payload: StockCancellationRequest) => {
    const response = await api.post<InventoryMovementResponse>("/inventory/movements/reservations/cancel", payload);
    return normalizeInventoryMovement(response.data);
  },
  registerReturn: async (payload: StockReturnRequest) => {
    const response = await api.post<InventoryMovementResponse>("/inventory/movements/returns", payload);
    return normalizeInventoryMovement(response.data);
  },
  listMovements: async (filters?: InventoryMovementFilters): Promise<InventoryMovement[]> => {
    const response = await api.get<InventoryMovementResponse[]>("/inventory/movements", { params: filters });
    return response.data.map(normalizeInventoryMovement);
  },

  getRecommendations: async (params?: {
    vehicleId?: number;
    serviceOrderId?: number;
    limit?: number;
    pipelineId?: string;
  }): Promise<InventoryRecommendation[]> => {
    const response = await api.get<InventoryRecommendationResponse[]>("/inventory/recommendations", { params });
    return response.data.map(normalizeInventoryRecommendation);
  },
  getRecommendationPipelines: async (): Promise<RecommendationPipeline[]> => {
    const response = await api.get<RecommendationPipeline[]>("/inventory/recommendations/pipelines");
    return response.data;
  },

  getCriticalPartsReport: async (): Promise<CriticalPartReport[]> => {
    const response = await api.get<CriticalPartReportResponse[]>("/inventory/reports/critical-parts");
    return response.data.map(normalizeCriticalPartReport);
  },
  getPartAvailability: async (partId: number): Promise<InventoryAvailability> => {
    const response = await api.get<InventoryAvailabilityResponse>(`/inventory/availability/parts/${partId}`);
    return normalizeInventoryAvailability(response.data);
  },
  getVehicleAvailability: async (vehicleId: number): Promise<InventoryAvailability> => {
    const response = await api.get<InventoryAvailabilityResponse>(`/inventory/availability/vehicles/${vehicleId}`);
    return normalizeInventoryAvailability(response.data);
  },
  getClientAvailability: async (clientId: number): Promise<InventoryAvailability> => {
    const response = await api.get<InventoryAvailabilityResponse>(`/inventory/availability/clients/${clientId}`);
    return normalizeInventoryAvailability(response.data);
  },
  getVehicleHistory: async (vehicleId: number): Promise<InventoryHistoryEntry[]> => {
    const response = await api.get<InventoryHistoryEntryResponse[]>(`/inventory/history/vehicles/${vehicleId}`);
    return response.data.map(normalizeInventoryHistoryEntry);
  },
  getClientHistory: async (clientId: number): Promise<InventoryHistoryEntry[]> => {
    const response = await api.get<InventoryHistoryEntryResponse[]>(`/inventory/history/clients/${clientId}`);
    return response.data.map(normalizeInventoryHistoryEntry);
  },
};
