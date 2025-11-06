export interface PartResponse {
  id: number
  name: string
  sku: string
  manufacturer?: string | null
  description?: string | null
  unitCost?: number | null
  unitPrice?: number | null
  active?: boolean | null
  createdAt?: string
  updatedAt?: string
}

export interface Part {
  id: number
  name: string
  sku: string
  manufacturer?: string
  description?: string
  unitCost?: number
  unitPrice?: number
  active: boolean
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
    unitCost: part.unitCost ?? undefined,
    unitPrice: part.unitPrice ?? undefined,
    active: part.active ?? true,
    createdAt: part.createdAt,
    updatedAt: part.updatedAt,
  }
}
