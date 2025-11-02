export interface AuditEventRequest {
  action: string
  referenceId?: string
  metadata?: Record<string, unknown>
}

export interface AuditEventResponse {
  id: string
  action: string
  createdAt: string
  referenceId?: string
  metadata?: Record<string, unknown>
  blockchainHash?: string
}
