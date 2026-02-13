import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import type { IntegratorStatusItem } from "./dto";

@Injectable()
export class EDocStatusesService {
  private readonly logger = new Logger(EDocStatusesService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Harici e-fatura servisinden entegratör durumlarını getirir
   */
  async getIntegratorStatuses(
    startDate: string,
    endDate: string,
  ): Promise<IntegratorStatusItem[]> {
    const invoiceServiceUrl = this.configService.get<string>("INVOICE_SERVICE_URL");
    const apiKey = this.configService.get<string>("INVOICE_SERVICE_API_KEY");

    const url = `${invoiceServiceUrl}/api/helpers/integratorStatuses`;

    this.logger.log(
      `Entegratör durumları getiriliyor: ${startDate} - ${endDate}`,
    );

    try {
      const response = await lastValueFrom(
        this.httpService.post<IntegratorStatusItem[]>(
          url,
          { startDate, endDate },
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
            },
            timeout: 30000,
          },
        ),
      );

      this.logger.log(
        `Entegratör durumları başarıyla getirildi: ${response.data.length} kayıt`,
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        `Entegratör durumları getirilirken hata: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
