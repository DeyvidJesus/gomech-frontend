import api from "../../../shared/services/axios";
import type { AuditEventFilters, AuditEventPage, AuditEventRequest, AuditEventResponse } from "../types/audit";

export const auditApi = {
  createEvent: async (payload: AuditEventRequest): Promise<AuditEventResponse> => {
    const response = await api.post<AuditEventResponse>("/audit/event", payload);
    return response.data;
  },
  listEvents: async (params?: AuditEventFilters): Promise<AuditEventPage> => {
    const response = await api.get<AuditEventPage>("/audit/events", { params });
    return response.data;
  },
};
