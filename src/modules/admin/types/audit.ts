export type AuditModule =
  | 'INVENTORY'
  | 'SERVICE_ORDER'
  | 'CUSTOMER'
  | 'OPERATIONS'
  | 'SUPPLIER'
  | 'ANALYTICS'
  | 'AUDIT'
  | 'VEHICLE'
  | 'PART'

// DTO correspondente ao backend: AuditEventRequest
export interface AuditEventRequest {
  eventType: string
  operation: string
  userEmail: string
  moduleName: AuditModule | string
  userRole: string
  occurredAt?: string // LocalDateTime no backend
  metadata?: string // Texto JSON
  entityId?: number
}

// Modelo completo do backend: AuditEvent (usado no POST /audit/event)
export interface AuditEvent {
  id: number
  eventType: string
  payload: string
  operation: string
  userEmail: string
  moduleName: string
  userRole: string
  entityId?: number
  occurredAt: string
  eventHash: string
  blockchainReference?: string
  createdAt: string
}

// DTO correspondente ao backend: AuditEventResponse (usado no GET /audit/events)
export interface AuditEventResponse {
  id: number
  eventType: string
  operation: string
  userEmail: string
  moduleName: string
  userRole: string
  entityId?: number
  occurredAt: string
  createdAt: string
  blockchainReference?: string
  eventHash: string
}

// Interface de paginação do Spring
export interface AuditEventPage {
  content: AuditEventResponse[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

// Parâmetros de filtro para consulta de eventos
export interface AuditEventFilters {
  page?: number
  size?: number
  sort?: string
  startDate?: string // LocalDateTime no backend
  endDate?: string // LocalDateTime no backend
  actionType?: string
  userEmail?: string
}
