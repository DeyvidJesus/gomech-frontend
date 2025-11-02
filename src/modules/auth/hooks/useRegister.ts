import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { authApi } from "../services/api";
import type { RegisterRequest, RegisterResponse } from "../types/user";
import { setCachedAuth } from "../utils/authCache";

interface RegisterError {
  message?: string;
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation<RegisterResponse, AxiosError<RegisterError>, RegisterRequest>({
    mutationFn: async (payload) => {
      const response = await authApi.register(payload);
      return response.data;
    },
    onSuccess: (data) => {
      setCachedAuth(data);
      queryClient.setQueryData(["auth"], data);
    },
  });
}
