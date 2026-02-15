import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  Invoice,
  InvoiceDocument,
} from "../invoices/schemas/invoice.schema";
import {
  Customer,
  CustomerDocument,
} from "../customers/schemas/customer.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { NotificationSettingsService } from "../notification-settings";
import {
  NotificationDispatchService,
  DispatchNotificationDto,
} from "../notification-dispatch";
import { PaymentsService } from "../payments/payments.service";
import {
  buildInvoiceTemplateData,
} from "../notification-queue/notification-data.helper";
import {
  SystemLogsService,
  SystemLogAction,
} from "../system-logs";

@Injectable()
export class InvoiceNotificationCron {
  private readonly logger = new Logger(InvoiceNotificationCron.name);
  private readonly paymentBaseUrl: string;

  constructor(
    @InjectModel(Invoice.name, CONTRACT_DB_CONNECTION)
    private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Customer.name, CONTRACT_DB_CONNECTION)
    private customerModel: Model<CustomerDocument>,
    private settingsService: NotificationSettingsService,
    private dispatchService: NotificationDispatchService,
    private systemLogsService: SystemLogsService,
    private paymentsService: PaymentsService,
    private configService: ConfigService
  ) {
    this.paymentBaseUrl =
      this.configService.get<string>("PAYMENT_BASE_URL") ||
      "http://localhost:3889";
  }

  /**
   * Fatura icin odeme linki olusturur veya fallback URL dondurur.
   */
  private async createPaymentLinkForInvoice(
    invoice: Invoice,
    customer: { name?: string; companyName?: string; email?: string; phone?: string }
  ): Promise<string> {
    try {
      if (!customer.email || !invoice.grandTotal || invoice.grandTotal <= 0) {
        return `${this.paymentBaseUrl}/odeme/${invoice.id}`;
      }

      const result = await this.paymentsService.createPaymentLink({
        amount: invoice.grandTotal,
        email: customer.email,
        name: customer.name || "",
        customerName: customer.companyName || customer.name || "",
        customerId: invoice.customerId || "",
        companyId: "VERI",
        invoiceNo: invoice.invoiceNumber || "",
        staffName: "Kerzz Bildirim Cron",
        canRecurring: true,
      });

      return result.url;
    } catch (error) {
      this.logger.warn(
        `Fatura icin odeme linki olusturulamadi (${invoice.invoiceNumber}): ${error}`
      );
      return `${this.paymentBaseUrl}/odeme/${invoice.id}`;
    }
  }

  /**
   * Her gün saat 09:00'da çalışır
   * Fatura son ödeme tarihi hatırlatmaları ve vadesi geçmiş bildirimleri gönderir
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleInvoiceNotifications(): Promise<void> {
    const startTime = Date.now();

    try {
      // Cron başlangıcını logla
      await this.systemLogsService.logCron(
        SystemLogAction.CRON_START,
        "invoice-notification",
        { details: { message: "Fatura bildirim cron'u başladı" } }
      );

      // Ayarları al
      const settings = await this.settingsService.getSettings();

      // Cron devre dışıysa çık
      if (!settings.cronEnabled || !settings.invoiceNotificationCronEnabled) {
        console.log("⏸️ Fatura bildirim cron'u devre dışı");
        return;
      }

      // En az bir kanal aktif olmalı
      if (!settings.emailEnabled && !settings.smsEnabled) {
        console.log("⚠️ Hiçbir bildirim kanalı aktif değil");
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let totalSent = 0;
      let totalFailed = 0;

      // 1. Son ödeme tarihi gelen faturalar (dueDate === today)
      if (settings.invoiceDueReminderDays.includes(0)) {
        const result = await this.processInvoicesDue(today, settings);
        totalSent += result.sent;
        totalFailed += result.failed;
      }

      // 2. Vadesi geçmiş faturalar (lookback limiti dahilinde)
      const lookbackDays = settings.invoiceLookbackDays ?? 90;
      for (const days of settings.invoiceOverdueDays) {
        // Lookback limitini aşan günleri atla
        if (days > lookbackDays) {
          continue;
        }
        const result = await this.processInvoicesOverdue(today, days, settings);
        totalSent += result.sent;
        totalFailed += result.failed;
      }

      const duration = Date.now() - startTime;

      // Cron bitişini logla
      await this.systemLogsService.logCron(
        SystemLogAction.CRON_END,
        "invoice-notification",
        {
          details: {
            message: "Fatura bildirim cron'u tamamlandı",
            totalSent,
            totalFailed,
            duration,
          },
        }
      );

      console.log(
        `✅ Fatura bildirim cron'u tamamlandı: ${totalSent} gönderildi, ${totalFailed} başarısız`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      await this.systemLogsService.logCron(
        SystemLogAction.CRON_FAILED,
        "invoice-notification",
        {
          details: { error: errorMessage },
          errorMessage,
        }
      );

      console.error("❌ Fatura bildirim cron'u başarısız:", errorMessage);
    }
  }

  /**
   * Son ödeme tarihi bugün olan faturaları işler
   */
  private async processInvoicesDue(
    today: Date,
    settings: Awaited<ReturnType<NotificationSettingsService["getSettings"]>>
  ): Promise<{ sent: number; failed: number }> {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Son ödeme tarihi bugün olan, ödenmemiş, daha önce bu gün bildirim gönderilmemiş faturalar
    const invoices = await this.invoiceModel
      .find({
        dueDate: { $gte: today, $lt: tomorrow },
        isPaid: false,
        $or: [
          { lastNotify: { $exists: false } },
          { lastNotify: null },
          { lastNotify: { $lt: today } },
        ],
      })
      .lean()
      .exec();

    console.log(`📋 Son ödeme tarihi bugün olan ${invoices.length} fatura bulundu`);

    return this.sendNotificationsForInvoices(
      invoices,
      "invoice-due",
      settings
    );
  }

  /**
   * Vadesi N gün geçmiş faturaları işler
   */
  private async processInvoicesOverdue(
    today: Date,
    days: number,
    settings: Awaited<ReturnType<NotificationSettingsService["getSettings"]>>
  ): Promise<{ sent: number; failed: number }> {
    // N gün önceki tarih
    const targetDate = new Date(today);
    targetDate.setDate(targetDate.getDate() - days);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Vadesi tam N gün önce dolmuş, ödenmemiş faturalar
    // Son N gün içinde bildirim gönderilmemiş olanlar
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - 1); // Dün

    const invoices = await this.invoiceModel
      .find({
        dueDate: { $gte: targetDate, $lt: nextDay },
        isPaid: false,
        $or: [
          { lastNotify: { $exists: false } },
          { lastNotify: null },
          { lastNotify: { $lt: checkDate } },
        ],
      })
      .lean()
      .exec();

    console.log(
      `📋 Vadesi ${days} gün önce dolmuş ${invoices.length} fatura bulundu`
    );

    // Template code'u belirle (3, 5, 10 gün için ayrı template)
    const templateSuffix = days <= 3 ? "3" : days <= 5 ? "5" : "5"; // 10 günlük için de 5 template'i kullan
    const templateCode = `invoice-overdue-${templateSuffix}`;

    return this.sendNotificationsForInvoices(
      invoices,
      templateCode,
      settings,
      days
    );
  }

  /**
   * Faturalar için bildirim gönderir
   */
  private async sendNotificationsForInvoices(
    invoices: Invoice[],
    templateCodeBase: string,
    settings: Awaited<ReturnType<NotificationSettingsService["getSettings"]>>,
    overdueDays?: number
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const invoice of invoices) {
      try {
        if (!invoice.customerId) {
          console.warn(
            `⚠️ Müşteri ID boş (Fatura: ${invoice.invoiceNumber}), atlanıyor`
          );
          failed++;
          continue;
        }

        // Müşteri bilgilerini al (Customer koleksiyonu id alanı üzerinden ilişkilendirilir)
        const customer = await this.customerModel
          .findOne({ id: invoice.customerId })
          .lean()
          .exec();

        if (!customer) {
          console.warn(
            `⚠️ Müşteri bulunamadı: ${invoice.customerId} (Fatura: ${invoice.invoiceNumber})`
          );
          failed++;
          continue;
        }

        // Fatura icin odeme linki olustur
        const paymentLinkUrl = await this.createPaymentLinkForInvoice(invoice, customer);

        // Template verileri hazırla
        const templateData = buildInvoiceTemplateData(
          invoice,
          customer,
          paymentLinkUrl,
          overdueDays
        );

        const notifications: DispatchNotificationDto[] = [];

        // Email bildirimi
        if (settings.emailEnabled && customer.email) {
          notifications.push({
            templateCode: `${templateCodeBase}-email`,
            channel: "email",
            recipient: {
              email: customer.email,
              name: customer.name,
            },
            contextType: "invoice",
            contextId: invoice.id,
            customerId: invoice.customerId,
            invoiceId: invoice.id,
            templateData,
          });
        }

        // SMS bildirimi
        if (settings.smsEnabled && customer.phone) {
          notifications.push({
            templateCode: `${templateCodeBase}-sms`,
            channel: "sms",
            recipient: {
              phone: customer.phone,
              name: customer.name,
            },
            contextType: "invoice",
            contextId: invoice.id,
            customerId: invoice.customerId,
            invoiceId: invoice.id,
            templateData,
          });
        }

        // Bildirimleri gönder
        const results = await this.dispatchService.dispatchBulk(notifications);

        const successCount = results.filter((r) => r.success).length;
        const failCount = results.filter((r) => !r.success).length;

        sent += successCount;
        failed += failCount;

        // Fatura kaydını güncelle
        if (successCount > 0) {
          await this.invoiceModel.updateOne(
            { _id: invoice._id },
            {
              $set: { lastNotify: new Date() },
              $push: {
                notify: {
                  sms: settings.smsEnabled,
                  email: settings.emailEnabled,
                  push: false,
                  sendTime: new Date(),
                  users: [
                    {
                      name: customer.name || "",
                      email: customer.email || "",
                      gsm: customer.phone || "",
                      smsText: "",
                    },
                  ],
                },
              },
            }
          );
        }
      } catch (error) {
        console.error(
          `❌ Fatura bildirimi gönderilemedi: ${invoice.invoiceNumber}`,
          error
        );
        failed++;
      }
    }

    return { sent, failed };
  }
}
