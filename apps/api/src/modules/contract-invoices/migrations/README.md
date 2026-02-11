# Contract Invoices Migrations

Bu klasör contract-invoices modülü için veritabanı migration scriptlerini içerir.

## Mevcut Migrationlar

### 1. create-payment-indexes.js
Contract payments koleksiyonuna performans indexleri ekler.

**Ne yapar:**
- `payDate (desc) + contractId (asc)` compound index
- `payDate (desc) + paid (asc)` compound index  
- `contractId (asc) + payDate (desc)` compound index

**Nasıl çalıştırılır:**

#### Yöntem 1: mongosh CLI
```bash
mongosh mongodb://localhost:27017/kerzz-contracts --file create-payment-indexes.js
```

#### Yöntem 2: mongosh Shell İçinde
```javascript
use kerzz-contracts
load('./create-payment-indexes.js')
```

#### Yöntem 3: MongoDB Compass
1. Compass'ı açın ve `kerzz-contracts` database'ine bağlanın
2. Mongosh sekmesini açın
3. `create-payment-indexes.js` dosyasının içeriğini kopyalayıp yapıştırın
4. Enter tuşuna basın

**Not:**
- Indexler `background: true` ile oluşturulur, bu sayede koleksiyon kilitlenmez
- Büyük koleksiyonlarda işlem birkaç dakika sürebilir
- Index durumunu kontrol etmek için: `db.currentOp({ "command.createIndexes": "contract-payments" })`

## Index Performans Kontrolü

Index'lerin kullanılıp kullanılmadığını kontrol etmek için:

```javascript
// Bir sorguyu açıklama modunda çalıştır
db.getCollection('contract-payments')
  .find({
    $expr: {
      $and: [
        { $eq: [{ $year: { date: "$payDate", timezone: "Europe/Istanbul" } }, 2025] },
        { $eq: [{ $month: { date: "$payDate", timezone: "Europe/Istanbul" } }, 1] }
      ]
    }
  })
  .explain("executionStats");

// Index listesini görüntüle
db.getCollection('contract-payments').getIndexes();

// Index boyutlarını görüntüle
db.getCollection('contract-payments').stats().indexSizes;
```

## Rollback

Index'leri kaldırmak için:

```javascript
use kerzz-contracts

db.getCollection('contract-payments').dropIndex('idx_payDate_contractId');
db.getCollection('contract-payments').dropIndex('idx_payDate_paid');
db.getCollection('contract-payments').dropIndex('idx_contractId_payDate');
```

## Üretim Ortamı İçin Notlar

1. **Timing:** Index oluşturma işlemini düşük yoğunluklu saatlerde yapın
2. **Monitoring:** Index oluşturma ilerlemesini `db.currentOp()` ile izleyin
3. **Disk Space:** Index'ler disk alanı kullanır, yeterli alan olduğundan emin olun
4. **Replica Set:** Replica set kullanıyorsanız, indexler tüm node'lara replike edilir
