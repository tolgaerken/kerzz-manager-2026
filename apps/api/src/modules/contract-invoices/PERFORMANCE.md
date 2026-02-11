# Contract Invoices - Performans Optimizasyonları

## Yapılan İyileştirmeler

### 1. MongoDB Index Optimizasyonu
**Dosya:** `apps/api/src/modules/contract-payments/schemas/contract-payment.schema.ts`

**Eklenen Indexler:**
```typescript
ContractPaymentSchema.index({ payDate: -1, contractId: 1 });
ContractPaymentSchema.index({ payDate: -1, paid: 1 });
ContractPaymentSchema.index({ contractId: 1, payDate: -1 });
```

**Amaç:** Compound indexler sayesinde sık kullanılan sorgu kombinasyonları için index desteği sağlandı.

### 2. Aggregation Pipeline ile N+1 Problem Çözümü
**Dosya:** `apps/api/src/modules/contract-invoices/services/contract-invoice-orchestrator.service.ts`

**Önceki Yaklaşım (Yavaş):**
```typescript
// 1. Payment plans çek
const paymentPlans = await this.paymentModel.find(monthFilter).exec();

// 2. Contract'ları ayrı sorgu ile çek
const contracts = await this.contractModel.find({ id: { $in: contractIds } }).exec();

// 3. Memory'de filtrele
const filteredPlans = paymentPlans.filter(plan => ...);

// 4. Her kayıt için ERP Balance ve License çek
await this.enrichWithDynamicFields(filteredPlans);
```

**Toplam Sorgu Sayısı:** 1 (payments) + 1 (contracts) + N (balance) + M (licenses) = **3+ sorgu**

**Yeni Yaklaşım (Hızlı):**
```typescript
const results = await this.paymentModel.aggregate([
  { $match: monthFilter },                    // Tarih filtresi
  { $lookup: { from: "contracts", ... } },    // Join contracts
  { $match: { "contract.isFree": false } },   // Filtreleme
  { $lookup: { from: "erp-balances", ... } }, // Join balance
  { $lookup: { from: "licenses", ... } },     // Join licenses
  { $project: { ... } },                      // Zenginleştirme
  { $sort: { company: 1 } }
]).exec();
```

**Toplam Sorgu Sayısı:** **1 tek aggregation pipeline sorgusu**

**Avantajlar:**
- Tüm join ve filtreleme işlemleri database seviyesinde yapılır
- Network round-trip azalır
- MongoDB optimizer tüm pipeline'ı optimize edebilir
- Memory kullanımı azalır (gereksiz veri çekilmez)

### 3. Frontend Cache Optimizasyonu
**Dosya:** `apps/web/src/features/contract-invoices/hooks/useContractInvoices.ts`

**Değişiklikler:**
```typescript
staleTime: 1000 * 60 * 5,      // 2dk -> 5dk (veriler sık değişmez)
gcTime: 1000 * 60 * 15,         // 10dk -> 15dk
refetchOnReconnect: false,      // Gereksiz refetch engellendi
```

**Amaç:** Aynı veri için tekrarlayan API çağrılarını minimize etmek.

## Performans Kazançları

### Beklenen İyileştirmeler:
- **%60-80 daha hızlı** sorgu süresi (N+1 eliminasyonu)
- **%70+ daha az** database round-trip
- **Daha iyi index kullanımı** (compound indexler sayesinde)
- **Daha az memory tüketimi** (gereksiz veri çekilmez)

### Ölçüm Metrikleri:

#### Önceki Durum:
- İlk yükleme: ~3-5 saniye
- Database sorguları: 3+ sorgu
- Network round-trips: 4-6 adet

#### Yeni Durum (Hedef):
- İlk yükleme: ~0.5-1 saniye
- Database sorguları: 1 aggregation pipeline
- Network round-trips: 1 adet

## Timezone Desteği

**Not:** `$expr` operatörü timezone-aware sorgular için kullanılıyor:

```typescript
{
  $expr: {
    $and: [
      { $eq: [{ $year: { date: "$payDate", timezone: "Europe/Istanbul" } }, year] },
      { $eq: [{ $month: { date: "$payDate", timezone: "Europe/Istanbul" } }, month] }
    ]
  }
}
```

Bu yaklaşım timezone güvenliğini korur ancak index kullanımını kısıtlar. Gelecekte daha iyi performans için tarihleri doğru timezone'da saklamak düşünülebilir.

## İzlenecek Metrikler

1. **Sorgu Süresi**: MongoDB slow query log'larını izleyin
2. **Index Kullanımı**: `.explain("executionStats")` ile index performansını kontrol edin
3. **API Response Time**: `/contract-invoices/payment-plans` endpoint süresini ölçün
4. **Frontend Loading Time**: React DevTools Profiler ile render süresini kontrol edin

## Potansiyel İyileştirmeler (Gelecek)

1. **Materialized View/Cache:** Sık kullanılan ay verilerini Redis'te cache'leyin
2. **Pagination:** Çok fazla kayıt varsa sayfalama ekleyin
3. **Virtual Scroll:** Frontend'de virtual scroll kullanarak render performansını artırın
4. **Background Jobs:** İstatistikleri arka planda hesaplayın ve cache'leyin
