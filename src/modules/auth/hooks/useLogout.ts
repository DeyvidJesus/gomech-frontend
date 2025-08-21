import { useQueryClient } from "@tanstack/react-query";

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.removeQueries({ queryKey: ["auth"] });
  };
}