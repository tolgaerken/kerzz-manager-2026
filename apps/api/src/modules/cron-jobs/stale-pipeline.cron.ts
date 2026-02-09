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
    private notificationService: ManagerNotificationService
  ) {}

  /**
   * Her gün 09:15'te çalışır
   * Hareketsiz lead/offer'lar için bildirim üretir.
   */
  @Cron("0 15 9 * * *")
  async handleStalePipeline(): Promise<void> {
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

    await this.notificationService.createMany(notifications);
    this.logger.log(`${notifications.length} hareketsiz pipeline bildirimi üretildi.`);
  }
}
