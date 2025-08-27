import api from "@/shared/services/axios";
import type { User } from "../types/user";
import type { AuthResponse } from "../types/user";

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>("/auth/login", { email, password }),

  register: (name: string, email: string, password: string, roleId: number) =>
    api.post<User>("/auth/register", { name, email, password, roleId }),
};

export const loginApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),
};
