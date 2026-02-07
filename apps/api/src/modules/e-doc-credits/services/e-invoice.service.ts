import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { lastValueFrom } from "rxjs";
import { EInvoiceClass, EInvoiceCover } from "../interfaces/e-invoice.interfaces";

/**
 * Harici e-fatura API servisi
 * io-cloud-2025'teki ClaudieInvoiceService muadili
 */
@Injectable()
export class EInvoiceService {
  private readonly logger = new Logger(EInvoiceService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Faturayı harici e-fatura servisine gönderir
   * invoiceNumber ve uuid bilgilerini geri alır
   */
  async sendInvoice(invoiceCover: EInvoiceCover): Promise<EInvoiceClass> {
    const invoiceServiceUrl = this.configService.get<string>("INVOICE_SERVICE_URL");
    const apiKey = this.configService.get<string>("INVOICE_SERVICE_API_KEY");

    const url = `${invoiceServiceUrl}/api/invoice/saveinvoicewithobject`;

    this.logger.log(`Fatura gönderiliyor: ${url}`);

    try {
      const response = await lastValueFrom(
        this.httpService.post<EInvoiceClass>(url, invoiceCover, {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
          },
        }),
      );

      const result = response.data;

      // Gelen yanıttan invoiceNumber ve uuid'yi invoice nesnesine yaz
      invoiceCover.invoice.uuid = result.uuid;
      invoiceCover.invoice.invoiceNumber = result.invoiceNumber;

      this.logger.log(
        `Fatura başarıyla oluşturuldu: ${result.invoiceNumber} (UUID: ${result.uuid})`,
      );

      return invoiceCover.invoice;
    } catch (error) {
      this.logger.error(`Fatura gönderilirken hata oluştu: ${error.message}`);
      throw error;
    }
  }
}
