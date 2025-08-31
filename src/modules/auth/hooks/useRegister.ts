import { useMutation } from "@tanstack/react-query";
import axios from "axios";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: "ADMIN" | "USER"; // opcional, dependendo da lógica do backend
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const res = await axios.post("/auth/register", {
        ...data,
        role: "USER",
      });
      return res.data;
    },
  });
}
