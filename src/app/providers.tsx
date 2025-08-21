import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function AppProviders({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
