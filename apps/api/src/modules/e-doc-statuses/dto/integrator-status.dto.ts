import { IsDateString, IsNotEmpty } from "class-validator";

export class IntegratorStatusQueryDto {
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}

export interface IntegratorStatusItem {
  taxpayerVknTckn: string;
  taxpayerName: string;
  date: string;
  eInvoiceCount: number;
  errorEInvoiceCount: number;
  eWaybillCount: number;
  errorEWaybillCount: number;
  eArchiveInvoiceCount: number;
  eArchiveInvoiceExcludedFromReportCount: number;
  eReceiptCount: number;
  eReceiptExcludedFromReportCount: number;
  eArchiveReportGibStatus: string;
  eArchiveReportStatusCode: string;
  eReceiptReportGibStatus: string;
  eReceiptReportStatusCode: string;
}
