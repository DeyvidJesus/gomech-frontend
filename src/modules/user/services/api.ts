import api from "../../../shared/services/axios";
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserListResponse,
  UserCreationWithMfaResponse,
} from "../types/user";

export const userApi = {
  // List users in the same organization (paginated)
  list: (page = 0, size = 20) =>
    api.get<UserListResponse>("/users", {
      params: { page, size },
    }),

  // Get user by ID
  getById: (id: number) => api.get<User>(`/users/${id}`),

  // Create new user in the same organization
  create: (payload: CreateUserRequest) =>
    api.post<User | UserCreationWithMfaResponse>("/users", payload),

  // Update user
  update: (id: number, payload: UpdateUserRequest) =>
    api.put<User>(`/users/${id}`, payload),

  // Delete user
  delete: (id: number) => api.delete(`/users/${id}`),

  // Toggle user active status (if needed)
  toggleActive: (id: number) => api.patch(`/users/${id}/toggle-active`),
};
