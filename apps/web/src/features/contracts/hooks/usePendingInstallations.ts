import { useQuery } from "@tanstack/react-query";
import { fetchPendingInstallations } from "../api/pendingInstallationsApi";

export const PENDING_INSTALLATIONS_QUERY_KEY = ["pending-installations"];

export function usePendingInstallations() {
  return useQuery({
    queryKey: PENDING_INSTALLATIONS_QUERY_KEY,
    queryFn: fetchPendingInstallations,
    staleTime: 30000 // 30 saniye
  });
}
