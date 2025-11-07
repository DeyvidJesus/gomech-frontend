// --------------------- Enums ---------------------
export type InventoryMovementType = "IN" | "OUT" | "ADJUSTMENT";

// --------------------- Interfaces principais ---------------------
export interface InventoryPartSummary {
  id: number
  code?: string | null
  name: string
  manufacturer?: string | null
  category?: string | null
}

export interface InventoryItemResponse {
  id: number
  part?: InventoryPartSummary | null
  partId?: number
  partName?: string
  partSku?: string
  location?: string | null
  quantity?: number | null
  reservedQuantity?: number | null
  minimumQuantity?: number | null
  unitCost?: number | null
  salePrice?: number | null
  createdAt?: string
  updatedAt?: string
}

export interface InventoryItem {
  id: number
  partId: number
  partName: string
  partSku?: string
  partCode?: string
  manufacturer?: string
  location: string
  quantity: number
  reservedQuantity: number
  minimumQuantity: number
  unitCost?: number
  salePrice?: number
  createdAt?: string
  updatedAt?: string
}

export interface InventoryItemCreateDTO {
  partId: number
  location: string
  initialQuantity?: number
  unitCost?: number
  salePrice?: number
}

export interface InventoryItemUpdateDTO {
  location?: string
  quantity?: number
  reservedQuantity?: number
  minimumQuantity?: number
  unitCost?: number
  salePrice?: number
}

export interface InventoryMovementResponse {
  id: number
  inventoryItemId?: number
  part?: InventoryPartSummary | null
  partId?: number
  partName?: string
  serviceOrderId?: number
  vehicleId?: number
  movementType?: string
  quantity: number
  referenceCode?: string | null
  notes?: string | null
  movementDate?: string
  createdAt?: string
  updatedAt?: string
}

export interface InventoryMovement {
  id: number
  inventoryItemId: number
  partId: number
  partName?: string
  serviceOrderId?: number
  vehicleId?: number
  movementType: InventoryMovementType
  quantity: number
  referenceCode?: string
  notes?: string
  movementDate: string
  createdAt?: string
  updatedAt?: string
}

export interface InventoryMovementCreateDTO {
  inventoryItemId: number
  partId: number
  serviceOrderId?: number
  vehicleId?: number
  movementType: InventoryMovementType
  quantity: number
  referenceCode?: string
  notes?: string
}

export interface InventoryEntryRequest {
  partId: number
  location: string
  quantity: number
  unitCost?: number
  salePrice?: number
  referenceCode?: string
  notes?: string
}

export interface StockReservationRequest {
  serviceOrderItemId: number
  quantity: number
  notes?: string
}

export interface StockConsumptionRequest {
  serviceOrderItemId: number
  quantity: number
  notes?: string
}

export interface StockCancellationRequest {
  serviceOrderItemId: number
  quantity: number
  notes?: string
}

export interface StockReturnRequest {
  serviceOrderItemId: number
  quantity: number
  notes?: string
}

export interface InventoryMovementFilters {
  itemId?: number
  partId?: number
  serviceOrderId?: number
  vehicleId?: number
}

export interface InventoryRecommendationResponse {
  partId?: number
  partName?: string
  partSku?: string
  confidence?: number
  rationale?: string | null
  fromFallback?: boolean
  historicalQuantity?: number
  lastMovementDate?: string
}

export interface InventoryRecommendation {
  partId?: number
  partName?: string
  partSku?: string
  confidence?: number
  rationale?: string
  fromFallback?: boolean
  historicalQuantity?: number
  lastMovementDate?: string
}

export interface CriticalPartReportResponse {
  partId: number
  partName: string
  partSku?: string
  vehicleModel?: string
  totalQuantity?: number
  reservedQuantity?: number
  minimumQuantity: number
  availableQuantity?: number
  totalConsumed?: number
  lastMovementDate?: string
}

export interface CriticalPartReport {
  partId: number
  partName: string
  partSku?: string
  vehicleModel?: string
  totalQuantity: number
  reservedQuantity: number
  minimumQuantity: number
  availableQuantity: number
  totalConsumed: number
  lastMovementDate?: string
}

export interface InventoryAvailabilityResponse {
  partId?: number
  partName?: string
  partSku?: string
  totalQuantity?: number
  reservedQuantity?: number
  minimumQuantity?: number
  availableQuantity?: number
  lastMovementDate?: string
}

export interface InventoryAvailability {
  partId?: number
  partName?: string
  partSku?: string
  totalQuantity: number
  reservedQuantity: number
  minimumQuantity: number
  availableQuantity: number
  lastMovementDate?: string
}

export interface InventoryHistoryEntryResponse {
  id: number
  date?: string
  occurredAt?: string
  quantity: number
  movementType: string
  partName?: string
  notes?: string
  performedBy?: string | null
}

export interface InventoryHistoryEntry {
  id: number
  occurredAt: string
  quantity: number
  movementType: string
  partName?: string
  notes?: string
  performedBy?: string
}

export interface RecommendationPipeline {
  id: string
  name: string
  description?: string
  updatedAt?: string
  isDefault?: boolean
}

// --------------------- Funções de normalização ---------------------
export function normalizeInventoryItem(item: InventoryItemResponse): InventoryItem {
  const partId = item.part?.id ?? item.partId ?? 0
  return {
    id: item.id,
    partId,
    partName: item.part?.name ?? item.partName ?? `Peça ${partId}`,
    partSku: item.partSku ?? item.part?.code ?? undefined,
    partCode: item.part?.code ?? undefined,
    manufacturer: item.part?.manufacturer ?? undefined,
    location: item.location ?? 'Não especificado',
    quantity: item.quantity ?? 0,
    reservedQuantity: item.reservedQuantity ?? 0,
    minimumQuantity: item.minimumQuantity ?? 0,
    unitCost: item.unitCost ?? undefined,
    salePrice: item.salePrice ?? undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

export function normalizeInventoryMovement(movement: InventoryMovementResponse): InventoryMovement {
  const movementDate = movement.movementDate ?? movement.createdAt ?? new Date().toISOString()

  return {
    id: movement.id,
    inventoryItemId: movement.inventoryItemId ?? 0,
    partId: movement.part?.id ?? movement.partId ?? 0,
    partName: movement.part?.name ?? movement.partName,
    serviceOrderId: movement.serviceOrderId,
    vehicleId: movement.vehicleId,
    movementType: (movement.movementType as InventoryMovementType) ?? 'ADJUSTMENT',
    quantity: movement.quantity,
    referenceCode: movement.referenceCode ?? undefined,
    notes: movement.notes ?? undefined,
    movementDate,
    createdAt: movement.createdAt,
    updatedAt: movement.updatedAt,
  }
}

export function normalizeInventoryAvailability(
  availability: InventoryAvailabilityResponse,
): InventoryAvailability {
  return {
    partId: availability.partId,
    partName: availability.partName,
    partSku: availability.partSku,
    totalQuantity: availability.totalQuantity ?? 0,
    reservedQuantity: availability.reservedQuantity ?? 0,
    minimumQuantity: availability.minimumQuantity ?? 0,
    availableQuantity: availability.availableQuantity ?? 0,
    lastMovementDate: availability.lastMovementDate,
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
    performedBy: entry.performedBy ?? undefined,
  }
}

export function normalizeInventoryRecommendation(
  recommendation: InventoryRecommendationResponse,
): InventoryRecommendation {
  return {
    partId: recommendation.partId,
    partName: recommendation.partName,
    partSku: recommendation.partSku,
    confidence: recommendation.confidence,
    rationale: recommendation.rationale ?? undefined,
    fromFallback: recommendation.fromFallback,
    historicalQuantity: recommendation.historicalQuantity,
    lastMovementDate: recommendation.lastMovementDate,
  }
}

export function normalizeCriticalPartReport(report: CriticalPartReportResponse): CriticalPartReport {
  return {
    partId: report.partId,
    partName: report.partName,
    partSku: report.partSku,
    vehicleModel: report.vehicleModel,
    totalQuantity: report.totalQuantity ?? 0,
    reservedQuantity: report.reservedQuantity ?? 0,
    minimumQuantity: report.minimumQuantity,
    availableQuantity: report.availableQuantity ?? 0,
    totalConsumed: report.totalConsumed ?? 0,
    lastMovementDate: report.lastMovementDate,
  }
}
