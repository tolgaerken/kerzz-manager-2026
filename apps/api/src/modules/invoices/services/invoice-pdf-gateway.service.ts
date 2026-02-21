import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { lastValueFrom } from "rxjs";
import { Invoice, InvoiceDocument } from "../schemas/invoice.schema";
import {
  Customer,
  CustomerDocument,
} from "../../customers/schemas/customer.schema";
import {
  GroupCompany,
  GroupCompanyDocument,
} from "../../companies/schemas/group-company.schema";
import { CONTRACT_DB_CONNECTION } from "../../../database/contract-database.module";

interface PdfResponse {
  pdf: string;
}

export interface InvoicePdfResult {
  pdf: string;
  invoiceNumber: string;
  customerName: string;
}

@Injectable()
export class InvoicePdfGatewayService {
  private readonly logger = new Logger(InvoicePdfGatewayService.name);
  private readonly invoiceServiceUrl: string;
  private readonly invoiceServiceApiKey: string;

  constructor(
    @InjectModel(Invoice.name, CONTRACT_DB_CONNECTION)
    private readonly invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Customer.name, CONTRACT_DB_CONNECTION)
    private readonly customerModel: Model<CustomerDocument>,
    @InjectModel(GroupCompany.name, CONTRACT_DB_CONNECTION)
    private readonly groupCompanyModel: Model<GroupCompanyDocument>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.invoiceServiceUrl =
      this.configService.get<string>("INVOICE_SERVICE_URL") ||
      "https://invoice-service.kerzz.com:4260";
    this.invoiceServiceApiKey =
      this.configService.get<string>("INVOICE_SERVICE_API_KEY") || "";
  }

  async getInvoicePdfByUuid(invoiceUuid: string): Promise<InvoicePdfResult> {
    const invoice = await this.invoiceModel
      .findOne({ invoiceUUID: invoiceUuid })
      .lean()
      .exec();

    if (!invoice) {
      throw new NotFoundException(
        `Fatura bulunamadı: invoiceUUID=${invoiceUuid}`
      );
    }

    if (!invoice.internalFirm) {
      throw new NotFoundException("Faturaya ait firma bilgisi bulunamadı");
    }

    // internalFirm'den firma vergi numarasını al
    // internalFirm küçük harf (veri), id büyük harf (VERI) olabilir - idc alanı da kontrol et
    const internalFirmLower = invoice.internalFirm.toLowerCase();
    const company = await this.groupCompanyModel
      .findOne({
        $or: [
          { id: invoice.internalFirm },
          { id: invoice.internalFirm.toUpperCase() },
          { idc: internalFirmLower },
        ],
      })
      .lean()
      .exec();

    if (!company) {
      throw new NotFoundException(
        `Firma bulunamadı: internalFirm=${invoice.internalFirm}`
      );
    }

    if (!company.vatNo) {
      throw new NotFoundException(
        `Firma vergi numarası bulunamadı: ${invoice.internalFirm}`
      );
    }

    // Müşteri adını almak için customer'ı da çekelim
    let customerName = "";
    if (invoice.customerId) {
      const customer = await this.customerModel
        .findOne({ id: invoice.customerId })
        .lean()
        .exec();
      customerName = customer?.name || "";
    }

    const pdf = await this.fetchPdfFromExternalService(
      company.vatNo,
      invoiceUuid
    );

    return {
      pdf,
      invoiceNumber: invoice.invoiceNumber || "",
      customerName,
    };
  }

  async validateInvoiceExists(invoiceUuid: string): Promise<boolean> {
    const invoice = await this.invoiceModel
      .findOne({ invoiceUUID: invoiceUuid })
      .lean()
      .exec();

    return !!invoice;
  }

  private async fetchPdfFromExternalService(
    taxNumber: string,
    shortCode: string
  ): Promise<string> {
    const url = `${this.invoiceServiceUrl}/api/invoice/getPdfInvoiceByShortCode`;

    const requestBody = {
      taxNumber,
      shortCode,
      requestFile: false,
    };
    
    const requestHeaders = {
      "Content-Type": "application/json",
      "X-Api-Key": this.invoiceServiceApiKey,
    };

    this.logger.debug(`PDF isteği gönderiliyor:
      URL: ${url}
      Headers: ${JSON.stringify(requestHeaders)}
      Body: ${JSON.stringify(requestBody)}`);

    try {
      const response = await lastValueFrom(
        this.httpService.post<PdfResponse>(
          url,
          requestBody,
          {
            headers: requestHeaders,
            timeout: 30000,
          }
        )
      );

      if (!response.data?.pdf) {
        throw new Error("Dış servisten PDF verisi alınamadı");
      }

      this.logger.log(`PDF başarıyla alındı: shortCode=${shortCode}`);

      return response.data.pdf;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      
      let userFriendlyMessage = "Fatura PDF'i alınamadı";
      
      // Axios error ise response body'yi de logla
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
        this.logger.error(
          `PDF çekme hatası: ${errorMessage}, status=${axiosError.response?.status}, response=${JSON.stringify(axiosError.response?.data)}`
        );
        
        // Harici servisten gelen hata mesajını kullanıcıya göster
        if (axiosError.response?.status === 500) {
          userFriendlyMessage = "E-fatura servisi geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.";
        }
      } else {
        this.logger.error(`PDF çekme hatası: ${errorMessage}`);
      }
      
      throw new Error(userFriendlyMessage);
    }
  }
}
