import { Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model, SortOrder, Types } from "mongoose";
import { randomBytes } from "crypto";
import {
  PaymentLink,
  PaymentLinkDocument
} from "./schemas/payment-link.schema";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { CreatePaymentLinkDto } from "./dto/create-payment-link.dto";
import { PaymentLinkQueryDto } from "./dto/payment-link-query.dto";
import {
  PaginatedPaymentLinksResponseDto,
  PaymentInfoDto
} from "./dto/payment-link-response.dto";
import { EmailService } from "../email/email.service";
import { SmsService } from "../sms/sms.service";

const SMARTY_API_KEY = "1453";

@Injectable()
export class PaymentsService {
  private readonly smartyBaseUrl: string;
  private readonly paymentBaseUrl: string;

  constructor(
    @InjectModel(PaymentLink.name, CONTRACT_DB_CONNECTION)
    private paymentLinkModel: Model<PaymentLinkDocument>,
    private configService: ConfigService,
    private emailService: EmailService,
    private smsService: SmsService
  ) {
    this.smartyBaseUrl =
      this.configService.get<string>("SMARTY_API_URL") ||
      "https://smarty.kerzz.com:4004";
    this.paymentBaseUrl =
      this.configService.get<string>("PAYMENT_BASE_URL") ||
      "http://localhost:5173";
  }

  private generateLinkId(): string {
    return randomBytes(16).toString("hex");
  }

  private getSmartyHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      apikey: SMARTY_API_KEY
    };
  }

  async createPaymentLink(dto: CreatePaymentLinkDto): Promise<{ url: string; linkId: string }> {
    const linkId = this.generateLinkId();

    const payload = {
      linkId,
      staffName: dto.staffName || "Kerzz Manager",
      staffId: dto.staffId || "kerzz-manager",
      brand: dto.brand || "",
      customerId: dto.customerId || "",
      erpId: dto.erpId || "",
      amount: dto.amount,
      canRecurring: dto.canRecurring ?? false,
      validty: undefined as Date | undefined,
      companyId: dto.companyId,
      email: dto.email,
      name: dto.name,
      gsm: dto.gsm || "",
      customerName: dto.customerName,
      installment: dto.installment ?? 1,
      cardType: dto.cardType ?? "",
      non3d: dto.non3d ?? false,
      invoiceNo: dto.invoiceNo ?? ""
    };

    const url = `${this.smartyBaseUrl}/api/payment/createOnlinePaymentInfo`;
    const response = await fetch(url, {
      method: "POST",
      headers: this.getSmartyHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Smarty API hatası: ${response.status} ${errText}`);
    }

    const paymentUrl = `${this.paymentBaseUrl}/odeme/${linkId}`;
    return { url: paymentUrl, linkId };
  }

  /**
   * Smarty API'den ödeme bilgisi al.
   * Gelen identifier bir MongoDB _id olabilir (eski kayıtlar için fallback).
   * Bu durumda önce yerel DB'de gerçek linkId'yi bul, sonra Smarty'ye onu gönder.
   */
  async getPaymentInfo(identifier: string): Promise<PaymentInfoDto> {
    let smartyId = identifier;

    // identifier bir MongoDB ObjectId ise, yerel DB'den gerçek linkId'yi bul
    if (Types.ObjectId.isValid(identifier) && identifier.length === 24) {
      const localDoc = await this.paymentLinkModel
        .findOne({
          $or: [
            { _id: new Types.ObjectId(identifier) },
            { linkId: identifier }
          ]
        })
        .lean()
        .exec();

      if (localDoc) {
        const doc = localDoc as any;
        // Smarty'nin tanıyacağı ID'yi bul: önce linkId, sonra id alanı
        if (typeof doc.linkId === "string" && doc.linkId.length > 0) {
          smartyId = doc.linkId;
        } else if (typeof doc.id === "string" && doc.id.length > 0) {
          smartyId = doc.id;
        }
        // Hala aynı _id ise Smarty bunu tanımayacak - local datayı döndür
        if (smartyId === identifier || smartyId === doc._id?.toString()) {
          return this.buildLocalPaymentInfo(doc);
        }
      }
    }

    return this.fetchFromSmarty(smartyId);
  }

  private async fetchFromSmarty(smartyId: string): Promise<PaymentInfoDto> {
    const url = `${this.smartyBaseUrl}/api/payment/getOnlinePaymentInfo`;
    const response = await fetch(url, {
      method: "POST",
      headers: this.getSmartyHeaders(),
      body: JSON.stringify({ id: smartyId })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new NotFoundException(`Ödeme bilgisi alınamadı: ${errText}`);
    }

    const text = await response.text();
    if (!text || text.trim().length === 0) {
      throw new NotFoundException(
        `Bu linkId için ödeme bilgisi bulunamadı: ${smartyId}`
      );
    }

    try {
      const data = JSON.parse(text) as PaymentInfoDto;
      return data;
    } catch {
      throw new NotFoundException(
        `Ödeme bilgisi ayrıştırılamadı (linkId: ${smartyId})`
      );
    }
  }

  private buildLocalPaymentInfo(doc: any): PaymentInfoDto {
    return {
      id: doc._id?.toString() ?? "",
      linkId: doc.linkId ?? "",
      paytrToken: doc.paytrToken ?? "",
      merchantId: doc.merchantId ?? "",
      paymentAmount: doc.amount ?? 0,
      currency: "TL",
      installmentCount: String(doc.installment ?? 1),
      non3d: doc.non3d ? "1" : "0",
      storeCard: "0",
      userIp: "",
      postUrl: "",
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
      createDate: doc.createDate?.toISOString?.() ?? ""
    };
  }

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
      sortOrder = "desc"
    } = query;

    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (dateFrom || dateTo) {
      filter.createDate = {};
      if (dateFrom) {
        (filter.createDate as Record<string, Date>).$gte = new Date(dateFrom);
      }
      if (dateTo) {
        (filter.createDate as Record<string, Date>).$lte = new Date(dateTo);
      }
    } else {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filter.createDate = { $gte: thirtyDaysAgo };
    }

    if (status) {
      filter.status = status;
    }

    if (customerId) {
      filter.customerId = customerId;
    }

    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
        { linkId: { $regex: search, $options: "i" } }
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
      this.paymentLinkModel.countDocuments(filter).exec()
    ]);

    const totalPages = Math.ceil(total / limit);

    if (docs.length > 0) {
      const sample = docs[0] as any;
      console.log("[PaymentsService] Sample linkId:", JSON.stringify(sample.linkId), "| type:", typeof sample.linkId);
      console.log("[PaymentsService] Resolved linkId:", sample.linkId || sample._id?.toString());
    }

    const data = docs.map((doc: any) => ({
      _id: doc._id?.toString() ?? "",
      linkId: (typeof doc.linkId === "string" && doc.linkId.length > 0) ? doc.linkId : doc._id?.toString() ?? "",
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
      createDate: doc.createDate
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  async sendNotification(linkId: string): Promise<{ email: boolean; sms: boolean }> {
    const info = await this.getPaymentInfo(linkId);
    const paymentUrl = `${this.paymentBaseUrl}/odeme/${linkId}`;
    const amountStr = new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY"
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
        html: emailHtml
      });
      emailSent = emailResult.success;
    }

    if (info.gsm) {
      const smsResult = await this.smsService.send({
        to: info.gsm,
        message: smsText
      });
      smsSent = smsResult.success;
    }

    return { email: emailSent, sms: smsSent };
  }
}
