/**
 * Mevcut müşterilerin erpId alanlarını erpMappings dizisine backfill eder.
 *
 * Mantık:
 * - erpId alanı dolu olan müşteriler için erpMappings dizisine
 *   varsayılan firma (VERI) ile bir mapping eklenir.
 * - Zaten erpMappings dizisi dolu olan müşteriler atlanır.
 * - İdempotent: tekrar çalıştırılabilir, aynı veriyi iki kez eklemez.
 *
 * Kullanım:
 * cd apps/api
 * npx ts-node -r tsconfig-paths/register src/scripts/backfill-erp-mappings.ts
 *
 * Opsiyonlar:
 * --dry-run       : Gerçek güncelleme yapmadan sadece rapor üretir
 * --company=XXX   : Varsayılan firma kodu (default: VERI)
 * --primary       : Eklenen mapping'i primary olarak işaretle
 */

import { connect, connection, Schema, model } from "mongoose";
import * as dotenv from "dotenv";
import { join } from "path";

// .env dosyasını yükle (apps/api/.env)
dotenv.config({ path: join(__dirname, "../../.env") });

// Argümanları parse et
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isPrimary = args.includes("--primary");

const companyArg = args.find((a) => a.startsWith("--company="));
const defaultCompanyId = companyArg ? companyArg.split("=")[1] : "VERI";

// bulkWrite batch boyutu
const BATCH_SIZE = 500;

// Minimal schema
const CustomerSchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    id: String,
    name: String,
    erpId: String,
    erpMappings: [
      {
        companyId: String,
        erpId: String,
        isPrimary: Boolean,
      },
    ],
  },
  { collection: "customers", strict: false }
);

async function main() {
  const mongoUri = process.env.CONTRACT_DB_URI;
  if (!mongoUri) {
    console.error("CONTRACT_DB_URI environment variable is not set");
    process.exit(1);
  }

  console.log("=".repeat(60));
  console.log("ERP Mappings Backfill Script");
  console.log("=".repeat(60));
  console.log(`Mode: ${isDryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Default Company ID: ${defaultCompanyId}`);
  console.log(`Set as Primary: ${isPrimary}`);
  console.log("");

  await connect(mongoUri);
  console.log("MongoDB bağlantısı kuruldu");

  const CustomerModel = model("Customer", CustomerSchema);

  // erpId dolu ve erpMappings boş/yok olan müşterileri bul
  const filter = {
    erpId: { $exists: true, $nin: ["", null] },
    $or: [
      { erpMappings: { $exists: false } },
      { erpMappings: { $size: 0 } },
      { erpMappings: null },
    ],
  };

  const totalCount = await CustomerModel.countDocuments(filter);
  console.log(`Backfill yapılacak müşteri sayısı: ${totalCount}`);

  if (totalCount === 0) {
    console.log("Backfill yapılacak müşteri bulunamadı.");
    await connection.close();
    return;
  }

  let processed = 0;
  let updated = 0;
  let skipped = 0;

  // Cursor ile batch işleme
  const cursor = CustomerModel.find(filter).cursor();

  let batch: any[] = [];

  for await (const customer of cursor) {
    processed++;

    const erpId = customer.erpId as string;
    if (!erpId || !erpId.trim()) {
      skipped++;
      continue;
    }

    // Yeni mapping oluştur
    const newMapping = {
      companyId: defaultCompanyId,
      erpId: erpId.trim(),
      isPrimary: isPrimary,
    };

    batch.push({
      updateOne: {
        filter: { _id: customer._id },
        update: {
          $set: {
            erpMappings: [newMapping],
          },
        },
      },
    });

    // Batch dolduğunda yaz
    if (batch.length >= BATCH_SIZE) {
      if (!isDryRun) {
        const result = await CustomerModel.bulkWrite(batch);
        updated += result.modifiedCount;
      } else {
        updated += batch.length;
      }
      console.log(`İşlendi: ${processed}/${totalCount}, Güncellendi: ${updated}`);
      batch = [];
    }
  }

  // Kalan batch'i yaz
  if (batch.length > 0) {
    if (!isDryRun) {
      const result = await CustomerModel.bulkWrite(batch);
      updated += result.modifiedCount;
    } else {
      updated += batch.length;
    }
  }

  console.log("");
  console.log("=".repeat(60));
  console.log("SONUÇ");
  console.log("=".repeat(60));
  console.log(`Toplam işlenen: ${processed}`);
  console.log(`Güncellenen: ${updated}`);
  console.log(`Atlanan (boş erpId): ${skipped}`);

  if (isDryRun) {
    console.log("");
    console.log("⚠️  DRY RUN modu - gerçek güncelleme yapılmadı");
    console.log("Gerçek güncelleme için --dry-run parametresini kaldırın");
  }

  await connection.close();
  console.log("MongoDB bağlantısı kapatıldı");
}

main().catch((err) => {
  console.error("Script hatası:", err);
  process.exit(1);
});
