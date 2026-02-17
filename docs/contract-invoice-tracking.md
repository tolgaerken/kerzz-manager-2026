# Kontrat Kalemleri ve Fatura Eşleştirme Sistemi

## Problem Tanımı

Kontrat alt kalemleri (yazarkasa, saas, destek, item, versiyon) bir faturaya dahil edilip edilmediğini güvenilir şekilde tespit etmek gerekiyor. Bu bilgi, "faturaya dahil edilmemiş kalemleri listeleme" ihtiyacı için kritik.

## Mevcut Veri Yapısı

### ContractPayment (Ödeme Planı)

```
contract-payments koleksiyonu
├── invoiceNo: string       → Fatura kesilmişse dolu
├── sourceItemId: string    → Sadece kıst planlarda dolu (tek kalem ID)
├── type: "regular" | "prorated"
├── list: PaymentListItem[] → Fatura satırları
│   ├── description
│   ├── total
│   ├── sourceItemId (YENİ) → Kaynak kalem ID'leri (virgülle ayrılmış)
│   └── category (YENİ)     → "eftpos" | "support" | "version" | "item" | "saas"
└── report: object (LEGACY) → Eski sistemden gelen fatura özeti
    ├── saas: [{id, ...}]
    ├── eftpos: [{id, ...}]
    ├── support: [{id, ...}]
    ├── item: [{id, ...}]
    └── version: [{id, ...}]
```

### Kontrat Alt Kalemleri

| Koleksiyon | Açıklama | ID Alanı |
|------------|----------|----------|
| `contract-cash-registers` | Yazarkasa (EFT-POS) | `id` |
| `contract-saas` | SaaS ürünleri | `id` |
| `contract-supports` | Destek paketleri | `id` |
| `contract-items` | Diğer kalemler | `id` |
| `contract-versions` | Sürüm/versiyon | `id` |

## Fatura Akışları ve ID Eşleştirmesi

### 1. Kıst (Prorated) Planlar

**Akış:** `activate()` → `ProratedPlanService.createProratedPlan()`

- `ContractPayment.sourceItemId` = Kaynak kalemin `id` değeri
- `ContractPayment.type` = `"prorated"`

**Örnek:** Bir yazarkasa aktive edildiğinde:
```typescript
// ContractCashRegistersService.activate()
await this.proratedPlanService.createProratedPlan({
  sourceItemId: item.id,  // "abc123"
  // ...
});
```

**Eşleştirme:** `sourceItemId` üzerinden doğrudan eşleşir.

### 2. Normal (Regular) Planlar - YENİ SİSTEM

**Akış:** `PaymentPlanService.processContract()` → `InvoiceCalculatorService.calculateAll()` → `PlanGeneratorService.generateAndSyncPlans()`

- `ContractPayment.type` = `"regular"` (veya undefined)
- `ContractPayment.list[].sourceItemId` = Kaynak kalem ID'leri (virgülle ayrılmış)
- `ContractPayment.list[].category` = Kalem kategorisi

**Örnek:**
```json
{
  "invoiceNo": "INV-2024-001",
  "type": "regular",
  "list": [
    {
      "description": "EFT-POS Hizmet Bedeli",
      "total": 500,
      "sourceItemId": "abc123,def456",
      "category": "eftpos"
    },
    {
      "description": "SaaS Ürün (LIC-001)",
      "total": 200,
      "sourceItemId": "ghi789",
      "category": "saas"
    }
  ]
}
```

**Eşleştirme:** `list[].sourceItemId` virgülle ayrılarak parse edilir.

### 3. Legacy Planlar (Eski Sistem)

**Akış:** Eski Angular uygulamasından gelen veriler

- `ContractPayment.report` objesi içinde kalem dizileri var
- Her dizide `id` alanı kaynak kalemi işaret eder

**Örnek:**
```json
{
  "invoiceNo": "INV-2023-500",
  "report": {
    "saas": [{"id": "ghi789", "description": "..."}],
    "eftpos": [{"id": "abc123"}, {"id": "def456"}],
    "support": [],
    "item": [],
    "version": []
  }
}
```

**Eşleştirme:** `report.{category}[].id` üzerinden eşleşir.

## Ara Dönem Problemi

Yeni sistem devreye alınmadan önce kesilen faturalar için:

| Durum | sourceItemId | list[].sourceItemId | report |
|-------|--------------|---------------------|--------|
| Kıst planlar | ✅ Dolu | - | - |
| Legacy planlar | - | - | ✅ Dolu |
| **Ara dönem** | - | ❌ Boş | ❌ Boş |

**Ara dönem planları:** `invoiceNo` dolu ama `sourceItemId`, `list[].sourceItemId` ve `report` boş olan kayıtlar.

### Çözüm Seçenekleri

#### Seçenek 1: Migration Script (Önerilen)

Mevcut faturalı planları geriye dönük güncelleyen script:

1. `invoiceNo` dolu + `list[].sourceItemId` boş olan kayıtları bul
2. `contractId` üzerinden ilgili kalemleri çek
3. `description` eşleştirmesi ile `sourceItemId` ve `category` doldur

**Zorluk:** Açıklama bazlı eşleştirme %100 doğru olmayabilir.

#### Seçenek 2: Tarih Bazlı Fallback

Belirli bir tarihten önceki kalemler için farklı mantık:

```typescript
const CUTOFF_DATE = new Date("2024-XX-XX"); // Yeni sistem devreye alma tarihi

if (item.createdAt < CUTOFF_DATE) {
  // Bu tarihten önce oluşturulan enabled kalemler
  // otomatik olarak "faturalı" kabul edilir
}
```

#### Seçenek 3: Hibrit Yaklaşım

Migration + Tarih bazlı fallback kombinasyonu.

## Uygulanan Çözüm

### Değiştirilen Dosyalar

1. **`PaymentListItem` Interface**
   - Dosya: `apps/api/src/modules/contract-payments/schemas/contract-payment.schema.ts`
   - Eklenen: `sourceItemId?: string`, `category?: PaymentListItemCategory`

2. **`InvoiceRow` Interface**
   - Dosya: `apps/api/src/modules/contract-payments/interfaces/payment-plan.interfaces.ts`
   - Eklenen: `sourceItemIds?: string[]`

3. **`InvoiceCalculatorService`**
   - Dosya: `apps/api/src/modules/contract-payments/services/invoice-calculator.service.ts`
   - `groupAndProcess()`, `processItems()`, `processSaas()` metodları güncellendi
   - Her fatura satırına kaynak kalem ID'leri ekleniyor

4. **`PlanGeneratorService`**
   - Dosya: `apps/api/src/modules/contract-payments/services/plan-generator.service.ts`
   - `buildPaymentListItem()` helper metodu eklendi
   - `InvoiceRow` → `PaymentListItem` dönüşümünde `sourceItemId` ve `category` taşınıyor

5. **`UninvoicedItemsService` (YENİ)**
   - Dosya: `apps/api/src/modules/contract-payments/services/uninvoiced-items.service.ts`
   - Üç kaynaktan faturalı kalem ID'lerini topluyor:
     1. `sourceItemId` (kıst planlar)
     2. `list[].sourceItemId` (normal planlar)
     3. `report.{category}[].id` (legacy planlar)

6. **Controller Endpoint'leri**
   - Dosya: `apps/api/src/modules/contract-payments/contract-payments.controller.ts`
   - `GET /contract-payments/uninvoiced-items` - Tüm faturaya dahil edilmemiş kalemler
   - `GET /contract-payments/uninvoiced-items/:contractId` - Belirli kontrat için

## API Kullanımı

### Faturaya Dahil Edilmemiş Kalemleri Listele

```bash
# Tüm kontratlar için
GET /api/contract-payments/uninvoiced-items

# Belirli kontrat için
GET /api/contract-payments/uninvoiced-items/{contractId}
```

**Response:**
```json
{
  "eftpos": [
    {"id": "abc123", "category": "eftpos", "description": "...", "contractId": "..."}
  ],
  "support": [],
  "version": [],
  "item": [],
  "saas": [
    {"id": "xyz789", "category": "saas", "description": "...", "contractId": "..."}
  ],
  "total": 2
}
```

## Gelecek Adımlar

1. [x] Ara dönem kayıtları için migration script yazılması
2. [ ] Frontend'de faturaya dahil edilmemiş kalemler sayfası
3. [ ] Tarih bazlı fallback mekanizması (gerekirse)

## Migration Script Kullanımı

Ara dönem kayıtlarını güncellemek için migration script hazırlandı.

**Dosya:** `apps/api/src/modules/contract-payments/scripts/migrate-payment-source-items.ts`

### Çalıştırma Adımları

```bash
# 1. Önce DRY RUN ile raporu inceleyin (varsayılan)
cd apps/api
npx ts-node -r tsconfig-paths/register src/modules/contract-payments/scripts/migrate-payment-source-items.ts

# 2. Raporu inceledikten sonra gerçek migration
DRY_RUN=false npx ts-node -r tsconfig-paths/register src/modules/contract-payments/scripts/migrate-payment-source-items.ts
```

### Ortam Değişkenleri

| Değişken | Varsayılan | Açıklama |
|----------|------------|----------|
| `DRY_RUN` | `true` | `true` ise sadece rapor üretir, değişiklik yapmaz |
| `BATCH_SIZE` | `100` | Tek seferde işlenecek kayıt sayısı |

### Script Mantığı

1. `invoiceNo` dolu + `list[].sourceItemId` boş olan kayıtları bulur
2. Her kayıt için `contractId` üzerinden ilgili kalemleri çeker
3. Açıklama pattern'ları ile kategori belirler:
   - `EFT-POS`, `Yazarkasa` → `eftpos`
   - `Destek`, `Support` → `support`
   - `Sürüm`, `Version` → `version`
   - `SaaS`, `Lisans`, `(LIC-xxx)` → `saas`
   - Diğerleri → `item`
4. Kategori içindeki kalemlerle açıklama benzerliği hesaplar
5. Eşleşme güvenilirliğini raporlar: `high`, `medium`, `low`

### Dikkat Edilecekler

- **Veritabanı yedeği alın** - Migration öncesi mutlaka yedek alın
- **DRY RUN ile başlayın** - Önce raporu inceleyin
- **Eşleşmeyen kalemleri kontrol edin** - Manuel düzeltme gerekebilir
- **Düşük güvenilirlik uyarılarını inceleyin** - Yanlış eşleşme olabilir

## İlgili Dosyalar

```
apps/api/src/modules/contract-payments/
├── schemas/
│   └── contract-payment.schema.ts      # PaymentListItem interface
├── interfaces/
│   └── payment-plan.interfaces.ts      # InvoiceRow interface
├── services/
│   ├── invoice-calculator.service.ts   # Fatura hesaplama
│   ├── plan-generator.service.ts       # Plan oluşturma
│   ├── prorated-plan.service.ts        # Kıst plan yönetimi
│   └── uninvoiced-items.service.ts     # Faturasız kalem sorgulama
├── scripts/
│   └── migrate-payment-source-items.ts # Ara dönem migration script
├── contract-payments.controller.ts     # API endpoint'leri
└── contract-payments.module.ts         # Modül tanımı
```

## Tarihçe

- **2024-XX-XX:** İlk analiz ve problem tanımı
- **2024-XX-XX:** `sourceItemId` + `category` çözümü implemente edildi
- **2024-XX-XX:** `UninvoicedItemsService` ve API endpoint'leri eklendi
