import { useQuery } from "@tanstack/react-query";
import type { AuthResponse } from "../types/user";

export function useAuth() {
  return useQuery<AuthResponse | null>({
    queryKey: ["auth"],
    queryFn: async () => {
      // Primeiro tenta buscar do cache do TanStack Query
      const stored = localStorage.getItem("tanstack-query-persist-client");
      if (stored) {
        try {
          const cache = JSON.parse(stored);
          const authData = cache.clientState?.queries?.find(
            (q: any) => q.queryKey[0] === "auth"
          )?.state?.data;
          if (authData) {
            return authData;
          }
        } catch (error) {
          console.error("Erro ao parsear cache do TanStack Query:", error);
        }
      }
      
      return null;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}