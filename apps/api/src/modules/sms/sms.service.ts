import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface SmsMessage {
  to: string;
  message: string;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
  rawResponse?: string;
}

/**
 * SMS Service - JetSMS Entegrasyonu
 * JetSMS API üzerinden SMS gönderimi yapar.
 * SMS_ENABLED=false ise sadece log'a yazar (mock mode).
 */
@Injectable()
export class SmsService {
  private readonly smsEnabled: boolean;
  private readonly jetsmsConfig: {
    username: string;
    password: string;
    transmissionId: string;
    baseUrl: string;
  };

  constructor(private readonly configService: ConfigService) {
    this.smsEnabled =
      this.configService.get<string>("SMS_ENABLED") === "true" || false;
    this.jetsmsConfig = {
      username: this.configService.get<string>("JETSMS_USERNAME") || "",
      password: this.configService.get<string>("JETSMS_PASSWORD") || "",
      transmissionId:
        this.configService.get<string>("JETSMS_TRANSMISSION_ID") || "KERZZ",
      baseUrl:
        this.configService.get<string>("JETSMS_BASE_URL") ||
        "http://service.jetsms.com.tr/SMS-Web/HttpSmsSend",
    };
  }

  /**
   * Türkçe karakterleri ASCII eşdeğerlerine dönüştürür
   * SMS'lerde Türkçe karakter problemi yaşanmaması için kullanılır
   */
  private normalizeTurkishChars(text: string): string {
    if (!text) return "";

    const turkishMap: Record<string, string> = {
      ş: "s",
      Ş: "S",
      ğ: "g",
      Ğ: "G",
      ü: "u",
      Ü: "U",
      ö: "o",
      Ö: "O",
      ç: "c",
      Ç: "C",
      ı: "i",
      İ: "I",
    };

    return text
      .split("")
      .map((char) => turkishMap[char] || char)
      .join("");
  }

  /**
   * Telefon numarasını temizler ve formatlar
   * +90, 0 gibi prefixleri kaldırır, sadece rakamları bırakır
   */
  private cleanGsm(gsm: string): string {
    if (!gsm) return "";

    // Tüm boşlukları ve özel karakterleri kaldır
    let cleaned = gsm.replace(/[\s\-\(\)\.]/g, "");

    // +90 ile başlıyorsa kaldır
    if (cleaned.startsWith("+90")) {
      cleaned = cleaned.substring(3);
    }
    // 0090 ile başlıyorsa kaldır
    else if (cleaned.startsWith("0090")) {
      cleaned = cleaned.substring(4);
    }
    // 90 ile başlıyorsa ve 12 haneli ise kaldır (905xxxxxxxxx)
    else if (cleaned.startsWith("90") && cleaned.length === 12) {
      cleaned = cleaned.substring(2);
    }
    // 0 ile başlıyorsa kaldır
    else if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }

    // Sadece rakamları bırak
    cleaned = cleaned.replace(/\D/g, "");

    return cleaned;
  }

  /**
   * JetSMS API'sine SMS gönderir
   */
  private async sendViaJetSMS(gsm: string, message: string): Promise<SmsResult> {
    const cleanedGsm = this.cleanGsm(gsm);

    if (!cleanedGsm || cleanedGsm.length < 10) {
      return {
        success: false,
        error: "Geçersiz telefon numarası",
      };
    }

    // Türkçe karakterleri normalize et
    const normalizedMessage = this.normalizeTurkishChars(message);

    // URL parametrelerini encode et
    const params = new URLSearchParams({
      Username: this.jetsmsConfig.username,
      Password: this.jetsmsConfig.password,
      Msisdns: cleanedGsm,
      Messages: normalizedMessage,
      TransmissionID: this.jetsmsConfig.transmissionId,
    });

    const url = `${this.jetsmsConfig.baseUrl}?${params.toString()}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const textResult = await response.text();

      console.log("📱 JetSMS Yanıt", {
        to: cleanedGsm,
        response: textResult,
      });

      // JetSMS başarılı yanıtları: "Status=0\nMessageIDs=..." veya pozitif sayı
      // Hata durumunda: "Status=-X\n..." veya negatif değer
      const isSuccess = this.isJetSmsSuccess(textResult);
      const messageId = this.extractMessageId(textResult);

      return {
        success: isSuccess,
        messageId: messageId,
        error: isSuccess ? undefined : textResult.trim(),
        rawResponse: textResult,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("JetSMS API hatası", {
        to: cleanedGsm,
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage || "JetSMS API bağlantı hatası",
      };
    }
  }

  /**
   * JetSMS yanıtının başarılı olup olmadığını kontrol eder
   * Başarılı yanıt formatları:
   * 1. "Status=0\nMessageIDs=..." (multiline format)
   * 2. Pozitif sayı (eski format - messageId)
   * Hata durumunda:
   * - "Status=-X\n..." (negatif status)
   * - Negatif sayı
   */
  private isJetSmsSuccess(response: string): boolean {
    const trimmed = response.trim();

    // Multiline format kontrolü: "Status=0\nMessageIDs=..."
    if (trimmed.includes("Status=")) {
      const statusMatch = trimmed.match(/Status=(-?\d+)/);
      if (statusMatch) {
        const status = parseInt(statusMatch[1], 10);
        // Status=0 başarılı demek
        return status === 0;
      }
    }

    // Eski format: Pozitif bir sayı ise başarılı
    const numericValue = parseInt(trimmed, 10);
    return !isNaN(numericValue) && numericValue > 0;
  }

  /**
   * JetSMS yanıtından MessageID'yi çıkarır
   */
  private extractMessageId(response: string): string | undefined {
    const trimmed = response.trim();

    // Multiline format: "Status=0\nMessageIDs=..."
    const messageIdMatch = trimmed.match(/MessageIDs?=(\d+)/);
    if (messageIdMatch) {
      return messageIdMatch[1];
    }

    // Eski format: Sadece sayı
    const numericValue = parseInt(trimmed, 10);
    if (!isNaN(numericValue) && numericValue > 0) {
      return trimmed;
    }

    return undefined;
  }

  /**
   * SMS gönderir
   * SMS_ENABLED=true ise JetSMS üzerinden gönderir
   * SMS_ENABLED=false ise sadece log'a yazar (mock mode)
   */
  async send(sms: SmsMessage): Promise<SmsResult> {
    try {
      // SMS devre dışı ise mock mod
      if (!this.smsEnabled) {
        console.log("📱 SMS Gönderildi (Mock Mode - SMS Disabled)", {
          to: sms.to,
          message: sms.message,
          timestamp: new Date().toISOString(),
        });

        return {
          success: true,
          messageId: `mock-sms-${Date.now()}`,
        };
      }

      // JetSMS üzerinden gönder
      return await this.sendViaJetSMS(sms.to, sms.message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("SMS gönderimi başarısız", {
        to: sms.to,
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage || "SMS gönderilemedi",
      };
    }
  }

  /**
   * Toplu SMS gönderir
   */
  async sendBulk(messages: SmsMessage[]): Promise<SmsResult[]> {
    const results: SmsResult[] = [];

    for (const sms of messages) {
      const result = await this.send(sms);
      results.push(result);
    }

    return results;
  }

  /**
   * SMS servisinin aktif olup olmadığını kontrol eder
   */
  isEnabled(): boolean {
    return this.smsEnabled;
  }
}
