import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";

@Injectable()
export class NetsisProxyService {
  private readonly logger = new Logger(NetsisProxyService.name);
  private readonly netsisSocketUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.netsisSocketUrl = this.configService.get<string>("NETSIS_SOCKET_URL") ?? "";
  }

  async executeSql<T>(sql: string): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<T>(`${this.netsisSocketUrl}/sql/`, {
          action: "sql",
          sql,
        })
      );
      return response.data;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      this.logger.error(`Netsis SQL sorgu hatası: ${error.message}`, error.stack);
      throw error;
    }
  }
}
