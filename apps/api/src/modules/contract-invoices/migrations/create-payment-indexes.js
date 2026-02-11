/**
 * Contract Payments - Index Migration
 * 
 * Bu script contract-payments koleksiyonuna performans indexleri ekler.
 * 
 * Kullanım:
 * mongosh mongodb://localhost:27017/kerzz-contracts --file create-payment-indexes.js
 * 
 * veya MongoDB Compass'ta Script Runner ile çalıştırın.
 */

// contract-payments koleksiyonunu seç
db = db.getSiblingDB('kerzz-contracts');

print('Creating indexes for contract-payments collection...');

try {
  // Mevcut indexleri kontrol et
  const existingIndexes = db.getCollection('contract-payments').getIndexes();
  print('\nMevcut indexler:');
  existingIndexes.forEach(idx => {
    print(`  - ${JSON.stringify(idx.key)}`);
  });

  // Compound indexler oluştur
  print('\nYeni compound indexler oluşturuluyor...');

  // Index 1: payDate (desc) + contractId (asc)
  db.getCollection('contract-payments').createIndex(
    { payDate: -1, contractId: 1 },
    { name: 'idx_payDate_contractId', background: true }
  );
  print('✓ idx_payDate_contractId oluşturuldu');

  // Index 2: payDate (desc) + paid (asc)
  db.getCollection('contract-payments').createIndex(
    { payDate: -1, paid: 1 },
    { name: 'idx_payDate_paid', background: true }
  );
  print('✓ idx_payDate_paid oluşturuldu');

  // Index 3: contractId (asc) + payDate (desc)
  db.getCollection('contract-payments').createIndex(
    { contractId: 1, payDate: -1 },
    { name: 'idx_contractId_payDate', background: true }
  );
  print('✓ idx_contractId_payDate oluşturuldu');

  // Index durumunu kontrol et
  print('\nTüm indexler:');
  db.getCollection('contract-payments').getIndexes().forEach(idx => {
    print(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
  });

  print('\n✓ Index migration başarıyla tamamlandı!');
  print('\nNot: background: true kullanıldığı için indexler arka planda oluşturulacak.');
  print('Büyük koleksiyonlarda bu işlem birkaç dakika sürebilir.');
  print('Index durumunu kontrol etmek için:');
  print('  db.currentOp({ "command.createIndexes": "contract-payments" })');

} catch (error) {
  print(`\n✗ Hata: ${error.message}`);
  print('\nEğer index zaten varsa bu hata normal olabilir.');
}
