import type { Vehicle } from "../../vehicle/types/vehicle";

// --------------------- Enums do backend ---------------------
export type ServiceOrderStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "WAITING_PARTS"
  | "WAITING_APPROVAL"
  | "COMPLETED"
  | "CANCELLED"
  | "DELIVERED";

export type ServiceOrderItemType =
  | "SERVICE"
  | "PART"
  | "MATERIAL"
  | "LABOR";

// --------------------- Interfaces principais ---------------------
export interface ServiceOrder {
  id: number;
  orderNumber: string;
  vehicleId: number;
  clientId: number;
  description?: string;
  problemDescription?: string;
  diagnosis?: string;
  solutionDescription?: string;
  status: ServiceOrderStatus;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  discount: number;
  estimatedCompletion?: string;
  actualCompletion?: string;
  observations?: string;
  technicianName?: string;
  currentKilometers?: number;
  createdAt: string;
  updatedAt: string;
  clientName?: string;
  clientPhone?: string;
  vehicleLicensePlate?: string;
  vehicleModel?: string;
  vehicleBrand?: string;
  items?: ServiceOrderItem[];
}

export interface ServiceOrderItem {
  id: number;
  serviceOrderId?: number;
  partId?: number;
  partName?: string;
  partSku?: string;
  description: string;
  itemType: ServiceOrderItemType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productCode?: string;
  inventoryItemId?: number;
  inventoryLocation?: string;
  requiresStock: boolean;
  stockReserved: boolean;
  observations?: string;
  applied: boolean;
  createdAt: string;
  updatedAt: string;
}

// --------------------- DTOs ---------------------
export interface ServiceOrderCreateDTO {
  vehicleId: number;
  clientId: number;
  description?: string;
  problemDescription?: string;
  laborCost?: number;
  partsCost?: number;
  discount?: number;
  estimatedCompletion?: string;
  observations?: string;
  technicianName?: string;
  currentKilometers?: number;
  items?: ServiceOrderItemCreateDTO[];
}

export interface ServiceOrderUpdateDTO {
  description?: string;
  problemDescription?: string;
  diagnosis?: string;
  solutionDescription?: string;
  laborCost?: number;
  partsCost?: number;
  discount?: number;
  estimatedCompletion?: string;
  observations?: string;
  technicianName?: string;
  currentKilometers?: number;
  items?: ServiceOrderItemCreateDTO[];
}

export interface ServiceOrderItemCreateDTO {
  description: string;
  itemType: ServiceOrderItemType;
  quantity: number;
  unitPrice: number;
  productCode?: string;
  partId?: number;
  inventoryItemId?: number;
  requiresStock?: boolean;
  observations?: string;
}

// --------------------- DTOs de resposta ---------------------
export interface ServiceOrderResponseDTO extends ServiceOrder {
  daysPastDue?: number; // campo calculado
}

export interface ServiceOrderItemResponseDTO {
  id: number;
  description: string;
  itemType: ServiceOrderItemType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productCode?: string;
  partId?: number;
  partName?: string;
  partSku?: string;
  inventoryItemId?: number;
  inventoryLocation?: string;
  requiresStock?: boolean;
  stockReserved?: boolean;
  applied?: boolean;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

// --------------------- Filtros e relatórios ---------------------
export interface ServiceOrderFilters {
  status?: ServiceOrderStatus;
  clientId?: number;
  vehicleId?: number;
  startDate?: string;
  endDate?: string;
}

export interface ServiceOrderReport {
  id: number;
  orderNumber: string;
  clientName: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleLicensePlate: string;
  status: ServiceOrderStatus;
  estimatedCompletion?: string;
  daysPastDue?: number;
  totalCost: number;
}

export interface ServiceOrderReports {
  overdue: ServiceOrderReport[];
  waitingParts: ServiceOrderReport[];
  waitingApproval: ServiceOrderReport[];
}

export interface VehicleServiceHistory {
  vehicleId: number;
  vehicle?: Vehicle;
  serviceOrders: ServiceOrder[];
  totalServices: number;
  totalSpent: number;
  lastService?: string;
}

// --------------------- Mapeamentos de exibição ---------------------
export const statusDisplayMapping: Record<ServiceOrderStatus, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em Andamento",
  WAITING_PARTS: "Aguardando Peças",
  WAITING_APPROVAL: "Aguardando Aprovação",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
  DELIVERED: "Entregue",
};

export const itemTypeDisplayMapping: Record<ServiceOrderItemType, string> = {
  SERVICE: "Serviço",
  PART: "Peça",
  MATERIAL: "Material",
  LABOR: "Mão de Obra",
};