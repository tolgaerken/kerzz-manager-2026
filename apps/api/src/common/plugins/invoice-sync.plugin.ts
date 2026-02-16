import { Schema, Model, Connection } from "mongoose";

/**
 * Invoice-Sync Plugin Options
 */
export interface InvoiceSyncPluginOptions {
  /**
   * true: Invoice schema için (isPaid → ContractPayment.paid sync)
   * false: ContractPayment schema için (paid → Invoice.isPaid sync)
   */
  isInvoiceSchema: boolean;

  /**
   * Mongoose connection referansı (lazy loading için)
   * Her iki model de aynı connection'da olmalı
   */
  getConnection: () => Connection;
}

// Plugin'in birden fazla kez uygulanmasını önlemek için symbol
const INVOICE_SYNC_PLUGIN_APPLIED = Symbol("invoiceSyncPluginApplied");

// Sonsuz döngüyü önlemek için in-memory Set
// Aktif sync işlemlerini invoiceNumber/invoiceNo bazında takip eder
const activeSyncOperations = new Set<string>();

// Sync lock timeout (ms) - güvenlik için maksimum lock süresi
const SYNC_LOCK_TIMEOUT_MS = 5000;

/**
 * Sync lock'ı al ve timeout sonrası otomatik temizle
 */
function acquireSyncLock(key: string): boolean {
  if (activeSyncOperations.has(key)) {
    return false; // Lock zaten alınmış, sync atla
  }

  activeSyncOperations.add(key);

  // Güvenlik: timeout sonrası lock'ı temizle (stuck kalmasını önle)
  setTimeout(() => {
    activeSyncOperations.delete(key);
  }, SYNC_LOCK_TIMEOUT_MS);

  return true;
}

/**
 * Sync lock'ı serbest bırak
 */
function releaseSyncLock(key: string): void {
  activeSyncOperations.delete(key);
}

/**
 * Invoice <-> ContractPayment Otomatik Senkronizasyon Plugin
 *
 * Çift yönlü senkronizasyon sağlar:
 * - Invoice.isPaid değiştiğinde → ContractPayment.paid güncellenir
 * - ContractPayment.paid değiştiğinde → Invoice.isPaid güncellenir
 *
 * Desteklenen operasyonlar:
 * - findOneAndUpdate()
 * - updateOne()
 *
 * NOT: updateMany() ve bulkWrite() desteklenmez (bilinçli kapsam dışı)
 */
export function invoiceSyncPlugin(
  schema: Schema,
  options: InvoiceSyncPluginOptions
): void {
  // Plugin'in birden fazla kez uygulanmasını önle
  if (
    (schema as unknown as Record<symbol, boolean>)[INVOICE_SYNC_PLUGIN_APPLIED]
  ) {
    return;
  }
  (schema as unknown as Record<symbol, boolean>)[INVOICE_SYNC_PLUGIN_APPLIED] =
    true;

  if (options.isInvoiceSchema) {
    // ─────────────────────────────────────────────────────────────────────────
    // INVOICE SCHEMA: isPaid değiştiğinde ContractPayment.paid güncelle
    // ─────────────────────────────────────────────────────────────────────────

    schema.post(
      "findOneAndUpdate",
      async function (doc: Record<string, unknown> | null) {
        if (!doc) return;

        const update = this.getUpdate() as Record<string, unknown> | null;
        if (!update) return;

        // $set içinde isPaid var mı kontrol et
        const setFields = update.$set as Record<string, unknown> | undefined;
        if (setFields?.isPaid === undefined) return;

        const invoiceNumber = doc.invoiceNumber as string | undefined;
        if (!invoiceNumber) return;

        // Sonsuz döngü kontrolü - lock alınamıyorsa atla
        const lockKey = `invoice:${invoiceNumber}`;
        if (!acquireSyncLock(lockKey)) return;

        const newIsPaid = setFields.isPaid as boolean;
        const paymentDate = newIsPaid
          ? ((setFields.paymentSuccessDate as Date) ?? new Date())
          : null;

        try {
          const connection = options.getConnection();
          const ContractPayment = connection.model(
            "ContractPayment"
          ) as Model<unknown>;

          if (newIsPaid) {
            // Ödendi: paid=true ve paymentDate set et
            await ContractPayment.updateOne(
              { invoiceNo: invoiceNumber },
              {
                $set: {
                  paid: true,
                  ...(paymentDate ? { paymentDate } : {}),
                },
              }
            ).exec();
          } else {
            // Ödenmedi: paid=false ve paymentDate sil
            await ContractPayment.updateOne(
              { invoiceNo: invoiceNumber },
              {
                $set: { paid: false },
                $unset: { paymentDate: 1 },
              }
            ).exec();
          }
        } catch (err) {
          // Sync hatası ana işlemi etkilememeli
          console.error(
            `[InvoiceSyncPlugin] Invoice→ContractPayment sync hatası: ${err}`
          );
        } finally {
          // Lock'ı kısa bir gecikme ile serbest bırak (change stream event'lerinin işlenmesi için)
          setTimeout(() => releaseSyncLock(lockKey), 100);
        }
      }
    );

    schema.post(
      "updateOne",
      async function (result: { modifiedCount?: number }) {
        if (!result?.modifiedCount) return;

        const update = this.getUpdate() as Record<string, unknown> | null;
        if (!update) return;

        // $set içinde isPaid var mı kontrol et
        const setFields = update.$set as Record<string, unknown> | undefined;
        if (setFields?.isPaid === undefined) return;

        // Filter'dan invoiceNumber al
        const filter = this.getFilter() as Record<string, unknown>;
        const invoiceNumber =
          (filter.invoiceNumber as string) ||
          (filter._id ? undefined : undefined);

        if (!invoiceNumber) return;

        // Sonsuz döngü kontrolü - lock alınamıyorsa atla
        const lockKey = `invoice:${invoiceNumber}`;
        if (!acquireSyncLock(lockKey)) return;

        const newIsPaid = setFields.isPaid as boolean;
        const paymentDate = newIsPaid
          ? ((setFields.paymentSuccessDate as Date) ?? new Date())
          : null;

        try {
          const connection = options.getConnection();
          const ContractPayment = connection.model(
            "ContractPayment"
          ) as Model<unknown>;

          if (newIsPaid) {
            // Ödendi: paid=true ve paymentDate set et
            await ContractPayment.updateOne(
              { invoiceNo: invoiceNumber },
              {
                $set: {
                  paid: true,
                  ...(paymentDate ? { paymentDate } : {}),
                },
              }
            ).exec();
          } else {
            // Ödenmedi: paid=false ve paymentDate sil
            await ContractPayment.updateOne(
              { invoiceNo: invoiceNumber },
              {
                $set: { paid: false },
                $unset: { paymentDate: 1 },
              }
            ).exec();
          }
        } catch (err) {
          console.error(
            `[InvoiceSyncPlugin] Invoice→ContractPayment sync hatası (updateOne): ${err}`
          );
        } finally {
          setTimeout(() => releaseSyncLock(lockKey), 100);
        }
      }
    );
  } else {
    // ─────────────────────────────────────────────────────────────────────────
    // CONTRACT PAYMENT SCHEMA: paid değiştiğinde Invoice.isPaid güncelle
    // ─────────────────────────────────────────────────────────────────────────

    schema.post(
      "findOneAndUpdate",
      async function (doc: Record<string, unknown> | null) {
        if (!doc) return;

        const update = this.getUpdate() as Record<string, unknown> | null;
        if (!update) return;

        // $set içinde paid var mı kontrol et
        const setFields = update.$set as Record<string, unknown> | undefined;
        if (setFields?.paid === undefined) return;

        const invoiceNo = doc.invoiceNo as string | undefined;
        if (!invoiceNo) return;

        // Sonsuz döngü kontrolü - lock alınamıyorsa atla
        const lockKey = `invoice:${invoiceNo}`;
        if (!acquireSyncLock(lockKey)) return;

        const newPaid = setFields.paid as boolean;
        const paymentSuccessDate = newPaid
          ? ((setFields.paymentDate as Date) ?? new Date())
          : null;

        try {
          const connection = options.getConnection();
          const Invoice = connection.model("Invoice") as Model<unknown>;

          if (newPaid) {
            // Ödendi: isPaid=true ve paymentSuccessDate set et
            await Invoice.updateOne(
              { invoiceNumber: invoiceNo },
              {
                $set: {
                  isPaid: true,
                  ...(paymentSuccessDate ? { paymentSuccessDate } : {}),
                },
              }
            ).exec();
          } else {
            // Ödenmedi: isPaid=false ve paymentSuccessDate sil
            await Invoice.updateOne(
              { invoiceNumber: invoiceNo },
              {
                $set: { isPaid: false },
                $unset: { paymentSuccessDate: 1 },
              }
            ).exec();
          }
        } catch (err) {
          console.error(
            `[InvoiceSyncPlugin] ContractPayment→Invoice sync hatası: ${err}`
          );
        } finally {
          setTimeout(() => releaseSyncLock(lockKey), 100);
        }
      }
    );

    schema.post(
      "updateOne",
      async function (result: { modifiedCount?: number }) {
        if (!result?.modifiedCount) return;

        const update = this.getUpdate() as Record<string, unknown> | null;
        if (!update) return;

        // $set içinde paid var mı kontrol et
        const setFields = update.$set as Record<string, unknown> | undefined;
        if (setFields?.paid === undefined) return;

        // Filter'dan invoiceNo al
        const filter = this.getFilter() as Record<string, unknown>;
        const invoiceNo = filter.invoiceNo as string | undefined;

        if (!invoiceNo) return;

        // Sonsuz döngü kontrolü - lock alınamıyorsa atla
        const lockKey = `invoice:${invoiceNo}`;
        if (!acquireSyncLock(lockKey)) return;

        const newPaid = setFields.paid as boolean;
        const paymentSuccessDate = newPaid
          ? ((setFields.paymentDate as Date) ?? new Date())
          : null;

        try {
          const connection = options.getConnection();
          const Invoice = connection.model("Invoice") as Model<unknown>;

          if (newPaid) {
            // Ödendi: isPaid=true ve paymentSuccessDate set et
            await Invoice.updateOne(
              { invoiceNumber: invoiceNo },
              {
                $set: {
                  isPaid: true,
                  ...(paymentSuccessDate ? { paymentSuccessDate } : {}),
                },
              }
            ).exec();
          } else {
            // Ödenmedi: isPaid=false ve paymentSuccessDate sil
            await Invoice.updateOne(
              { invoiceNumber: invoiceNo },
              {
                $set: { isPaid: false },
                $unset: { paymentSuccessDate: 1 },
              }
            ).exec();
          }
        } catch (err) {
          console.error(
            `[InvoiceSyncPlugin] ContractPayment→Invoice sync hatası (updateOne): ${err}`
          );
        } finally {
          setTimeout(() => releaseSyncLock(lockKey), 100);
        }
      }
    );
  }
}
