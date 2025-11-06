import api from "../../../shared/services/axios";
import type { AuditEventFilters, AuditEventPage, AuditEventRequest } from "../types/audit";
import type { AuditEvent } from "../types/audit";

// Importamos o modelo completo do backend para registerEvent
export type { AuditEvent };

export const auditApi = {
  /**
   * Registra um novo evento de auditoria
   * POST /audit/event
   * @returns AuditEvent (modelo completo do backend)
   */
  registerEvent: async (payload: AuditEventRequest): Promise<AuditEvent> => {
    const response = await api.post<AuditEvent>("/audit/event", payload);
    return response.data;
  },

  /**
   * Lista eventos de auditoria com filtros e paginação
   * GET /audit/events
   * @returns Page<AuditEventResponse>
   */
  listEvents: async (params?: AuditEventFilters): Promise<AuditEventPage> => {
    const response = await api.get<AuditEventPage>("/audit/events", { params });
    return response.data;
  },
};
