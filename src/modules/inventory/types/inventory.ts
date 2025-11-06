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
  quantity?: number
  reservedQuantity?: number
  minimumQuantity: number
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
  notes?: string
}

export interface StockReservationRequest {
  serviceOrderItemId: number
  quantity: number
  notes?: string
}

export interface StockConsumptionRequest {
  reservationId: number
  quantity: number
  notes?: string
}

export interface StockCancellationRequest {
  reservationId: number
  reason?: string
}

export interface StockReturnRequest {
  serviceOrderItemId: number
  quantity: number
  notes?: string
}

export interface InventoryMovementResponse {
  id: number
  type?: string
  movementType?: string
  quantity: number
  createdAt?: string
  occurredAt?: string
  itemId?: number
  inventoryItemId?: number
  part?: InventoryPartSummary | null
  partId?: number
  partName?: string
  serviceOrderId?: number
  serviceOrderItemId?: number
  vehicleId?: number
  notes?: string
  reservationId?: number
  unitCost?: number | null
  unitPrice?: number | null
  balanceAfter?: number | null
  performedBy?: string | null
}

export interface InventoryMovement {
  id: number
  movementType: string
  quantity: number
  occurredAt: string
  partId?: number
  partName?: string
  serviceOrderId?: number
  serviceOrderItemId?: number
  vehicleId?: number
  notes?: string
  reservationId?: number
  unitCost?: number
  unitPrice?: number
  balanceAfter?: number
  performedBy?: string
}

export interface InventoryMovementFilters {
  itemId?: number
  partId?: number
  serviceOrderId?: number
  vehicleId?: number
}

export interface InventoryRecommendationResponse {
  id: string
  part?: InventoryPartSummary | null
  partId?: number
  partName?: string
  description?: string
  priorityScore?: number
  suggestedQuantity?: number
  confidence?: number | null
  rationale?: string | null
  fallback?: boolean | null
}

export interface InventoryRecommendation {
  id: string
  partId?: number
  partName?: string
  description?: string
  priorityScore?: number
  suggestedQuantity?: number
  confidence?: number
  rationale?: string
  isFallback?: boolean
}

export interface CriticalPartReportResponse {
  partId: number
  partName: string
  currentQuantity: number
  minimumQuantity: number
  recommendedAction?: string | null
  severity: 'CRITICAL' | 'WARNING' | 'STABLE'
  confidence?: number | null
}

export interface CriticalPartReport {
  partId: number
  partName: string
  currentQuantity: number
  minimumQuantity: number
  recommendedAction?: string
  severity: 'CRITICAL' | 'WARNING' | 'STABLE'
  confidence?: number
}

export interface InventoryAvailabilityResponse {
  totalAvailable?: number | null
  available?: number | null
  reserved?: number | null
  pending?: number | null
  breakdown?: Array<{ location: string; available: number }>
  projectedStockoutDate?: string | null
  coverageDays?: number | null
}

export interface InventoryAvailability {
  totalAvailable: number
  reserved: number
  pending: number
  breakdown?: Array<{ location: string; available: number }>
  projectedStockoutDate?: string
  coverageDays?: number
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
    totalAvailable: availability.totalAvailable ?? availability.available ?? 0,
    reserved: availability.reserved ?? 0,
    pending: availability.pending ?? 0,
    breakdown: availability.breakdown,
    projectedStockoutDate: availability.projectedStockoutDate ?? undefined,
    coverageDays: availability.coverageDays ?? undefined,
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
    id: recommendation.id,
    partId: recommendation.part?.id ?? recommendation.partId,
    partName: recommendation.part?.name ?? recommendation.partName,
    description: recommendation.description,
    priorityScore: recommendation.priorityScore,
    suggestedQuantity: recommendation.suggestedQuantity,
    confidence: recommendation.confidence ?? undefined,
    rationale: recommendation.rationale ?? undefined,
    isFallback: recommendation.fallback ?? undefined,
  }
}

export function normalizeCriticalPartReport(report: CriticalPartReportResponse): CriticalPartReport {
  return {
    partId: report.partId,
    partName: report.partName,
    currentQuantity: report.currentQuantity,
    minimumQuantity: report.minimumQuantity,
    recommendedAction: report.recommendedAction ?? undefined,
    severity: report.severity,
    confidence: report.confidence ?? undefined,
  }
}
