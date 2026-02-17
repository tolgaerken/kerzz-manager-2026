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

@Injectable()
export class SaleApprovalService {
  private readonly logger = new Logger(SaleApprovalService.name);

  constructor(
    @InjectModel(Sale.name, CONTRACT_DB_CONNECTION)
    private saleModel: Model<SaleDocument>,
    private notificationService: SaleApprovalNotificationService
  ) {}

  /**
   * Toplu onay isteği gönderir
   */
  async requestApproval(
    saleIds: string[],
    requestedBy: AuthenticatedUser,
    note?: string
  ): Promise<ApprovalRequestResultDto> {
    // Satışları bul ve durumlarını kontrol et
    const sales = await this.saleModel
      .find({ _id: { $in: saleIds } })
      .lean()
      .exec();

    if (sales.length === 0) {
      throw new NotFoundException("Belirtilen satışlar bulunamadı");
    }

    // Zaten onay bekleyen veya onaylanmış satışları filtrele
    const eligibleSales = sales.filter(
      (s) => s.approvalStatus === "none" || s.approvalStatus === "rejected"
    );

    if (eligibleSales.length === 0) {
      throw new BadRequestException(
        "Seçilen satışların tümü zaten onay sürecinde veya onaylanmış"
      );
    }

    const eligibleIds = eligibleSales.map((s) => s._id.toString());

    // Satışları güncelle
    const updateResult = await this.saleModel.updateMany(
      { _id: { $in: eligibleIds } },
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
      .find({ _id: { $in: eligibleIds } })
      .lean()
      .exec();

    await this.notificationService.notifyApprovers(updatedSales, requestedBy);

    return {
      success: true,
      updatedCount: updateResult.modifiedCount,
      saleIds: eligibleIds,
      message: `${updateResult.modifiedCount} satış onay isteğine gönderildi`,
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
    if (updatedSale) {
      await this.notificationService.notifyRequester(
        updatedSale,
        "approved",
        approver
      );
    }

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
    if (updatedSale) {
      await this.notificationService.notifyRequester(
        updatedSale,
        "rejected",
        approver
      );
    }

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
    for (const sale of sales) {
      await this.notificationService.notifyRequester(
        sale,
        "approved",
        approver
      );
    }

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
