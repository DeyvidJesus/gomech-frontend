import api from "../../../shared/services/axios";
import type { AuthResponse } from "../types/user";

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string, email: string, role: 'USER' | 'ADMIN', name: string, id: number }>("/auth/login", { email, password }),

  register: (name: string, email: string, password: string, roleId: number) =>
    api.post<{ token: string, email: string, role: 'USER' | 'ADMIN', name: string, id: number }>("/auth/register", { name, email, password, roleId }),
};

export const loginApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),
};
