/**
 * Boss kullanıcıları için customerId backfill scripti.
 *
 * Amaç:
 * - customerId alanı boş olan SSO kullanıcılarında,
 * - kullanıcının aktif Kerzz Boss lisansından customerId çözerek alanı doldurmak.
 *
 * Eşleştirme:
 * - app-licances.licance_id -> licenses.licenseId (string karşılığı)
 * - app-licances.licance_id -> licenses.id (fallback)
 *
 * Kullanım:
 *   cd apps/api
 *   npx ts-node -r tsconfig-paths/register scripts/backfill-boss-user-customer-ids.ts
 *
 * Dry-run:
 *   DRY_RUN=true npx ts-node -r tsconfig-paths/register scripts/backfill-boss-user-customer-ids.ts
 */

import { join } from "path";
import * as dotenv from "dotenv";
import * as mongoose from "mongoose";

dotenv.config({ path: join(__dirname, "../.env") });

const KERZZ_BOSS_APP_ID = "2a17-a038";

interface SsoUserDoc {
  _id: mongoose.Types.ObjectId;
  id: string;
  name?: string;
  customerId?: string | null;
}

interface BossAppLicenseDoc {
  app_id: string;
  user_id: string;
  licance_id?: string;
  is_active?: boolean;
  updatedAt?: Date;
  createdAt?: Date;
}

interface ContractLicenseDoc {
  id?: string;
  licenseId?: number;
  customerId?: string;
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const normalizeLicenseRef = (value: unknown): string => {
  if (!isNonEmptyString(value)) return "";
  return value.trim();
};

async function run() {
  const ssoUri = process.env.MONGODB_SSO_URI || process.env.MONGODB_URI;
  const ssoDbName = process.env.MONGODB_SSO_DB || "sso-db";

  const contractUri = process.env.MONGODB_CONTRACT_URI || process.env.MONGODB_URI;
  const contractDbName = process.env.MONGODB_CONTRACT_DB || "kerzz-contract";

  if (!ssoUri) {
    throw new Error("SSO veritabani URI bulunamadi (MONGODB_SSO_URI veya MONGODB_URI)");
  }
  if (!contractUri) {
    throw new Error("Contract veritabani URI bulunamadi (MONGODB_CONTRACT_URI veya MONGODB_URI)");
  }

  const dryRun = process.env.DRY_RUN === "true";
  console.log(`DRY_RUN: ${dryRun ? "aktif" : "pasif"}`);

  const ssoConn = await mongoose.createConnection(ssoUri, { dbName: ssoDbName }).asPromise();
  const contractConn = await mongoose
    .createConnection(contractUri, { dbName: contractDbName })
    .asPromise();

  try {
    const ssoDb = ssoConn.db;
    const contractDb = contractConn.db;

    if (!ssoDb || !contractDb) {
      throw new Error("Veritabani baglantisi olusturulamadi");
    }

    const usersCollection = ssoDb.collection<SsoUserDoc>("users");
    const bossLicensesCollection = ssoDb.collection<BossAppLicenseDoc>("app-licances");
    const licensesCollection = contractDb.collection<ContractLicenseDoc>("licenses");

    const usersToBackfill = await usersCollection
      .find({
        $or: [{ customerId: { $exists: false } }, { customerId: null }, { customerId: "" }]
      })
      .project({ _id: 1, id: 1, name: 1 })
      .toArray();

    console.log(`customerId bos kullanici sayisi: ${usersToBackfill.length}`);
    if (usersToBackfill.length === 0) {
      return;
    }

    const userIds = usersToBackfill.map((user) => user.id).filter(isNonEmptyString);
    if (userIds.length === 0) {
      console.log("Islenecek gecerli user id bulunamadi");
      return;
    }

    const bossLicensesRaw = await bossLicensesCollection
      .find({
        app_id: KERZZ_BOSS_APP_ID,
        user_id: { $in: userIds },
        is_active: { $ne: false }
      })
      .project({ user_id: 1, licance_id: 1, updatedAt: 1, createdAt: 1 })
      .toArray();

    const bossLicenses: BossAppLicenseDoc[] = [];
    for (const raw of bossLicensesRaw) {
      const rawUserId = raw.user_id;
      if (!isNonEmptyString(rawUserId)) continue;

      const licanceId = isNonEmptyString(raw.licance_id) ? raw.licance_id : undefined;
      const updatedAt = raw.updatedAt instanceof Date ? raw.updatedAt : undefined;
      const createdAt = raw.createdAt instanceof Date ? raw.createdAt : undefined;

      bossLicenses.push({
        app_id: KERZZ_BOSS_APP_ID,
        user_id: rawUserId,
        licance_id: licanceId,
        is_active: true,
        updatedAt,
        createdAt
      });
    }

    const licensesByUser = new Map<string, BossAppLicenseDoc[]>();
    for (const bossLicense of bossLicenses) {
      const list = licensesByUser.get(bossLicense.user_id) || [];
      list.push(bossLicense);
      licensesByUser.set(bossLicense.user_id, list);
    }

    for (const [userId, list] of licensesByUser) {
      list.sort((a, b) => {
        const aTime = (a.updatedAt || a.createdAt || new Date(0)).getTime();
        const bTime = (b.updatedAt || b.createdAt || new Date(0)).getTime();
        return bTime - aTime;
      });
      licensesByUser.set(userId, list);
    }

    const rawLicenseRefs = bossLicenses
      .map((item) => normalizeLicenseRef(item.licance_id))
      .filter((value) => value.length > 0);

    const uniqueRefs = [...new Set(rawLicenseRefs)];
    const numericRefs = uniqueRefs
      .map((value) => Number.parseInt(value, 10))
      .filter((value) => Number.isFinite(value));

    const contractLicenses = await licensesCollection
      .find({
        $or: [{ id: { $in: uniqueRefs } }, { licenseId: { $in: numericRefs } }]
      })
      .project({ id: 1, licenseId: 1, customerId: 1 })
      .toArray();

    const customerByContractId = new Map<string, string>();
    const customerByLicenseNo = new Map<string, string>();

    for (const license of contractLicenses) {
      if (!isNonEmptyString(license.customerId)) continue;
      if (isNonEmptyString(license.id)) {
        customerByContractId.set(license.id.trim(), license.customerId.trim());
      }
      if (typeof license.licenseId === "number") {
        customerByLicenseNo.set(String(license.licenseId), license.customerId.trim());
      }
    }

    const updates: Array<{ userObjectId: mongoose.Types.ObjectId; customerId: string }> = [];
    let unresolvedCount = 0;

    for (const user of usersToBackfill) {
      const relatedLicenses = licensesByUser.get(user.id) || [];
      let resolvedCustomerId = "";

      for (const bossLicense of relatedLicenses) {
        const ref = normalizeLicenseRef(bossLicense.licance_id);
        if (!ref) continue;

        const fromLicenseNo = customerByLicenseNo.get(ref);
        if (isNonEmptyString(fromLicenseNo)) {
          resolvedCustomerId = fromLicenseNo;
          break;
        }

        const fromContractId = customerByContractId.get(ref);
        if (isNonEmptyString(fromContractId)) {
          resolvedCustomerId = fromContractId;
          break;
        }
      }

      if (!resolvedCustomerId) {
        unresolvedCount += 1;
        continue;
      }

      updates.push({ userObjectId: user._id, customerId: resolvedCustomerId });
    }

    console.log(`Eslestirilen kullanici: ${updates.length}`);
    console.log(`Eslestirilemeyen kullanici: ${unresolvedCount}`);

    if (updates.length === 0 || dryRun) {
      return;
    }

    const now = new Date();
    const result = await usersCollection.bulkWrite(
      updates.map((item) => ({
        updateOne: {
          filter: { _id: item.userObjectId },
          update: { $set: { customerId: item.customerId, updatedAt: now } }
        }
      }))
    );

    console.log(`Guncellenen kayit: ${result.modifiedCount}`);
  } finally {
    await Promise.all([ssoConn.close(), contractConn.close()]);
  }
}

run()
  .then(() => {
    console.log("Backfill tamamlandi");
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("Backfill hatasi:", error);
    process.exit(1);
  });
