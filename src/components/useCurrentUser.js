"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "./ApiClient";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/api/auth/me"),
    staleTime: 15_000,
  });
}
