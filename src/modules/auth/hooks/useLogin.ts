import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthResponse } from "../types/user";
import { authApi } from "../services/api";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, { email: string; password: string }>({
    mutationFn: async (credentials) => {
      const { email, password } = credentials;
      const res = await authApi.login(email, password);
      if (res.status === 404) throw new Error("Login inválido");
      return res.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      
      queryClient.setQueryData(["auth"], data); 
    },
  });
}
