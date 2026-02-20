import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ChangeStreamService } from "../mongo-ws/change-stream.service";
import { MongoChangeEvent } from "../mongo-ws/mongo-ws.types";
import { SystemLogsService } from "../system-logs/system-logs.service";
import {
  SystemLogAction,
  SystemLogCategory,
  SystemLogStatus,
} from "../system-logs/schemas/system-log.schema";
import { ManagerLogService } from "../manager-log/manager-log.service";
import { EmailService } from "../email/email.service";
import { NotificationSettingsService } from "../notification-settings/notification-settings.service";
import {
  ContractPayment,
  ContractPaymentDocument,
} from "../contract-payments/schemas/contract-payment.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";

interface PaymentDocument {
  _id: string;
  id?: string;
  linkId?: string;
  status: string;
  statusMessage?: string;
  customerId?: string;
  customerName?: string;
  name?: string;
  amount?: number;
  invoiceNo?: string;
  contextType?: string;
  contextId?: string;
  contractNo?: string;
}

@Injectable()
export class PaymentStatusChangeHandler implements OnModuleInit {
  private readonly logger = new Logger(PaymentStatusChangeHandler.name);
  private readonly processedEvents = new Map<string, number>();
  private readonly EVENT_TTL_MS = 60_000;

  constructor(
    @InjectModel(ContractPayment.name, CONTRACT_DB_CONNECTION)
    private contractPaymentModel: Model<ContractPaymentDocument>,
    private changeStreamService: ChangeStreamService,
    private systemLogsService: SystemLogsService,
    private managerLogService: ManagerLogService,
    private emailService: EmailService,
    private notificationSettingsService: NotificationSettingsService
  ) {}

  onModuleInit() {
    this.changeStreamService.registerChangeHandler(
      "online-payments",
      this.handlePaymentChange.bind(this)
    );
    this.logger.log("PaymentStatusChangeHandler online-payments icin kaydedildi");

    setInterval(() => this.cleanupProcessedEvents(), this.EVENT_TTL_MS);
  }

  private async handlePaymentChange(event: MongoChangeEvent): Promise<void> {
    if (event.operationType !== "update") {
      return;
    }

    const statusChanged = event.updatedFields?.status !== undefined;
    if (!statusChanged) {
      return;
    }

    const eventKey = `${event.documentId}:${event.updatedFields?.status}`;
    if (this.processedEvents.has(eventKey)) {
      this.logger.debug(`Duplicate event atlandi: ${eventKey}`);
      return;
    }
    this.processedEvents.set(eventKey, Date.now());

    const fullDoc = event.fullDocument as PaymentDocument | undefined;
    if (!fullDoc) {
      this.logger.warn(`fullDocument yok, event islenmedi: ${event.documentId}`);
      return;
    }

    const status = fullDoc.status;
    const isSuccess = status === "success";
    const isFailed = status === "failed";

    if (!isSuccess && !isFailed) {
      return;
    }

    this.logger.log(
      `Odeme status degisikligi isleniyor: ${event.documentId}, status=${status}`
    );

    try {
      await this.logPaymentResult(fullDoc, isSuccess);
      await this.processInvoiceMarking(fullDoc, isSuccess);
      await this.createManagerLog(fullDoc, isSuccess);
      await this.sendAdminNotification(fullDoc, isSuccess);
    } catch (err) {
      this.logger.error(`Odeme status isleme hatasi: ${err}`);
    }
  }

  private async logPaymentResult(
    doc: PaymentDocument,
    isSuccess: boolean
  ): Promise<void> {
    const logAction = isSuccess
      ? SystemLogAction.PAYMENT_SUCCESS
      : SystemLogAction.PAYMENT_FAILED;
    const logStatus = isSuccess
      ? SystemLogStatus.SUCCESS
      : SystemLogStatus.FAILURE;

    await this.systemLogsService
      .log(SystemLogCategory.SYSTEM, logAction, "payments", {
        entityId: doc.linkId || doc.id || doc._id,
        entityType: "PaymentLink",
        status: logStatus,
        details: {
          customerId: doc.customerId,
          customerName: doc.customerName || doc.name,
          amount: doc.amount,
          invoiceNo: doc.invoiceNo,
          contextType: doc.contextType,
          contextId: doc.contextId,
          failedReason: isSuccess ? undefined : doc.statusMessage,
        },
        errorMessage: isSuccess ? undefined : doc.statusMessage,
      })
      .catch((err) => this.logger.error(`Payment result log hatasi: ${err}`));
  }

  private async processInvoiceMarking(
    doc: PaymentDocument,
    isSuccess: boolean
  ): Promise<void> {
    const paymentId = doc.id || doc._id;
    const invoiceNo = doc.invoiceNo;
    const statusMessage = doc.statusMessage || "";

    try {
      let statusUpdated = false;
      let invoiceUpdated = false;

      const updateFields: Record<string, unknown> = {
        paid: isSuccess,
        isPaid: isSuccess,
      };

      if (isSuccess) {
        updateFields.paymentDate = new Date();
        updateFields.paymentSuccessDate = new Date();
      } else {
        updateFields.onlinePaymentError = statusMessage;
      }

      const result = await this.contractPaymentModel
        .findOneAndUpdate(
          { onlinePaymentId: paymentId },
          { $set: updateFields },
          { returnDocument: "after" }
        )
        .lean()
        .exec();

      if (result) {
        statusUpdated = true;
        const resultInvoiceNo = (result as unknown as { invoiceNo?: string }).invoiceNo;
        if (resultInvoiceNo) {
          await this.updateGlobalInvoice(
            resultInvoiceNo,
            isSuccess,
            isSuccess ? new Date() : undefined
          );
        }
      }

      if (invoiceNo) {
        const invoiceNumbers = invoiceNo
          .split(",")
          .map((n) => n.trim())
          .filter((n) => n.length > 0);

        for (const currentInvoiceNo of invoiceNumbers) {
          const invoiceResult = await this.contractPaymentModel
            .findOneAndUpdate(
              { invoiceNo: currentInvoiceNo },
              { $set: updateFields },
              { returnDocument: "after" }
            )
            .lean()
            .exec();

          if (invoiceResult) {
            invoiceUpdated = true;
            await this.updateGlobalInvoice(
              currentInvoiceNo,
              isSuccess,
              isSuccess ? new Date() : undefined
            );
          }
        }
      }

      const markingSuccess = statusUpdated || invoiceUpdated;
      const logAction =
        markingSuccess && isSuccess
          ? SystemLogAction.INVOICE_MARKED_PAID
          : SystemLogAction.INVOICE_MARKING_FAILED;
      const logStatus =
        markingSuccess && isSuccess
          ? SystemLogStatus.SUCCESS
          : SystemLogStatus.FAILURE;

      const logMessage = isSuccess
        ? markingSuccess
          ? `${invoiceNo || doc.contextId} nolu fatura odendi olarak isaretlendi`
          : `${invoiceNo || doc.contextId} nolu fatura isaretlenemedi - kayit bulunamadi`
        : `${invoiceNo || doc.contextId} nolu fatura odeme basarisiz: ${statusMessage}`;

      await this.systemLogsService
        .log(SystemLogCategory.SYSTEM, logAction, "payments", {
          entityId: invoiceNo || doc.contextId || paymentId,
          entityType: "Invoice",
          status: logStatus,
          details: {
            customerId: doc.customerId,
            customerName: doc.customerName || doc.name,
            invoiceNo,
            contractNo: doc.contractNo,
            contextId: doc.contextId,
            paymentId,
            statusUpdated,
            invoiceUpdated,
            message: logMessage,
            failedReason: isSuccess ? undefined : statusMessage,
          },
          errorMessage:
            markingSuccess && isSuccess
              ? undefined
              : statusMessage || "Kayit bulunamadi",
        })
        .catch((err) => this.logger.error(`Invoice marking log hatasi: ${err}`));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.logger.error(`Fatura isaretleme hatasi: ${errorMessage}`);

      await this.systemLogsService
        .log(SystemLogCategory.SYSTEM, SystemLogAction.INVOICE_MARKING_FAILED, "payments", {
          entityId: invoiceNo || doc.contextId || paymentId,
          entityType: "Invoice",
          status: SystemLogStatus.ERROR,
          details: {
            customerId: doc.customerId,
            customerName: doc.customerName || doc.name,
            invoiceNo,
            contractNo: doc.contractNo,
            contextId: doc.contextId,
            paymentId,
          },
          errorMessage,
        })
        .catch((logErr) =>
          this.logger.error(`Invoice marking error log hatasi: ${logErr}`)
        );
    }
  }

  private async updateGlobalInvoice(
    invoiceNo: string,
    isPaid: boolean,
    paymentSuccessDate?: Date
  ): Promise<void> {
    const db = this.contractPaymentModel.db;
    await db.collection("global-invoices").updateOne(
      { invoiceNumber: invoiceNo },
      {
        $set: {
          isPaid,
          ...(paymentSuccessDate ? { paymentSuccessDate } : {}),
        },
      }
    );
  }

  private async createManagerLog(
    doc: PaymentDocument,
    isSuccess: boolean
  ): Promise<void> {
    const customerId = doc.customerId;
    if (!customerId) {
      return;
    }

    const invoiceNo = doc.invoiceNo || doc.contextId || doc.id || doc._id;
    const statusMessage = doc.statusMessage;

    try {
      const message = isSuccess
        ? `${invoiceNo} nolu fatura odendi olarak isaretlendi.`
        : `${invoiceNo} nolu fatura odemesi basarisiz: ${statusMessage || "Bilinmeyen hata"}`;

      await this.managerLogService.create({
        customerId,
        contextType: "invoice",
        contextId: invoiceNo,
        message,
        authorId: "system",
        authorName: "Sistem",
        references: [
          {
            type: "invoice",
            id: invoiceNo,
            label: `Fatura #${invoiceNo}`,
          },
        ],
      });
    } catch (err) {
      this.logger.error(`Manager log olusturma hatasi: ${err}`);
    }
  }

  private async sendAdminNotification(
    doc: PaymentDocument,
    isSuccess: boolean
  ): Promise<void> {
    const settings = await this.notificationSettingsService.getSettings();
    const emails = settings.paymentSuccessNotifyEmails || [];

    if (emails.length === 0) {
      return;
    }

    const amountStr = new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(doc.amount || 0);

    const dateStr = new Date().toLocaleString("tr-TR", {
      dateStyle: "short",
      timeStyle: "short",
    });

    const customerName = doc.customerName || doc.name || "Bilinmiyor";
    const invoiceNo = doc.invoiceNo || "-";

    const subject = isSuccess
      ? `Odeme Basarili - ${customerName}`
      : `Odeme Basarisiz - ${customerName}`;

    const statusIcon = isSuccess ? "✓" : "✗";
    const statusColor = isSuccess ? "#22c55e" : "#ef4444";
    const statusText = isSuccess ? "Odeme Basarili" : "Odeme Basarisiz";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${statusColor};">${statusIcon} ${statusText}</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Musteri:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${customerName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Tutar:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${amountStr}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Fatura No:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">${invoiceNo}</td>
          </tr>
          ${
            !isSuccess && doc.statusMessage
              ? `<tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Hata:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; color: #ef4444;">${doc.statusMessage}</td>
          </tr>`
              : ""
          }
          <tr>
            <td style="padding: 8px 0;"><strong>Tarih:</strong></td>
            <td style="padding: 8px 0;">${dateStr}</td>
          </tr>
        </table>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          Bu email otomatik olarak gonderilmistir.
        </p>
      </div>
    `;

    for (const email of emails) {
      try {
        await this.emailService.send({
          to: email,
          subject,
          html,
        });
        this.logger.log(`Odeme bildirimi gonderildi: ${email}`);
      } catch (err) {
        this.logger.error(`Odeme bildirimi gonderilemedi (${email}): ${err}`);
      }
    }
  }

  private cleanupProcessedEvents(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.processedEvents) {
      if (now - timestamp > this.EVENT_TTL_MS) {
        this.processedEvents.delete(key);
      }
    }
  }
}
