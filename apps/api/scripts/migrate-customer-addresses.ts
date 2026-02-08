/**
 * Customer Address Migration Script
 *
 * Mevcut customer kayıtlarındaki flat address yapısını (city, district, address)
 * nested Address yapısına dönüştürür.
 *
 * Kullanım:
 *   npx ts-node scripts/migrate-customer-addresses.ts
 *
 * UYARI: Bu script'i çalıştırmadan önce yedek alınması önerilir.
 */

import * as mongoose from "mongoose";

const MONGODB_URI =
  process.env.MONGODB_CONTRACT_URI ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_CONTRACT_DB || "kerzz-contract";

async function migrate() {
  console.log("Bağlantı kuruluyor...");
  console.log(`URI: ${MONGODB_URI}`);
  console.log(`DB: ${MONGODB_DB}`);

  const connection = await mongoose.createConnection(MONGODB_URI, {
    dbName: MONGODB_DB,
  });

  const db = connection.db;
  if (!db) {
    throw new Error("Veritabanına bağlanılamadı");
  }

  const collection = db.collection("customers");

  // Flat address yapısına sahip customer'ları bul
  // (city veya district alanı string olarak bulunanlar)
  const customers = await collection
    .find({
      $or: [
        { city: { $exists: true, $type: "string" } },
        { district: { $exists: true, $type: "string" } },
      ],
    })
    .toArray();

  console.log(`${customers.length} müşteri migrate edilecek...`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const customer of customers) {
    // Eğer address zaten nested object ise atla
    if (customer.address && typeof customer.address === "object" && customer.address.cityId !== undefined) {
      skippedCount++;
      continue;
    }

    const addressText =
      typeof customer.address === "string" ? customer.address : "";

    const newAddress = {
      address: addressText,
      cityId: 0,
      city: customer.city || "",
      townId: 0,
      town: customer.district || "",
      districtId: 0,
      district: "",
      countryId: "TR",
      country: "Türkiye",
    };

    await collection.updateOne(
      { _id: customer._id },
      {
        $set: { address: newAddress },
        $unset: { city: "", district: "" },
      }
    );

    migratedCount++;
  }

  console.log(`Migration tamamlandı!`);
  console.log(`  Migrate edilen: ${migratedCount}`);
  console.log(`  Atlanan (zaten nested): ${skippedCount}`);

  await connection.close();
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration hatası:", err);
  process.exit(1);
});
