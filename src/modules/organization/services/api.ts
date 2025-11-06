import api from "../../../shared/services/axios";
import type {
  Organization,
  OrganizationCreateRequest,
  OrganizationUpdateRequest,
  OrganizationListResponse,
} from "../types/organization";

export const organizationApi = {
  // List all organizations (paginated)
  list: (page = 0, size = 20) =>
    api.get<OrganizationListResponse>("/organizations", {
      params: { page, size },
    }),

  // Get organization by ID
  getById: (id: number) => api.get<Organization>(`/organizations/${id}`),

  // Get organization by slug
  getBySlug: (slug: string) => api.get<Organization>(`/organizations/slug/${slug}`),

  // Create new organization
  create: (payload: OrganizationCreateRequest) =>
    api.post<Organization>("/organizations", payload),

  // Update organization
  update: (id: number, payload: OrganizationUpdateRequest) =>
    api.put<Organization>(`/organizations/${id}`, payload),

  // Delete organization
  delete: (id: number) => api.delete(`/organizations/${id}`),

  // Toggle active status
  toggleActive: (id: number) => api.patch(`/organizations/${id}/toggle-active`),
};

