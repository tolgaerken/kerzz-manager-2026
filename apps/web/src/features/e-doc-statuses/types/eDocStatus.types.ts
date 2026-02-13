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

export interface IntegratorStatusQueryParams {
  startDate: string;
  endDate: string;
}
