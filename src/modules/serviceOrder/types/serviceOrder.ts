import type { Client } from "../../client/types/client";
import type { Vehicle } from "../../vehicle/types/vehicle";

// Enums que correspondem ao backend Java
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

// Interface principal ServiceOrder correspondente ao backend
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
  finalCost: number;
  estimatedCompletion?: string;
  actualCompletion?: string;
  observations?: string;
  technicianName?: string;
  currentKilometers?: number;
  createdAt: string;
  updatedAt: string;

  // Relacionamentos (populados quando necessário)
  client?: Client;
  vehicle?: Vehicle;
  items?: ServiceOrderItem[];
}

// Interface ServiceOrderItem correspondente ao backend
export interface ServiceOrderItem {
  id: number;
  serviceOrder?: ServiceOrder; // Relacionamento bidirecional
  description: string;
  itemType: ServiceOrderItemType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productCode?: string;
  requiresStock: boolean;
  stockReserved: boolean;
  stockProductId?: number;
  observations?: string;
  applied: boolean;
  createdAt: string;
  updatedAt: string;
}

// DTOs para criação
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
}

// DTOs para atualização
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
}

// DTO para criação de itens
export interface ServiceOrderItemCreateDTO {
  description: string;
  itemType: ServiceOrderItemType;
  quantity: number;
  unitPrice: number;
  productCode?: string;
  requiresStock?: boolean;
  observations?: string;
}

// DTO de resposta para ServiceOrder
export interface ServiceOrderResponseDTO extends ServiceOrder {
  daysPastDue?: number;
  // Campos calculados que podem vir do backend
}

// DTO de resposta para ServiceOrderItem
export interface ServiceOrderItemResponseDTO extends ServiceOrderItem {
  // Campos calculados que podem vir do backend
}

// Filtros para busca
export interface ServiceOrderFilters {
  status?: ServiceOrderStatus;
  clientId?: number;
  vehicleId?: number;
  startDate?: string;
  endDate?: string;
}

// Interface para relatórios
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
  finalCost: number;
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

// Tipos de conveniência para compatibilidade com o frontend atual
export type ServiceOrderPriority = "low" | "medium" | "high" | "urgent";

// Mapeamentos de status para compatibilidade
export const statusMapping: Record<string, ServiceOrderStatus> = {
  'pending': 'PENDING',
  'in_progress': 'IN_PROGRESS', 
  'waiting_parts': 'WAITING_PARTS',
  'waiting_approval': 'WAITING_APPROVAL',
  'completed': 'COMPLETED',
  'canceled': 'CANCELLED',
  'cancelled': 'CANCELLED',
  'delivered': 'DELIVERED'
};

// Mapeamento reverso para exibição
export const statusDisplayMapping: Record<ServiceOrderStatus, string> = {
  'PENDING': 'Pendente',
  'IN_PROGRESS': 'Em Andamento',
  'WAITING_PARTS': 'Aguardando Peças', 
  'WAITING_APPROVAL': 'Aguardando Aprovação',
  'COMPLETED': 'Concluída',
  'CANCELLED': 'Cancelada',
  'DELIVERED': 'Entregue'
};

// Mapeamento de tipos de item
export const itemTypeMapping: Record<string, ServiceOrderItemType> = {
  'service': 'SERVICE',
  'part': 'PART',
  'material': 'MATERIAL',
  'labor': 'LABOR'
};

export const itemTypeDisplayMapping: Record<ServiceOrderItemType, string> = {
  'SERVICE': 'Serviço',
  'PART': 'Peça',
  'MATERIAL': 'Material', 
  'LABOR': 'Mão de Obra'
};
