import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Header,
  Req,
} from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { CreatePaymentLinkDto } from "./dto/create-payment-link.dto";
import { PaymentLinkQueryDto } from "./dto/payment-link-query.dto";
import { Public } from "../auth/decorators/public.decorator";
import { RequirePermission } from "../auth/decorators";
import { PERMISSIONS } from "../auth/constants/permissions";
import { AuditLog } from "../system-logs";

@Controller("payments")
@RequirePermission(PERMISSIONS.FINANCE_MENU)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @AuditLog({ module: "payments", entityType: "PaymentLink" })
  @Post("links")
  @HttpCode(HttpStatus.CREATED)
  async createLink(@Body() dto: CreatePaymentLinkDto) {
    return this.paymentsService.createPaymentLink(dto);
  }

  @Get("links")
  async findAll(@Query() query: PaymentLinkQueryDto) {
    return this.paymentsService.findAll(query);
  }

  @Public()
  @Get("links/:linkId/info")
  async getPaymentInfo(@Param("linkId") linkId: string) {
    return this.paymentsService.getPaymentInfo(linkId);
  }

  @Public()
  @Get("links/:linkId/contract-detail")
  async getContractDetailForPayment(@Param("linkId") linkId: string) {
    return this.paymentsService.getContractDetailForPayment(linkId);
  }

  @AuditLog({ module: "payments", entityType: "PaymentLink" })
  @Post("links/:linkId/notify")
  @HttpCode(HttpStatus.OK)
  async sendNotification(@Param("linkId") linkId: string) {
    return this.paymentsService.sendNotification(linkId);
  }

  /**
   * PayTR callback endpoint (public - auth gerektirmez).
   * PayTR odeme sonucunu bu endpointe POST eder.
   */
  @Public()
  @Post("callback")
  @HttpCode(HttpStatus.OK)
  @Header("Content-Type", "text/plain")
  async paymentCallback(@Body() body: Record<string, any>) {
    await this.paymentsService.handleCallback(body);
    return "OK";
  }

  /**
   * PayTR basari redirect (GET).
   */
  @Public()
  @Get("success")
  @Header("Content-Type", "text/plain")
  async successPayment() {
    return "OK";
  }

  /**
   * PayTR hata redirect (GET).
   */
  @Public()
  @Get("error")
  @Header("Content-Type", "text/plain")
  async errorPayment() {
    return "OK";
  }
}
