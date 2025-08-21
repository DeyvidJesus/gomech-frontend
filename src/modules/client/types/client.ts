import type { Vehicle } from "@/features/vehicle/types/vehicle";

export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  vehicles?: Vehicle[];
}
