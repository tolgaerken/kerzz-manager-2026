import {
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model, SortOrder, Types } from "mongoose";
import { randomBytes } from "crypto";
import {
  PaymentLink,
  PaymentLinkDocument,
} from "./schemas/payment-link.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { CreatePaymentLinkDto } from "./dto/create-payment-link.dto";
import { PaymentLinkQueryDto } from "./dto/payment-link-query.dto";
import {
  PaginatedPaymentLinksResponseDto,
  PaymentInfoDto,
} from "./dto/payment-link-response.dto";
import { EmailService } from "../email/email.service";
import { SmsService } from "../sms/sms.service";
import { PaytrService } from "../paytr/paytr.service";
import {
  PaymentUserToken,
  PaymentUserTokenDocument,
} from "../automated-payments/schemas/payment-user-token.schema";
import {
  ContractPayment,
  ContractPaymentDocument,
} from "../contract-payments/schemas/contract-payment.schema";
import { SystemLogsService } from "../system-logs/system-logs.service";
import {
  SystemLogAction,
  SystemLogCategory,
  SystemLogStatus,
} from "../system-logs/schemas/system-log.schema";
import { NotificationSettingsService } from "../notification-settings/notification-settings.service";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly paymentBaseUrl: string;

  constructor(
    @InjectModel(PaymentLink.name, CONTRACT_DB_CONNECTION)
    private paymentLinkModel: Model<PaymentLinkDocument>,
    @InjectModel(PaymentUserToken.name, CONTRACT_DB_CONNECTION)
    private paymentUserTokenModel: Model<PaymentUserTokenDocument>,
    @InjectModel(ContractPayment.name, CONTRACT_DB_CONNECTION)
    private contractPaymentModel: Model<ContractPaymentDocument>,
    private configService: ConfigService,
    private emailService: EmailService,
    private smsService: SmsService,
    private paytrService: PaytrService,
    private systemLogsService: SystemLogsService,
    private notificationSettingsService: NotificationSettingsService
  ) {
    this.paymentBaseUrl =
      this.configService.get<string>("PAYMENT_BASE_URL") ||
      "http://localhost:3889";
  }

  /**
   * Odeme linki olustur - dogrudan PayTR token uret ve DB'ye yaz.
   */
  async createPaymentLink(
    dto: CreatePaymentLinkDto
  ): Promise<{ url: string; linkId: string }> {
    const linkId = randomBytes(16).toString("hex");
    const vpos = await this.paytrService.getVirtualPOSConfig(
      (dto.companyId as any) || "VERI"
    );

    const orderId = new Types.ObjectId().toString();
    const paymentAmount = this.roundNumber(dto.amount).toFixed(2);
    const installmentCount =
      dto.installment === 1 ? "0" : String(dto.installment ?? 0);
    const non3dStr = dto.non3d ? "1" : "0";
    const userIp = "127.0.0.1";

    const paytrToken = this.paytrService.generatePaymentToken({
      merchantId: vpos.merchantId,
      userIp,
      orderId,
      email: dto.email,
      paymentAmount,
      paymentType: "card",
      installmentCount,
      currency: "TL",
      non3d: non3dStr,
      storeKey: vpos.storeKey,
      provisionPassword: vpos.provisionPassword,
    });

    // DB'ye kaydet – token hash'inde kullanilan tum parametreler saklanmali
    await this.paymentLinkModel.create({
      linkId,
      id: orderId,
      staffName: dto.staffName || "Kerzz Manager",
      staffId: dto.staffId || "kerzz-manager",
      brand: dto.brand || "",
      customerId: dto.customerId || "",
      erpId: dto.erpId || "",
      amount: dto.amount,
      paymentAmount: paymentAmount,
      installmentCount,
      canRecurring: dto.canRecurring ?? false,
      companyId: dto.companyId,
      email: dto.email,
      name: dto.name,
      gsm: dto.gsm || "",
      customerName: dto.customerName,
      installment: dto.installment ?? 1,
      cardType: dto.cardType ?? "",
      non3d: dto.non3d ?? false,
      invoiceNo: dto.invoiceNo ?? "",
      status: "waiting",
      paytrToken,
      merchantId: vpos.merchantId,
      userIp,
      paymentType: "card",
      currency: "TL",
      createDate: new Date(),
      contextType: dto.contextType ?? "",
      contextId: dto.contextId ?? "",
      contractNo: dto.contractNo ?? "",
      notificationSource: dto.notificationSource ?? "",
    });

    const paymentUrl = `${this.paymentBaseUrl}/odeme/${linkId}`;
    return { url: paymentUrl, linkId };
  }

  /**
   * Odeme bilgisi getir - dogrudan MongoDB'den oku.
   */
  async getPaymentInfo(identifier: string): Promise<PaymentInfoDto> {
    const doc = await this.paymentLinkModel
      .findOne({
        $or: [
          { id: identifier },
          { linkId: identifier },
          ...(Types.ObjectId.isValid(identifier) && identifier.length === 24
            ? [{ _id: new Types.ObjectId(identifier) }]
            : []),
        ],
      })
      .lean()
      .exec();

    if (!doc) {
      throw new NotFoundException(
        `Odeme bilgisi bulunamadi: ${identifier}`
      );
    }

    const docAny = doc as any;

    // Ödeme linki açıldığında sistem logu oluştur
    this.systemLogsService
      .log(SystemLogCategory.SYSTEM, SystemLogAction.PAYMENT_LINK_OPENED, "payments", {
        entityId: docAny.linkId || docAny._id?.toString(),
        entityType: "PaymentLink",
        status: SystemLogStatus.SUCCESS,
        details: {
          customerId: docAny.customerId,
          customerName: docAny.customerName,
          amount: docAny.amount,
          invoiceNo: docAny.invoiceNo,
          contextType: docAny.contextType,
          contextId: docAny.contextId,
        },
      })
      .catch((err) => this.logger.error(`Payment link opened log hatası: ${err}`));

    return this.mapToPaymentInfo(doc);
  }

  /**
   * PayTR callback islemesi.
   * Smarty'deki paymentCallback mantigi birebir tasinmistir.
   */
  async handleCallback(body: Record<string, any>): Promise<void> {
    const merchantOid = body.merchant_oid as string;
    const status = body.status as string;
    const failedReasonMsg = body.failed_reason_msg as string;
    const utoken = body.utoken as string;

    const info = await this.paymentLinkModel
      .findOne({ $or: [{ id: merchantOid }, { linkId: merchantOid }] })
      .lean()
      .exec();

    if (!info) {
      this.logger.error(`Callback: odeme bulunamadi - ${merchantOid}`);
      return;
    }

    const infoDoc = info as any;
    const paymentId = infoDoc.id || infoDoc._id?.toString();

    // Odeme durumunu guncelle
    await this.updatePaymentStatus(
      paymentId,
      status,
      failedReasonMsg,
      utoken ? "saved" : "not-saved"
    );

    // Ödeme sonucu sistem logu oluştur
    const isSuccess = status === "success";
    const logAction = isSuccess
      ? SystemLogAction.PAYMENT_SUCCESS
      : SystemLogAction.PAYMENT_FAILED;
    const logStatus = isSuccess
      ? SystemLogStatus.SUCCESS
      : SystemLogStatus.FAILURE;

    await this.systemLogsService
      .log(SystemLogCategory.SYSTEM, logAction, "payments", {
        entityId: infoDoc.linkId || paymentId,
        entityType: "PaymentLink",
        status: logStatus,
        details: {
          customerId: infoDoc.customerId,
          customerName: infoDoc.customerName,
          amount: infoDoc.amount,
          invoiceNo: infoDoc.invoiceNo,
          contextType: infoDoc.contextType,
          contextId: infoDoc.contextId,
          failedReason: isSuccess ? undefined : failedReasonMsg,
        },
        errorMessage: isSuccess ? undefined : failedReasonMsg,
      })
      .catch((err) => this.logger.error(`Payment callback log hatası: ${err}`));

    // Başarılı ödemede yöneticilere email gönder (asenkron)
    if (isSuccess) {
      this.sendPaymentSuccessNotification(infoDoc).catch((err) =>
        this.logger.error(`Payment success email hatası: ${err}`)
      );
    }

    // 10 sn sonra kontrat odeme durumunu guncelle
    setTimeout(async () => {
      try {
        await this.updateContractPaymentStatus(
          paymentId,
          status,
          failedReasonMsg
        );

        if (infoDoc.invoiceNo) {
          await this.updateContractPaymentStatusByInvoiceNo(
            paymentId,
            infoDoc.invoiceNo,
            status,
            failedReasonMsg
          );
        }
      } catch (err) {
        this.logger.error(
          `Kontrat odeme guncelleme hatasi: ${err}`
        );
      }
    }, 10_000);

    // Kullanici tokenini kaydet (utoken varsa)
    if (utoken) {
      await this.saveUserToken({
        customerId: infoDoc.customerId || "",
        email: infoDoc.email || "",
        erpId: infoDoc.erpId || "",
        userToken: utoken,
        sourceId: paymentId,
        companyId: infoDoc.companyId || "VERI",
        userIp: infoDoc.userIp || "",
        source: infoDoc.source || "io",
        userId: infoDoc.userId || "",
      });
    }
  }

  /**
   * Odeme durumunu guncelle.
   */
  async updatePaymentStatus(
    id: string,
    status: string,
    statusMessage: string,
    statusCardSave: "none" | "saved" | "not-saved"
  ): Promise<void> {
    await this.paymentLinkModel
      .updateOne(
        { $or: [{ id }, { linkId: id }] },
        {
          $set: {
            status,
            statusMessage,
            lastEditDate: new Date(),
            statusCardSave,
          },
        }
      )
      .exec();
  }

  /**
   * Kontrat odeme durumu guncelle (onlinePaymentId ile).
   */
  async updateContractPaymentStatus(
    paymentId: string,
    status: string,
    statusMessage: string
  ): Promise<boolean> {
    const updateFields: Record<string, any> = {
      paid: status === "success",
    };

    if (status === "success") {
      updateFields.paymentDate = new Date();
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

    if (!result) {
      this.logger.warn(
        `Kontrat odemesi bulunamadi: onlinePaymentId=${paymentId}`
      );
      return false;
    }

    const invoiceNo = (result as any).invoiceNo;
    if (invoiceNo) {
      await this.updateGlobalInvoice(
        invoiceNo,
        status === "success",
        status === "success" ? new Date() : undefined
      );
    }

    return true;
  }

  /**
   * Fatura numarasina gore kontrat odeme durumu guncelle.
   */
  async updateContractPaymentStatusByInvoiceNo(
    paymentId: string,
    invoiceNo: string,
    status: string,
    statusMessage: string
  ): Promise<boolean> {
    const invoiceNumbers = invoiceNo
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    const updateFields: Record<string, any> = {
      paid: status === "success",
      isPaid: status === "success",
    };

    if (status === "success") {
      updateFields.paymentDate = new Date();
      updateFields.paymentSuccessDate = new Date();
    } else {
      updateFields.onlinePaymentError = statusMessage;
    }

    let updatedCount = 0;

    for (const currentInvoiceNo of invoiceNumbers) {
      const result = await this.contractPaymentModel
        .findOneAndUpdate(
          { invoiceNo: currentInvoiceNo },
          { $set: updateFields },
          { returnDocument: "after" }
        )
        .lean()
        .exec();

      if (result) {
        updatedCount++;
        await this.updateGlobalInvoice(
          currentInvoiceNo,
          status === "success",
          status === "success" ? new Date() : undefined
        );
      }
    }

    return updatedCount > 0;
  }

  /**
   * Odeme linklerini listele.
   */
  async findAll(
    query: PaymentLinkQueryDto
  ): Promise<PaginatedPaymentLinksResponseDto> {
    const {
      page = 1,
      limit = 50,
      dateFrom,
      dateTo,
      status,
      customerId,
      search,
      sortField = "createDate",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (dateFrom || dateTo) {
      filter.createDate = {};
      if (dateFrom) {
        (filter.createDate as Record<string, Date>).$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // dateTo'yu günün sonuna ayarla (23:59:59.999)
        const endOfDay = new Date(dateTo);
        endOfDay.setHours(23, 59, 59, 999);
        (filter.createDate as Record<string, Date>).$lte = endOfDay;
      }
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filter.createDate = { $gte: thirtyDaysAgo };
    }

    if (status) filter.status = status;
    if (customerId) filter.customerId = customerId;

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { linkId: { $regex: search, $options: "i" } },
      ];
    }

    const sort: Record<string, SortOrder> = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    const [docs, total] = await Promise.all([
      this.paymentLinkModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.paymentLinkModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    const data = docs.map((doc: any) => ({
      _id: doc._id?.toString() ?? "",
      linkId:
        typeof doc.linkId === "string" && doc.linkId.length > 0
          ? doc.linkId
          : doc._id?.toString() ?? "",
      staffName: doc.staffName ?? "",
      staffId: doc.staffId ?? "",
      customerId: doc.customerId ?? "",
      customerName: doc.customerName ?? "",
      email: doc.email ?? "",
      name: doc.name ?? "",
      gsm: doc.gsm ?? "",
      amount: doc.amount ?? 0,
      status: doc.status ?? "",
      statusMessage: doc.statusMessage ?? "",
      companyId: doc.companyId ?? "",
      createDate: doc.createDate,
    }));

    return { data, pagination: { page, limit, total, totalPages } };
  }

  /**
   * Bildirim gonder (e-posta / SMS).
   */
  async sendNotification(
    linkId: string
  ): Promise<{ email: boolean; sms: boolean }> {
    const info = await this.getPaymentInfo(linkId);
    const paymentUrl = `${this.paymentBaseUrl}/odeme/${linkId}`;
    const amountStr = new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(info.paymentAmount);
    const company = (info.customerName || "").slice(0, 20);

    const smsText = `Kerzz: ${company} icin ${amountStr} odeme linki: ${paymentUrl}`;
    const emailHtml = `<p>Sayin ${info.name},</p><p>${company} adina ${amountStr} tutarinda odeme linki:</p><p><a href="${paymentUrl}">Odeme yap</a></p>`;

    let emailSent = false;
    let smsSent = false;

    if (info.email) {
      const emailResult = await this.emailService.send({
        to: info.email,
        subject: "Kerzz Odeme Linki",
        html: emailHtml,
      });
      emailSent = emailResult.success;
    }

    if (info.gsm) {
      const smsResult = await this.smsService.send({
        to: info.gsm,
        message: smsText,
      });
      smsSent = smsResult.success;
    }

    return { email: emailSent, sms: smsSent };
  }

  // ── Private Helpers ──────────────────────────────────────────────

  private async saveUserToken(data: {
    customerId: string;
    email: string;
    erpId: string;
    userToken: string;
    sourceId: string;
    companyId: string;
    userIp: string;
    source: string;
    userId: string;
  }): Promise<void> {
    await this.paymentUserTokenModel.create({
      id: new Types.ObjectId().toString(),
      createDate: new Date(),
      ...data,
    });
  }

  private async updateGlobalInvoice(
    invoiceNo: string,
    isPaid: boolean,
    paymentSuccessDate?: Date
  ): Promise<void> {
    // global-invoices koleksiyonu ayni DB'de
    // Mongoose'da register edilmemis koleksiyon icin dogrudan collection kullan
    const db = this.paymentLinkModel.db;
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

  private mapToPaymentInfo(doc: any): PaymentInfoDto {
    return {
      id: doc.id || doc._id?.toString() || "",
      linkId: doc.linkId ?? "",
      paytrToken: doc.paytrToken ?? "",
      merchantId: doc.merchantId ?? "",
      paymentAmount: doc.paymentAmount || (doc.amount ?? 0),
      paymentType: doc.paymentType ?? "card",
      currency: doc.currency ?? "TL",
      installmentCount: doc.installmentCount ?? String(doc.installment ?? 1),
      non3d: typeof doc.non3d === "string" ? doc.non3d : (doc.non3d ? "1" : "0"),
      storeCard: doc.storeCard ?? "0",
      userIp: doc.userIp ?? "127.0.0.1",
      postUrl: doc.postUrl ?? "",
      status: doc.status ?? "",
      statusMessage: doc.statusMessage ?? "",
      email: doc.email ?? "",
      name: doc.name ?? "",
      gsm: doc.gsm ?? "",
      customerName: doc.customerName ?? "",
      customerId: doc.customerId ?? "",
      companyId: doc.companyId ?? "",
      amount: doc.amount ?? 0,
      canRecurring: doc.canRecurring ?? false,
      staffName: doc.staffName ?? "",
      staffId: doc.staffId ?? "",
      createDate: doc.createDate,
    };
  }

  private roundNumber(num: number): number {
    return Math.round(num * 100) / 100;
  }

  /**
   * Başarılı ödeme sonrası yöneticilere email bildirimi gönderir.
   */
  private async sendPaymentSuccessNotification(paymentInfo: any): Promise<void> {
    const settings = await this.notificationSettingsService.getSettings();
    const emails = settings.paymentSuccessNotifyEmails || [];

    if (emails.length === 0) {
      return;
    }

    const amountStr = new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(paymentInfo.amount || 0);

    const dateStr = new Date().toLocaleString("tr-TR", {
      dateStyle: "short",
      timeStyle: "short",
    });

    const customerName = paymentInfo.customerName || paymentInfo.name || "Bilinmiyor";
    const invoiceNo = paymentInfo.invoiceNo || "-";

    const subject = `Ödeme Başarılı - ${customerName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">✓ Ödeme Başarılı</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;"><strong>Müşteri:</strong></td>
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
          <tr>
            <td style="padding: 8px 0;"><strong>Tarih:</strong></td>
            <td style="padding: 8px 0;">${dateStr}</td>
          </tr>
        </table>
        <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
          Bu email otomatik olarak gönderilmiştir.
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
        this.logger.log(`Ödeme başarı bildirimi gönderildi: ${email}`);
      } catch (err) {
        this.logger.error(`Ödeme başarı bildirimi gönderilemedi (${email}): ${err}`);
      }
    }
  }
}
