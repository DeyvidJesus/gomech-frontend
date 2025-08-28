import type { Client } from "@/modules/client/types/client";

export interface Vehicle {
  id: number;
  clientId?: number;
  licensePlate: string;
  brand: string;
  model: string;
  manufactureDate: string;
  color: string;
  observations?: string;
  kilometers: number;
  chassisId: string;
  createdAt?: string;
  updatedAt?: string;
  client?: Client;
}
