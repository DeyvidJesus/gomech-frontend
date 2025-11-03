import api from "../../../shared/services/axios";
import type { AuditEventRequest, AuditEventResponse } from "../types/audit";

export const auditApi = {
  createEvent: (payload: AuditEventRequest) => api.post<AuditEventResponse>("/audit/event", payload),
};
