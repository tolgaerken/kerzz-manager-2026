import { useMutation } from "@tanstack/react-query";
import { cronDryRunApi } from "../api/cronDryRunApi";
import type { CronName, CronDryRunResponse } from "../types";

export function useCronDryRun() {
  return useMutation<CronDryRunResponse, Error, CronName>({
    mutationFn: (cronName) => cronDryRunApi.run(cronName),
  });
}
