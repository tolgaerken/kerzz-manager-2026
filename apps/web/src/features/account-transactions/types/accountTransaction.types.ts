export interface Account {
  ID: string;
  name: string;
}

export interface AccountTransaction {
  TARIH: string;
  ACIKLAMA: string;
  BORC: number;
  ALACAK: number;
  BELGE_NO: string;
  HAREKET_TURU: string;
  DOVIZ_TURU: string;
  DOVIZ_TUTAR: number;
}

export interface DocumentDetail {
  STOK_KODU: string;
  STOK_ADI: string;
  MIKTAR: number;
  BIRIM_FIYAT: number;
  TOPLAM: number;
  STHAR_KDV: number;
  DOVIZ: string;
  DOV_FIYAT: number;
}

export interface TransactionsSummary {
  totalDebit: number;
  totalCredit: number;
  balance: number;
}

export interface AccountTransactionsQueryParams {
  year: number;
  company: string;
}
