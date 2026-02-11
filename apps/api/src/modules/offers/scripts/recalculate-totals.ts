import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../app.module';
import { OffersService } from '../offers.service';

/**
 * Tüm offers için totals alanını yeniden hesaplar
 * 
 * Kullanım:
 * pnpm exec ts-node -r tsconfig-paths/register apps/api/src/modules/offers/scripts/recalculate-totals.ts
 */
async function recalculateTotals() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const offersService = app.get(OffersService);

  console.log('Tüm teklifler için toplamlar yeniden hesaplanıyor...');

  try {
    // Tüm offer ID'lerini getir
    const result = await offersService.findAll({ 
      limit: 99999,
      sortField: 'createdAt',
      sortOrder: 'desc'
    });

    const offers = result.data;
    console.log(`Toplam ${offers.length} teklif bulundu.`);

    let successCount = 0;
    let errorCount = 0;

    // Her bir offer için calculate çalıştır
    for (const offer of offers) {
      try {
        await offersService.calculate(offer._id);
        successCount++;
        console.log(`✓ [${successCount}/${offers.length}] Teklif ${offer.no} hesaplandı`);
      } catch (err: any) {
        errorCount++;
        console.error(`✗ Teklif ${offer.no} hesaplama hatası:`, err.message);
      }
    }

    console.log('\n=== ÖZET ===');
    console.log(`Başarılı: ${successCount}`);
    console.log(`Hatalı: ${errorCount}`);
    console.log(`Toplam: ${offers.length}`);

  } catch (err: any) {
    console.error('Kritik hata:', err.message);
  } finally {
    await app.close();
  }
}

recalculateTotals();
