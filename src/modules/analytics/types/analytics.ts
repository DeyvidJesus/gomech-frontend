export interface AnalyticsRequest {
  metric: string
  payload: Record<string, unknown>
}

export interface AnalyticsResponse {
  status: string
  data?: unknown
  message?: string
  generatedAt?: string
}
