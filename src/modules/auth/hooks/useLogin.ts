import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AuthResponse } from "../types/user";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<AuthResponse, Error, { email: string; password: string }>({
    mutationFn: async (credentials) => {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) throw new Error("Login inválido");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["auth"], data); // salva no cache
    },
  });
}
