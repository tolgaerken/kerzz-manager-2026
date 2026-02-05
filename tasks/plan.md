# Plan: Lisanslar (Licenses) Modülü

## Amaç
Angular projesindeki t-licenses modülünün tüm özelliklerini modern React/NestJS mimarisine taşımak. 
Modern UI/UX ile AG-Grid kullanarak lisans yönetim sistemi oluşturmak.

## Referans Özellikler (Angular Projesi)
- Lisans listesi (filtreleme, arama, sayfalama)
- Lisans detay formu (CRUD)
- Lisans modülleri yönetimi (licenseItems)
- SaaS kiralamalar yönetimi (saasItems)
- Lisans değişiklik geçmişi (audit log)
- Lisans tipleri (kerzz-pos, kerzz-cloud, orwi-pos)
- Şirket tipleri (chain, single, belediye, unv)
- Adres yönetimi (şehir/ilçe)
- Kişi yönetimi (persons)
- Durum kontrolleri (block, isOpen, active, hasRenty, hasLicense, hasBoss)

## Adımlar

### Backend (API) - Phase 1: Core

- [x] 1. License schema oluştur (`apps/api/src/modules/licenses/schemas/license.schema.ts`)
  - TLicense interface'i baz alınacak
  - Gerekli index'ler eklenecek (licenseId, type, companyType, brandName)

- [x] 2. License DTO'larını oluştur (`apps/api/src/modules/licenses/dto/`)
  - `license-query.dto.ts` - Query parametreleri (page, limit, search, type, companyType, active, block)
  - `license-response.dto.ts` - Response tipleri
  - `create-license.dto.ts` - Yeni lisans oluşturma
  - `update-license.dto.ts` - Lisans güncelleme

- [x] 3. Licenses service oluştur (`apps/api/src/modules/licenses/licenses.service.ts`)
  - findAll() - Pagination, filtering, sorting
  - findOne() - ID ile tek kayıt
  - create() - Yeni lisans
  - update() - Güncelleme
  - delete() - Silme
  - generateLicenseId() - Otomatik ID üretimi

- [x] 4. Licenses controller oluştur (`apps/api/src/modules/licenses/licenses.controller.ts`)
  - GET /licenses - Liste
  - GET /licenses/:id - Detay
  - POST /licenses - Oluştur
  - PATCH /licenses/:id - Güncelle
  - DELETE /licenses/:id - Sil

- [x] 5. Licenses module oluştur ve AppModule'e ekle

### Backend (API) - Phase 2: İlişkili Veriler

- [ ] 6. LicenseChange schema ve servis oluştur (değişiklik geçmişi)
  - Değişiklik logları için schema
  - GET /license-changes - Liste (tarih filtreli)
  - POST /license-changes - Log oluştur

### Frontend (Web) - Phase 3: Core UI

- [x] 7. License types oluştur (`apps/web/src/features/licenses/types/`)
  - `license.types.ts` - License, Person, Address, LicenseItem interfaces
  - `license-change.types.ts` - LicenseChangeLog interface

- [x] 8. License constants oluştur (`apps/web/src/features/licenses/constants/`)
  - LICENSE_TYPES, COMPANY_TYPES, CATEGORIES
  - API endpoints

- [x] 9. License API fonksiyonları oluştur (`apps/web/src/features/licenses/api/`)
  - `licensesApi.ts` - CRUD operasyonları
  - `licenseChangesApi.ts` - Değişiklik geçmişi

- [x] 10. useLicenses hook oluştur (`apps/web/src/features/licenses/hooks/`)
  - useLicenses() - Liste hook
  - useLicense() - Tek kayıt hook
  - useLicenseChanges() - Değişiklik geçmişi

### Frontend (Web) - Phase 4: Components

- [x] 11. LicensesGrid bileşeni oluştur (AG-Grid)
  - Tüm alanlar için kolon tanımları
  - Custom cell renderer'lar (durum ikonları, tarih formatı)
  - Filtreleme ve sıralama

- [x] 12. LicensesFilters bileşeni oluştur
  - Lisans tipi filtresi
  - Şirket tipi filtresi
  - Aktif/Bloke durumu
  - Arama

- [x] 13. LicenseFormModal bileşeni oluştur
  - Tab yapısı (Lisans Bilgileri, Modüller, SaaS)
  - Form validasyonu
  - Şehir/İlçe seçimi

- [ ] 14. LicenseModulesTab bileşeni oluştur (ileride)
  - Lisans modülleri grid'i (licenseItems)
  - Ekleme/silme

- [ ] 15. LicenseSaasTab bileşeni oluştur (ileride)
  - SaaS kiralamalar grid'i (saasItems)
  - Ekleme/silme

- [ ] 16. LicenseChangesPage bileşeni oluştur (ileride)
  - Değişiklik geçmişi grid'i
  - Tarih filtresi
  - Detay görüntüleme

### Frontend (Web) - Phase 5: Entegrasyon

- [x] 17. LicensesPage oluştur
  - Grid + Filters + Pagination
  - Toolbar (refresh, add)

- [x] 18. Router'a route'ları ekle
  - /licenses - Liste sayfası
  - /license-changes - Değişiklik geçmişi (ileride)

- [x] 19. Sidebar'a lisanslar linki ekle

### Test & Doğrulama

- [ ] 20. API endpoint'lerini test et
- [ ] 21. UI'da tüm özellikleri doğrula
- [ ] 22. Performans kontrolü

## Teknik Kararlar

1. **Database**: MongoDB (mevcut yapı ile uyumlu)
2. **Collection**: `licenses` (kerzz-contract DB'sine bağlanacak)
3. **State Management**: React Query (TanStack Query)
4. **UI Grid**: AG-Grid (mevcut tema ile uyumlu)
5. **Form**: Tek sorumluluk prensibi ile tab'lara bölünmüş
6. **Audit Log**: Ayrı collection'da değişiklik geçmişi

## UI/UX Prensipleri

- Modern, minimalist tasarım
- Dark/Light tema desteği (mevcut tema sistemi)
- Responsive layout
- Accessibility (ARIA labels)
- Loading states ve error handling
- Toast notifications

## Bağımlılıklar

- Contracts modülü yapısı referans alınacak
- Customers modülü yapısı referans alınacak
- Mevcut Modal bileşeni kullanılacak

---
**Durum**: Onay bekleniyor
**Öncelik**: Yüksek
