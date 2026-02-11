/**
 * Timezone-safe tarih yardımcıları.
 *
 * date-fns'in startOfMonth/endOfMonth/getMonth/getYear fonksiyonları
 * sunucunun LOCAL timezone'unu kullanır. Bu durum sunucu farklı timezone'larda
 * çalıştığında (ör: Türkiye → Yunanistan taşınması) veri uyumsuzluğuna yol açar.
 *
 * Bu modüldeki fonksiyonlar HER ZAMAN UTC kullanır.
 */

const APP_TIMEZONE = "Europe/Istanbul";

/**
 * MongoDB sorgusu için timezone-aware ay filtresi oluşturur.
 *
 * payDate alanını Europe/Istanbul timezone'unda yorumlayarak
 * doğru yıl ve ay eşleştirmesi yapar.
 * Böylece veriler hangi timezone'da oluşturulmuş olursa olsun
 * (UTC, UTC+2, UTC+3) doğru ay eşleşir.
 *
 * @param date - "YYYY-MM-DD" veya "YYYY-MM" formatında tarih string'i
 * @returns MongoDB filter expression
 */
export function buildPayDateMonthFilter(date: string): Record<string, unknown> {
  const [year, month] = date.split("-").map(Number);

  return {
    $expr: {
      $and: [
        {
          $eq: [
            { $year: { date: "$payDate", timezone: APP_TIMEZONE } },
            year,
          ],
        },
        {
          $eq: [
            { $month: { date: "$payDate", timezone: APP_TIMEZONE } },
            month,
          ],
        },
      ],
    },
  };
}

/**
 * Verilen Date'in UTC ayının ilk gününü döndürür (UTC 00:00:00.000).
 *
 * date-fns startOfMonth yerine kullanılır — timezone'dan bağımsız çalışır.
 */
export function utcStartOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

/**
 * Verilen Date'in UTC ayının son gününü döndürür (UTC 23:59:59.999).
 *
 * date-fns endOfMonth yerine kullanılır — timezone'dan bağımsız çalışır.
 */
export function utcEndOfMonth(date: Date): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, lastDay, 23, 59, 59, 999));
}

/**
 * Verilen Date'e belirtilen ay sayısı kadar ekler (UTC bazlı).
 *
 * date-fns addMonths yerine kullanılır — timezone'dan bağımsız çalışır.
 */
export function utcAddMonths(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const day = date.getUTCDate();
  return new Date(Date.UTC(year, month, day));
}

/**
 * İki UTC tarih arası takvim ayı farkını hesaplar.
 *
 * date-fns differenceInCalendarMonths yerine kullanılır.
 */
export function utcDifferenceInCalendarMonths(
  later: Date,
  earlier: Date,
): number {
  return (
    (later.getUTCFullYear() - earlier.getUTCFullYear()) * 12 +
    (later.getUTCMonth() - earlier.getUTCMonth())
  );
}

/**
 * Date nesnesinden UTC yılını döndürür.
 *
 * date-fns getYear yerine kullanılır.
 */
export function utcGetYear(date: Date): number {
  return new Date(date).getUTCFullYear();
}

/**
 * Date nesnesinden UTC ayını döndürür (0-indexed).
 *
 * date-fns getMonth yerine kullanılır.
 */
export function utcGetMonth(date: Date): number {
  return new Date(date).getUTCMonth();
}

/**
 * Verilen Date'in UTC günün başlangıcını döndürür (UTC 00:00:00.000).
 *
 * date-fns startOfDay yerine kullanılır — timezone'dan bağımsız çalışır.
 */
export function utcStartOfDay(date: Date): Date {
  const d = new Date(date);
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

/**
 * İki UTC tarih arası takvim günü farkını hesaplar.
 *
 * date-fns differenceInCalendarDays yerine kullanılır.
 */
export function utcDifferenceInCalendarDays(
  later: Date,
  earlier: Date,
): number {
  const utcLater = Date.UTC(
    later.getUTCFullYear(),
    later.getUTCMonth(),
    later.getUTCDate(),
  );
  const utcEarlier = Date.UTC(
    earlier.getUTCFullYear(),
    earlier.getUTCMonth(),
    earlier.getUTCDate(),
  );
  return Math.round((utcLater - utcEarlier) / (24 * 60 * 60 * 1000));
}
