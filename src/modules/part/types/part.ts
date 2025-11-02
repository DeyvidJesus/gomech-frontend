export interface PartResponse {
  id: number
  name: string
  sku: string
  manufacturer?: string | null
  description?: string | null
  cost?: number | null
  unitCost?: number | null
  price?: number | null
  unitPrice?: number | null
  stockQuantity?: number | null
  currentStock?: number | null
  availableQuantity?: number | null
  minimumStock?: number | null
  minimumStockLevel?: number | null
  createdAt?: string
  updatedAt?: string
}

export interface Part {
  id: number
  name: string
  sku: string
  manufacturer?: string
  description?: string
  cost: number
  price: number
  stockQuantity: number
  minimumStock: number
  createdAt?: string
  updatedAt?: string
}

export type PartCreateDTO = Omit<Part, 'id' | 'createdAt' | 'updatedAt'>

export type PartUpdateDTO = Partial<PartCreateDTO>

export function normalizePart(part: PartResponse): Part {
  return {
    id: part.id,
    name: part.name,
    sku: part.sku,
    manufacturer: part.manufacturer ?? undefined,
    description: part.description ?? undefined,
    cost: part.cost ?? part.unitCost ?? 0,
    price: part.price ?? part.unitPrice ?? 0,
    stockQuantity: part.stockQuantity ?? part.currentStock ?? part.availableQuantity ?? 0,
    minimumStock: part.minimumStock ?? part.minimumStockLevel ?? 0,
    createdAt: part.createdAt,
    updatedAt: part.updatedAt,
  }
}
