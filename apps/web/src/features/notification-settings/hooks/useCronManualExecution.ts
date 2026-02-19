import { useMutation } from "@tanstack/react-query";
import { notificationQueueApi } from "../api";
import type { ManualSendResponse } from "../types";

export interface CronManualExecutionInput {
  type: "invoice" | "contract";
  id: string;
  channels: ("email" | "sms")[];
}

export function useCronManualExecution() {
  return useMutation<ManualSendResponse, Error, CronManualExecutionInput>({
    mutationFn: ({ type, id, channels }) =>
      notificationQueueApi.sendManual({
        items: [{ type, id }],
        channels,
      }),
  });
}
