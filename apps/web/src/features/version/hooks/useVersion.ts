import { useQuery } from "@tanstack/react-query";
import * as versionApi from "../api/versionApi";
import type { VersionInfo } from "../api/versionApi";

export function useVersion() {
  return useQuery<VersionInfo, Error>({
    queryKey: ["version"],
    queryFn: versionApi.getVersion,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });
}
