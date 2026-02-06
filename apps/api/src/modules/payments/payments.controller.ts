import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus
} from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { CreatePaymentLinkDto } from "./dto/create-payment-link.dto";
import { PaymentLinkQueryDto } from "./dto/payment-link-query.dto";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("links")
  @HttpCode(HttpStatus.CREATED)
  async createLink(@Body() dto: CreatePaymentLinkDto) {
    return this.paymentsService.createPaymentLink(dto);
  }

  @Get("links")
  async findAll(@Query() query: PaymentLinkQueryDto) {
    return this.paymentsService.findAll(query);
  }

  @Get("links/:linkId/info")
  async getPaymentInfo(@Param("linkId") linkId: string) {
    return this.paymentsService.getPaymentInfo(linkId);
  }

  @Post("links/:linkId/notify")
  @HttpCode(HttpStatus.OK)
  async sendNotification(@Param("linkId") linkId: string) {
    return this.paymentsService.sendNotification(linkId);
  }
}
