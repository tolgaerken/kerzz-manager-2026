import { NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { Model } from "mongoose";
import { of, throwError } from "rxjs";
import { InvoicePdfGatewayService } from "./invoice-pdf-gateway.service";
import { InvoiceDocument } from "../schemas/invoice.schema";
import { CustomerDocument } from "../../customers/schemas/customer.schema";

describe("InvoicePdfGatewayService", () => {
  let service: InvoicePdfGatewayService;
  let invoiceModel: Model<InvoiceDocument>;
  let customerModel: Model<CustomerDocument>;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockInvoice = {
    invoiceUUID: "test-uuid-123",
    invoiceNumber: "FT-2026-001",
    customerId: "customer-123",
  };

  const mockCustomer = {
    id: "customer-123",
    name: "Test Müşteri",
    taxNo: "1234567890",
  };

  beforeEach(() => {
    invoiceModel = {
      findOne: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockInvoice),
        }),
      }),
    } as unknown as Model<InvoiceDocument>;

    customerModel = {
      findOne: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockCustomer),
        }),
      }),
    } as unknown as Model<CustomerDocument>;

    httpService = {
      post: jest.fn().mockReturnValue(
        of({
          data: { pdf: "base64-pdf-content" },
        })
      ),
    } as unknown as HttpService;

    configService = {
      get: jest.fn((key: string) => {
        if (key === "INVOICE_SERVICE_URL")
          return "https://invoice-service.kerzz.com:4260";
        if (key === "INVOICE_SERVICE_API_KEY") return "test-api-key";
        return undefined;
      }),
    } as unknown as ConfigService;

    service = new InvoicePdfGatewayService(
      invoiceModel,
      customerModel,
      httpService,
      configService
    );
  });

  describe("getInvoicePdfByUuid", () => {
    it("başarılı şekilde PDF döner", async () => {
      const result = await service.getInvoicePdfByUuid("test-uuid-123");

      expect(result).toEqual({
        pdf: "base64-pdf-content",
        invoiceNumber: "FT-2026-001",
        customerName: "Test Müşteri",
      });

      expect(httpService.post).toHaveBeenCalledWith(
        "https://invoice-service.kerzz.com:4260/api/invoice/getPdfInvoiceByShortCode",
        {
          taxNumber: "1234567890",
          shortCode: "test-uuid-123",
          requestFile: false,
        },
        expect.objectContaining({
          headers: {
            "Content-Type": "application/json",
            "x-api-key": "test-api-key",
          },
        })
      );
    });

    it("fatura bulunamadığında NotFoundException fırlatır", async () => {
      (invoiceModel.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.getInvoicePdfByUuid("invalid-uuid")).rejects.toThrow(
        NotFoundException
      );
    });

    it("müşteri bulunamadığında NotFoundException fırlatır", async () => {
      (customerModel.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.getInvoicePdfByUuid("test-uuid-123")).rejects.toThrow(
        NotFoundException
      );
    });

    it("müşteri taxNo yoksa NotFoundException fırlatır", async () => {
      (customerModel.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ ...mockCustomer, taxNo: "" }),
        }),
      });

      await expect(service.getInvoicePdfByUuid("test-uuid-123")).rejects.toThrow(
        NotFoundException
      );
    });

    it("dış servis hatası durumunda Error fırlatır", async () => {
      (httpService.post as jest.Mock).mockReturnValue(
        throwError(() => new Error("Network error"))
      );

      await expect(service.getInvoicePdfByUuid("test-uuid-123")).rejects.toThrow(
        /Fatura PDF'i alınamadı/
      );
    });
  });

  describe("validateInvoiceExists", () => {
    it("fatura varsa true döner", async () => {
      const result = await service.validateInvoiceExists("test-uuid-123");
      expect(result).toBe(true);
    });

    it("fatura yoksa false döner", async () => {
      (invoiceModel.findOne as jest.Mock).mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await service.validateInvoiceExists("invalid-uuid");
      expect(result).toBe(false);
    });
  });
});
