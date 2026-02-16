import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, SortOrder } from "mongoose";
import { ErpBalance, ErpBalanceDocument } from "../schemas/erp-balance.schema";
import { CONTRACT_DB_CONNECTION } from "../../../database/contract-database.module";
import { CompaniesService } from "../../companies/companies.service";
import { NetsisProxyService } from "./netsis-proxy.service";
import { ErpBalanceQueryDto } from "../dto/erp-balance-query.dto";
import {
  getAuditFieldsForUpdate,
  getAuditFieldsForSetOnInsert,
} from "../../../common/audit";

interface NetsisBalanceRow {
  CariKodu: string;
  CariUnvan: string;
  CariBakiye: number;
  CariVade: number;
  Bugun: number;
  ToplamGecikme: number;
  VadesiGelmemis: number;
  Limiti: number;
  GECIKMEGUN: number;
  GrupKodu: string;
  TcKimlik: string;
  VergiN: string;
  EkAcik1: string;
}

@Injectable()
export class ErpBalanceService {
  private readonly logger = new Logger(ErpBalanceService.name);

  constructor(
    @InjectModel(ErpBalance.name, CONTRACT_DB_CONNECTION)
    private erpBalanceModel: Model<ErpBalanceDocument>,
    private readonly companiesService: CompaniesService,
    private readonly netsisProxyService: NetsisProxyService
  ) {}

  async fetchAndStoreAllBalances(): Promise<{ success: number; failed: number }> {
    const companies = await this.companiesService.findWithCloudDb();
    const currentYear = new Date().getFullYear();
    const fetchedAt = new Date();

    let success = 0;
    let failed = 0;

    const results = await Promise.allSettled(
      companies.map((company) =>
        this.fetchCompanyBalances(company.id, company.idc, currentYear)
      )
    );

    const allBalances: (NetsisBalanceRow & { internalFirm: string })[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === "fulfilled" && result.value) {
        allBalances.push(...result.value);
        success++;
      } else {
        failed++;
        if (result.status === "rejected") {
          this.logger.error(
            `${companies[i].id} bakiye çekme hatası: ${result.reason}`
          );
        }
      }
    }

    if (allBalances.length > 0) {
      await this.storeBalances(allBalances, fetchedAt);
    }

    this.logger.log(
      `Bakiye güncelleme tamamlandı. Başarılı: ${success}, Başarısız: ${failed}, Toplam kayıt: ${allBalances.length}`
    );

    return { success, failed };
  }

  private async fetchCompanyBalances(
    companyId: string,
    companyIdc: string,
    year: number
  ): Promise<(NetsisBalanceRow & { internalFirm: string })[]> {
    const db = `${companyId}${year}`;
    const sql = `EXECUTE NETSISSVR.${db}.dbo.SP_CARI_BORC_YAS`;

    this.logger.debug(`Bakiye sorgusu çalıştırılıyor: ${sql}`);

    const rows = await this.netsisProxyService.executeSql<NetsisBalanceRow[]>(sql);

    if (!rows || !Array.isArray(rows)) {
      this.logger.warn(`${companyId} için boş sonuç döndü.`);
      return [];
    }

    return rows.map((row) => ({
      ...row,
      internalFirm: companyIdc,
    }));
  }

  private async storeBalances(
    balances: (NetsisBalanceRow & { internalFirm: string })[],
    fetchedAt: Date
  ): Promise<void> {
    // Audit alanlarini al (bulkWrite middleware calistirmaz)
    const auditUpdate = getAuditFieldsForUpdate();
    const auditSetOnInsert = getAuditFieldsForSetOnInsert();

    const bulkOps = balances.map((balance) => ({
      updateOne: {
        filter: {
          CariKodu: balance.CariKodu,
          internalFirm: balance.internalFirm,
        },
        update: {
          $set: {
            ...balance,
            fetchedAt,
            ...auditUpdate,
          },
          $setOnInsert: auditSetOnInsert,
        },
        upsert: true,
      },
    }));

    const BATCH_SIZE = 500;
    for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
      const batch = bulkOps.slice(i, i + BATCH_SIZE);
      await this.erpBalanceModel.bulkWrite(batch);
    }
  }

  async findAll(query: ErpBalanceQueryDto) {
    const {
      page = 1,
      limit = 50,
      search,
      internalFirm,
      sortField = "CariUnvan",
      sortOrder = "asc",
    } = query;

    const skip = (page - 1) * limit;
    let filter: Record<string, any> = {};

    if (internalFirm) {
      filter.internalFirm = internalFirm;
    }

    if (search) {
      const searchFilter = {
        $or: [
          { CariUnvan: { $regex: search, $options: "i" } },
          { CariKodu: { $regex: search, $options: "i" } },
          { VergiN: { $regex: search, $options: "i" } },
          { TcKimlik: { $regex: search, $options: "i" } },
        ],
      };
      filter = internalFirm
        ? { $and: [{ internalFirm }, searchFilter] }
        : searchFilter;
    }

    const sort: Record<string, SortOrder> = {};
    sort[sortField] = sortOrder === "asc" ? 1 : -1;

    const [data, total] = await Promise.all([
      this.erpBalanceModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.erpBalanceModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findByCompany(internalFirm: string) {
    return this.erpBalanceModel
      .find({ internalFirm })
      .sort({ CariUnvan: 1 })
      .lean()
      .exec();
  }

  async getStatus() {
    const [totalRecords, lastRecord, companyCounts] = await Promise.all([
      this.erpBalanceModel.countDocuments().exec(),
      this.erpBalanceModel.findOne().sort({ fetchedAt: -1 }).lean().exec(),
      this.erpBalanceModel.aggregate([
        { $group: { _id: "$internalFirm", count: { $sum: 1 } } },
        { $project: { internalFirm: "$_id", count: 1, _id: 0 } },
        { $sort: { internalFirm: 1 } },
      ]),
    ]);

    return {
      lastFetchedAt: lastRecord?.fetchedAt ?? null,
      totalRecords,
      companyCounts,
    };
  }
}
