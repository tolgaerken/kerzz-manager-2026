import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { Transporter } from "nodemailer";

export interface EmailMessage {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Email Service - Nodemailer ile SMTP üzerinden mail gönderir
 */
@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: Transporter | null = null;
  private senderName: string;
  private senderEmail: string;
  private isConfigured = false;

  constructor(private configService: ConfigService) {
    this.senderName =
      this.configService.get<string>("SMTP_SENDER_NAME") || "Kerzz Manager";
    this.senderEmail =
      this.configService.get<string>("SMTP_SENDER_EMAIL") || "noreply@kerzz.com";
  }

  async onModuleInit() {
    await this.initializeTransporter();
  }

  /**
   * SMTP transporter'ı başlatır
   */
  private async initializeTransporter() {
    const host = this.configService.get<string>("SMTP_HOST");
    const port = this.configService.get<number>("SMTP_PORT") || 587;
    const user = this.configService.get<string>("SMTP_USER");
    const pass = this.configService.get<string>("SMTP_PASS");
    const secure = this.configService.get<string>("SMTP_SECURE") === "true";

    // SMTP bilgileri yoksa mock modda çalış
    if (!host || !user || !pass) {
      console.warn(
        "⚠️ SMTP yapılandırması eksik - Email servisi mock modda çalışacak",
        {
          hasHost: !!host,
          hasUser: !!user,
          hasPass: !!pass,
        }
      );
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure, // true for 465, false for other ports
        auth: {
          user,
          pass,
        },
      });

      // Bağlantıyı doğrula
      await this.transporter.verify();
      this.isConfigured = true;
      console.log("✅ SMTP bağlantısı başarıyla kuruldu", {
        host,
        port,
        secure,
        senderEmail: this.senderEmail,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(
        "❌ SMTP bağlantısı kurulamadı - Mock modda çalışılacak",
        {
          host,
          port,
          error: errorMessage,
        }
      );
      this.isConfigured = false;
      this.transporter = null;
    }
  }

  /**
   * Email gönderir
   */
  async send(email: EmailMessage): Promise<EmailResult> {
    // SMTP yapılandırılmamışsa mock mod
    if (!this.isConfigured || !this.transporter) {
      return this.sendMock(email);
    }

    try {
      const mailOptions = {
        from: `"${this.senderName}" <${this.senderEmail}>`,
        to: email.to,
        subject: email.subject,
        text: email.text,
        html: email.html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log("📧 Email başarıyla gönderildi", {
        to: email.to,
        subject: email.subject,
        messageId: info.messageId,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Email gönderimi başarısız", {
        to: email.to,
        subject: email.subject,
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage || "Email gönderilemedi",
      };
    }
  }

  /**
   * Mock email gönderimi (SMTP yapılandırılmamışsa)
   */
  private async sendMock(email: EmailMessage): Promise<EmailResult> {
    console.log("📧 Email Gönderildi (Mock - SMTP yapılandırılmamış)", {
      to: email.to,
      subject: email.subject,
      hasHtml: !!email.html,
      hasText: !!email.text,
      timestamp: new Date().toISOString(),
    });

    // Debug için içeriği de logla
    if (email.text) {
      console.log("Email içeriği (text):", {
        content: email.text.substring(0, 200),
      });
    }

    return {
      success: true,
      messageId: `mock-email-${Date.now()}`,
    };
  }

  /**
   * Toplu Email gönderir
   */
  async sendBulk(emails: EmailMessage[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];

    for (const email of emails) {
      const result = await this.send(email);
      results.push(result);
    }

    return results;
  }

  /**
   * SMTP durumunu kontrol eder
   */
  isSmtpConfigured(): boolean {
    return this.isConfigured;
  }
}
