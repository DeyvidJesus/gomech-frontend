export interface InventoryItemResponse {
  id: number
  partId: number
  partName: string
  availableQuantity?: number | null
  currentQuantity?: number | null
  reservedQuantity?: number | null
  minimumQuantity?: number | null
  minimumStock?: number | null
  location?: string | null
  averageCost?: number | null
  cost?: number | null
  status?: string | null
  updatedAt?: string
}

export interface InventoryItem {
  id: number
  partId: number
  partName: string
  availableQuantity: number
  reservedQuantity: number
  minimumQuantity: number
  location?: string
  averageCost?: number
  status?: string
  updatedAt?: string
}

export interface InventoryItemCreateDTO {
  partId: number
  availableQuantity: number
  minimumQuantity: number
  location?: string
  averageCost?: number
}

export interface InventoryItemUpdateDTO extends Partial<InventoryItemCreateDTO> {}

export interface InventoryMovementResponse {
  id: number
  type?: string
  movementType?: string
  quantity: number
  createdAt?: string
  occurredAt?: string
  partId?: number
  partName?: string
  serviceOrderId?: number
  vehicleId?: number
  notes?: string
  reservationId?: number
}

export interface InventoryMovement {
  id: number
  movementType: string
  quantity: number
  occurredAt: string
  partId?: number
  partName?: string
  serviceOrderId?: number
  vehicleId?: number
  notes?: string
  reservationId?: number
}

export interface InventoryMovementFilters {
  partId?: number
  serviceOrderId?: number
  vehicleId?: number
}

export interface InventoryRecommendation {
  id: string
  partId?: number
  partName?: string
  description?: string
  priorityScore?: number
  suggestedQuantity?: number
}

export interface InventoryAvailabilityResponse {
  totalAvailable?: number | null
  available?: number | null
  reserved?: number | null
  pending?: number | null
  breakdown?: Array<{ location: string; available: number }>
}

export interface InventoryAvailability {
  totalAvailable: number
  reserved: number
  pending: number
  breakdown?: Array<{ location: string; available: number }>
}

export interface InventoryHistoryEntryResponse {
  id: number
  date?: string
  occurredAt?: string
  quantity: number
  movementType: string
  partName?: string
  notes?: string
}

export interface InventoryHistoryEntry {
  id: number
  occurredAt: string
  quantity: number
  movementType: string
  partName?: string
  notes?: string
}

export interface RecommendationPipeline {
  id: string
  name: string
  description?: string
  updatedAt?: string
}

export function normalizeInventoryItem(item: InventoryItemResponse): InventoryItem {
  return {
    id: item.id,
    partId: item.partId,
    partName: item.partName,
    availableQuantity: item.availableQuantity ?? item.currentQuantity ?? 0,
    reservedQuantity: item.reservedQuantity ?? 0,
    minimumQuantity: item.minimumQuantity ?? item.minimumStock ?? 0,
    location: item.location ?? undefined,
    averageCost: item.averageCost ?? item.cost ?? undefined,
    status: item.status ?? undefined,
    updatedAt: item.updatedAt,
  }
}

export function normalizeInventoryMovement(movement: InventoryMovementResponse): InventoryMovement {
  return {
    id: movement.id,
    movementType: movement.movementType ?? movement.type ?? 'UNKNOWN',
    quantity: movement.quantity,
    occurredAt: movement.occurredAt ?? movement.createdAt ?? new Date().toISOString(),
    partId: movement.partId,
    partName: movement.partName,
    serviceOrderId: movement.serviceOrderId,
    vehicleId: movement.vehicleId,
    notes: movement.notes,
    reservationId: movement.reservationId,
  }
}

export function normalizeInventoryAvailability(
  availability: InventoryAvailabilityResponse,
): InventoryAvailability {
  return {
    totalAvailable: availability.totalAvailable ?? availability.available ?? 0,
    reserved: availability.reserved ?? 0,
    pending: availability.pending ?? 0,
    breakdown: availability.breakdown,
  }
}

export function normalizeInventoryHistoryEntry(
  entry: InventoryHistoryEntryResponse,
): InventoryHistoryEntry {
  return {
    id: entry.id,
    occurredAt: entry.occurredAt ?? entry.date ?? new Date().toISOString(),
    quantity: entry.quantity,
    movementType: entry.movementType,
    partName: entry.partName,
    notes: entry.notes,
  }
}
