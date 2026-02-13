import { useQuery } from "@tanstack/react-query";
import { fetchIntegratorStatuses } from "../api";
import type {
  IntegratorStatusItem,
  IntegratorStatusQueryParams,
} from "../types";

export const eDocStatusKeys = {
  all: ["e-doc-statuses"] as const,
  lists: () => [...eDocStatusKeys.all, "list"] as const,
  list: (params: IntegratorStatusQueryParams) =>
    [...eDocStatusKeys.lists(), params] as const,
};

export function useIntegratorStatuses(params: IntegratorStatusQueryParams) {
  return useQuery<IntegratorStatusItem[], Error>({
    queryKey: eDocStatusKeys.list(params),
    queryFn: () => fetchIntegratorStatuses(params),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    enabled: !!params.startDate && !!params.endDate,
  });
}
