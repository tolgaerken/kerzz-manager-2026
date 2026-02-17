import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { SSO_DB_CONNECTION } from "../../../database";
import {
  SsoAppLicence,
  SsoAppLicenceDocument,
  SsoRole,
  SsoRoleDocument,
  SsoUser,
  SsoUserDocument,
} from "../../sso/schemas";
import {
  EmployeeProfile,
  EmployeeProfileDocument,
} from "../../employee-profile/schemas/employee-profile.schema";
import { NotificationDispatchService } from "../../notification-dispatch";
import type { AuthenticatedUser } from "../../auth/auth.types";
import type { Sale } from "../schemas/sale.schema";

interface RecipientUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  source: "manager" | "owner";
}

export interface NotificationChannelResult {
  channel: "email" | "sms";
  recipient: string;
  success: boolean;
  error?: string;
}

export interface NotificationResult {
  recipientId: string;
  recipientName: string;
  source: "manager" | "owner";
  channels: NotificationChannelResult[];
}

export interface NotifyApproversResult {
  strategy: "manager" | "owner-fallback" | "none";
  recipientsFound: number;
  recipientsNotified: number;
  results: NotificationResult[];
}

export interface NotifyRequesterResult {
  requesterId: string | null;
  requesterName: string | null;
  found: boolean;
  channels: NotificationChannelResult[];
}

@Injectable()
export class SaleApprovalNotificationService {
  private readonly logger = new Logger(SaleApprovalNotificationService.name);
  private readonly appId: string;
  private readonly webUrl: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(SsoUser.name, SSO_DB_CONNECTION)
    private readonly ssoUserModel: Model<SsoUserDocument>,
    @InjectModel(SsoAppLicence.name, SSO_DB_CONNECTION)
    private readonly ssoAppLicenceModel: Model<SsoAppLicenceDocument>,
    @InjectModel(SsoRole.name, SSO_DB_CONNECTION)
    private readonly ssoRoleModel: Model<SsoRoleDocument>,
    @InjectModel(EmployeeProfile.name, SSO_DB_CONNECTION)
    private readonly employeeProfileModel: Model<EmployeeProfileDocument>,
    private readonly notificationDispatch: NotificationDispatchService
  ) {
    this.appId = this.configService.get<string>("APP_ID") || "kerzz-manager";
    this.webUrl = this.configService.get<string>("WEB_URL") || "https://io.kerzz.com";
  }

  /**
   * Onay sayfasına yönlendiren link oluşturur
   */
  private buildApprovalLink(saleIds: string[]): string {
    const params = new URLSearchParams();
    params.set("approvalSaleIds", saleIds.join(","));
    return `${this.webUrl}/pipeline/sales?${params.toString()}`;
  }

  /**
   * İsteği yapan kullanıcının yöneticisini bulur.
   * Yönetici yoksa Owner rolüne sahip kullanıcıları döndürür.
   */
  async getApprovalRecipients(
    requesterId: string
  ): Promise<{ recipients: RecipientUser[]; strategy: "manager" | "owner-fallback" | "none" }> {
    try {
      // 1. Kullanıcının EmployeeProfile'ından yöneticisini bul
      const profile = await this.employeeProfileModel
        .findOne({ userId: requesterId })
        .lean()
        .exec();

      if (profile?.managerUserId) {
        const manager = await this.ssoUserModel
          .findOne({ id: profile.managerUserId, isActive: { $ne: false } })
          .lean()
          .exec();

        if (manager) {
          this.logger.log(
            `Yönetici bulundu: ${manager.name} (${manager.id}) → kullanıcı: ${requesterId}`
          );
          return {
            strategy: "manager",
            recipients: [
              {
                id: manager.id,
                name: manager.name,
                email: manager.email,
                phone: manager.phone,
                source: "manager",
              },
            ],
          };
        }

        this.logger.warn(
          `managerUserId (${profile.managerUserId}) SSO'da bulunamadı, Owner fallback`
        );
      } else {
        this.logger.warn(
          `Kullanıcının (${requesterId}) yöneticisi atanmamış, Owner fallback`
        );
      }

      // 2. Fallback: Owner rolüne sahip kullanıcıları bul
      const owners = await this.getOwnerUsers();

      if (owners.length === 0) {
        this.logger.warn("Owner rolüne sahip kullanıcı da bulunamadı");
        return { strategy: "none", recipients: [] };
      }

      return { strategy: "owner-fallback", recipients: owners };
    } catch (error) {
      this.logger.error(`Onay alıcıları bulunurken hata: ${error}`);
      return { strategy: "none", recipients: [] };
    }
  }

  /**
   * Owner rolüne sahip kullanıcıları bulur
   */
  private async getOwnerUsers(): Promise<RecipientUser[]> {
    const ownerRoles = await this.ssoRoleModel
      .find({
        app_id: this.appId,
        isActive: { $ne: false },
        $or: [
          { name: { $regex: /owner/i } },
          { name: { $regex: /admin/i } },
          { name: { $regex: /yönetim/i } },
          { name: { $regex: /müdür/i } },
        ],
      })
      .lean()
      .exec();

    if (ownerRoles.length === 0) {
      this.logger.warn(`Owner/admin rolü bulunamadı (app_id: ${this.appId})`);
      return [];
    }

    const roleIds = ownerRoles.map((r) => r.id).filter((id): id is string => Boolean(id));
    this.logger.log(
      `Bulunan owner/admin roller: ${ownerRoles.map((r) => `${r.name} (${r.id})`).join(", ")}`
    );

    const licences = await this.ssoAppLicenceModel
      .find({
        app_id: this.appId,
        roles: { $in: roleIds },
        $or: [
          { is_active: { $exists: false } },
          { is_active: true },
          { is_active: null },
        ],
      })
      .lean()
      .exec();

    if (licences.length === 0) {
      return [];
    }

    const userIds = [...new Set(licences.map((l) => l.user_id))];

    const users = await this.ssoUserModel
      .find({ id: { $in: userIds }, isActive: { $ne: false } })
      .lean()
      .exec();

    this.logger.log(
      `Bulunan owner kullanıcılar: ${users.map((u) => u.name).join(", ")}`
    );

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      source: "owner" as const,
    }));
  }

  /**
   * Onay isteği bildirimi gönderir
   * Önce isteği yapanın yöneticisine, yoksa Owner'lara gönderir
   */
  async notifyApprovers(
    sales: Sale[],
    requestedBy: AuthenticatedUser
  ): Promise<NotifyApproversResult> {
    const result: NotifyApproversResult = {
      strategy: "none",
      recipientsFound: 0,
      recipientsNotified: 0,
      results: [],
    };

    try {
      const { recipients, strategy } = await this.getApprovalRecipients(
        requestedBy.id
      );
      result.strategy = strategy;
      result.recipientsFound = recipients.length;

      if (recipients.length === 0) {
        this.logger.warn("Bildirim gönderilecek alıcı bulunamadı");
        return result;
      }

      const saleCount = sales.length;
      const totalAmount = sales.reduce(
        (sum, s) => sum + (s.grandTotal || 0),
        0
      );
      const formattedAmount = new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
      }).format(totalAmount);

      for (const recipient of recipients) {
        // İstek sahibi kendisi ise bildirim gönderme
        if (recipient.id === requestedBy.id) continue;

        const recipientResult: NotificationResult = {
          recipientId: recipient.id,
          recipientName: recipient.name,
          source: recipient.source,
          channels: [],
        };

        const saleIds = sales.map((s) => s._id.toString());
        const approvalLink = this.buildApprovalLink(saleIds);

        const templateData = {
          approverName: recipient.name,
          requesterName: requestedBy.name,
          saleCount: saleCount.toString(),
          totalAmount: formattedAmount,
          saleNumbers: sales.map((s) => s.no).join(", "),
          approvalLink,
        };

        if (recipient.email) {
          const channelResult = await this.sendNotification(
            "sale-approval-request-email",
            "email",
            { email: recipient.email, name: recipient.name },
            sales[0]._id.toString(),
            templateData
          );
          recipientResult.channels.push(channelResult);
        }

        if (recipient.phone) {
          const channelResult = await this.sendNotification(
            "sale-approval-request-sms",
            "sms",
            { phone: recipient.phone, name: recipient.name },
            sales[0]._id.toString(),
            templateData
          );
          recipientResult.channels.push(channelResult);
        }

        if (recipientResult.channels.length > 0) {
          result.recipientsNotified++;
        }
        result.results.push(recipientResult);
      }
    } catch (error: any) {
      this.logger.error(`Onay isteği bildirimi gönderilirken hata: ${error}`);
    }

    return result;
  }

  /**
   * Onay/Red sonuç bildirimi gönderir (istek sahibine)
   */
  async notifyRequester(
    sale: Sale,
    action: "approved" | "rejected",
    approver: AuthenticatedUser
  ): Promise<NotifyRequesterResult> {
    const result: NotifyRequesterResult = {
      requesterId: null,
      requesterName: null,
      found: false,
      channels: [],
    };

    try {
      const requesterId = sale.approvalRequestedBy;
      if (!requesterId) {
        this.logger.warn(`Satış ${sale._id} için istek sahibi bulunamadı`);
        return result;
      }

      result.requesterId = requesterId;

      const requester = await this.ssoUserModel
        .findOne({ id: requesterId })
        .lean()
        .exec();

      if (!requester) {
        this.logger.warn(`Kullanıcı bulunamadı: ${requesterId}`);
        return result;
      }

      result.requesterName = requester.name;
      result.found = true;

      const formattedAmount = new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
      }).format(sale.grandTotal || 0);

      const templateCode =
        action === "approved" ? "sale-approved" : "sale-rejected";

      const templateData = {
        requesterName: requester.name,
        approverName: approver.name,
        saleNo: sale.no?.toString() || "",
        customerName: sale.customerName || "",
        totalAmount: formattedAmount,
        rejectionReason: sale.rejectionReason || "",
        approvalNote: sale.approvalNote || "",
      };

      if (requester.email) {
        const channelResult = await this.sendNotification(
          `${templateCode}-email`,
          "email",
          { email: requester.email, name: requester.name },
          sale._id.toString(),
          templateData
        );
        result.channels.push(channelResult);
      }

      if (requester.phone) {
        const channelResult = await this.sendNotification(
          `${templateCode}-sms`,
          "sms",
          { phone: requester.phone, name: requester.name },
          sale._id.toString(),
          templateData
        );
        result.channels.push(channelResult);
      }
    } catch (error: any) {
      this.logger.error(`Sonuç bildirimi gönderilirken hata: ${error}`);
    }

    return result;
  }

  /**
   * Tek bir bildirim gönderir ve sonucunu döndürür
   */
  private async sendNotification(
    templateCode: string,
    channel: "email" | "sms",
    recipient: { email?: string; phone?: string; name?: string },
    contextId: string,
    templateData: Record<string, unknown>
  ): Promise<NotificationChannelResult> {
    const recipientAddress =
      channel === "email" ? recipient.email! : recipient.phone!;

    try {
      await this.notificationDispatch.dispatch({
        templateCode,
        channel,
        recipient,
        contextType: "sale-approval" as any,
        contextId,
        templateData,
      });

      this.logger.log(
        `${channel.toUpperCase()} bildirimi gönderildi: ${recipientAddress} (template: ${templateCode})`
      );

      return { channel, recipient: recipientAddress, success: true };
    } catch (err: any) {
      this.logger.error(
        `${channel.toUpperCase()} gönderimi başarısız: ${recipientAddress} - ${err?.message || err}`
      );

      return {
        channel,
        recipient: recipientAddress,
        success: false,
        error: err?.message || String(err),
      };
    }
  }
}
