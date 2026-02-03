"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// 2 daqiqa: ma'lumot shu vaqt "yangı" hisoblanadi
const defaultStaleTime = 1000 * 60 * 2;
// 1 daqiqa: boshqa adminlar o'zgartirsa, ochiq sahifada polling orqali yangilanish ko'rinadi
const defaultRefetchInterval = 1000 * 60 * 1;

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: defaultStaleTime,
        refetchInterval: defaultRefetchInterval,
      },
    },
  });
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
