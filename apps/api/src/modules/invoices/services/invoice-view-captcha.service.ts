import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomInt } from "crypto";

interface CaptchaChallenge {
  code: string;
  attempts: number;
  expiresAt: number;
}

@Injectable()
export class InvoiceViewCaptchaService {
  private readonly logger = new Logger(InvoiceViewCaptchaService.name);
  private readonly challenges = new Map<string, CaptchaChallenge>();
  private readonly ttlSeconds: number;
  private readonly maxAttempts: number;

  constructor(private readonly configService: ConfigService) {
    this.ttlSeconds = this.configService.get<number>(
      "INVOICE_VIEW_CAPTCHA_TTL_SECONDS",
      300
    );
    this.maxAttempts = this.configService.get<number>(
      "INVOICE_VIEW_CAPTCHA_MAX_ATTEMPTS",
      5
    );
  }

  generateCaptcha(invoiceUuid: string): { challengeId: string; code: string } {
    this.cleanupExpired();

    const challengeId = `${invoiceUuid}_${Date.now()}`;
    const code = this.generate4DigitCode();
    const expiresAt = Date.now() + this.ttlSeconds * 1000;

    this.challenges.set(challengeId, {
      code,
      attempts: 0,
      expiresAt,
    });

    this.logger.debug(`Captcha oluşturuldu: ${challengeId}`);

    return { challengeId, code };
  }

  verifyCaptcha(challengeId: string, userCode: string): boolean {
    const challenge = this.challenges.get(challengeId);

    if (!challenge) {
      throw new BadRequestException("Geçersiz veya süresi dolmuş captcha");
    }

    if (Date.now() > challenge.expiresAt) {
      this.challenges.delete(challengeId);
      throw new BadRequestException("Captcha süresi doldu");
    }

    challenge.attempts++;

    if (challenge.attempts > this.maxAttempts) {
      this.challenges.delete(challengeId);
      throw new BadRequestException(
        "Maksimum deneme sayısına ulaşıldı. Lütfen yeni captcha alın."
      );
    }

    if (challenge.code !== userCode) {
      throw new BadRequestException(
        `Hatalı kod. Kalan deneme: ${this.maxAttempts - challenge.attempts}`
      );
    }

    this.challenges.delete(challengeId);
    this.logger.debug(`Captcha doğrulandı: ${challengeId}`);

    return true;
  }

  private generate4DigitCode(): string {
    return randomInt(1000, 9999).toString();
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, challenge] of this.challenges.entries()) {
      if (now > challenge.expiresAt) {
        this.challenges.delete(key);
      }
    }
  }
}
