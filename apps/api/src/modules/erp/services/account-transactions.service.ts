import { Injectable, Logger } from "@nestjs/common";
import { NetsisProxyService } from "./netsis-proxy.service";

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

@Injectable()
export class AccountTransactionsService {
  private readonly logger = new Logger(AccountTransactionsService.name);

  constructor(private readonly netsisProxyService: NetsisProxyService) {}

  /**
   * Cari hesap listesini getirir
   */
  async getAccounts(year: number, company: string): Promise<Account[]> {
    const db = `${company}${year}`;
    const sql = `SELECT CARI_KOD AS ID, dbo.trk(CARI_ISIM) AS name FROM netsissvr.${db}.dbo.TBLCASABIT ORDER BY CARI_ISIM`;

    this.logger.debug(`Cari listesi sorgusu: ${sql}`);

    try {
      const result = await this.netsisProxyService.executeSql<Account[]>(sql);
      return result || [];
    } catch (error) {
      this.logger.error(`Cari listesi çekme hatası: ${error}`);
      throw error;
    }
  }

  /**
   * Belirli bir cari hesabın hareketlerini getirir
   */
  async getTransactions(
    accountId: string,
    year: number,
    company: string
  ): Promise<AccountTransaction[]> {
    const db = `${company}${year}`;
    const sql = `
      SELECT 
        TARIH,
        dbo.trk(ACIKLAMA) AS ACIKLAMA,
        BORC,
        ALACAK,
        BELGE_NO,
        HAREKET_TURU,
        DOVIZ_TURU,
        DOVIZ_TUTAR
      FROM netsissvr.${db}.dbo.TBLCAHAR 
      WHERE CARI_KOD = '${accountId}'
      ORDER BY TARIH DESC
    `;

    this.logger.debug(`Cari hareketleri sorgusu: ${sql}`);

    try {
      const result = await this.netsisProxyService.executeSql<AccountTransaction[]>(sql);
      return result || [];
    } catch (error) {
      this.logger.error(`Cari hareketleri çekme hatası: ${error}`);
      throw error;
    }
  }

  /**
   * Belge detayını (fatura/irsaliye kalemleri) getirir
   */
  async getDocumentDetail(
    year: number,
    documentId: string,
    company: string
  ): Promise<DocumentDetail[]> {
    const db = `${company}${year}`;
    const sql = `
      SELECT 
        STOK_KODU,
        dbo.TRK(
          CASE 
            WHEN EKALAN_NEDEN = 1 THEN EKALAN 
            ELSE (SELECT TOP 1 STOK_ADI FROM NETSISSVR.${db}.dbo.TBLSTSABIT WHERE STOK_KODU = TBLSTHAR.STOK_KODU)
          END
        ) AS STOK_ADI,
        STHAR_KDV,
        CONVERT(FLOAT, STHAR_GCMIK) AS MIKTAR,
        CONVERT(FLOAT, STHAR_DOVFIAT) AS DOV_FIYAT,
        (SELECT TOP 1 ISIM FROM NETSISSVR.NETSIS.dbo.KUR WHERE BIRIM = TBLSTHAR.STHAR_DOVTIP) AS DOVIZ,
        CONVERT(MONEY, STHAR_BF) AS BIRIM_FIYAT,
        CONVERT(MONEY, STHAR_BF * STHAR_GCMIK) AS TOPLAM
      FROM NETSISSVR.${db}.dbo.TBLSTHAR
      WHERE FISNO = '${documentId}'
      ORDER BY SIRA
    `;

    this.logger.debug(`Belge detayı sorgusu: ${sql}`);

    try {
      const result = await this.netsisProxyService.executeSql<DocumentDetail[]>(sql);
      return result || [];
    } catch (error) {
      this.logger.error(`Belge detayı çekme hatası: ${error}`);
      throw error;
    }
  }
}
