import { useMutation } from "@tanstack/react-query";
import { cronDryRunApi } from "../api/cronDryRunApi";
import type {
  CronName,
  CronManualRunRequest,
  CronManualRunResponse,
} from "../types";

export interface CronManualRunInput {
  cronName: CronName;
  payload: CronManualRunRequest;
}

export function useCronManualRun() {
  return useMutation<CronManualRunResponse, Error, CronManualRunInput>({
    mutationFn: ({ cronName, payload }) => cronDryRunApi.manualRun(cronName, payload),
  });
}
