import api from "../../../shared/services/axios";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenResponse,
} from "../types/user";

export const authApi = {
  login: (payload: LoginRequest) => api.post<AuthResponse>("/auth/login", payload),
  register: (payload: RegisterRequest) => api.post<RegisterResponse>("/auth/register", payload),
  refresh: (refreshToken: string) =>
    api.post<RefreshTokenResponse>("/auth/refresh", { refreshToken }),
};
