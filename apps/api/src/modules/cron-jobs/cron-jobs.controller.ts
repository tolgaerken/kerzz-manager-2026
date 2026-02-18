import { Controller, Get, Param, BadRequestException } from "@nestjs/common";
import { InvoiceNotificationCron } from "./invoice-notification.cron";
import { ContractNotificationCron } from "./contract-notification.cron";
import { StalePipelineCron } from "./stale-pipeline.cron";
import { ManagerLogReminderCron } from "./manager-log-reminder.cron";
import { ProratedInvoiceCron } from "./prorated-invoice.cron";
import type { CronDryRunResponse } from "./dto/dry-run.dto";

const VALID_CRON_NAMES = [
  "invoice-notification",
  "contract-notification",
  "stale-pipeline",
  "manager-log-reminder",
  "prorated-invoice",
] as const;

@Controller("cron-jobs")
export class CronJobsController {
  constructor(
    private invoiceNotificationCron: InvoiceNotificationCron,
    private contractNotificationCron: ContractNotificationCron,
    private stalePipelineCron: StalePipelineCron,
    private managerLogReminderCron: ManagerLogReminderCron,
    private proratedInvoiceCron: ProratedInvoiceCron,
  ) {}

  @Get(":cronName/dry-run")
  async dryRun(
    @Param("cronName") cronName: string,
  ): Promise<CronDryRunResponse> {
    switch (cronName) {
      case "invoice-notification":
        return this.invoiceNotificationCron.dryRun();
      case "contract-notification":
        return this.contractNotificationCron.dryRun();
      case "stale-pipeline":
        return this.stalePipelineCron.dryRun();
      case "manager-log-reminder":
        return this.managerLogReminderCron.dryRun();
      case "prorated-invoice":
        return this.proratedInvoiceCron.dryRun();
      default:
        throw new BadRequestException(
          `Bilinmeyen cron job: ${cronName}. Gecerli degerler: ${VALID_CRON_NAMES.join(", ")}`
        );
    }
  }
}
