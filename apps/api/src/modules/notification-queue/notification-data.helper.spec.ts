import {
  buildInvoiceTemplateData,
  buildInvoiceViewLink,
  normalizePhone,
  normalizeEmail,
  formatCurrency,
  formatDate,
} from "./notification-data.helper";

describe("notification-data.helper", () => {
  describe("normalizePhone", () => {
    it("null/undefined için boş string döner", () => {
      expect(normalizePhone(null)).toBe("");
      expect(normalizePhone(undefined)).toBe("");
    });

    it("+90 ile başlayan numarayı normalize eder", () => {
      expect(normalizePhone("+905551234567")).toBe("05551234567");
    });

    it("90 ile başlayan numarayı normalize eder", () => {
      expect(normalizePhone("905551234567")).toBe("05551234567");
    });

    it("5 ile başlayan 10 haneli numaraya 0 ekler", () => {
      expect(normalizePhone("5551234567")).toBe("05551234567");
    });

    it("boşlukları temizler", () => {
      expect(normalizePhone("0555 123 45 67")).toBe("05551234567");
    });
  });

  describe("normalizeEmail", () => {
    it("null/undefined için boş string döner", () => {
      expect(normalizeEmail(null)).toBe("");
      expect(normalizeEmail(undefined)).toBe("");
    });

    it("küçük harfe çevirir ve trim yapar", () => {
      expect(normalizeEmail("  TEST@Example.COM  ")).toBe("test@example.com");
    });
  });

  describe("formatCurrency", () => {
    it("TL formatında döner", () => {
      const result = formatCurrency(1234.56);
      expect(result).toContain("1.234,56");
      expect(result).toContain("₺");
    });
  });

  describe("formatDate", () => {
    it("undefined için boş string döner", () => {
      expect(formatDate(undefined)).toBe("");
    });

    it("TR formatında tarih döner", () => {
      const date = new Date("2026-02-15");
      const result = formatDate(date);
      expect(result).toBe("15.02.2026");
    });
  });

  describe("buildInvoiceViewLink", () => {
    it("invoiceUUID yoksa boş string döner", () => {
      expect(buildInvoiceViewLink(undefined, "https://example.com")).toBe("");
      expect(buildInvoiceViewLink("", "https://example.com")).toBe("");
    });

    it("doğru formatta link üretir", () => {
      const result = buildInvoiceViewLink("test-uuid", "https://example.com");
      expect(result).toBe("https://example.com/fatura-goruntule/test-uuid");
    });
  });

  describe("buildInvoiceTemplateData", () => {
    const mockInvoice = {
      id: "invoice-123",
      invoiceNumber: "FT-2026-001",
      grandTotal: 1000,
      dueDate: new Date("2026-02-15"),
      customerId: "customer-123",
      invoiceUUID: "uuid-123",
    };

    const mockCustomer = {
      name: "Test Şirket",
      email: "test@example.com",
      phone: "05551234567",
    };

    it("temel template data üretir", () => {
      const result = buildInvoiceTemplateData(
        mockInvoice,
        mockCustomer,
        "https://pay.example.com/odeme/link-123"
      );

      expect(result.company).toBe("Test Şirket");
      expect(result.invoiceNumber).toBe("FT-2026-001");
      expect(result.paymentLink).toBe("https://pay.example.com/odeme/link-123");
      expect(result.recordType).toBe("invoice");
      expect(result.recordId).toBe("invoice-123");
    });

    it("webBaseUrl yoksa confirmLink paymentLink ile aynı olur", () => {
      const result = buildInvoiceTemplateData(
        mockInvoice,
        mockCustomer,
        "https://pay.example.com/odeme/link-123"
      );

      expect(result.confirmLink).toBe("https://pay.example.com/odeme/link-123");
    });

    it("webBaseUrl varsa confirmLink fatura görüntüleme linkine yönlenir", () => {
      const result = buildInvoiceTemplateData(
        mockInvoice,
        mockCustomer,
        "https://pay.example.com/odeme/link-123",
        undefined,
        "cron",
        undefined,
        "https://web.example.com"
      );

      expect(result.confirmLink).toBe(
        "https://web.example.com/fatura-goruntule/uuid-123"
      );
      expect(result.paymentLink).toBe("https://pay.example.com/odeme/link-123");
    });

    it("invoiceUUID yoksa webBaseUrl olsa bile paymentLink kullanılır", () => {
      const invoiceWithoutUUID = { ...mockInvoice, invoiceUUID: undefined };

      const result = buildInvoiceTemplateData(
        invoiceWithoutUUID,
        mockCustomer,
        "https://pay.example.com/odeme/link-123",
        undefined,
        "cron",
        undefined,
        "https://web.example.com"
      );

      expect(result.confirmLink).toBe("https://pay.example.com/odeme/link-123");
    });

    it("overdueDays parametresi doğru şekilde eklenir", () => {
      const result = buildInvoiceTemplateData(
        mockInvoice,
        mockCustomer,
        "https://pay.example.com/odeme/link-123",
        5
      );

      expect(result.overdueDays).toBe("5");
    });

    it("contactName parametresi customerName olarak kullanılır", () => {
      const result = buildInvoiceTemplateData(
        mockInvoice,
        mockCustomer,
        "https://pay.example.com/odeme/link-123",
        undefined,
        "manual",
        "Ahmet Yılmaz"
      );

      expect(result.customerName).toBe("Ahmet Yılmaz");
    });

    it("contactName yoksa Yetkili kullanılır", () => {
      const result = buildInvoiceTemplateData(
        mockInvoice,
        mockCustomer,
        "https://pay.example.com/odeme/link-123"
      );

      expect(result.customerName).toBe("Yetkili");
    });
  });
});
