import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body
} from "@nestjs/common";
import { ContractPaymentsService } from "./contract-payments.service";
import { PaymentPlanService } from "./services/payment-plan.service";
import { ProratedPlanService } from "./services/prorated-plan.service";
import { UninvoicedItemsService } from "./services/uninvoiced-items.service";
import {
  ContractPaymentQueryDto,
  CreateContractPaymentDto,
  UpdateContractPaymentDto
} from "./dto";
import { AuditLog } from "../system-logs";

@Controller("contract-payments")
export class ContractPaymentsController {
  constructor(
    private readonly contractPaymentsService: ContractPaymentsService,
    private readonly paymentPlanService: PaymentPlanService,
    private readonly proratedPlanService: ProratedPlanService,
    private readonly uninvoicedItemsService: UninvoicedItemsService,
  ) {}

  // ─── Payment Plan Endpoint'leri (spesifik route'lar once tanimlanmali) ───

  /**
   * Tum aktif kontratlari kontrol eder ve planlarini olusturur.
   */
  @AuditLog({ module: "contract-payments", entityType: "ContractPayment" })
  @Post("check-all")
  async checkAllContracts() {
    return this.paymentPlanService.checkAllContracts();
  }

  /**
   * Tek kontrat icin odeme plani olusturur / gunceller.
   */
  @AuditLog({ module: "contract-payments", entityType: "ContractPayment" })
  @Post("check/:contractId")
  async checkContract(@Param("contractId") contractId: string) {
    return this.paymentPlanService.checkContractById(contractId);
  }

  /**
   * Kontrat icin odeme plani ve fatura ozetini onizler (readonly).
   */
  @Get("preview/:contractId")
  async previewPlans(@Param("contractId") contractId: string) {
    return this.paymentPlanService.previewPlans(contractId);
  }

  /**
   * Kontrat icin aylik ucret hesaplar (readonly).
   */
  @Get("monthly-fee/:contractId")
  async calculateMonthlyFee(@Param("contractId") contractId: string) {
    return this.paymentPlanService.calculateMonthlyFee(contractId);
  }

  // ─── Fatura Kesilmiş Kaynak Kalem ID'leri ────────────────────────

  /**
   * Faturası kesilmiş (invoiceNo dolu) sourceItemId'leri döndürür.
   * Kurulum bekleyen ürünler listesinde fatura kesilmiş olanları filtrelemek için kullanılır.
   */
  @Get("invoiced-source-items")
  async getInvoicedSourceItems() {
    const sourceItemIds = await this.contractPaymentsService.getInvoicedSourceItemIds();
    return { data: sourceItemIds, total: sourceItemIds.length };
  }

  // ─── Faturaya Dahil Edilmemiş Kalemler ───────────────────────────

  /**
   * Tüm kontratlardaki faturaya dahil edilmemiş kalemleri listeler.
   * Query params: startDate, endDate (ISO 8601 format)
   */
  @Get("uninvoiced-items")
  async getAllUninvoicedItems(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const dateRange = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };
    return this.uninvoicedItemsService.getAllUninvoicedItems(dateRange);
  }

  /**
   * Belirli bir kontrat için faturaya dahil edilmemiş kalemleri listeler.
   */
  @Get("uninvoiced-items/:contractId")
  async getUninvoicedItemsByContract(@Param("contractId") contractId: string) {
    return this.uninvoicedItemsService.getUninvoicedItemsByContract(contractId);
  }

  // ─── Kist Raporu ─────────────────────────────────────────────────

  /**
   * Tum kist planlarini listeler (rapor sayfasi icin).
   * Query params: paid, invoiced, contractId
   */
  @Get("prorated-report")
  async getProratedReport(
    @Query("paid") paid?: string,
    @Query("invoiced") invoiced?: string,
    @Query("contractId") contractId?: string,
  ) {
    const filter: { paid?: boolean; invoiced?: boolean; contractId?: string } = {};

    if (paid === "true") filter.paid = true;
    else if (paid === "false") filter.paid = false;

    if (invoiced === "true") filter.invoiced = true;
    else if (invoiced === "false") filter.invoiced = false;

    if (contractId) filter.contractId = contractId;

    const data = await this.proratedPlanService.findAllProratedPlans(filter);
    return { data, total: data.length };
  }

  /**
   * Belirli bir kıst planı rapordan çıkarır.
   */
  @AuditLog({ module: "contract-payments", entityType: "ContractPayment" })
  @Delete("prorated-report/:planId")
  async deleteProratedReportItem(@Param("planId") planId: string) {
    return this.proratedPlanService.deleteProratedPlanById(planId);
  }

  // ─── CRUD Endpoint'leri ───────────────────────────────────────────

  @Get()
  async findAll(@Query() query: ContractPaymentQueryDto) {
    return this.contractPaymentsService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.contractPaymentsService.findOne(id);
  }

  @AuditLog({ module: "contract-payments", entityType: "ContractPayment" })
  @Post()
  async create(@Body() dto: CreateContractPaymentDto) {
    return this.contractPaymentsService.create(dto);
  }

  @AuditLog({ module: "contract-payments", entityType: "ContractPayment" })
  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateContractPaymentDto) {
    return this.contractPaymentsService.update(id, dto);
  }

  @AuditLog({ module: "contract-payments", entityType: "ContractPayment" })
  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.contractPaymentsService.delete(id);
  }
}
