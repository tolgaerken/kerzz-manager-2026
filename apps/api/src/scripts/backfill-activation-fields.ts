/**
 * Mevcut kontrat kalemlerine activated ve startDate alanlari ekler (backfill).
 *
 * Mantik:
 * - enabled: true olan kalemler → activated: true, activatedAt: editDate
 * - enabled: false olan kalemler → activated: false
 * - startDate: Ilgili kontratin startDate'i kullanilir,
 *   kontrat bulunamazsa kalemin editDate'i kullanilir.
 *
 * Kullanim:
 * cd apps/api
 * npx ts-node -r tsconfig-paths/register src/scripts/backfill-activation-fields.ts
 *
 * Opsiyonlar:
 * --dry-run    : Gercek guncelleme yapmadan sadece rapor uretir
 */

import { connect, connection, Schema, model } from "mongoose";
import * as dotenv from "dotenv";
import { join } from "path";

// .env dosyasini yukle (apps/api/.env)
dotenv.config({ path: join(__dirname, "../../.env") });

// Argumanlari parse et
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");

// Son 1 yil filtresi
const ONE_YEAR_AGO = new Date();
ONE_YEAR_AGO.setFullYear(ONE_YEAR_AGO.getFullYear() - 1);

// bulkWrite batch boyutu
const BATCH_SIZE = 500;

// Minimal schema'lar
const ContractSchema = new Schema(
  { id: String, startDate: Date },
  { collection: "contracts", strict: false },
);

const CashRegisterSchema = new Schema(
  {
    id: String,
    contractId: String,
    enabled: Boolean,
    activated: Boolean,
    startDate: Date,
    editDate: Date,
    createdAt: Date,
  },
  { collection: "cash-registers", strict: false },
);

const SaasSchema = new Schema(
  {
    id: String,
    contractId: String,
    enabled: Boolean,
    activated: Boolean,
    startDate: Date,
    editDate: Date,
    createdAt: Date,
  },
  { collection: "contract-saas", strict: false },
);

const SupportSchema = new Schema(
  {
    id: String,
    contractId: String,
    enabled: Boolean,
    activated: Boolean,
    startDate: Date,
    editDate: Date,
    createdAt: Date,
  },
  { collection: "contract-supports", strict: false },
);

const ItemSchema = new Schema(
  {
    id: String,
    contractId: String,
    enabled: Boolean,
    activated: Boolean,
    startDate: Date,
    editDate: Date,
    createdAt: Date,
  },
  { collection: "contract-items", strict: false },
);

const VersionSchema = new Schema(
  {
    id: String,
    contractId: String,
    enabled: Boolean,
    activated: Boolean,
    startDate: Date,
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
    console.error("MONGODB_CONTRACT_URI env degiskeni bulunamadi!");
    process.exit(1);
  }

  console.log(`Baglanti kuruluyor: ${mongoUri.substring(0, 40)}...`);
  console.log(`Veritabani: ${mongoDb || "(default)"}`);
  console.log(`Mod: ${isDryRun ? "DRY RUN (guncelleme yapilmayacak)" : "CANLI"}`);
  console.log(`Filtre: editDate >= ${ONE_YEAR_AGO.toISOString().split("T")[0]} (son 1 yil)`);
  console.log("---");

  await connect(mongoUri, { dbName: mongoDb });

  const ContractModel = model("Contract", ContractSchema);
  const collections: CollectionConfig[] = [
    { name: "cash-registers", model: model("CashRegister", CashRegisterSchema) },
    { name: "contract-saas", model: model("Saas", SaasSchema) },
    { name: "contract-supports", model: model("Support", SupportSchema) },
    { name: "contract-items", model: model("Item", ItemSchema) },
    { name: "contract-versions", model: model("Version", VersionSchema) },
  ];

  // Kontrat startDate cache
  const contractStartDates = new Map<string, Date>();
  const contracts = await ContractModel.find({}, { id: 1, startDate: 1 }).lean().exec();
  for (const c of contracts) {
    if (c.id && c.startDate) {
      contractStartDates.set(c.id, c.startDate);
    }
  }
  console.log(`${contracts.length} kontrat yuklendi.\n`);

  let totalUpdated = 0;
  let totalSkipped = 0;

  for (const collection of collections) {
    console.log(`--- ${collection.name} ---`);

    // Son 1 yil + activated henuz set edilmemis kayitlari bul
    const items = await collection.model
      .find({
        activated: { $exists: false },
        $or: [
          { editDate: { $gte: ONE_YEAR_AGO } },
          { createdAt: { $gte: ONE_YEAR_AGO } },
        ],
      })
      .lean()
      .exec();

    console.log(`  ${items.length} kayit guncellenmesi gerekiyor`);

    if (items.length === 0) {
      totalSkipped += await collection.model.countDocuments({ activated: { $exists: true } });
      console.log(`  0 guncellendi (zaten tamamlanmis veya filtre disinda)`);
      continue;
    }

    // bulkWrite operasyonlari olustur
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bulkOps: any[] = [];

    for (const item of items) {
      const isEnabled = item.enabled ?? true;

      const contractStart = item.contractId
        ? contractStartDates.get(item.contractId)
        : undefined;
      const startDate = contractStart || item.editDate || new Date();

      const updateData: Record<string, unknown> = {
        activated: isEnabled,
        startDate,
      };

      if (isEnabled) {
        updateData.activatedAt = item.editDate || new Date();
      }

      bulkOps.push({
        updateOne: {
          filter: { _id: item._id },
          update: { $set: updateData },
        },
      });
    }

    let updated = 0;

    if (!isDryRun && bulkOps.length > 0) {
      // Batch'ler halinde bulkWrite
      for (let i = 0; i < bulkOps.length; i += BATCH_SIZE) {
        const batch = bulkOps.slice(i, i + BATCH_SIZE);
        const result = await collection.model.bulkWrite(batch, { ordered: false });
        updated += result.modifiedCount;
        console.log(`  batch ${Math.floor(i / BATCH_SIZE) + 1}: ${result.modifiedCount} guncellendi`);
      }
    } else {
      updated = bulkOps.length; // dry-run icin
    }

    const alreadySet = await collection.model.countDocuments({
      activated: { $exists: true },
    });

    console.log(`  ${updated} guncellendi, ${alreadySet} toplam set edilmis`);
    totalUpdated += updated;
    totalSkipped += alreadySet;
  }

  console.log("\n=== OZET ===");
  console.log(`Toplam guncellenen: ${totalUpdated}`);
  console.log(`Toplam zaten set: ${totalSkipped}`);
  console.log(`Mod: ${isDryRun ? "DRY RUN" : "CANLI"}`);

  await connection.close();
  console.log("\nBaglanti kapatildi. Tamamlandi.");
}

main().catch((err) => {
  console.error("Hata:", err);
  process.exit(1);
});
