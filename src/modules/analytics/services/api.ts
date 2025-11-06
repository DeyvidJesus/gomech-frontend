import api from "../../../shared/services/axios";
import type { AnalyticsInsight, AnalyticsRequest, AnalyticsResponse } from "../types/analytics";

export const analyticsApi = {
  send: async (payload: AnalyticsRequest): Promise<AnalyticsResponse> => {
    const response = await api.post<AnalyticsResponse>("/analytics", payload);
    return response.data;
  },
  getInsights: async (): Promise<AnalyticsInsight[]> => {
    const response = await api.get<AnalyticsInsight[]>("/analytics/insights");
    return response.data;
  },
};
