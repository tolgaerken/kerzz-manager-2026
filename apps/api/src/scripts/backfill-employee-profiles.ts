/**
 * Mevcut SSO kullanıcıları için employee_profiles koleksiyonunda
 * boş profil kayıtları oluşturur (backfill)
 * 
 * Kullanım:
 * cd apps/api
 * npx ts-node -r tsconfig-paths/register src/scripts/backfill-employee-profiles.ts
 * 
 * Opsiyonlar:
 * --dry-run    : Gerçek kayıt oluşturmadan sadece rapor üretir
 * --app-id=X   : Sadece belirli bir uygulamanın kullanıcıları için çalışır
 */

import { connect, connection, Schema, model } from "mongoose";
import * as dotenv from "dotenv";
import { join } from "path";

// .env dosyasını yükle (apps/api/.env)
dotenv.config({ path: join(__dirname, "../../.env") });

// Argümanları parse et
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const appIdArg = args.find((arg) => arg.startsWith("--app-id="));
const targetAppId = appIdArg ? appIdArg.split("=")[1] : null;

// SsoUser schema (minimal)
const SsoUserSchema = new Schema({
  id: String,
  name: String,
  email: String,
  phone: String,
  isActive: Boolean,
});

// SsoUserApp schema (minimal)
const SsoUserAppSchema = new Schema({
  user_id: String,
  app_id: String,
  isActive: Boolean,
});

// EmployeeProfile schema (minimal)
const EmployeeProfileSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  employmentStatus: { type: String, default: "active" },
  creatorId: String,
  updaterId: String,
  createdAt: Date,
  updatedAt: Date,
});

async function backfillEmployeeProfiles() {
  console.log("=".repeat(60));
  console.log("Employee Profile Backfill Script");
  console.log("=".repeat(60));
  console.log(`Mode: ${isDryRun ? "DRY RUN (no changes)" : "LIVE"}`);
  if (targetAppId) {
    console.log(`Target App ID: ${targetAppId}`);
  }
  console.log("");

  try {
    // MongoDB bağlantısı
    const mongoUri = process.env.MONGODB_SSO_URI || process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_SSO_DB || "sso-db";

    if (!mongoUri) {
      throw new Error("MONGODB_SSO_URI veya MONGODB_URI çevre değişkeni bulunamadı");
    }

    console.log("📦 MongoDB bağlantısı kuruluyor...");
    await connect(mongoUri, { dbName });
    console.log(`✅ MongoDB bağlantısı başarılı (Database: ${dbName})`);
    console.log("");

    // Modelleri oluştur
    const SsoUser = model("SsoUser", SsoUserSchema, "users");
    const SsoUserApp = model("SsoUserApp", SsoUserAppSchema, "user-apps");
    const EmployeeProfile = model("EmployeeProfile", EmployeeProfileSchema, "employee_profiles");

    // Hedef kullanıcıları belirle
    let targetUserIds: string[] = [];

    if (targetAppId) {
      // Belirli bir uygulamanın kullanıcıları
      console.log(`📋 ${targetAppId} uygulamasının kullanıcıları alınıyor...`);
      const userApps = await SsoUserApp.find({
        app_id: targetAppId,
        isActive: { $ne: false },
      }).lean();

      targetUserIds = userApps.map((ua) => ua.user_id).filter((id): id is string => !!id);
      console.log(`   Bulunan kullanıcı sayısı: ${targetUserIds.length}`);
    } else {
      // Tüm aktif kullanıcılar
      console.log("📋 Tüm aktif kullanıcılar alınıyor...");
      const users = await SsoUser.find({ isActive: { $ne: false } }).lean();
      targetUserIds = users.map((u) => u.id).filter((id): id is string => !!id);
      console.log(`   Bulunan kullanıcı sayısı: ${targetUserIds.length}`);
    }

    if (targetUserIds.length === 0) {
      console.log("\n⚠️  İşlenecek kullanıcı bulunamadı.");
      await connection.close();
      process.exit(0);
    }

    // Mevcut profilleri kontrol et
    console.log("\n📊 Mevcut profiller kontrol ediliyor...");
    const existingProfiles = await EmployeeProfile.find({
      userId: { $in: targetUserIds },
    }).lean();

    const existingUserIds = new Set(existingProfiles.map((p) => p.userId));
    const missingUserIds = targetUserIds.filter((id) => !existingUserIds.has(id));

    console.log(`   Mevcut profil sayısı: ${existingProfiles.length}`);
    console.log(`   Eksik profil sayısı: ${missingUserIds.length}`);

    if (missingUserIds.length === 0) {
      console.log("\n✅ Tüm kullanıcıların profili mevcut, işlem yapılmadı.");
      await connection.close();
      process.exit(0);
    }

    // Kullanıcı bilgilerini al (aktiflik durumu için)
    const usersMap = new Map<string, { id: string; isActive: boolean }>();
    const usersData = await SsoUser.find({ id: { $in: missingUserIds } }).lean();
    for (const user of usersData) {
      if (user.id) {
        usersMap.set(user.id, { id: user.id, isActive: user.isActive ?? true });
      }
    }

    // Profilleri oluştur
    console.log("\n🔨 Profiller oluşturuluyor...");

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const userId of missingUserIds) {
      const userData = usersMap.get(userId);

      if (!userData) {
        errors.push(`${userId}: SSO kullanıcısı bulunamadı`);
        skipped++;
        continue;
      }

      if (isDryRun) {
        console.log(`   [DRY RUN] Profil oluşturulacak: ${userId}`);
        created++;
        continue;
      }

      try {
        const profile = new EmployeeProfile({
          userId,
          employmentStatus: userData.isActive ? "active" : "inactive",
          creatorId: "system-backfill",
          updaterId: "system-backfill",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await profile.save();
        created++;

        if (created % 100 === 0) {
          console.log(`   ${created} profil oluşturuldu...`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        errors.push(`${userId}: ${errorMessage}`);
        skipped++;
      }
    }

    // Sonuç raporu
    console.log("\n" + "=".repeat(60));
    console.log("SONUÇ RAPORU");
    console.log("=".repeat(60));
    console.log(`Toplam hedef kullanıcı: ${targetUserIds.length}`);
    console.log(`Mevcut profil: ${existingProfiles.length}`);
    console.log(`Oluşturulan profil: ${created}`);
    console.log(`Atlanan: ${skipped}`);
    console.log(`Hata sayısı: ${errors.length}`);

    if (errors.length > 0) {
      console.log("\n⚠️  Hatalar:");
      errors.slice(0, 20).forEach((err) => console.log(`   - ${err}`));
      if (errors.length > 20) {
        console.log(`   ... ve ${errors.length - 20} hata daha`);
      }
    }

    if (isDryRun) {
      console.log("\n📝 DRY RUN modu - gerçek değişiklik yapılmadı.");
      console.log("   Gerçek çalıştırma için --dry-run parametresini kaldırın.");
    }

    await connection.close();
    console.log("\n👋 MongoDB bağlantısı kapatıldı");
    process.exit(errors.length > 0 ? 1 : 0);
  } catch (error) {
    console.error("\n❌ Kritik hata:", error);
    await connection.close();
    process.exit(1);
  }
}

backfillEmployeeProfiles();
