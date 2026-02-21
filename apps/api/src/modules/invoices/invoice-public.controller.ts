import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from "@nestjs/common";
import { Public } from "../auth/decorators/public.decorator";
import { InvoiceViewCaptchaService } from "./services/invoice-view-captcha.service";
import { InvoicePdfGatewayService } from "./services/invoice-pdf-gateway.service";
import {
  VerifyInvoiceCaptchaDto,
  CaptchaResponseDto,
  InvoicePdfResponseDto,
} from "./dto/invoice-view.dto";
import { ConfigService } from "@nestjs/config";

@Controller("invoices/public")
export class InvoicePublicController {
  private readonly captchaTtlSeconds: number;

  constructor(
    private readonly captchaService: InvoiceViewCaptchaService,
    private readonly pdfGatewayService: InvoicePdfGatewayService,
    private readonly configService: ConfigService
  ) {
    this.captchaTtlSeconds = this.configService.get<number>(
      "INVOICE_VIEW_CAPTCHA_TTL_SECONDS",
      300
    );
  }

  @Public()
  @Get(":invoiceUuid/captcha")
  async getCaptcha(
    @Param("invoiceUuid") invoiceUuid: string
  ): Promise<CaptchaResponseDto> {
    const exists = await this.pdfGatewayService.validateInvoiceExists(invoiceUuid);

    if (!exists) {
      throw new NotFoundException(`Fatura bulunamadı: ${invoiceUuid}`);
    }

    const { challengeId, code } = this.captchaService.generateCaptcha(invoiceUuid);

    return {
      challengeId,
      code,
      expiresInSeconds: this.captchaTtlSeconds,
    };
  }

  @Public()
  @Post(":invoiceUuid/view")
  @HttpCode(HttpStatus.OK)
  async viewInvoice(
    @Param("invoiceUuid") invoiceUuid: string,
    @Body() dto: VerifyInvoiceCaptchaDto
  ): Promise<InvoicePdfResponseDto> {
    this.captchaService.verifyCaptcha(dto.challengeId, dto.code);

    const result = await this.pdfGatewayService.getInvoicePdfByUuid(invoiceUuid);

    return {
      pdf: result.pdf,
      invoiceNumber: result.invoiceNumber,
      customerName: result.customerName,
    };
  }
}
