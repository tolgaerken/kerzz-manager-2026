import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

interface BankAccount {
  bankAccId: string;
  bankAccName: string;
  erpCompanyId: string;
  erpMuhCode: string;
}

interface ErpAccount {
  accountCode: string;
  accountName: string;
}

interface ErpGlAccount {
  glCode: string;
  glName: string;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 dakika

@Injectable()
export class ErpBankProxyService {
  private readonly logger = new Logger(ErpBankProxyService.name);
  private readonly erpBaseUrl: string;

  // Bellek ici cache
  private bankMapsCache: CacheEntry<BankAccount[]> | null = null;
  private erpAccountsCache = new Map<string, CacheEntry<ErpAccount[]>>();
  private erpGlAccountsCache = new Map<string, CacheEntry<ErpGlAccount[]>>();

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.erpBaseUrl =
      this.configService.get<string>("ERP_API_URL") ??
      "https://smarty.kerzz.com:4004";
  }

  async getErpBankMaps(): Promise<BankAccount[]> {
    // Cache kontrolu
    if (this.bankMapsCache && Date.now() < this.bankMapsCache.expiresAt) {
      return this.bankMapsCache.data;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<BankAccount[]>(
          `${this.erpBaseUrl}/erp/getErpBankMaps`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              apiKey: "1453",
            },
          },
        ),
      );

      this.bankMapsCache = {
        data: response.data,
        expiresAt: Date.now() + CACHE_TTL_MS,
      };

      return response.data;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error(
        `ERP banka haritasi hatasi: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getErpAccounts(companyId: string): Promise<ErpAccount[]> {
    const cached = this.erpAccountsCache.get(companyId);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<ErpAccount[]>(
          `${this.erpBaseUrl}/erp/getErpAccounts`,
          { companyId },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              apiKey: "1453",
            },
          },
        ),
      );

      this.erpAccountsCache.set(companyId, {
        data: response.data,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return response.data;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error(
        `ERP cari hesaplar hatasi (${companyId}): ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getErpGlAccounts(companyId: string): Promise<ErpGlAccount[]> {
    const cached = this.erpGlAccountsCache.get(companyId);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<ErpGlAccount[]>(
          `${this.erpBaseUrl}/erp/getErpGlAccounts`,
          { companyId },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              apiKey: "1453",
            },
          },
        ),
      );

      this.erpGlAccountsCache.set(companyId, {
        data: response.data,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return response.data;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error(
        `ERP muhasebe hesaplari hatasi (${companyId}): ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
