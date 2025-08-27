import type { Client } from "@/modules/client/types/client";
import type { Vehicle } from "@/modules/vehicle/types/vehicle";


export interface ServiceOrder {
  id: number;
  clientId: number;
  vehicleId: number;
  description: string;
  status: "pending" | "in_progress" | "completed" | "canceled";
  totalPrice?: number;
  createdAt: string;
  updatedAt: string;

  client?: Client;
  vehicle?: Vehicle;
}
