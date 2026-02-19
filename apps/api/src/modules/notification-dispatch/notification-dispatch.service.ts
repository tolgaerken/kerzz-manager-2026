import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import {
  NotificationLog,
  NotificationLogDocument,
} from "./schemas/notification-log.schema";
import {
  NotificationLogQueryDto,
  NotificationLogResponseDto,
  PaginatedNotificationLogsResponseDto,
  DispatchNotificationDto,
} from "./dto";
import { EmailService, EmailResult } from "../email";
import { SmsService, SmsResult } from "../sms";
import { NotificationTemplatesService } from "../notification-templates";

export interface DispatchResult {
  success: boolean;
  logId: string;
  channel: string;
  messageId?: string;
  error?: string;
}

@Injectable()
export class NotificationDispatchService {
  constructor(
    @InjectModel(NotificationLog.name)
    private logModel: Model<NotificationLogDocument>,
    private emailService: EmailService,
    private smsService: SmsService,
    private templatesService: NotificationTemplatesService
  ) {}

  /**
   * Bildirim gönderir ve loglar
   */
  async dispatch(dto: DispatchNotificationDto): Promise<DispatchResult> {
    const logId = uuidv4();
    const sentAt = new Date();

    try {
      // Template'i render et
      const rendered = await this.templatesService.renderTemplate(
        dto.templateCode,
        dto.templateData
      );

      let sendResult: EmailResult | SmsResult;

      // Kanala göre gönder
      if (dto.channel === "email" && dto.recipient.email) {
        sendResult = await this.emailService.send({
          to: dto.recipient.email,
          subject: rendered.subject || "",
          html: rendered.body,
          text: this.stripHtml(rendered.body),
        });
      } else if (dto.channel === "sms" && dto.recipient.phone) {
        sendResult = await this.smsService.send({
          to: dto.recipient.phone,
          message: rendered.body,
        });
      } else {
        throw new Error(
          `Geçersiz kanal veya alıcı bilgisi: channel=${dto.channel}`
        );
      }

      // Log oluştur
      const log = new this.logModel({
        id: logId,
        templateCode: dto.templateCode,
        channel: dto.channel,
        recipientEmail: dto.recipient.email || "",
        recipientPhone: dto.recipient.phone || "",
        recipientName: dto.recipient.name || "",
        contextType: dto.contextType,
        contextId: dto.contextId,
        customerId: dto.customerId || "",
        invoiceId: dto.invoiceId || "",
        contractId: dto.contractId || "",
        renewalCycleKey: dto.renewalCycleKey || "",
        status: sendResult.success ? "sent" : "failed",
        errorMessage: sendResult.error || "",
        messageId: sendResult.messageId || "",
        responseData: { rawResponse: (sendResult as SmsResult).rawResponse },
        templateData: dto.templateData,
        renderedSubject: rendered.subject || "",
        renderedBody: rendered.body,
        sentAt,
      });

      await log.save();

      return {
        success: sendResult.success,
        logId,
        channel: dto.channel,
        messageId: sendResult.messageId,
        error: sendResult.error,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Hata durumunda da log oluştur
      const log = new this.logModel({
        id: logId,
        templateCode: dto.templateCode,
        channel: dto.channel,
        recipientEmail: dto.recipient.email || "",
        recipientPhone: dto.recipient.phone || "",
        recipientName: dto.recipient.name || "",
        contextType: dto.contextType,
        contextId: dto.contextId,
        customerId: dto.customerId || "",
        invoiceId: dto.invoiceId || "",
        contractId: dto.contractId || "",
        renewalCycleKey: dto.renewalCycleKey || "",
        status: "failed",
        errorMessage,
        templateData: dto.templateData,
        sentAt,
      });

      await log.save();

      return {
        success: false,
        logId,
        channel: dto.channel,
        error: errorMessage,
      };
    }
  }

  /**
   * Toplu bildirim gönderir
   */
  async dispatchBulk(
    notifications: DispatchNotificationDto[]
  ): Promise<DispatchResult[]> {
    const results: DispatchResult[] = [];

    for (const notification of notifications) {
      const result = await this.dispatch(notification);
      results.push(result);
    }

    return results;
  }

  /**
   * Logları sorgular
   */
  async findAll(
    queryDto: NotificationLogQueryDto
  ): Promise<PaginatedNotificationLogsResponseDto> {
    const {
      page = 1,
      limit = 50,
      channel,
      status,
      contextType,
      contextId,
      customerId,
      invoiceId,
      contractId,
      templateCode,
      startDate,
      endDate,
      search,
    } = queryDto;

    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (channel) filter.channel = channel;
    if (status) filter.status = status;
    if (contextType) filter.contextType = contextType;
    if (contextId) filter.contextId = contextId;
    if (customerId) filter.customerId = customerId;
    if (invoiceId) filter.invoiceId = invoiceId;
    if (contractId) filter.contractId = contractId;
    if (templateCode) filter.templateCode = templateCode;

    // Tarih aralığı filtresi
    if (startDate || endDate) {
      const sentAtFilter: { $gte?: Date; $lte?: Date } = {};
      if (startDate) sentAtFilter.$gte = new Date(startDate);
      if (endDate) sentAtFilter.$lte = new Date(endDate);
      filter.sentAt = sentAtFilter;
    }

    // Metin arama
    if (search) {
      filter.$or = [
        { recipientEmail: { $regex: search, $options: "i" } },
        { recipientPhone: { $regex: search, $options: "i" } },
        { recipientName: { $regex: search, $options: "i" } },
        { templateCode: { $regex: search, $options: "i" } },
      ];
    }

    const [data, total, stats] = await Promise.all([
      this.logModel
        .find(filter)
        .sort({ sentAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.logModel.countDocuments(filter).exec(),
      this.getStats(filter),
    ]);

    return {
      data: data.map((doc) => this.mapToResponseDto(doc)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    };
  }

  /**
   * Tek log getirir
   */
  async findOne(id: string): Promise<NotificationLogResponseDto | null> {
    const log = await this.logModel.findById(id).exec();
    return log ? this.mapToResponseDto(log) : null;
  }

  /**
   * İstatistikleri hesaplar
   */
  private async getStats(
    baseFilter: Record<string, unknown>
  ): Promise<{
    total: number;
    sent: number;
    failed: number;
    byChannel: Record<string, number>;
  }> {
    const [statusAgg, channelAgg] = await Promise.all([
      this.logModel.aggregate([
        { $match: baseFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      this.logModel.aggregate([
        { $match: baseFilter },
        { $group: { _id: "$channel", count: { $sum: 1 } } },
      ]),
    ]);

    const byStatus: Record<string, number> = {};
    statusAgg.forEach((item) => {
      byStatus[item._id] = item.count;
    });

    const byChannel: Record<string, number> = {};
    channelAgg.forEach((item) => {
      byChannel[item._id] = item.count;
    });

    return {
      total: (byStatus["sent"] || 0) + (byStatus["failed"] || 0),
      sent: byStatus["sent"] || 0,
      failed: byStatus["failed"] || 0,
      byChannel,
    };
  }

  /**
   * HTML'den text çıkarır
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Belirtilen fatura ID'leri için gönderilmiş templateCode'ları döner
   * @returns Map<invoiceId, templateCode[]>
   */
  async getDistinctTemplateCodesForInvoices(
    invoiceIds: string[]
  ): Promise<Map<string, string[]>> {
    if (invoiceIds.length === 0) return new Map();

    const result = await this.logModel.aggregate<{
      _id: string;
      templateCodes: string[];
    }>([
      { $match: { invoiceId: { $in: invoiceIds }, status: "sent" } },
      { $group: { _id: "$invoiceId", templateCodes: { $addToSet: "$templateCode" } } },
    ]);

    const map = new Map<string, string[]>();
    for (const item of result) {
      map.set(item._id, item.templateCodes);
    }
    return map;
  }

  /**
   * Belirtilen kontrat ID'leri için gönderilmiş templateCode'ları döner
   * @returns Map<contractId, templateCode[]>
   */
  async getDistinctTemplateCodesForContracts(
    contractIds: string[]
  ): Promise<Map<string, string[]>> {
    if (contractIds.length === 0) return new Map();

    const result = await this.logModel.aggregate<{
      _id: string;
      templateCodes: string[];
    }>([
      { $match: { contractId: { $in: contractIds }, status: "sent" } },
      { $group: { _id: "$contractId", templateCodes: { $addToSet: "$templateCode" } } },
    ]);

    const map = new Map<string, string[]>();
    for (const item of result) {
      map.set(item._id, item.templateCodes);
    }
    return map;
  }

  /**
   * Belirtilen kontrat ID'leri ve cycleKey için gönderilmiş templateCode'ları döner.
   * Yıllık kontrat yenileme akışında milestone bazlı duplicate kontrolü için kullanılır.
   * @returns Map<`${contractId}:${cycleKey}`, templateCode[]>
   */
  async getDistinctTemplateCodesForContractCycles(
    contractIds: string[],
    cycleKey: string
  ): Promise<Map<string, string[]>> {
    if (contractIds.length === 0) return new Map();

    const result = await this.logModel.aggregate<{
      _id: { contractId: string; renewalCycleKey: string };
      templateCodes: string[];
    }>([
      {
        $match: {
          contractId: { $in: contractIds },
          renewalCycleKey: cycleKey,
          status: "sent",
        },
      },
      {
        $group: {
          _id: { contractId: "$contractId", renewalCycleKey: "$renewalCycleKey" },
          templateCodes: { $addToSet: "$templateCode" },
        },
      },
    ]);

    const map = new Map<string, string[]>();
    for (const item of result) {
      const key = `${item._id.contractId}:${item._id.renewalCycleKey}`;
      map.set(key, item.templateCodes);
    }
    return map;
  }

  private mapToResponseDto(
    doc: NotificationLogDocument
  ): NotificationLogResponseDto {
    return {
      _id: doc._id.toString(),
      id: doc.id,
      templateCode: doc.templateCode,
      channel: doc.channel,
      recipientEmail: doc.recipientEmail,
      recipientPhone: doc.recipientPhone,
      recipientName: doc.recipientName,
      contextType: doc.contextType,
      contextId: doc.contextId,
      customerId: doc.customerId,
      invoiceId: doc.invoiceId,
      contractId: doc.contractId,
      status: doc.status,
      errorMessage: doc.errorMessage,
      messageId: doc.messageId,
      responseData: doc.responseData,
      templateData: doc.templateData,
      renderedSubject: doc.renderedSubject,
      renderedBody: doc.renderedBody,
      sentAt: doc.sentAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
