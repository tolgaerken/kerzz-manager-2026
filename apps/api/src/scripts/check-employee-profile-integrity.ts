/**
 * Employee Profile veri bütünlüğü kontrol scripti
 * 
 * Kontrol edilen durumlar:
 * 1. SSO'da olmayan userId'ye sahip profiller (orphan profiles)
 * 2. Profili olmayan SSO kullanıcıları (missing profiles)
 * 3. Tutarsız employmentStatus (SSO isActive vs profile status)
 * 
 * Kullanım:
 * cd apps/api
 * npx ts-node -r tsconfig-paths/register src/scripts/check-employee-profile-integrity.ts
 * 
 * Opsiyonlar:
 * --fix        : Tespit edilen sorunları otomatik düzelt
 * --verbose    : Detaylı çıktı
 */

import { connect, connection, Schema, model } from "mongoose";
import * as dotenv from "dotenv";
import { join } from "path";

// .env dosyasını yükle
dotenv.config({ path: join(__dirname, "../../.env") });

// Argümanları parse et
const args = process.argv.slice(2);
const shouldFix = args.includes("--fix");
const isVerbose = args.includes("--verbose");

// SsoUser schema (minimal)
const SsoUserSchema = new Schema({
  id: String,
  name: String,
  email: String,
  isActive: Boolean,
});

// EmployeeProfile schema (minimal)
const EmployeeProfileSchema = new Schema({
  userId: String,
  employmentStatus: String,
  updaterId: String,
  updatedAt: Date,
});

interface IntegrityIssue {
  type: "orphan_profile" | "missing_profile" | "status_mismatch";
  userId: string;
  details: string;
  fixed?: boolean;
}

async function checkIntegrity() {
  console.log("=".repeat(60));
  console.log("Employee Profile Veri Bütünlüğü Kontrolü");
  console.log("=".repeat(60));
  console.log(`Mode: ${shouldFix ? "FIX" : "CHECK ONLY"}`);
  console.log(`Verbose: ${isVerbose ? "YES" : "NO"}`);
  console.log("");

  const issues: IntegrityIssue[] = [];

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
    const EmployeeProfile = model("EmployeeProfile", EmployeeProfileSchema, "employee_profiles");

    // 1. Tüm verileri al
    console.log("📊 Veriler yükleniyor...");
    const [allUsers, allProfiles] = await Promise.all([
      SsoUser.find({}).lean(),
      EmployeeProfile.find({}).lean(),
    ]);

    console.log(`   SSO Kullanıcı sayısı: ${allUsers.length}`);
    console.log(`   Profil sayısı: ${allProfiles.length}`);
    console.log("");

    // Map'ler oluştur
    const userMap = new Map(allUsers.map((u) => [u.id, u]));
    const profileMap = new Map(allProfiles.map((p) => [p.userId, p]));

    // 2. Orphan profilleri kontrol et (SSO'da olmayan userId)
    console.log("🔍 Orphan profiller kontrol ediliyor...");
    for (const profile of allProfiles) {
      if (!profile.userId) continue;

      if (!userMap.has(profile.userId)) {
        issues.push({
          type: "orphan_profile",
          userId: profile.userId,
          details: "SSO'da karşılık gelen kullanıcı bulunamadı",
        });

        if (isVerbose) {
          console.log(`   ⚠️  Orphan: ${profile.userId}`);
        }
      }
    }

    // 3. Missing profilleri kontrol et (profili olmayan aktif kullanıcılar)
    console.log("🔍 Eksik profiller kontrol ediliyor...");
    for (const user of allUsers) {
      if (!user.id) continue;

      // Sadece aktif kullanıcılar için kontrol
      if (user.isActive !== false && !profileMap.has(user.id)) {
        issues.push({
          type: "missing_profile",
          userId: user.id,
          details: `Aktif kullanıcının profili yok (${user.name || user.email || "N/A"})`,
        });

        if (isVerbose) {
          console.log(`   ⚠️  Missing: ${user.id} (${user.name || "N/A"})`);
        }
      }
    }

    // 4. Status tutarsızlıklarını kontrol et
    console.log("🔍 Status tutarsızlıkları kontrol ediliyor...");
    for (const profile of allProfiles) {
      if (!profile.userId) continue;

      const user = userMap.get(profile.userId);
      if (!user) continue; // Orphan, zaten raporlandı

      const userIsActive = user.isActive !== false;
      const profileIsActive = profile.employmentStatus === "active";

      // SSO aktif ama profil terminated/inactive ise uyar
      if (userIsActive && profile.employmentStatus === "terminated") {
        issues.push({
          type: "status_mismatch",
          userId: profile.userId,
          details: `SSO aktif ama profil terminated`,
        });

        if (isVerbose) {
          console.log(`   ⚠️  Mismatch: ${profile.userId} (SSO: active, Profile: terminated)`);
        }
      }

      // SSO pasif ama profil active ise uyar
      if (!userIsActive && profileIsActive) {
        issues.push({
          type: "status_mismatch",
          userId: profile.userId,
          details: `SSO pasif ama profil active`,
        });

        if (isVerbose) {
          console.log(`   ⚠️  Mismatch: ${profile.userId} (SSO: inactive, Profile: active)`);
        }
      }
    }

    // 5. Fix modu
    if (shouldFix && issues.length > 0) {
      console.log("\n🔧 Sorunlar düzeltiliyor...");

      for (const issue of issues) {
        try {
          switch (issue.type) {
            case "missing_profile": {
              const user = userMap.get(issue.userId);
              if (user) {
                const newProfile = new EmployeeProfile({
                  userId: issue.userId,
                  employmentStatus: user.isActive !== false ? "active" : "inactive",
                  updaterId: "system-integrity-fix",
                  updatedAt: new Date(),
                });
                await newProfile.save();
                issue.fixed = true;
                if (isVerbose) {
                  console.log(`   ✓ Profil oluşturuldu: ${issue.userId}`);
                }
              }
              break;
            }

            case "status_mismatch": {
              const user = userMap.get(issue.userId);
              if (user) {
                const newStatus = user.isActive !== false ? "active" : "inactive";
                await EmployeeProfile.updateOne(
                  { userId: issue.userId },
                  {
                    $set: {
                      employmentStatus: newStatus,
                      updaterId: "system-integrity-fix",
                      updatedAt: new Date(),
                    },
                  }
                );
                issue.fixed = true;
                if (isVerbose) {
                  console.log(`   ✓ Status güncellendi: ${issue.userId} -> ${newStatus}`);
                }
              }
              break;
            }

            case "orphan_profile":
              // Orphan profiller otomatik silinmez, manuel müdahale gerekir
              if (isVerbose) {
                console.log(`   ⚠️  Orphan profil silinmedi (manuel müdahale gerekli): ${issue.userId}`);
              }
              break;
          }
        } catch (err) {
          console.log(`   ❌ Düzeltme hatası (${issue.userId}): ${err}`);
        }
      }
    }

    // 6. Sonuç raporu
    console.log("\n" + "=".repeat(60));
    console.log("SONUÇ RAPORU");
    console.log("=".repeat(60));

    const orphanCount = issues.filter((i) => i.type === "orphan_profile").length;
    const missingCount = issues.filter((i) => i.type === "missing_profile").length;
    const mismatchCount = issues.filter((i) => i.type === "status_mismatch").length;
    const fixedCount = issues.filter((i) => i.fixed).length;

    console.log(`Toplam SSO kullanıcı: ${allUsers.length}`);
    console.log(`Toplam profil: ${allProfiles.length}`);
    console.log("");
    console.log("Tespit edilen sorunlar:");
    console.log(`   Orphan profiller: ${orphanCount}`);
    console.log(`   Eksik profiller: ${missingCount}`);
    console.log(`   Status tutarsızlıkları: ${mismatchCount}`);
    console.log(`   Toplam: ${issues.length}`);

    if (shouldFix) {
      console.log("");
      console.log(`Düzeltilen: ${fixedCount}`);
      console.log(`Düzeltilemeyen: ${issues.length - fixedCount}`);
    }

    if (issues.length === 0) {
      console.log("\n✅ Veri bütünlüğü sorunsuz!");
    } else if (!shouldFix) {
      console.log("\n📝 Sorunları düzeltmek için --fix parametresi ile çalıştırın.");
    }

    await connection.close();
    console.log("\n👋 MongoDB bağlantısı kapatıldı");
    process.exit(issues.length > 0 && !shouldFix ? 1 : 0);
  } catch (error) {
    console.error("\n❌ Kritik hata:", error);
    await connection.close();
    process.exit(1);
  }
}

checkIntegrity();
