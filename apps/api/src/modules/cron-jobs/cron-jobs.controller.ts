import {
  Controller,
  Get,
  Param,
  BadRequestException,
  Post,
  Body,
} from "@nestjs/common";
import { InvoiceNotificationCron } from "./invoice-notification.cron";
import { ContractNotificationCron } from "./contract-notification.cron";
import { StalePipelineCron } from "./stale-pipeline.cron";
import { ManagerLogReminderCron } from "./manager-log-reminder.cron";
import { ProratedInvoiceCron } from "./prorated-invoice.cron";
import type { CronDryRunResponse } from "./dto/dry-run.dto";
import type {
  CronManualRunDto,
  CronManualRunResponseDto,
} from "./dto/manual-run.dto";

const VALID_CRON_NAMES = [
  "invoice-notification",
  "contract-notification-monthly",
  "contract-notification-yearly",
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
      case "contract-notification-monthly":
      case "contract-notification-yearly":
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

  @Post(":cronName/manual-run")
  async manualRun(
    @Param("cronName") cronName: string,
    @Body() dto: CronManualRunDto,
  ): Promise<CronManualRunResponseDto> {
    switch (cronName) {
      case "stale-pipeline":
        if (!dto.targetType || !dto.contextId) {
          throw new BadRequestException(
            "stale-pipeline için targetType ve contextId zorunludur"
          );
        }
        return this.stalePipelineCron.manualRun({
          targetType: dto.targetType,
          contextId: dto.contextId,
        });
      case "manager-log-reminder":
        if (!dto.logId) {
          throw new BadRequestException(
            "manager-log-reminder için logId zorunludur"
          );
        }
        return this.managerLogReminderCron.manualRun({ logId: dto.logId });
      case "prorated-invoice":
        if (!dto.planId) {
          throw new BadRequestException(
            "prorated-invoice için planId zorunludur"
          );
        }
        return this.proratedInvoiceCron.manualRun({ planId: dto.planId });
      case "invoice-notification":
      case "contract-notification-monthly":
      case "contract-notification-yearly":
        throw new BadRequestException(
          `${cronName} manuel tetikleme için /notification-queue/send endpointini kullanın`
        );
      default:
        throw new BadRequestException(
          `Bilinmeyen cron job: ${cronName}. Gecerli degerler: ${VALID_CRON_NAMES.join(", ")}`
        );
    }
  }
}
