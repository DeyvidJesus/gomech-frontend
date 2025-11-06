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
  availableQuantity?: number | null
  currentQuantity?: number | null
  reservedQuantity?: number | null
  minimumQuantity?: number | null
  minimumStock?: number | null
  location?: string | null
  averageCost?: number | null
  unitCost?: number | null
  salePrice?: number | null
  status?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface InventoryItem {
  id: number
  partId: number
  partName: string
  partCode?: string
  manufacturer?: string
  availableQuantity: number
  reservedQuantity: number
  minimumQuantity: number
  location?: string
  averageCost?: number
  salePrice?: number
  status?: string
  createdAt?: string
  updatedAt?: string
}

export interface InventoryItemCreateDTO {
  partId: number
  minimumQuantity: number
  initialQuantity: number
  location?: string
  averageCost?: number
  salePrice?: number
}

export interface InventoryItemUpdateDTO extends Partial<Omit<InventoryItemCreateDTO, 'initialQuantity' | 'partId'>> {
  status?: string
}

export interface InventoryEntryRequest {
  itemId?: number
  partId?: number
  quantity: number
  unitCost?: number
  unitPrice?: number
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

export function normalizeInventoryItem(item: InventoryItemResponse): InventoryItem {
  const partId = item.part?.id ?? item.partId ?? 0
  return {
    id: item.id,
    partId,
    partName: item.part?.name ?? item.partName ?? `Peça ${partId}`,
    partCode: item.part?.code ?? undefined,
    manufacturer: item.part?.manufacturer ?? undefined,
    availableQuantity: item.availableQuantity ?? item.currentQuantity ?? 0,
    reservedQuantity: item.reservedQuantity ?? 0,
    minimumQuantity: item.minimumQuantity ?? item.minimumStock ?? 0,
    location: item.location ?? undefined,
    averageCost: item.averageCost ?? item.unitCost ?? undefined,
    salePrice: item.salePrice ?? undefined,
    status: item.status ?? undefined,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

export function normalizeInventoryMovement(movement: InventoryMovementResponse): InventoryMovement {
  const occurredAt = movement.occurredAt ?? movement.createdAt ?? new Date().toISOString()

  return {
    id: movement.id,
    movementType: movement.movementType ?? movement.type ?? 'UNKNOWN',
    quantity: movement.quantity,
    occurredAt,
    partId: movement.part?.id ?? movement.partId,
    partName: movement.part?.name ?? movement.partName,
    serviceOrderId: movement.serviceOrderId,
    serviceOrderItemId: movement.serviceOrderItemId,
    vehicleId: movement.vehicleId,
    notes: movement.notes ?? undefined,
    reservationId: movement.reservationId,
    unitCost: movement.unitCost ?? undefined,
    unitPrice: movement.unitPrice ?? undefined,
    balanceAfter: movement.balanceAfter ?? undefined,
    performedBy: movement.performedBy ?? undefined,
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
