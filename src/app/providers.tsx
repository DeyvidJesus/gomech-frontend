import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import type { ReactNode } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";

interface Props {
  children: ReactNode;
}

export function AppProviders({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <SpeedInsights />
    </QueryClientProvider>
  );
}
