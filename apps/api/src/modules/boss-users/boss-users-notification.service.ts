import { Injectable, Logger } from "@nestjs/common";
import { SmsService, SmsResult } from "../sms/sms.service";
import { EmailService, EmailResult } from "../email/email.service";

export interface NotificationResult {
  sms?: SmsResult;
  email?: EmailResult;
}

@Injectable()
export class BossUsersNotificationService {
  private readonly logger = new Logger(BossUsersNotificationService.name);

  constructor(
    private readonly smsService: SmsService,
    private readonly emailService: EmailService
  ) {}

  /**
   * Kerzz Boss uygulaması için bildirim gönder
   */
  async sendBossAppNotification(
    phone: string | undefined,
    email: string | undefined,
    userName: string,
    options: {
      sendSms?: boolean;
      sendEmail?: boolean;
      customMessage?: string;
    } = {}
  ): Promise<NotificationResult> {
    const result: NotificationResult = {};
    const { sendSms = true, sendEmail = true, customMessage } = options;

    const appLink = "https://boss.kerzz.com";
    const defaultMessage = `Merhaba ${userName}, Kerzz Boss uygulamasına erişiminiz tanımlandı. Uygulamaya ${appLink} adresinden ulaşabilirsiniz.`;
    const message = customMessage || defaultMessage;

    // SMS gönder
    if (sendSms && phone) {
      try {
        result.sms = await this.smsService.send({
          to: phone,
          message
        });
        this.logger.log(`SMS gönderildi: ${phone}`);
      } catch (error) {
        this.logger.error(`SMS gönderimi başarısız: ${phone}`, error);
        result.sms = {
          success: false,
          error: error instanceof Error ? error.message : "SMS gönderilemedi"
        };
      }
    }

    // Email gönder
    if (sendEmail && email) {
      try {
        result.email = await this.emailService.send({
          to: email,
          subject: "Kerzz Boss Erişim Bilgilendirmesi",
          html: this.generateEmailHtml(userName, appLink, customMessage),
          text: message
        });
        this.logger.log(`Email gönderildi: ${email}`);
      } catch (error) {
        this.logger.error(`Email gönderimi başarısız: ${email}`, error);
        result.email = {
          success: false,
          error: error instanceof Error ? error.message : "Email gönderilemedi"
        };
      }
    }

    return result;
  }

  /**
   * Email HTML şablonu oluştur
   */
  private generateEmailHtml(
    userName: string,
    appLink: string,
    customMessage?: string
  ): string {
    const content = customMessage
      ? `<p>${customMessage}</p>`
      : `
        <p>Merhaba <strong>${userName}</strong>,</p>
        <p>Kerzz Boss uygulamasına erişiminiz başarıyla tanımlandı.</p>
        <p>Uygulamaya aşağıdaki bağlantıdan ulaşabilirsiniz:</p>
        <p style="margin: 20px 0;">
          <a href="${appLink}" 
             style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Kerzz Boss'a Git
          </a>
        </p>
        <p>veya bu linki tarayıcınıza kopyalayın: <a href="${appLink}">${appLink}</a></p>
      `;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kerzz Boss Erişim Bilgilendirmesi</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2c3e50; margin: 0;">Kerzz Boss</h1>
          </div>
          ${content}
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            Bu email Kerzz Manager sistemi tarafından otomatik olarak gönderilmiştir.
          </p>
        </div>
      </body>
      </html>
    `;
  }
}
