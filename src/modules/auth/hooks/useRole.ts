import { useAuth } from "./useAuth";

export function useRole() {
  const { data: auth } = useAuth();
  const role = auth?.user.role;

  return {
    role,
    isAdmin: role === "ADMIN",
    isUser: role === "USER",
    canCreate: role === "ADMIN",
    canEdit: role === "ADMIN",
    canDelete: role === "ADMIN",
    canView: role === "ADMIN" || role === "USER",
  };
}