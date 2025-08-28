import type { Client } from "../../client/types/client";
import type { Vehicle } from "../../vehicle/types/vehicle";

export interface ServiceOrder {
  id: number;
  orderNumber: string;
  clientId: number;
  vehicleId: number;
  description: string;
  status: "pending" | "in_progress" | "completed" | "canceled" | "waiting_parts" | "waiting_approval";
  priority: "low" | "medium" | "high" | "urgent";
  totalPrice?: number;
  estimatedCompletionDate?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  client?: Client;
  vehicle?: Vehicle;
  items?: ServiceOrderItem[];
}

export interface ServiceOrderItem {
  id: number;
  serviceOrderId: number;
  type: "service" | "part";
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  applied: boolean;
  stockReserved?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceOrderFilters {
  status?: ServiceOrder['status'];
  clientId?: number;
  vehicleId?: number;
  priority?: ServiceOrder['priority'];
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
  status: ServiceOrder['status'];
  priority: ServiceOrder['priority'];
  estimatedCompletionDate?: string;
  daysPastDue?: number;
  totalPrice: number;
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
