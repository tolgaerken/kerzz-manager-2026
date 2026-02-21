import { IsString, Length, IsNotEmpty } from "class-validator";

export class VerifyInvoiceCaptchaDto {
  @IsString()
  @IsNotEmpty()
  challengeId: string;

  @IsString()
  @Length(4, 4, { message: "Kod 4 haneli olmalıdır" })
  code: string;
}

export class CaptchaResponseDto {
  challengeId: string;
  code: string;
  expiresInSeconds: number;
}

export class InvoicePdfResponseDto {
  pdf: string;
  invoiceNumber: string;
  customerName: string;
}
