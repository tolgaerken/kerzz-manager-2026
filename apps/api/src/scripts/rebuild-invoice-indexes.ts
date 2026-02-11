/**
 * Invoice koleksiyonundaki indexleri yeniden oluşturur
 * 
 * Kullanım:
 * cd apps/api
 * npx ts-node -r tsconfig-paths/register src/scripts/rebuild-invoice-indexes.ts
 */

import { connect, connection } from 'mongoose';
import * as dotenv from 'dotenv';
import { join } from 'path';

// .env dosyasını yükle (apps/api/.env)
dotenv.config({ path: join(__dirname, '../../.env') });

async function rebuildInvoiceIndexes() {
  try {
    console.log('📦 MongoDB bağlantısı kuruluyor...');
    
    // MONGODB_CONTRACT_URI çevre değişkeninden al
    const mongoUri = process.env.MONGODB_CONTRACT_URI;
    const dbName = process.env.MONGODB_CONTRACT_DB;
    
    if (!mongoUri) {
      throw new Error('MONGODB_CONTRACT_URI çevre değişkeni bulunamadı');
    }
    
    if (!dbName) {
      throw new Error('MONGODB_CONTRACT_DB çevre değişkeni bulunamadı');
    }

    await connect(mongoUri, { dbName });
    console.log(`✅ MongoDB bağlantısı başarılı (Database: ${dbName})`);

    const db = connection.db;
    if (!db) {
      throw new Error('Database instance bulunamadı');
    }
    
    const collection = db.collection('global-invoices');

    console.log('\n📋 Mevcut indexler:');
    const existingIndexes = await collection.indexes();
    existingIndexes.forEach((idx) => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\n🗑️  Eski indexler siliniyor (_id hariç)...');
    const indexNames = existingIndexes
      .map((idx) => idx.name)
      .filter((name): name is string => name !== undefined && name !== '_id_');
    
    for (const name of indexNames) {
      try {
        await collection.dropIndex(name);
        console.log(`  ✓ ${name} silindi`);
      } catch (err: any) {
        console.log(`  ⚠️  ${name} silinemedi: ${err.message}`);
      }
    }

    console.log('\n🔨 Yeni indexler oluşturuluyor...');
    
    // Tek alan indexleri
    await collection.createIndex({ invoiceNumber: 1 }, { name: 'invoiceNumber_1' });
    console.log('  ✓ invoiceNumber_1 oluşturuldu');
    
    await collection.createIndex({ customerId: 1 }, { name: 'customerId_1' });
    console.log('  ✓ customerId_1 oluşturuldu');
    
    await collection.createIndex({ contractId: 1 }, { name: 'contractId_1' });
    console.log('  ✓ contractId_1 oluşturuldu');
    
    await collection.createIndex({ erpId: 1 }, { name: 'erpId_1' });
    console.log('  ✓ erpId_1 oluşturuldu');

    // Compound indexler
    await collection.createIndex(
      { invoiceDate: -1, isPaid: 1, internalFirm: 1 },
      { name: 'invoiceDate_-1_isPaid_1_internalFirm_1' }
    );
    console.log('  ✓ invoiceDate_-1_isPaid_1_internalFirm_1 oluşturuldu (Tarih aralığı + sıralama)');
    
    await collection.createIndex(
      { internalFirm: 1, isPaid: 1, invoiceDate: -1 },
      { name: 'internalFirm_1_isPaid_1_invoiceDate_-1' }
    );
    console.log('  ✓ internalFirm_1_isPaid_1_invoiceDate_-1 oluşturuldu (İç firma + ödeme durumu)');
    
    await collection.createIndex(
      { invoiceType: 1, invoiceDate: -1 },
      { name: 'invoiceType_1_invoiceDate_-1' }
    );
    console.log('  ✓ invoiceType_1_invoiceDate_-1 oluşturuldu (Fatura tipi + tarih)');
    
    await collection.createIndex(
      { customerId: 1, invoiceDate: -1 },
      { name: 'customerId_1_invoiceDate_-1' }
    );
    console.log('  ✓ customerId_1_invoiceDate_-1 oluşturuldu (Müşteri + tarih)');
    
    await collection.createIndex(
      { contractId: 1, invoiceDate: -1 },
      { name: 'contractId_1_invoiceDate_-1' }
    );
    console.log('  ✓ contractId_1_invoiceDate_-1 oluşturuldu (Kontrat + tarih)');
    
    await collection.createIndex(
      { isPaid: 1, dueDate: 1 },
      { name: 'isPaid_1_dueDate_1' }
    );
    console.log('  ✓ isPaid_1_dueDate_1 oluşturuldu (Gecikmiş faturalar)');

    // Text index
    console.log('\n📝 Text index oluşturuluyor...');
    await collection.createIndex(
      { name: 'text', invoiceNumber: 'text', description: 'text' },
      { name: 'text_search_index' }
    );
    console.log('  ✓ text_search_index oluşturuldu');

    console.log('\n✅ Tüm indexler başarıyla oluşturuldu!');

    console.log('\n📊 Yeni index listesi:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach((idx) => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    await connection.close();
    console.log('\n👋 MongoDB bağlantısı kapatıldı');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Hata:', error);
    await connection.close();
    process.exit(1);
  }
}

rebuildInvoiceIndexes();
