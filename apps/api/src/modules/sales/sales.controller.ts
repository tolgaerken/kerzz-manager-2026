import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import { SalesService } from "./sales.service";
import { SaleApprovalService } from "./services/sale-approval.service";
import { CreateSaleDto } from "./dto/create-sale.dto";
import { UpdateSaleDto } from "./dto/update-sale.dto";
import { SaleQueryDto } from "./dto/sale-query.dto";
import {
  RequestApprovalDto,
  ApproveSaleDto,
  RejectSaleDto,
  BulkApproveDto,
} from "./dto/sale-approval.dto";
import { AuditLog } from "../system-logs";
import { RequirePermission, CurrentUser } from "../auth/decorators";
import { PERMISSIONS } from "../auth/constants/permissions";
import type { AuthenticatedUser } from "../auth/auth.types";

@Controller("sales")
@RequirePermission(PERMISSIONS.SALES_MENU)
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly approvalService: SaleApprovalService
  ) {}

  @Get()
  async findAll(@Query() query: SaleQueryDto) {
    return this.salesService.findAll(query);
  }

  @Get("stats")
  async getStats(@Query() query: SaleQueryDto) {
    return this.salesService.getStats(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.salesService.findOne(id);
  }

  @AuditLog({ module: "sales", entityType: "Sale" })
  @Post()
  async create(@Body() dto: CreateSaleDto) {
    return this.salesService.create(dto);
  }

  @AuditLog({ module: "sales", entityType: "Sale" })
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateSaleDto) {
    return this.salesService.update(id, dto);
  }

  @AuditLog({ module: "sales", entityType: "Sale" })
  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.salesService.remove(id);
  }

  @Post(":id/calculate")
  async calculate(@Param("id") id: string) {
    return this.salesService.calculate(id);
  }

  @AuditLog({ module: "sales", entityType: "Sale" })
  @Patch(":id/approve")
  async approve(
    @Param("id") id: string,
    @Body() body: ApproveSaleDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.approvalService.approveSale(id, user, body.note);
  }

  @AuditLog({ module: "sales", entityType: "Sale" })
  @Post(":id/revert")
  async revert(@Param("id") id: string) {
    return this.salesService.revertFromOffer(id);
  }

  // ==================== ONAY AKIŞI ENDPOINT'LERİ ====================

  /**
   * Toplu onay isteği gönderir
   */
  @AuditLog({ module: "sales", entityType: "Sale" })
  @Post("approval-requests")
  async requestApproval(
    @Body() dto: RequestApprovalDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.approvalService.requestApproval(dto.saleIds, user, dto.note);
  }

  /**
   * Bekleyen onayları listeler
   */
  @Get("pending-approvals")
  async getPendingApprovals() {
    return this.approvalService.getPendingApprovals();
  }

  /**
   * Tekil satışı reddeder
   */
  @AuditLog({ module: "sales", entityType: "Sale" })
  @Patch(":id/reject")
  async reject(
    @Param("id") id: string,
    @Body() dto: RejectSaleDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.approvalService.rejectSale(id, user, dto.reason);
  }

  /**
   * Toplu onay işlemi
   */
  @AuditLog({ module: "sales", entityType: "Sale" })
  @Post("bulk-approve")
  async bulkApprove(
    @Body() dto: BulkApproveDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.approvalService.bulkApprove(dto.saleIds, user, dto.note);
  }
}
