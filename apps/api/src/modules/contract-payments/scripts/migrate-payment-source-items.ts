/**
 * Migration Script: Ara Dönem ContractPayment Kayıtlarına sourceItemId ve category Ekleme
 *
 * Bu script, faturası kesilmiş (invoiceNo dolu) ancak list[].sourceItemId ve list[].category
 * alanları boş olan ContractPayment kayıtlarını günceller.
 *
 * ÇALIŞTIRMADAN ÖNCE:
 * 1. Veritabanı yedeği alın
 * 2. DRY_RUN=true ile çalıştırarak önce raporu inceleyin
 * 3. Emin olduktan sonra DRY_RUN=false ile çalıştırın
 *
 * Kullanım:
 *   npx ts-node -r tsconfig-paths/register src/modules/contract-payments/scripts/migrate-payment-source-items.ts
 *
 * Ortam Değişkenleri:
 *   DRY_RUN=true|false  - true ise sadece rapor üretir, değişiklik yapmaz (varsayılan: true)
 *   BATCH_SIZE=100      - Tek seferde işlenecek kayıt sayısı (varsayılan: 100)
 */

import { MongoClient, Db, Collection } from "mongodb";
import * as dotenv from "dotenv";

// .env dosyasını yükle
dotenv.config({ path: "apps/api/.env" });

// ─────────────────────────────────────────────────────────────────────────────
// Konfigürasyon
// ─────────────────────────────────────────────────────────────────────────────

const DRY_RUN = process.env.DRY_RUN !== "false"; // Varsayılan: true (sadece rapor)
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || "100", 10);
const MONGO_URI = process.env.CONTRACT_DB_URI || process.env.MONGODB_URI || "";

if (!MONGO_URI) {
  console.error("❌ MONGO_URI bulunamadı. .env dosyasını kontrol edin.");
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Tipler
// ─────────────────────────────────────────────────────────────────────────────

type PaymentListItemCategory = "eftpos" | "support" | "version" | "item" | "saas";

interface PaymentListItem {
  id: number;
  description: string;
  total: number;
  company: string;
  totalUsd: number;
  totalEur: number;
  sourceItemId?: string;
  category?: PaymentListItemCategory;
}

interface ContractPayment {
  _id: string;
  id: string;
  contractId: string;
  invoiceNo: string;
  list: PaymentListItem[];
  type?: string;
  sourceItemId?: string;
}

interface ContractItem {
  id: string;
  contractId: string;
  description: string;
  enabled: boolean;
}

interface MigrationStats {
  totalPayments: number;
  processedPayments: number;
  updatedPayments: number;
  skippedPayments: number;
  matchedItems: number;
  unmatchedItems: number;
  errors: number;
}

interface MatchResult {
  sourceItemId: string;
  category: PaymentListItemCategory;
  confidence: "high" | "medium" | "low";
}

// ─────────────────────────────────────────────────────────────────────────────
// Sabitler - Açıklama Eşleştirme Desenleri
// ─────────────────────────────────────────────────────────────────────────────

const DESCRIPTION_PATTERNS: Record<PaymentListItemCategory, RegExp[]> = {
  eftpos: [
    /EFT-POS/i,
    /EFTPOS/i,
    /Yazarkasa/i,
    /POS Hizmet/i,
    /POS Bedeli/i,
  ],
  support: [
    /Destek/i,
    /Support/i,
    /Bakım/i,
    /Maintenance/i,
  ],
  version: [
    /Sürüm/i,
    /Versiyon/i,
    /Version/i,
    /Güncelleme/i,
    /Update/i,
  ],
  saas: [
    /SaaS/i,
    /Yazılım/i,
    /Software/i,
    /Lisans/i,
    /License/i,
    /\(LIC-/i,
    /\([A-Z]+-\d+\)/i, // Lisans ID pattern: (ABC-123)
  ],
  item: [
    // item için özel pattern yok, diğerleriyle eşleşmezse item kabul edilir
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Ana Migration Sınıfı
// ─────────────────────────────────────────────────────────────────────────────

class PaymentSourceItemMigration {
  private client: MongoClient;
  private db: Db;
  private paymentsCollection: Collection<ContractPayment>;
  private stats: MigrationStats = {
    totalPayments: 0,
    processedPayments: 0,
    updatedPayments: 0,
    skippedPayments: 0,
    matchedItems: 0,
    unmatchedItems: 0,
    errors: 0,
  };

  // Kontrat kalemleri cache (contractId -> category -> items)
  private itemsCache: Map<string, Map<PaymentListItemCategory, ContractItem[]>> = new Map();

  constructor() {
    this.client = new MongoClient(MONGO_URI);
  }

  async run(): Promise<void> {
    console.log("═══════════════════════════════════════════════════════════════");
    console.log("  ContractPayment sourceItemId Migration");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log(`  Mode: ${DRY_RUN ? "🔍 DRY RUN (sadece rapor)" : "⚡ LIVE (değişiklik yapılacak)"}`);
    console.log(`  Batch Size: ${BATCH_SIZE}`);
    console.log("═══════════════════════════════════════════════════════════════\n");

    try {
      await this.connect();
      await this.migrate();
      this.printReport();
    } catch (error) {
      console.error("❌ Migration hatası:", error);
      this.stats.errors++;
    } finally {
      await this.disconnect();
    }
  }

  private async connect(): Promise<void> {
    console.log("🔌 Veritabanına bağlanılıyor...");
    await this.client.connect();
    this.db = this.client.db();
    this.paymentsCollection = this.db.collection<ContractPayment>("contract-payments");
    console.log("✅ Bağlantı başarılı\n");
  }

  private async disconnect(): Promise<void> {
    await this.client.close();
    console.log("\n🔌 Bağlantı kapatıldı");
  }

  private async migrate(): Promise<void> {
    // Ara dönem kayıtlarını bul:
    // - invoiceNo dolu (fatura kesilmiş)
    // - type = "regular" veya undefined (kıst değil)
    // - list[].sourceItemId boş veya yok
    const query = {
      invoiceNo: { $exists: true, $ne: "" },
      $or: [
        { type: "regular" },
        { type: { $exists: false } },
      ],
      $and: [
        // sourceItemId alanı hiç yok veya tüm list itemlarında boş
        {
          $or: [
            { "list.sourceItemId": { $exists: false } },
            { "list.sourceItemId": "" },
            { "list.sourceItemId": null },
          ],
        },
      ],
    };

    this.stats.totalPayments = await this.paymentsCollection.countDocuments(query);
    console.log(`📊 İşlenecek kayıt sayısı: ${this.stats.totalPayments}\n`);

    if (this.stats.totalPayments === 0) {
      console.log("✅ İşlenecek kayıt bulunamadı. Tüm kayıtlar güncel.");
      return;
    }

    // Batch işleme
    let skip = 0;
    while (skip < this.stats.totalPayments) {
      const payments = await this.paymentsCollection
        .find(query)
        .skip(skip)
        .limit(BATCH_SIZE)
        .toArray();

      if (payments.length === 0) break;

      console.log(`\n📦 Batch ${Math.floor(skip / BATCH_SIZE) + 1}: ${payments.length} kayıt işleniyor...`);

      for (const payment of payments) {
        await this.processPayment(payment);
      }

      skip += BATCH_SIZE;
    }
  }

  private async processPayment(payment: ContractPayment): Promise<void> {
    this.stats.processedPayments++;

    try {
      // Kontrat kalemlerini cache'den al veya yükle
      const contractItems = await this.getContractItems(payment.contractId);

      // Her list item için sourceItemId ve category bul
      const updatedList: PaymentListItem[] = [];
      let hasChanges = false;

      for (const listItem of payment.list) {
        // Zaten sourceItemId varsa atla
        if (listItem.sourceItemId && listItem.sourceItemId !== "") {
          updatedList.push(listItem);
          continue;
        }

        // Eşleştirme yap
        const match = this.matchListItem(listItem, contractItems);

        if (match) {
          updatedList.push({
            ...listItem,
            sourceItemId: match.sourceItemId,
            category: match.category,
          });
          this.stats.matchedItems++;
          hasChanges = true;

          if (match.confidence !== "high") {
            console.log(
              `  ⚠️  Düşük güvenilirlik eşleşmesi: "${listItem.description}" → ${match.category} (${match.confidence})`
            );
          }
        } else {
          updatedList.push(listItem);
          this.stats.unmatchedItems++;
          console.log(`  ❓ Eşleşme bulunamadı: "${listItem.description}" (Payment: ${payment.id})`);
        }
      }

      // Güncelleme yap
      if (hasChanges) {
        if (!DRY_RUN) {
          await this.paymentsCollection.updateOne(
            { _id: payment._id },
            { $set: { list: updatedList } }
          );
        }
        this.stats.updatedPayments++;
        console.log(`  ✅ Güncellendi: ${payment.id} (${payment.invoiceNo})`);
      } else {
        this.stats.skippedPayments++;
      }
    } catch (error) {
      console.error(`  ❌ Hata (Payment: ${payment.id}):`, error);
      this.stats.errors++;
    }
  }

  private async getContractItems(
    contractId: string
  ): Promise<Map<PaymentListItemCategory, ContractItem[]>> {
    // Cache kontrolü
    if (this.itemsCache.has(contractId)) {
      return this.itemsCache.get(contractId)!;
    }

    // Tüm kategorilerdeki kalemleri paralel olarak çek
    const [eftpos, support, version, item, saas] = await Promise.all([
      this.db
        .collection<ContractItem>("contract-cash-registers")
        .find({ contractId })
        .toArray(),
      this.db
        .collection<ContractItem>("contract-supports")
        .find({ contractId })
        .toArray(),
      this.db
        .collection<ContractItem>("contract-versions")
        .find({ contractId })
        .toArray(),
      this.db
        .collection<ContractItem>("contract-items")
        .find({ contractId })
        .toArray(),
      this.db
        .collection<ContractItem>("contract-saas")
        .find({ contractId })
        .toArray(),
    ]);

    const itemsMap = new Map<PaymentListItemCategory, ContractItem[]>();
    itemsMap.set("eftpos", eftpos);
    itemsMap.set("support", support);
    itemsMap.set("version", version);
    itemsMap.set("item", item);
    itemsMap.set("saas", saas);

    // Cache'e ekle
    this.itemsCache.set(contractId, itemsMap);

    return itemsMap;
  }

  private matchListItem(
    listItem: PaymentListItem,
    contractItems: Map<PaymentListItemCategory, ContractItem[]>
  ): MatchResult | null {
    const description = listItem.description.toLowerCase();

    // 1. Önce açıklama pattern'ı ile kategori belirle
    let detectedCategory: PaymentListItemCategory | null = null;

    for (const [category, patterns] of Object.entries(DESCRIPTION_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(listItem.description)) {
          detectedCategory = category as PaymentListItemCategory;
          break;
        }
      }
      if (detectedCategory) break;
    }

    // Pattern eşleşmezse item olarak kabul et
    if (!detectedCategory) {
      detectedCategory = "item";
    }

    // 2. Kategori içindeki kalemlerle eşleştir
    const categoryItems = contractItems.get(detectedCategory) || [];

    // Enabled olan kalemleri önceliklendir
    const enabledItems = categoryItems.filter((i) => i.enabled);
    const targetItems = enabledItems.length > 0 ? enabledItems : categoryItems;

    if (targetItems.length === 0) {
      // Bu kategoride kalem yok, diğer kategorilere bak
      return this.fallbackMatch(listItem, contractItems, detectedCategory);
    }

    // 3. Açıklama benzerliği ile eşleştir
    let bestMatch: ContractItem | null = null;
    let bestScore = 0;

    for (const item of targetItems) {
      const score = this.calculateSimilarity(
        listItem.description,
        item.description || ""
      );
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }

    // Tek kalem varsa direkt eşleştir
    if (targetItems.length === 1) {
      return {
        sourceItemId: targetItems[0].id,
        category: detectedCategory,
        confidence: "medium",
      };
    }

    // Benzerlik skoru yeterli mi?
    if (bestMatch && bestScore > 0.3) {
      return {
        sourceItemId: bestMatch.id,
        category: detectedCategory,
        confidence: bestScore > 0.6 ? "high" : "medium",
      };
    }

    // Gruplu kalem olabilir - tüm enabled kalemleri birleştir
    if (targetItems.length > 1) {
      const ids = targetItems.map((i) => i.id).join(",");
      return {
        sourceItemId: ids,
        category: detectedCategory,
        confidence: "low",
      };
    }

    return null;
  }

  private fallbackMatch(
    listItem: PaymentListItem,
    contractItems: Map<PaymentListItemCategory, ContractItem[]>,
    excludeCategory: PaymentListItemCategory
  ): MatchResult | null {
    // Diğer kategorilerde ara
    const categories: PaymentListItemCategory[] = [
      "eftpos",
      "support",
      "version",
      "saas",
      "item",
    ];

    for (const category of categories) {
      if (category === excludeCategory) continue;

      const items = contractItems.get(category) || [];
      const enabledItems = items.filter((i) => i.enabled);

      if (enabledItems.length === 1) {
        // Tek enabled kalem varsa eşleştir
        return {
          sourceItemId: enabledItems[0].id,
          category,
          confidence: "low",
        };
      }
    }

    return null;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    // Basit kelime eşleşmesi
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    const commonWords = words1.filter((w) => words2.includes(w));

    return commonWords.length / Math.max(words1.length, words2.length);
  }

  private printReport(): void {
    console.log("\n═══════════════════════════════════════════════════════════════");
    console.log("  Migration Raporu");
    console.log("═══════════════════════════════════════════════════════════════");
    console.log(`  Toplam Kayıt:        ${this.stats.totalPayments}`);
    console.log(`  İşlenen:             ${this.stats.processedPayments}`);
    console.log(`  Güncellenen:         ${this.stats.updatedPayments}`);
    console.log(`  Atlanan:             ${this.stats.skippedPayments}`);
    console.log(`  Eşleşen Kalem:       ${this.stats.matchedItems}`);
    console.log(`  Eşleşmeyen Kalem:    ${this.stats.unmatchedItems}`);
    console.log(`  Hatalar:             ${this.stats.errors}`);
    console.log("═══════════════════════════════════════════════════════════════");

    if (DRY_RUN) {
      console.log("\n⚠️  DRY RUN modu aktifti. Hiçbir değişiklik yapılmadı.");
      console.log("    Gerçek migration için: DRY_RUN=false npx ts-node ...");
    }

    if (this.stats.unmatchedItems > 0) {
      console.log("\n⚠️  Eşleşmeyen kalemler var. Manuel kontrol gerekebilir.");
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Çalıştır
// ─────────────────────────────────────────────────────────────────────────────

const migration = new PaymentSourceItemMigration();
migration.run().catch(console.error);
