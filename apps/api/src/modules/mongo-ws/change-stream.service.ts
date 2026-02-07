import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection, ChangeStream } from "mongoose";
import { CONTRACT_DB_CONNECTION } from "../../database/contract-database.module";
import { MongoWsGateway } from "./mongo-ws.gateway";
import type {
  MongoChangeEvent,
  WatchOptions,
  ChangeOperationType,
} from "./mongo-ws.types";

/**
 * MongoDB change stream dinleyicisi.
 *
 * Herhangi bir collection icin change stream baslatir.
 * Degisiklik aldiginda MongoWsGateway uzerinden ilgili room'a yayinlar.
 *
 * Kullanim:
 *   - Baslangicta varsayilan collection'lar otomatik dinlenir.
 *   - Baska moduller `registerCollection()` ile runtime'da yeni collection ekleyebilir.
 */
@Injectable()
export class ChangeStreamService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ChangeStreamService.name);
  private readonly streams = new Map<string, ChangeStream>();

  constructor(
    @InjectConnection(CONTRACT_DB_CONNECTION)
    private readonly connection: Connection,
    private readonly gateway: MongoWsGateway
  ) {}

  async onModuleInit() {
    this.logger.log("ChangeStreamService baslatiliyor...");
    this.logger.log(
      `DB baglanti durumu: ${this.connection.readyState === 1 ? "bagli" : "baglantiyor"}`
    );
    // Varsayilan collection'lari dinlemeye basla
    this.registerCollection("contract-payments");
    this.registerCollection("bank-transactions");
  }

  onModuleDestroy() {
    // Tum change stream'leri kapat
    for (const [name, stream] of this.streams) {
      this.logger.log(`Change stream kapatiliyor: ${name}`);
      stream.close().catch((err) => {
        this.logger.error(`Stream kapatma hatasi (${name}): ${err}`);
      });
    }
    this.streams.clear();
  }

  /**
   * Belirtilen collection icin change stream baslatir.
   * Ayni collection icin birden fazla kayit yapilmaz.
   */
  registerCollection(
    collectionName: string,
    options?: WatchOptions
  ): void {
    if (this.streams.has(collectionName)) {
      this.logger.warn(
        `Collection zaten dinleniyor: ${collectionName}`
      );
      return;
    }

    this.logger.log(
      `Collection kayit ediliyor: ${collectionName} (pipeline: ${options?.pipeline ? "ozel" : "yok"}, fullDocument: ${options?.fullDocument ?? "updateLookup"})`
    );
    this.watchCollection(collectionName, options);
  }

  private watchCollection(
    collectionName: string,
    options?: WatchOptions
  ): void {
    const db = this.connection.db;

    if (!db) {
      this.logger.error(
        "Veritabani baglantisi henuz hazir degil, change stream baslatilamiyor"
      );
      return;
    }

    const pipeline = options?.pipeline ?? [];
    const fullDocument = options?.fullDocument ?? "updateLookup";

    const collection = db.collection(collectionName);
    const changeStream = collection.watch(pipeline, { fullDocument });

    this.streams.set(collectionName, changeStream);

    this.logger.log(
      `Change stream baslatildi: ${collectionName}`
    );

    changeStream.on("change", (change: any) => {
      this.logger.log(
        `[${collectionName}] Degisiklik algilandi: op=${change.operationType}, docId=${change.documentKey?._id?.toString() ?? "?"}`
      );
      this.handleChange(collectionName, change);
    });

    changeStream.on("error", (error) => {
      this.logger.error(
        `Change stream hatasi (${collectionName}): ${error}`
      );
      // Yeniden baslatmayi dene
      this.streams.delete(collectionName);
      setTimeout(() => {
        this.logger.log(
          `Change stream yeniden baslatiliyor: ${collectionName}`
        );
        this.watchCollection(collectionName, options);
      }, 5000);
    });
  }

  private handleChange(collectionName: string, change: any): void {
    const operationType = change.operationType as ChangeOperationType;

    // Sadece anlamli operasyonlari ilet
    if (
      !["insert", "update", "replace", "delete"].includes(operationType)
    ) {
      this.logger.debug(
        `[${collectionName}] Operasyon atlandi: ${operationType}`
      );
      return;
    }

    const documentId =
      change.documentKey?._id?.toString() ?? "";

    const updatedFields = change.updateDescription?.updatedFields;
    if (updatedFields) {
      this.logger.log(
        `[${collectionName}] Guncellenen alanlar: ${Object.keys(updatedFields).join(", ")}`
      );
    }

    const event: MongoChangeEvent = {
      collection: collectionName,
      operationType,
      documentId,
      updatedFields,
      fullDocument: change.fullDocument
        ? this.sanitizeDocument(change.fullDocument)
        : undefined,
      timestamp: new Date(),
    };

    this.logger.log(
      `[${collectionName}] Event gateway'e iletiliyor => doc=${documentId}, op=${operationType}`
    );
    this.gateway.emitChange(event);
  }

  /**
   * Dokumandan _id'yi string'e donusturur ve gereksiz alanlari temizler.
   */
  private sanitizeDocument(
    doc: Record<string, unknown>
  ): Record<string, unknown> {
    const sanitized = { ...doc };

    if (sanitized._id) {
      sanitized._id = String(sanitized._id);
    }

    return sanitized;
  }
}
