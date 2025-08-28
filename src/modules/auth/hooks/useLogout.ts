import { useQueryClient } from "@tanstack/react-query";

export function useLogout() {
  const queryClient = useQueryClient();
  return () => {
    localStorage.removeItem("token");
    
    queryClient.removeQueries({ queryKey: ["auth"] });
    queryClient.clear();
  };
}