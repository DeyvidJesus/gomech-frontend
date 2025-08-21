import type { AuthResponse } from "../types/user";
import api from "@/shared/services/axios";

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { email, password }),
};
