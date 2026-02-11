# Invoice Index Optimizasyonu

## Problem

InvoicesPage'de faturalar yavaş yükleniyordu. Analiz sonucu:

1. **Yetersiz indexler**: Tek alanlı indexler vardı, ancak sorgular birden fazla alanı birlikte kullanıyordu
2. **Yüksek limit**: Frontend'de `limit: 100000` kullanılıyordu
3. **Compound index eksikliği**: Tarih aralığı + filtreleme kombinasyonları için optimize edilmiş index yoktu

## Yapılan İyileştirmeler

### 1. Compound (Birleşik) Indexler Eklendi

```typescript
// En sık kullanılan sorgu kombinasyonları için
InvoiceSchema.index({ invoiceDate: -1, isPaid: 1, internalFirm: 1 });
InvoiceSchema.index({ internalFirm: 1, isPaid: 1, invoiceDate: -1 });
InvoiceSchema.index({ invoiceType: 1, invoiceDate: -1 });
InvoiceSchema.index({ customerId: 1, invoiceDate: -1 });
InvoiceSchema.index({ contractId: 1, invoiceDate: -1 });
InvoiceSchema.index({ isPaid: 1, dueDate: 1 }); // Gecikmiş faturalar için
```

### 2. Frontend Limit Düşürüldü

```typescript
// InvoicesPage.tsx
limit: 1000, // 100000'den → 1000'e
```

### 3. ERP Balances Limit Düşürüldü

```typescript
// InvoicesPage.tsx
useErpBalances({ limit: 5000 }); // 100000'den → 5000'e
```

## Index Stratejisi

MongoDB'de compound indexler soldan sağa doğru çalışır. Örneğin:

```typescript
index({ invoiceDate: -1, isPaid: 1, internalFirm: 1 })
```

Bu index şu sorguları optimize eder:
- ✅ `{ invoiceDate: ... }`
- ✅ `{ invoiceDate: ..., isPaid: ... }`
- ✅ `{ invoiceDate: ..., isPaid: ..., internalFirm: ... }`
- ❌ `{ isPaid: ... }` (soldan başlamadığı için index kullanamaz)
- ❌ `{ internalFirm: ... }` (soldan başlamadığı için index kullanamaz)

Bu yüzden en sık filtrelenen ve sıralanan alanlar sol tarafa konuldu.

## Index Migration

Yeni indexleri uygulamak için:

```bash
cd apps/api
npx ts-node -r tsconfig-paths/register src/scripts/rebuild-invoice-indexes.ts
```

Script şunları yapar:
1. Mevcut indexleri listeler
2. Eski indexleri siler (_id hariç)
3. Yeni indexleri oluşturur
4. Yeni index listesini gösterir

## Performans Beklentisi

- **Öncesi**: Binlerce kayıtta 3-5+ saniye yükleme
- **Sonrası**: Aynı kayıtlarda <1 saniye yükleme

## İzleme

MongoDB Compass'ta query plan'ı kontrol etmek için:

1. Compass'ta `global-invoices` koleksiyonunu aç
2. Explain Plan'e tık
3. Sorguyu gir
4. "Execution Stats" sekmesinde:
   - `executionTimeMillis`: Sorgu süresi (ms)
   - `totalDocsExamined`: İncelenen döküman sayısı
   - `totalKeysExamined`: İncelenen index key sayısı
   - `indexesUsed`: Kullanılan indexler

İyi bir sorgu:
- Index kullanıyor ✅
- `totalDocsExamined` ≈ `nReturned` (dönen kayıt sayısı) ✅
- `executionTimeMillis` < 100ms ✅

## Notlar

- Index'ler otomatik olarak Mongoose schema'dan oluşturulur
- Production'da ilk deployment sonrası indexler otomatik oluşacak
- Script manuel index yönetimi için kullanılabilir
- Çok fazla index performansı düşürebilir (write operations yavaşlar)
- Gereksiz indexleri kaldırmak önemli
