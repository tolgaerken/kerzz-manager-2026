import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Sale, SaleDocument } from "../schemas/sale.schema";
import { CONTRACT_DB_CONNECTION } from "../../../database/contract-database.module";
import type { AuthenticatedUser } from "../../auth/auth.types";
import {
  ApprovalRequestResultDto,
  ApprovalActionResultDto,
} from "../dto/sale-approval.dto";
import { SaleApprovalNotificationService } from "./sale-approval-notification.service";
import {
  SystemLogsService,
  SystemLogCategory,
  SystemLogAction,
  SystemLogStatus,
} from "../../system-logs";

@Injectable()
export class SaleApprovalService {
  private readonly logger = new Logger(SaleApprovalService.name);

  constructor(
    @InjectModel(Sale.name, CONTRACT_DB_CONNECTION)
    private saleModel: Model<SaleDocument>,
    private notificationService: SaleApprovalNotificationService,
    private systemLogsService: SystemLogsService
  ) {}

  /**
   * Toplu onay isteği gönderir
   * Zaten onay sürecinde olanları yeniden göndermeye izin verir, bilgilendirme yapar
   */
  async requestApproval(
    saleIds: string[],
    requestedBy: AuthenticatedUser,
    note?: string
  ): Promise<ApprovalRequestResultDto> {
    const sales = await this.saleModel
      .find({ _id: { $in: saleIds } })
      .lean()
      .exec();

    if (sales.length === 0) {
      throw new NotFoundException("Belirtilen satışlar bulunamadı");
    }

    // Zaten onay sürecinde/onaylanmış olanları bilgilendirme için ayır
    const alreadyPending = sales
      .filter((s) => {
        const status = s.approvalStatus || "none";
        return status === "pending" || status === "approved";
      })
      .map((s) => ({
        saleId: s._id.toString(),
        no: s.no,
        status: s.approvalStatus || "none",
      }));

    // Tüm satışları onay isteğine gönder (yeniden göndermeye izin ver)
    const allIds = sales.map((s) => s._id.toString());

    const updateResult = await this.saleModel.updateMany(
      { _id: { $in: allIds } },
      {
        $set: {
          approvalStatus: "pending",
          approvalRequestedBy: requestedBy.id,
          approvalRequestedByName: requestedBy.name,
          approvalRequestedAt: new Date(),
          approvalNote: note || "",
          rejectionReason: "",
        },
      }
    );

    this.logger.log(
      `${updateResult.modifiedCount} satış onay isteğine gönderildi (kullanıcı: ${requestedBy.name})`
    );

    // Yetkililere bildirim gönder
    const updatedSales = await this.saleModel
      .find({ _id: { $in: allIds } })
      .lean()
      .exec();

    const notificationResults = await this.notificationService.notifyApprovers(
      updatedSales,
      requestedBy
    );

    // Detaylı system log
    await this.systemLogsService.log(
      SystemLogCategory.CRUD,
      SystemLogAction.CREATE,
      "sale-approval",
      {
        userId: requestedBy.id,
        userName: requestedBy.name,
        entityType: "SaleApprovalRequest",
        status: SystemLogStatus.SUCCESS,
        details: {
          action: "approval-request",
          saleIds: allIds,
          saleCount: allIds.length,
          saleNumbers: updatedSales.map((s) => s.no),
          totalAmount: updatedSales.reduce(
            (sum, s) => sum + (s.grandTotal || 0),
            0
          ),
          note: note || "",
          alreadyPending:
            alreadyPending.length > 0 ? alreadyPending : undefined,
          notifications: notificationResults,
        },
      }
    );

    // Mesajı oluştur
    let message = `${updateResult.modifiedCount} satış onay isteğine gönderildi`;
    if (alreadyPending.length > 0) {
      const pendingNos = alreadyPending.map((p) => p.no).join(", ");
      message += ` (${alreadyPending.length} satış zaten onay sürecindeydi: No ${pendingNos})`;
    }

    return {
      success: true,
      updatedCount: updateResult.modifiedCount,
      saleIds: allIds,
      message,
      alreadyPending: alreadyPending.length > 0 ? alreadyPending : undefined,
    };
  }

  /**
   * Tekil satışı onaylar
   */
  async approveSale(
    saleId: string,
    approver: AuthenticatedUser,
    note?: string
  ): Promise<ApprovalActionResultDto> {
    // Yetki kontrolü
    if (!approver.isManager && !approver.isAdmin) {
      throw new BadRequestException("Bu işlem için yetkiniz bulunmamaktadır");
    }

    const sale = await this.saleModel.findById(saleId).lean().exec();
    if (!sale) {
      throw new NotFoundException(`Satış bulunamadı: ${saleId}`);
    }

    if (sale.approvalStatus !== "pending") {
      throw new BadRequestException(
        "Bu satış onay bekliyor durumunda değil"
      );
    }

    // Satışı onayla
    await this.saleModel.findByIdAndUpdate(saleId, {
      $set: {
        approvalStatus: "approved",
        approved: true,
        approvedBy: approver.id,
        approvedByName: approver.name,
        approvedAt: new Date(),
        approvalNote: note || sale.approvalNote || "",
      },
    });

    this.logger.log(
      `Satış onaylandı: ${saleId} (onaylayan: ${approver.name})`
    );

    // İstek sahibine bildirim gönder
    const updatedSale = await this.saleModel.findById(saleId).lean().exec();
    let notificationResult = null;
    if (updatedSale) {
      notificationResult = await this.notificationService.notifyRequester(
        updatedSale,
        "approved",
        approver
      );
    }

    // Detaylı system log
    await this.systemLogsService.log(
      SystemLogCategory.CRUD,
      SystemLogAction.UPDATE,
      "sale-approval",
      {
        userId: approver.id,
        userName: approver.name,
        entityId: saleId,
        entityType: "SaleApproval",
        status: SystemLogStatus.SUCCESS,
        details: {
          action: "approve",
          saleNo: sale.no,
          customerName: sale.customerName,
          totalAmount: sale.grandTotal || 0,
          requestedBy: sale.approvalRequestedByName || sale.approvalRequestedBy,
          note: note || "",
          notification: notificationResult,
        },
      }
    );

    return {
      success: true,
      saleId,
      action: "approved",
      message: "Satış başarıyla onaylandı",
    };
  }

  /**
   * Tekil satışı reddeder
   */
  async rejectSale(
    saleId: string,
    approver: AuthenticatedUser,
    reason: string
  ): Promise<ApprovalActionResultDto> {
    // Yetki kontrolü
    if (!approver.isManager && !approver.isAdmin) {
      throw new BadRequestException("Bu işlem için yetkiniz bulunmamaktadır");
    }

    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException("Red nedeni belirtilmelidir");
    }

    const sale = await this.saleModel.findById(saleId).lean().exec();
    if (!sale) {
      throw new NotFoundException(`Satış bulunamadı: ${saleId}`);
    }

    if (sale.approvalStatus !== "pending") {
      throw new BadRequestException(
        "Bu satış onay bekliyor durumunda değil"
      );
    }

    // Satışı reddet
    await this.saleModel.findByIdAndUpdate(saleId, {
      $set: {
        approvalStatus: "rejected",
        approved: false,
        approvedBy: approver.id,
        approvedByName: approver.name,
        approvedAt: new Date(),
        rejectionReason: reason,
      },
    });

    this.logger.log(
      `Satış reddedildi: ${saleId} (reddeden: ${approver.name}, neden: ${reason})`
    );

    // İstek sahibine bildirim gönder
    const updatedSale = await this.saleModel.findById(saleId).lean().exec();
    let notificationResult = null;
    if (updatedSale) {
      notificationResult = await this.notificationService.notifyRequester(
        updatedSale,
        "rejected",
        approver
      );
    }

    // Detaylı system log
    await this.systemLogsService.log(
      SystemLogCategory.CRUD,
      SystemLogAction.UPDATE,
      "sale-approval",
      {
        userId: approver.id,
        userName: approver.name,
        entityId: saleId,
        entityType: "SaleApproval",
        status: SystemLogStatus.SUCCESS,
        details: {
          action: "reject",
          saleNo: sale.no,
          customerName: sale.customerName,
          totalAmount: sale.grandTotal || 0,
          requestedBy: sale.approvalRequestedByName || sale.approvalRequestedBy,
          reason,
          notification: notificationResult,
        },
      }
    );

    return {
      success: true,
      saleId,
      action: "rejected",
      message: "Satış reddedildi",
    };
  }

  /**
   * Toplu onay işlemi
   */
  async bulkApprove(
    saleIds: string[],
    approver: AuthenticatedUser,
    note?: string
  ): Promise<ApprovalRequestResultDto> {
    // Yetki kontrolü
    if (!approver.isManager && !approver.isAdmin) {
      throw new BadRequestException("Bu işlem için yetkiniz bulunmamaktadır");
    }

    // Sadece pending durumundaki satışları onayla
    const sales = await this.saleModel
      .find({ _id: { $in: saleIds }, approvalStatus: "pending" })
      .lean()
      .exec();

    if (sales.length === 0) {
      throw new BadRequestException(
        "Onaylanacak bekleyen satış bulunamadı"
      );
    }

    const eligibleIds = sales.map((s) => s._id.toString());

    // Toplu güncelleme
    const updateResult = await this.saleModel.updateMany(
      { _id: { $in: eligibleIds } },
      {
        $set: {
          approvalStatus: "approved",
          approved: true,
          approvedBy: approver.id,
          approvedByName: approver.name,
          approvedAt: new Date(),
          approvalNote: note || "",
        },
      }
    );

    this.logger.log(
      `${updateResult.modifiedCount} satış toplu onaylandı (onaylayan: ${approver.name})`
    );

    // Her satış için istek sahibine bildirim gönder
    const notificationResults: any[] = [];
    for (const sale of sales) {
      const result = await this.notificationService.notifyRequester(
        sale,
        "approved",
        approver
      );
      notificationResults.push({ saleId: sale._id.toString(), saleNo: sale.no, ...result });
    }

    // Detaylı system log
    await this.systemLogsService.log(
      SystemLogCategory.CRUD,
      SystemLogAction.UPDATE,
      "sale-approval",
      {
        userId: approver.id,
        userName: approver.name,
        entityType: "SaleApproval",
        status: SystemLogStatus.SUCCESS,
        details: {
          action: "bulk-approve",
          saleIds: eligibleIds,
          saleCount: eligibleIds.length,
          saleNumbers: sales.map((s) => s.no),
          totalAmount: sales.reduce((sum, s) => sum + (s.grandTotal || 0), 0),
          note: note || "",
          notifications: notificationResults,
        },
      }
    );

    return {
      success: true,
      updatedCount: updateResult.modifiedCount,
      saleIds: eligibleIds,
      message: `${updateResult.modifiedCount} satış onaylandı`,
    };
  }

  /**
   * Bekleyen onayları listeler
   */
  async getPendingApprovals(): Promise<any[]> {
    const sales = await this.saleModel
      .find({ approvalStatus: "pending" })
      .sort({ approvalRequestedAt: -1 })
      .lean()
      .exec();

    return sales;
  }
}
