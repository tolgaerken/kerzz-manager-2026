/**
 * MongoDB Change Stream uzerinden WebSocket'e iletilen degisiklik olaylari
 * icin ortak tipler.
 */

/** MongoDB change stream'den gelen operasyon turleri. */
export type ChangeOperationType = "insert" | "update" | "replace" | "delete";

/** Frontend'e iletilen degisiklik olayi. */
export interface MongoChangeEvent {
  /** Degisen collection adi. */
  collection: string;
  /** Operasyon turu. */
  operationType: ChangeOperationType;
  /** Degisen dokuman ID'si. */
  documentId: string;
  /** Guncellenen alanlar (sadece update operasyonunda). */
  updatedFields?: Record<string, unknown>;
  /** Tam dokuman (fullDocument etkinse). */
  fullDocument?: Record<string, unknown>;
  /** Olay zamani. */
  timestamp: Date;
}

/** Change stream dinleme secenekleri. */
export interface WatchOptions {
  /** Ozel aggregation pipeline. */
  pipeline?: Record<string, unknown>[];
  /** Tam dokumani dahil et. Varsayilan: "updateLookup". */
  fullDocument?: "default" | "updateLookup";
}

/** Client tarafindan gonderilen subscribe/unsubscribe mesaji. */
export interface CollectionSubscription {
  /** Dinlenecek collection adi. */
  collection: string;
}
