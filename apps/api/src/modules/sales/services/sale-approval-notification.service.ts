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
import { NotificationDispatchService } from "../../notification-dispatch";
import type { AuthenticatedUser } from "../../auth/auth.types";
import type { Sale } from "../schemas/sale.schema";

interface ApproverUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

@Injectable()
export class SaleApprovalNotificationService {
  private readonly logger = new Logger(SaleApprovalNotificationService.name);
  private readonly appId: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(SsoUser.name, SSO_DB_CONNECTION)
    private readonly ssoUserModel: Model<SsoUserDocument>,
    @InjectModel(SsoAppLicence.name, SSO_DB_CONNECTION)
    private readonly ssoAppLicenceModel: Model<SsoAppLicenceDocument>,
    @InjectModel(SsoRole.name, SSO_DB_CONNECTION)
    private readonly ssoRoleModel: Model<SsoRoleDocument>,
    private readonly notificationDispatch: NotificationDispatchService
  ) {
    this.appId = this.configService.get<string>("APP_ID") || "kerzz-manager";
  }

  /**
   * Yetkili kullanıcıları (yönetim/müdür/admin) bulur
   */
  async getApproverUsers(): Promise<ApproverUser[]> {
    try {
      // Yönetim rollerini bul
      const managerRoles = await this.ssoRoleModel
        .find({
          app_id: this.appId,
          isActive: { $ne: false },
          name: { $in: [/yönetim/i, /müdür/i, /admin/i, /veri owner/i] },
        })
        .lean()
        .exec();

      if (managerRoles.length === 0) {
        this.logger.warn("Yetkili rol bulunamadı");
        return [];
      }

      const roleIds = managerRoles.map((r) => r.id);

      // Bu rollere sahip kullanıcıları bul
      const licences = await this.ssoAppLicenceModel
        .find({
          app_id: this.appId,
          isActive: { $ne: false },
          "roles.id": { $in: roleIds },
        })
        .lean()
        .exec();

      if (licences.length === 0) {
        this.logger.warn("Yetkili role sahip kullanıcı bulunamadı");
        return [];
      }

      const userIds = [...new Set(licences.map((l) => l.user_id))];

      // Kullanıcı bilgilerini al
      const users = await this.ssoUserModel
        .find({ id: { $in: userIds }, isActive: { $ne: false } })
        .lean()
        .exec();

      return users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
      }));
    } catch (error) {
      this.logger.error(`Yetkili kullanıcılar alınırken hata: ${error}`);
      return [];
    }
  }

  /**
   * Onay isteği bildirimi gönderir (yetkililere)
   */
  async notifyApprovers(
    sales: Sale[],
    requestedBy: AuthenticatedUser
  ): Promise<void> {
    try {
      const approvers = await this.getApproverUsers();

      if (approvers.length === 0) {
        this.logger.warn("Bildirim gönderilecek yetkili kullanıcı bulunamadı");
        return;
      }

      const saleCount = sales.length;
      const totalAmount = sales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
      const formattedAmount = new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
      }).format(totalAmount);

      // Her yetkili için bildirim gönder
      for (const approver of approvers) {
        // İstek sahibi kendisi ise bildirim gönderme
        if (approver.id === requestedBy.id) continue;

        const templateData = {
          approverName: approver.name,
          requesterName: requestedBy.name,
          saleCount: saleCount.toString(),
          totalAmount: formattedAmount,
          saleNumbers: sales.map((s) => s.no).join(", "),
        };

        // Email bildirimi
        if (approver.email) {
          try {
            await this.notificationDispatch.dispatch({
              templateCode: "sale-approval-request-email",
              channel: "email",
              recipient: {
                email: approver.email,
                name: approver.name,
              },
              contextType: "sale-approval" as any,
              contextId: sales[0]._id.toString(),
              templateData,
            });
            this.logger.log(`Email bildirimi gönderildi: ${approver.email}`);
          } catch (err) {
            this.logger.error(`Email gönderimi başarısız: ${approver.email} - ${err}`);
          }
        }

        // SMS bildirimi
        if (approver.phone) {
          try {
            await this.notificationDispatch.dispatch({
              templateCode: "sale-approval-request-sms",
              channel: "sms",
              recipient: {
                phone: approver.phone,
                name: approver.name,
              },
              contextType: "sale-approval" as any,
              contextId: sales[0]._id.toString(),
              templateData,
            });
            this.logger.log(`SMS bildirimi gönderildi: ${approver.phone}`);
          } catch (err) {
            this.logger.error(`SMS gönderimi başarısız: ${approver.phone} - ${err}`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Onay isteği bildirimi gönderilirken hata: ${error}`);
    }
  }

  /**
   * Onay/Red sonuç bildirimi gönderir (istek sahibine)
   */
  async notifyRequester(
    sale: Sale,
    action: "approved" | "rejected",
    approver: AuthenticatedUser
  ): Promise<void> {
    try {
      // İstek sahibinin bilgilerini al
      const requesterId = sale.approvalRequestedBy;
      if (!requesterId) {
        this.logger.warn(`Satış ${sale._id} için istek sahibi bulunamadı`);
        return;
      }

      const requester = await this.ssoUserModel
        .findOne({ id: requesterId })
        .lean()
        .exec();

      if (!requester) {
        this.logger.warn(`Kullanıcı bulunamadı: ${requesterId}`);
        return;
      }

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

      // Email bildirimi
      if (requester.email) {
        try {
          await this.notificationDispatch.dispatch({
            templateCode: `${templateCode}-email`,
            channel: "email",
            recipient: {
              email: requester.email,
              name: requester.name,
            },
            contextType: "sale-approval" as any,
            contextId: sale._id.toString(),
            templateData,
          });
          this.logger.log(
            `${action} email bildirimi gönderildi: ${requester.email}`
          );
        } catch (err) {
          this.logger.error(
            `Email gönderimi başarısız: ${requester.email} - ${err}`
          );
        }
      }

      // SMS bildirimi
      if (requester.phone) {
        try {
          await this.notificationDispatch.dispatch({
            templateCode: `${templateCode}-sms`,
            channel: "sms",
            recipient: {
              phone: requester.phone,
              name: requester.name,
            },
            contextType: "sale-approval" as any,
            contextId: sale._id.toString(),
            templateData,
          });
          this.logger.log(
            `${action} SMS bildirimi gönderildi: ${requester.phone}`
          );
        } catch (err) {
          this.logger.error(
            `SMS gönderimi başarısız: ${requester.phone} - ${err}`
          );
        }
      }
    } catch (error) {
      this.logger.error(`Sonuç bildirimi gönderilirken hata: ${error}`);
    }
  }
}
