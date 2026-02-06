import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AutomatedPaymentsService } from "./automated-payments.service";
import { AutoPaymentQueryDto } from "./dto/auto-payment-query.dto";
import { CollectPaymentDto } from "./dto/collect-payment.dto";

@Controller("automated-payments")
export class AutomatedPaymentsController {
  constructor(
    private readonly automatedPaymentsService: AutomatedPaymentsService
  ) {}

  /**
   * Otomatik odeme tokenlarini listele.
   */
  @Get("tokens")
  async findAllTokens(@Query() query: AutoPaymentQueryDto) {
    return this.automatedPaymentsService.findAllTokens(query);
  }

  /**
   * Tahsilat baslat (item / balance / custom modlari).
   */
  @Post("collect")
  @HttpCode(HttpStatus.OK)
  async collectPayment(@Body() dto: CollectPaymentDto) {
    return this.automatedPaymentsService.collectPayment(dto);
  }

  /**
   * Musteri icin kayitli kartlari getir.
   */
  @Get("tokens/:customerId/cards")
  async getCustomerCards(@Param("customerId") customerId: string) {
    return this.automatedPaymentsService.getCustomerCards(customerId);
  }

  /**
   * Musteri odeme planlarini getir.
   */
  @Get("payment-plans/:erpId")
  async getPaymentPlans(@Param("erpId") erpId: string) {
    return this.automatedPaymentsService.getPaymentPlans(erpId);
  }

  /**
   * Token sil.
   */
  @Delete("tokens/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteToken(@Param("id") id: string) {
    return this.automatedPaymentsService.deleteToken(id);
  }

  /**
   * Kayitli kart sil.
   */
  @Delete("cards/:customerId/:ctoken")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCard(
    @Param("customerId") customerId: string,
    @Param("ctoken") ctoken: string
  ) {
    await this.automatedPaymentsService.deleteCard(customerId, ctoken);
  }
}
