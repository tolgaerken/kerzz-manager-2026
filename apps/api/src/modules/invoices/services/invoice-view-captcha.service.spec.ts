import { ConfigService } from "@nestjs/config";
import { BadRequestException } from "@nestjs/common";
import { InvoiceViewCaptchaService } from "./invoice-view-captcha.service";

describe("InvoiceViewCaptchaService", () => {
  let service: InvoiceViewCaptchaService;
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string, defaultValue?: number) => {
        if (key === "INVOICE_VIEW_CAPTCHA_TTL_SECONDS") return 300;
        if (key === "INVOICE_VIEW_CAPTCHA_MAX_ATTEMPTS") return 5;
        return defaultValue;
      }),
    } as unknown as ConfigService;

    service = new InvoiceViewCaptchaService(configService);
  });

  describe("generateCaptcha", () => {
    it("4 haneli kod üretir", () => {
      const result = service.generateCaptcha("test-uuid");

      expect(result.challengeId).toContain("test-uuid");
      expect(result.code).toMatch(/^\d{4}$/);
    });

    it("her seferinde farklı challengeId üretir", () => {
      const result1 = service.generateCaptcha("test-uuid");
      const result2 = service.generateCaptcha("test-uuid");

      expect(result1.challengeId).not.toBe(result2.challengeId);
    });
  });

  describe("verifyCaptcha", () => {
    it("doğru kod ile başarılı doğrulama yapar", () => {
      const { challengeId, code } = service.generateCaptcha("test-uuid");

      const result = service.verifyCaptcha(challengeId, code);

      expect(result).toBe(true);
    });

    it("hatalı kod ile BadRequestException fırlatır", () => {
      const { challengeId } = service.generateCaptcha("test-uuid");

      expect(() => service.verifyCaptcha(challengeId, "0000")).toThrow(
        BadRequestException
      );
    });

    it("geçersiz challengeId ile BadRequestException fırlatır", () => {
      expect(() => service.verifyCaptcha("invalid-id", "1234")).toThrow(
        BadRequestException
      );
    });

    it("doğrulama sonrası challenge silinir", () => {
      const { challengeId, code } = service.generateCaptcha("test-uuid");

      service.verifyCaptcha(challengeId, code);

      expect(() => service.verifyCaptcha(challengeId, code)).toThrow(
        BadRequestException
      );
    });

    it("maksimum deneme sayısı aşılınca hata fırlatır", () => {
      const { challengeId } = service.generateCaptcha("test-uuid");

      for (let i = 0; i < 5; i++) {
        try {
          service.verifyCaptcha(challengeId, "0000");
        } catch {
          // Beklenen hata
        }
      }

      expect(() => service.verifyCaptcha(challengeId, "0000")).toThrow(
        /Maksimum deneme sayısına ulaşıldı/
      );
    });
  });

  describe("TTL kontrolü", () => {
    it("süresi dolmuş captcha için hata fırlatır", () => {
      jest.useFakeTimers();

      const { challengeId, code } = service.generateCaptcha("test-uuid");

      jest.advanceTimersByTime(301 * 1000);

      expect(() => service.verifyCaptcha(challengeId, code)).toThrow(
        /süresi doldu/
      );

      jest.useRealTimers();
    });
  });
});
