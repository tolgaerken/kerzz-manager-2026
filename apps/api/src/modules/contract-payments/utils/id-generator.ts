/**
 * Benzersiz bir uzun ID olusturur (UUID + random suffix).
 * Odeme plani ve kontrat odemesi kayitlari icin kullanilir.
 */
export function generatePaymentId(): string {
  const uuid = crypto.randomUUID();
  const suffix = Math.random().toString(16).substring(2, 6);
  return `${uuid}-${suffix}`;
}

/**
 * Kisa benzersiz ID olusturur (UUID'nin ilk 8 karakteri).
 * Fatura satirlari ve referans kodlari icin kullanilir.
 */
export function generateShortId(): string {
  return crypto.randomUUID().substring(0, 8);
}
