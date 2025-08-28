export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
}
