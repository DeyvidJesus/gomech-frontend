import { useQuery } from "@tanstack/react-query";
import type { AuthResponse } from "../types/user";

export function useAuth() {
  return useQuery<AuthResponse | null>({
    queryKey: ["auth"],
    queryFn: async () => {
      const stored = localStorage.getItem("tanstack-query-persist-client");
      if (stored) {
        const cache = JSON.parse(stored);
        const authData = cache.clientState?.queries?.find(
          (q: any) => q.queryKey[0] === "auth"
        )?.state?.data;
        return authData ?? null;
      }
      return null;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}