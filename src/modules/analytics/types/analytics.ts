export interface AnalyticsRequest {
  metric: string
  payload: Record<string, unknown>
}

export interface AnalyticsResponse {
  status: 'SUCCESS' | 'ERROR'
  data?: unknown
  message?: string
  generatedAt?: string
}

export type AnalyticsInsightCategory = 'INVENTORY' | 'CUSTOMER' | 'OPERATIONS' | 'SUPPLIER'

export interface AnalyticsInsight {
  id: string
  title: string
  description: string
  category: AnalyticsInsightCategory
  createdAt?: string
  updatedAt?: string
}
