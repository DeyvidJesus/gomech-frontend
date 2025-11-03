import api from "../../../shared/services/axios";
import type { AnalyticsRequest, AnalyticsResponse } from "../types/analytics";

export const analyticsApi = {
  send: (payload: AnalyticsRequest) => api.post<AnalyticsResponse>("/analytics", payload),
};
