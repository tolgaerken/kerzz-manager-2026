import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ErpBalanceService } from "./services/erp-balance.service";
import {
  SystemLogsService,
  SystemLogAction,
  SystemLogCategory,
} from "../system-logs";

@Injectable()
export class ErpBalanceCron {
  private readonly logger = new Logger(ErpBalanceCron.name);

  constructor(
    private readonly erpBalanceService: ErpBalanceService,
    private readonly systemLogsService: SystemLogsService
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleErpBalanceSync(): Promise<void> {
    this.logger.log("ERP bakiye senkronizasyonu başlatılıyor...");

    try {
      const result = await this.erpBalanceService.fetchAndStoreAllBalances();

      await this.systemLogsService.log(
        SystemLogCategory.CRON,
        SystemLogAction.CRON_END,
        "erp",
        {
          entityType: "ErpBalance",
          details: {
            success: result.success,
            failed: result.failed,
          },
        }
      );

      this.logger.log(
        `ERP bakiye senkronizasyonu tamamlandı. Başarılı: ${result.success}, Başarısız: ${result.failed}`
      );
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error(
        `ERP bakiye senkronizasyonu başarısız: ${error.message}`,
        error.stack
      );

      await this.systemLogsService.log(
        SystemLogCategory.CRON,
        SystemLogAction.CRON_FAILED,
        "erp",
        {
          entityType: "ErpBalance",
          errorMessage: error.message,
        }
      );
    }
  }
}
