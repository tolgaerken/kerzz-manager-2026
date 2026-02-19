import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { Lead, LeadDocument } from "../leads/schemas/lead.schema";
import { Offer, OfferDocument } from "../offers/schemas/offer.schema";
import {
  ManagerNotification,
  ManagerNotificationDocument,
} from "../manager-notification/schemas/manager-notification.schema";
import { ManagerNotificationService } from "../manager-notification/manager-notification.service";
import { NotificationSettingsService } from "../notification-settings";
import type {
  StalePipelineDryRunResponse,
  StalePipelineDryRunItem,
} from "./dto/dry-run.dto";
import type { CronManualRunResponseDto } from "./dto/manual-run.dto";

@Injectable()
export class StalePipelineCron {
  private readonly logger = new Logger(StalePipelineCron.name);
  private readonly staleDays = 14;

  constructor(
    @InjectModel(Lead.name, CONTRACT_DB_CONNECTION)
    private leadModel: Model<LeadDocument>,
    @InjectModel(Offer.name, CONTRACT_DB_CONNECTION)
    private offerModel: Model<OfferDocument>,
    @InjectModel(ManagerNotification.name)
    private notificationModel: Model<ManagerNotificationDocument>,
    private notificationService: ManagerNotificationService,
    private settingsService: NotificationSettingsService
  ) {}

  /**
   * Her gün 09:15'te çalışır
   * Hareketsiz lead/offer'lar için bildirim üretir.
   */
  @Cron("0 15 9 * * *")
  async handleStalePipeline(): Promise<void> {
    const settings = await this.settingsService.getSettings();
    if (!settings.stalePipelineCronEnabled) {
      this.logger.log("⏸️ Hareketsiz pipeline cron'u devre dışı");
      return;
    }

    const now = new Date();
    const staleBefore = new Date(now);
    staleBefore.setDate(now.getDate() - this.staleDays);

    const [leads, offers] = await Promise.all([
      this.leadModel
        .find({
          status: { $in: ["new", "contacted", "qualified"] },
          updatedAt: { $lte: staleBefore },
          assignedUserId: { $ne: "" },
        })
        .lean()
        .exec(),
      this.offerModel
        .find({
          status: { $in: ["draft", "sent", "revised", "waiting", "approved"] },
          updatedAt: { $lte: staleBefore },
          sellerId: { $ne: "" },
        })
        .lean()
        .exec(),
    ]);

    const notificationWindowStart = new Date(now);
    notificationWindowStart.setDate(now.getDate() - this.staleDays);

    const contextIds = [
      ...leads.map((lead) => lead._id.toString()),
      ...offers.map((offer) => offer._id.toString()),
    ];

    const existingNotifications = contextIds.length
      ? await this.notificationModel
          .find({
            type: "stale",
            contextId: { $in: contextIds },
            createdAt: { $gte: notificationWindowStart },
          })
          .lean()
          .exec()
      : [];

    const existingMap = new Set(
      existingNotifications.map(
        (n) => `${n.contextType}:${n.contextId}`
      )
    );

    const leadNotifications = leads
      .filter(
        (lead) =>
          !existingMap.has(`lead:${lead._id.toString()}`) &&
          lead.assignedUserId
      )
      .map((lead) => ({
        userId: lead.assignedUserId,
        type: "stale" as const,
        logId: "stale",
        customerId: lead.customerId || "",
        contextType: "lead",
        contextId: lead._id.toString(),
        message: `Lead ${lead.companyName || lead.contactName || ""} ${this.staleDays} gündür güncellenmedi`,
      }));

    const offerNotifications = offers
      .filter(
        (offer) =>
          !existingMap.has(`offer:${offer._id.toString()}`) &&
          offer.sellerId
      )
      .map((offer) => ({
        userId: offer.sellerId,
        type: "stale" as const,
        logId: "stale",
        customerId: offer.customerId || "",
        contextType: "offer",
        contextId: offer._id.toString(),
        message: `Teklif ${offer.customerName || ""} ${this.staleDays} gündür güncellenmedi`,
      }));

    const notifications = [...leadNotifications, ...offerNotifications];
    if (notifications.length === 0) {
      this.logger.log("Hareketsiz kayıt bulunamadı.");
      return;
    }

    // DRY RUN MODU: Gerçek bildirim oluşturma, sadece logla
    if (settings.dryRunMode) {
      this.logger.log(
        `🧪 [DRY RUN] ${notifications.length} hareketsiz pipeline bildirimi oluşturulacaktı — kuru çalışma modunda atlandı`
      );
      for (const n of notifications) {
        this.logger.log(
          `🧪 [DRY RUN] ${n.contextType}:${n.contextId} → userId: ${n.userId} — ${n.message}`
        );
      }
      return;
    }

    await this.notificationService.createMany(notifications);
    this.logger.log(`${notifications.length} hareketsiz pipeline bildirimi üretildi.`);
  }

  /**
   * Dry run: Gercek bildirim olusturmadan ne olacagini raporlar
   */
  async dryRun(): Promise<StalePipelineDryRunResponse> {
    const startTime = Date.now();
    const settings = await this.settingsService.getSettings();

    const now = new Date();
    const staleBefore = new Date(now);
    staleBefore.setDate(now.getDate() - this.staleDays);

    const [leads, offers] = await Promise.all([
      this.leadModel
        .find({
          status: { $in: ["new", "contacted", "qualified"] },
          updatedAt: { $lte: staleBefore },
          assignedUserId: { $ne: "" },
        })
        .lean()
        .exec(),
      this.offerModel
        .find({
          status: { $in: ["draft", "sent", "revised", "waiting", "approved"] },
          updatedAt: { $lte: staleBefore },
          sellerId: { $ne: "" },
        })
        .lean()
        .exec(),
    ]);

    // Deduplication: mevcut bildirimleri kontrol et
    const notificationWindowStart = new Date(now);
    notificationWindowStart.setDate(now.getDate() - this.staleDays);

    const contextIds = [
      ...leads.map((lead) => lead._id.toString()),
      ...offers.map((offer) => offer._id.toString()),
    ];

    const existingNotifications = contextIds.length
      ? await this.notificationModel
          .find({
            type: "stale",
            contextId: { $in: contextIds },
            createdAt: { $gte: notificationWindowStart },
          })
          .lean()
          .exec()
      : [];

    const existingMap = new Set(
      existingNotifications.map((n) => `${n.contextType}:${n.contextId}`)
    );

    const items: StalePipelineDryRunItem[] = [];
    let alreadyNotifiedCount = 0;

    for (const lead of leads) {
      const alreadyNotified = existingMap.has(`lead:${lead._id.toString()}`);
      if (alreadyNotified) alreadyNotifiedCount++;
      if (!lead.assignedUserId) continue;

      items.push({
        type: "lead",
        id: lead._id.toString(),
        name: lead.companyName || lead.contactName || "",
        userId: lead.assignedUserId,
        customerId: lead.customerId || "",
        message: `Lead ${lead.companyName || lead.contactName || ""} ${this.staleDays} gundur guncellenmedi`,
        alreadyNotified,
      });
    }

    for (const offer of offers) {
      const alreadyNotified = existingMap.has(`offer:${offer._id.toString()}`);
      if (alreadyNotified) alreadyNotifiedCount++;
      if (!offer.sellerId) continue;

      items.push({
        type: "offer",
        id: offer._id.toString(),
        name: offer.customerName || "",
        userId: offer.sellerId,
        customerId: offer.customerId || "",
        message: `Teklif ${offer.customerName || ""} ${this.staleDays} gundur guncellenmedi`,
        alreadyNotified,
      });
    }

    const wouldCreate = items.filter((i) => !i.alreadyNotified).length;

    return {
      cronName: "stale-pipeline",
      executedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      settings: {
        cronEnabled: settings.cronEnabled,
        stalePipelineCronEnabled: settings.stalePipelineCronEnabled,
      },
      summary: {
        totalStaleLeads: leads.length,
        totalStaleOffers: offers.length,
        totalNotificationsWouldCreate: wouldCreate,
        alreadyNotifiedCount,
      },
      items,
    };
  }

  async manualRun(target: {
    targetType: "lead" | "offer";
    contextId: string;
  }): Promise<CronManualRunResponseDto> {
    const startTime = Date.now();
    const executedAt = new Date().toISOString();

    try {
      const settings = await this.settingsService.getSettings();
      if (!settings.stalePipelineCronEnabled) {
        return {
          cronName: "stale-pipeline",
          success: true,
          skipped: true,
          message: "Hareketsiz pipeline cron'u devre disi oldugu icin islem atlandi",
          executedAt,
          durationMs: Date.now() - startTime,
        };
      }

      const now = new Date();
      const staleBefore = new Date(now);
      staleBefore.setDate(now.getDate() - this.staleDays);

      if (target.targetType === "lead") {
        const lead = await this.leadModel.findById(target.contextId).lean().exec();
        if (!lead) {
          return {
            cronName: "stale-pipeline",
            success: false,
            skipped: false,
            message: `Lead bulunamadi: ${target.contextId}`,
            executedAt,
            durationMs: Date.now() - startTime,
          };
        }

        const validStatuses = ["new", "contacted", "qualified"];
        const isStale = lead.updatedAt instanceof Date && lead.updatedAt <= staleBefore;
        if (!validStatuses.includes(lead.status) || !isStale || !lead.assignedUserId) {
          return {
            cronName: "stale-pipeline",
            success: true,
            skipped: true,
            message: "Lead cron kosullarini saglamadigi icin atlandi",
            executedAt,
            durationMs: Date.now() - startTime,
            details: {
              status: lead.status,
              updatedAt: lead.updatedAt,
              assignedUserId: lead.assignedUserId,
            },
          };
        }

        const notificationWindowStart = new Date(now);
        notificationWindowStart.setDate(now.getDate() - this.staleDays);
        const existing = await this.notificationModel
          .findOne({
            type: "stale",
            contextType: "lead",
            contextId: lead._id.toString(),
            createdAt: { $gte: notificationWindowStart },
          })
          .lean()
          .exec();

        if (existing) {
          return {
            cronName: "stale-pipeline",
            success: true,
            skipped: true,
            message: "Lead icin son 14 gun icinde stale bildirimi zaten olusturulmus",
            executedAt,
            durationMs: Date.now() - startTime,
          };
        }

        const notification = {
          userId: lead.assignedUserId,
          type: "stale" as const,
          logId: "stale",
          customerId: lead.customerId || "",
          contextType: "lead",
          contextId: lead._id.toString(),
          message: `Lead ${lead.companyName || lead.contactName || ""} ${this.staleDays} gündür güncellenmedi`,
        };

        if (settings.dryRunMode) {
          return {
            cronName: "stale-pipeline",
            success: true,
            skipped: true,
            message: "Dry run modu acik oldugu icin bildirim kaydi olusturulmadi",
            executedAt,
            durationMs: Date.now() - startTime,
            details: notification,
          };
        }

        await this.notificationService.createMany([notification]);
        return {
          cronName: "stale-pipeline",
          success: true,
          skipped: false,
          message: "Lead icin stale bildirimi olusturuldu",
          executedAt,
          durationMs: Date.now() - startTime,
          details: {
            contextType: "lead",
            contextId: lead._id.toString(),
            userId: lead.assignedUserId,
          },
        };
      }

      const offer = await this.offerModel.findById(target.contextId).lean().exec();
      if (!offer) {
        return {
          cronName: "stale-pipeline",
          success: false,
          skipped: false,
          message: `Teklif bulunamadi: ${target.contextId}`,
          executedAt,
          durationMs: Date.now() - startTime,
        };
      }

      const validStatuses = ["draft", "sent", "revised", "waiting", "approved"];
      const isStale = offer.updatedAt instanceof Date && offer.updatedAt <= staleBefore;
      if (!validStatuses.includes(offer.status) || !isStale || !offer.sellerId) {
        return {
          cronName: "stale-pipeline",
          success: true,
          skipped: true,
          message: "Teklif cron kosullarini saglamadigi icin atlandi",
          executedAt,
          durationMs: Date.now() - startTime,
          details: {
            status: offer.status,
            updatedAt: offer.updatedAt,
            sellerId: offer.sellerId,
          },
        };
      }

      const notificationWindowStart = new Date(now);
      notificationWindowStart.setDate(now.getDate() - this.staleDays);
      const existing = await this.notificationModel
        .findOne({
          type: "stale",
          contextType: "offer",
          contextId: offer._id.toString(),
          createdAt: { $gte: notificationWindowStart },
        })
        .lean()
        .exec();

      if (existing) {
        return {
          cronName: "stale-pipeline",
          success: true,
          skipped: true,
          message: "Teklif icin son 14 gun icinde stale bildirimi zaten olusturulmus",
          executedAt,
          durationMs: Date.now() - startTime,
        };
      }

      const notification = {
        userId: offer.sellerId,
        type: "stale" as const,
        logId: "stale",
        customerId: offer.customerId || "",
        contextType: "offer",
        contextId: offer._id.toString(),
        message: `Teklif ${offer.customerName || ""} ${this.staleDays} gündür güncellenmedi`,
      };

      if (settings.dryRunMode) {
        return {
          cronName: "stale-pipeline",
          success: true,
          skipped: true,
          message: "Dry run modu acik oldugu icin bildirim kaydi olusturulmadi",
          executedAt,
          durationMs: Date.now() - startTime,
          details: notification,
        };
      }

      await this.notificationService.createMany([notification]);
      return {
        cronName: "stale-pipeline",
        success: true,
        skipped: false,
        message: "Teklif icin stale bildirimi olusturuldu",
        executedAt,
        durationMs: Date.now() - startTime,
        details: {
          contextType: "offer",
          contextId: offer._id.toString(),
          userId: offer.sellerId,
        },
      };
    } catch (error) {
      return {
        cronName: "stale-pipeline",
        success: false,
        skipped: false,
        message: error instanceof Error ? error.message : "Bilinmeyen hata",
        executedAt,
        durationMs: Date.now() - startTime,
      };
    }
  }
}
