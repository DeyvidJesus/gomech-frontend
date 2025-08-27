import type { Client } from "@/modules/client/types/client";

export interface Vehicle {
  id: number;
  clientId: number;
  brand: string;
  model: string;
  year: number;
  plate: string;
  createdAt: string;
  updatedAt: string;
  client?: Client;
}
