import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { CRON_JOB_NAMES } from "./cron-scheduler.service";
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
  formatDate,
  formatCurrency,
} from "../notification-queue/notification-data.helper";
import {
  SystemLogsService,
  SystemLogAction,
} from "../system-logs";
import type {
  InvoiceNotificationDryRunResponse,
  InvoiceDryRunItem,
  DryRunNotificationItem,
} from "./dto/dry-run.dto";

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
        contextType: "invoice",
        contextId: invoice.id,
        notificationSource: "cron",
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
   * Fatura son ödeme tarihi hatırlatmaları ve vadesi geçmiş bildirimleri gönderir
   * Varsayılan: Her gün 09:00 (DB ayarlarından değiştirilebilir)
   */
  @Cron("0 9 * * *", {
    name: CRON_JOB_NAMES.INVOICE_NOTIFICATION,
    timeZone: "Europe/Istanbul",
  })
  async handleInvoiceNotifications(): Promise<void> {
    const startTime = Date.now();

    try {
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

      if (settings.dryRunMode) {
        console.log("🧪 [DRY RUN] Fatura bildirim cron'u kuru çalışma modunda — gerçek gönderim yapılmayacak");
      }

      // Cron başlangıcını logla (ayar kontrolleri geçtikten sonra)
      await this.systemLogsService.logCron(
        SystemLogAction.CRON_START,
        "invoice-notification",
        { details: { message: "Fatura bildirim cron'u başladı" } }
      );

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

    // Vadesi tam N gün önce dolmuş, ödenmemiş ve bugün henüz bildirim gönderilmemiş faturalar
    const invoices = await this.invoiceModel
      .find({
        dueDate: { $gte: targetDate, $lt: nextDay },
        isPaid: false,
        $or: [
          { lastNotify: { $exists: false } },
          { lastNotify: null },
          { lastNotify: { $lt: today } },
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
    let skippedDuplicate = 0;

    // Tüm fatura ID'leri için daha önce gönderilmiş templateCode'ları al
    const invoiceIds = invoices.map((inv) => inv.id).filter(Boolean);
    const sentConditionsMap =
      await this.dispatchService.getDistinctTemplateCodesForInvoices(invoiceIds);

    for (const invoice of invoices) {
      try {
        if (!invoice.customerId) {
          console.warn(
            `⚠️ Müşteri ID boş (Fatura: ${invoice.invoiceNumber}), atlanıyor`
          );
          failed++;
          continue;
        }

        // Bu fatura için daha önce gönderilmiş templateCode'ları kontrol et
        const sentConditions = sentConditionsMap.get(invoice.id) ?? [];
        const emailTemplateCode = `${templateCodeBase}-email`;
        const smsTemplateCode = `${templateCodeBase}-sms`;

        const emailAlreadySent = sentConditions.includes(emailTemplateCode);
        const smsAlreadySent = sentConditions.includes(smsTemplateCode);

        // Her iki kanal için de daha önce gönderilmişse atla
        if (emailAlreadySent && smsAlreadySent) {
          console.log(
            `⏭️ Fatura ${invoice.invoiceNumber} için ${templateCodeBase} koşulu zaten gönderilmiş, atlanıyor`
          );
          skippedDuplicate++;
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

        // DRY RUN MODU: Gerçek gönderim yapma, sadece logla
        if (settings.dryRunMode) {
          const channels: string[] = [];
          if (settings.emailEnabled && customer.email && !emailAlreadySent)
            channels.push(`email(${customer.email})`);
          if (settings.smsEnabled && customer.phone && !smsAlreadySent)
            channels.push(`sms(${customer.phone})`);
          console.log(
            `🧪 [DRY RUN] Fatura bildirimi atlanıyor — Fatura: ${invoice.invoiceNumber}, Müşteri: ${customer.name}, Kanallar: ${channels.join(", ") || "yok"}`
          );
          sent += channels.length;
          continue;
        }

        // Fatura icin odeme linki olustur
        const paymentLinkUrl = await this.createPaymentLinkForInvoice(invoice, customer);

        // Template verileri hazırla
        const templateData = buildInvoiceTemplateData(
          invoice,
          customer,
          paymentLinkUrl,
          overdueDays,
          "cron"
        );

        const notifications: DispatchNotificationDto[] = [];

        // Email bildirimi (daha önce gönderilmemişse)
        if (settings.emailEnabled && customer.email && !emailAlreadySent) {
          notifications.push({
            templateCode: emailTemplateCode,
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

        // SMS bildirimi (daha önce gönderilmemişse)
        if (settings.smsEnabled && customer.phone && !smsAlreadySent) {
          notifications.push({
            templateCode: smsTemplateCode,
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

        // Gönderilecek bildirim yoksa atla
        if (notifications.length === 0) {
          console.log(
            `⏭️ Fatura ${invoice.invoiceNumber} için gönderilecek yeni bildirim yok`
          );
          continue;
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
                  sms: settings.smsEnabled && !smsAlreadySent,
                  email: settings.emailEnabled && !emailAlreadySent,
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

    if (skippedDuplicate > 0) {
      console.log(`⏭️ ${skippedDuplicate} fatura duplicate koşul nedeniyle atlandı`);
    }

    return { sent, failed };
  }

  /**
   * Dry run: Gercek bildirim gondermeden ne olacagini raporlar.
   * Odeme linki olusturma gibi yan etkiler atlanir.
   */
  async dryRun(): Promise<InvoiceNotificationDryRunResponse> {
    const startTime = Date.now();
    const settings = await this.settingsService.getSettings();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const items: InvoiceDryRunItem[] = [];
    let emailCount = 0;
    let smsCount = 0;
    let totalDue = 0;
    let totalOverdue = 0;

    // 1. Son odeme tarihi bugun olan faturalar
    if (settings.invoiceDueReminderDays.includes(0)) {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

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

      totalDue = invoices.length;

      for (const invoice of invoices) {
        const result = await this.buildDryRunItem(
          invoice, "invoice-due", settings, "due"
        );
        items.push(result.item);
        emailCount += result.emailCount;
        smsCount += result.smsCount;
      }
    }

    // 2. Vadesi gecmis faturalar
    const lookbackDays = settings.invoiceLookbackDays ?? 90;
    for (const days of settings.invoiceOverdueDays) {
      if (days > lookbackDays) continue;

      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() - days);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const invoices = await this.invoiceModel
        .find({
          dueDate: { $gte: targetDate, $lt: nextDay },
          isPaid: false,
          $or: [
            { lastNotify: { $exists: false } },
            { lastNotify: null },
            { lastNotify: { $lt: today } },
          ],
        })
        .lean()
        .exec();

      totalOverdue += invoices.length;

      const templateSuffix = days <= 3 ? "3" : days <= 5 ? "5" : "5";
      const templateCode = `invoice-overdue-${templateSuffix}`;

      for (const invoice of invoices) {
        const result = await this.buildDryRunItem(
          invoice, templateCode, settings, "overdue", days
        );
        items.push(result.item);
        emailCount += result.emailCount;
        smsCount += result.smsCount;
      }
    }

    return {
      cronName: "invoice-notification",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      settings: {
        cronEnabled: settings.cronEnabled,
        invoiceNotificationCronEnabled: settings.invoiceNotificationCronEnabled,
        emailEnabled: settings.emailEnabled,
        smsEnabled: settings.smsEnabled,
        invoiceDueReminderDays: settings.invoiceDueReminderDays,
        invoiceOverdueDays: settings.invoiceOverdueDays,
        invoiceLookbackDays: settings.invoiceLookbackDays ?? 90,
      },
      summary: {
        totalInvoicesDue: totalDue,
        totalInvoicesOverdue: totalOverdue,
        totalNotificationsWouldSend: emailCount + smsCount,
        byChannel: { email: emailCount, sms: smsCount },
      },
      items,
    };
  }

  /**
   * Tek bir fatura icin dry run item'i olusturur (yan etkisiz)
   */
  private async buildDryRunItem(
    invoice: Invoice,
    templateCodeBase: string,
    settings: Awaited<ReturnType<NotificationSettingsService["getSettings"]>>,
    status: "due" | "overdue",
    overdueDays?: number,
  ): Promise<{ item: InvoiceDryRunItem; emailCount: number; smsCount: number }> {
    let ec = 0;
    let sc = 0;

    if (!invoice.customerId) {
      return {
        item: {
          invoiceNumber: invoice.invoiceNumber || "",
          invoiceId: invoice.id,
          customerId: "",
          customerName: "",
          grandTotal: invoice.grandTotal || 0,
          dueDate: invoice.dueDate ? formatDate(invoice.dueDate) : "",
          overdueDays,
          status,
          notifications: [],
          skippedReason: "Musteri ID bos",
        },
        emailCount: 0,
        smsCount: 0,
      };
    }

    const customer = await this.customerModel
      .findOne({ id: invoice.customerId })
      .lean()
      .exec();

    if (!customer) {
      return {
        item: {
          invoiceNumber: invoice.invoiceNumber || "",
          invoiceId: invoice.id,
          customerId: invoice.customerId,
          customerName: "",
          grandTotal: invoice.grandTotal || 0,
          dueDate: invoice.dueDate ? formatDate(invoice.dueDate) : "",
          overdueDays,
          status,
          notifications: [],
          skippedReason: `Musteri bulunamadi: ${invoice.customerId}`,
        },
        emailCount: 0,
        smsCount: 0,
      };
    }

    // Dry run'da gercek odeme linki olusturmuyoruz
    const paymentLinkUrl = `${this.paymentBaseUrl}/odeme/${invoice.id}`;

    const templateData = buildInvoiceTemplateData(
      invoice, customer, paymentLinkUrl, overdueDays, "cron"
    );

    const notifications: DryRunNotificationItem[] = [];

    if (settings.emailEnabled && customer.email) {
      notifications.push({
        templateCode: `${templateCodeBase}-email`,
        channel: "email",
        recipient: { email: customer.email, name: customer.name },
        contextType: "invoice",
        contextId: invoice.id,
        customerId: invoice.customerId,
        templateData,
      });
      ec++;
    }

    if (settings.smsEnabled && customer.phone) {
      notifications.push({
        templateCode: `${templateCodeBase}-sms`,
        channel: "sms",
        recipient: { phone: customer.phone, name: customer.name },
        contextType: "invoice",
        contextId: invoice.id,
        customerId: invoice.customerId,
        templateData,
      });
      sc++;
    }

    return {
      item: {
        invoiceNumber: invoice.invoiceNumber || "",
        invoiceId: invoice.id,
        customerId: invoice.customerId || "",
        customerName: customer.name || customer.brand || "",
        grandTotal: invoice.grandTotal || 0,
        dueDate: invoice.dueDate ? formatDate(invoice.dueDate) : "",
        overdueDays,
        status,
        notifications,
      },
      emailCount: ec,
      smsCount: sc,
    };
  }
}
