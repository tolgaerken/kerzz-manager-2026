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
import {
  ContractPaymentQueryDto,
  CreateContractPaymentDto,
  UpdateContractPaymentDto
} from "./dto";

@Controller("contract-payments")
export class ContractPaymentsController {
  constructor(
    private readonly contractPaymentsService: ContractPaymentsService,
    private readonly paymentPlanService: PaymentPlanService,
  ) {}

  // ─── Payment Plan Endpoint'leri (spesifik route'lar once tanimlanmali) ───

  /**
   * Tum aktif kontratlari kontrol eder ve planlarini olusturur.
   */
  @Post("check-all")
  async checkAllContracts() {
    return this.paymentPlanService.checkAllContracts();
  }

  /**
   * Tek kontrat icin odeme plani olusturur / gunceller.
   */
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

  // ─── CRUD Endpoint'leri ───────────────────────────────────────────

  @Get()
  async findAll(@Query() query: ContractPaymentQueryDto) {
    return this.contractPaymentsService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.contractPaymentsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateContractPaymentDto) {
    return this.contractPaymentsService.create(dto);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateContractPaymentDto) {
    return this.contractPaymentsService.update(id, dto);
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.contractPaymentsService.delete(id);
  }
}
