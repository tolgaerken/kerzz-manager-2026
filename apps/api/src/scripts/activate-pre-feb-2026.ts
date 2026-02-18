/**
 * 1 Şubat 2026 öncesi oluşturulmuş ve henüz aktive edilmemiş kontrat kalemlerini
 * toplu olarak aktive eden migration script'i.
 *
 * Mantık:
 * - Aşağıdaki koşullardan birini sağlayan kayıtları bulur:
 *   1. createdAt < 2026-02-01 ve activated: false
 *   2. createdAt alanı yok ve activated: false (eski kayıtlar)
 *   3. activated alanı yok (hiç set edilmemiş)
 * - activated: true, activatedAt: createdAt (veya editDate) olarak günceller
 * - Prorated plan OLUŞTURMAZ (eski kayıtlar için gereksiz)
 *
 * Kullanım:
 * cd apps/api
 * npx ts-node -r tsconfig-paths/register src/scripts/activate-pre-feb-2026.ts
 *
 * Opsiyonlar:
 * --dry-run    : Gerçek güncelleme yapmadan sadece rapor üretir
 */

import { connect, connection, Schema, model } from "mongoose";
import * as dotenv from "dotenv";
import { join } from "path";

dotenv.config({ path: join(__dirname, "../../.env") });

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");

const CUTOFF_DATE = new Date("2026-02-01T00:00:00.000Z");
const BATCH_SIZE = 500;

const CashRegisterSchema = new Schema(
  {
    id: String,
    contractId: String,
    activated: Boolean,
    activatedAt: Date,
    editDate: Date,
    createdAt: Date,
  },
  { collection: "cash-registers", strict: false },
);

const SaasSchema = new Schema(
  {
    id: String,
    contractId: String,
    activated: Boolean,
    activatedAt: Date,
    editDate: Date,
    createdAt: Date,
  },
  { collection: "contract-saas", strict: false },
);

const SupportSchema = new Schema(
  {
    id: String,
    contractId: String,
    activated: Boolean,
    activatedAt: Date,
    editDate: Date,
    createdAt: Date,
  },
  { collection: "contract-supports", strict: false },
);

const ItemSchema = new Schema(
  {
    id: String,
    contractId: String,
    activated: Boolean,
    activatedAt: Date,
    editDate: Date,
    createdAt: Date,
  },
  { collection: "contract-items", strict: false },
);

const VersionSchema = new Schema(
  {
    id: String,
    contractId: String,
    activated: Boolean,
    activatedAt: Date,
    editDate: Date,
    createdAt: Date,
  },
  { collection: "contract-versions", strict: false },
);

interface CollectionConfig {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: ReturnType<typeof model<any>>;
}

async function main(): Promise<void> {
  const mongoUri = process.env.MONGODB_CONTRACT_URI;
  const mongoDb = process.env.MONGODB_CONTRACT_DB;
  if (!mongoUri) {
    console.error("MONGODB_CONTRACT_URI env değişkeni bulunamadı!");
    process.exit(1);
  }

  console.log(`Bağlantı kuruluyor: ${mongoUri.substring(0, 40)}...`);
  console.log(`Veritabanı: ${mongoDb || "(default)"}`);
  console.log(`Mod: ${isDryRun ? "DRY RUN (güncelleme yapılmayacak)" : "CANLI"}`);
  console.log(`Filtre: (createdAt < ${CUTOFF_DATE.toISOString().split("T")[0]} VEYA createdAt yok) ve (activated: false VEYA activated yok)`);
  console.log("---");

  await connect(mongoUri, { dbName: mongoDb });

  const collections: CollectionConfig[] = [
    { name: "cash-registers", model: model("CashRegister", CashRegisterSchema) },
    { name: "contract-saas", model: model("Saas", SaasSchema) },
    { name: "contract-supports", model: model("Support", SupportSchema) },
    { name: "contract-items", model: model("Item", ItemSchema) },
    { name: "contract-versions", model: model("Version", VersionSchema) },
  ];

  let totalUpdated = 0;
  let totalSkipped = 0;
  const now = new Date();

  for (const collection of collections) {
    console.log(`--- ${collection.name} ---`);

    const items = await collection.model
      .find({
        $or: [
          // activated: false ve (createdAt < cutoff VEYA createdAt yok)
          {
            activated: false,
            $or: [
              { createdAt: { $lt: CUTOFF_DATE } },
              { createdAt: { $exists: false } },
            ],
          },
          // activated alanı hiç yok (eski kayıtlar)
          { activated: { $exists: false } },
        ],
      })
      .lean()
      .exec();

    console.log(`  ${items.length} kayıt güncellenmesi gerekiyor`);

    if (items.length === 0) {
      const alreadyActivated = await collection.model.countDocuments({
        activated: true,
      });
      totalSkipped += alreadyActivated;
      console.log(`  0 güncellendi (${alreadyActivated} zaten aktive edilmiş)`);
      continue;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bulkOps: any[] = [];

    for (const item of items) {
      const activatedAt = item.createdAt || item.editDate || now;

      bulkOps.push({
        updateOne: {
          filter: { _id: item._id },
          update: {
            $set: {
              activated: true,
              activatedAt,
              editDate: now,
            },
          },
        },
      });
    }

    let updated = 0;

    if (!isDryRun && bulkOps.length > 0) {
      for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
        const batch = bulkOps.slice(i, i + BATCH_SIZE);
        const result = await collection.model.bulkWrite(batch, { ordered: false });
        updated += result.modifiedCount;
        console.log(`  batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.modifiedCount} güncellendi`);
      }
    } else {
      updated = bulkOps.length;
    }

    const alreadyActivated = await collection.model.countDocuments({
      activated: true,
    });

    console.log(`  ${updated} güncellendi, ${alreadyActivated} toplam aktive edilmiş`);
    totalUpdated += updated;
    totalSkipped += alreadyActivated - updated;
  }

  console.log("\n=== ÖZET ===");
  console.log(`Toplam güncellenen: ${totalUpdated}`);
  console.log(`Toplam zaten aktive: ${totalSkipped}`);
  console.log(`Mod: ${isDryRun ? "DRY RUN" : "CANLI"}`);

  await connection.close();
  console.log("\nBağlantı kapatıldı. Tamamlandı.");
}

main().catch((err) => {
  console.error("Hata:", err);
  process.exit(1);
});
