/**
 * group-companies koleksiyonunda id ve idc alanlarını tek companyCode alanına taşır.
 *
 * Mantık:
 * - Mevcut idc değeri companyCode olarak kullanılır (küçük harfli, internalFirm ile uyumlu)
 * - id ve idc alanları kaldırılır
 * - companyCode için unique index oluşturulur
 *
 * Kullanım:
 * cd apps/api
 * npx ts-node -r tsconfig-paths/register src/scripts/migrate-group-company-code.ts
 *
 * Opsiyonlar:
 * --dry-run : Gerçek güncelleme yapmadan sadece rapor üretir
 */

import { connect, connection, Schema, model } from "mongoose";
import * as dotenv from "dotenv";
import { join } from "path";

dotenv.config({ path: join(__dirname, "../../.env") });

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");

const GroupCompanySchema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    id: String,
    idc: String,
    companyCode: String,
    name: String,
    cloudDb: String,
    licanceId: String,
    eInvoice: Boolean,
    vatNo: String,
    noVat: Boolean,
    exemptionReason: String,
    description: String,
    isActive: Boolean,
  },
  { collection: "group-companies", strict: false }
);

async function main() {
  const mongoUri = process.env.CONTRACT_DB_URI;
  if (!mongoUri) {
    console.error("CONTRACT_DB_URI environment variable is not set");
    process.exit(1);
  }

  console.log("=".repeat(60));
  console.log("Group Company Code Migration Script");
  console.log("=".repeat(60));
  console.log(`Mode: ${isDryRun ? "DRY RUN" : "LIVE"}`);
  console.log("");

  await connect(mongoUri);
  console.log("MongoDB bağlantısı kuruldu");

  const GroupCompanyModel = model("GroupCompany", GroupCompanySchema);

  // Mevcut kayıtları kontrol et
  const companies = await GroupCompanyModel.find({}).lean();
  console.log(`Toplam firma sayısı: ${companies.length}`);
  console.log("");

  // Mevcut durumu göster
  console.log("Mevcut durum:");
  console.log("-".repeat(50));
  for (const company of companies) {
    const hasCompanyCode = !!company.companyCode;
    const hasId = !!company.id;
    const hasIdc = !!company.idc;
    console.log(
      `${company.name}: id=${company.id || "-"}, idc=${company.idc || "-"}, companyCode=${company.companyCode || "-"}`
    );
  }
  console.log("");

  // Migration işlemi
  const needsMigration = companies.filter((c) => !c.companyCode && c.idc);
  console.log(`Migration yapılacak kayıt sayısı: ${needsMigration.length}`);

  if (needsMigration.length === 0) {
    console.log("Migration yapılacak kayıt bulunamadı.");
    await connection.close();
    return;
  }

  let updated = 0;

  for (const company of needsMigration) {
    const newCompanyCode = company.idc;

    console.log(
      `Migrating: ${company.name} -> companyCode: ${newCompanyCode}`
    );

    if (!isDryRun) {
      await GroupCompanyModel.updateOne(
        { _id: company._id },
        {
          $set: { companyCode: newCompanyCode },
          $unset: { id: "", idc: "" },
        }
      );
      updated++;
    } else {
      updated++;
    }
  }

  // companyCode için unique index oluştur
  if (!isDryRun) {
    try {
      // Eski index'leri kaldır
      try {
        await GroupCompanyModel.collection.dropIndex("id_1");
        console.log("Eski id_1 index kaldırıldı");
      } catch {
        // Index yoksa hata vermez
      }

      try {
        await GroupCompanyModel.collection.dropIndex("idc_1");
        console.log("Eski idc_1 index kaldırıldı");
      } catch {
        // Index yoksa hata vermez
      }

      // Yeni index oluştur
      await GroupCompanyModel.collection.createIndex(
        { companyCode: 1 },
        { unique: true }
      );
      console.log("companyCode için unique index oluşturuldu");
    } catch (err) {
      console.error("Index işlemi hatası:", err);
    }
  }

  console.log("");
  console.log("=".repeat(60));
  console.log("SONUÇ");
  console.log("=".repeat(60));
  console.log(`Güncellenen: ${updated}`);

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
