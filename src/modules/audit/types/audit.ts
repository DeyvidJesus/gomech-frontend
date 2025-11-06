export type AuditModule =
  | 'INVENTORY'
  | 'SERVICE_ORDER'
  | 'CUSTOMER'
  | 'OPERATIONS'
  | 'SUPPLIER'
  | 'ANALYTICS'
  | 'AUDIT'

export interface AuditEventRequest {
  eventType: string
  operation: string
  module: AuditModule | string
  username: string
  role: string
  occurredAt: string
  referenceId?: string
  metadata?: Record<string, unknown>
}

export interface AuditEventResponse {
  id: string
  eventType: string
  operation: string
  module: AuditModule | string
  username: string
  role: string
  occurredAt: string
  createdAt: string
  referenceId?: string
  metadata?: Record<string, unknown>
  blockchainHash?: string
  previousHash?: string
  signature?: string
}

export interface AuditEventPage {
  content: AuditEventResponse[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface AuditEventFilters {
  page?: number
  size?: number
  eventType?: string
  operation?: string
  module?: string
  username?: string
  sort?: string
  from?: string
  to?: string
}
