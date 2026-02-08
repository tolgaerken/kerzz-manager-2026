# @kerzz/ui-theme - Theme Preset System

Kerzz Cloud uygulamaları için merkezi tema ve stil yönetim paketi. Preset tabanlı tema sistemi, semantic token'lar ve utility fonksiyonları içerir.

## Özellikler

- ✅ **5 Hazır Tema Preset'i**: Kerzz Red, Ocean Blue, Forest Green, Sunset Orange, Midnight Purple
- ✅ **Semantic Token Sistemi**: Payment, status, delivery kategorileri için renk token'ları
- ✅ **Dinamik Gradient'ler**: Saat bazlı ve preset bazlı gradient'ler
- ✅ **Dark/Light Mode**: Tüm preset'ler için dark ve light mode desteği
- ✅ **Utility Fonksiyonlar**: Renk, gradient ve kategori yönetimi
- ✅ **Tailwind & MUI Desteği**: Her iki framework için hazır konfigürasyonlar
- ✅ **React Native Desteği**: pos.kerzz.cloud için özelleştirilmiş theme sistemi
- ✅ **i18n Entegrasyonu**: Çoklu dil desteği

## Kurulum

```bash
npm install @kerzz/ui-theme
```

## Kullanım

### 1. Tailwind CSS ile Kullanım

```javascript
// tailwind.config.js
import { createKerzzTailwindPreset } from '@kerzz/ui-theme';

export default {
  presets: [createKerzzTailwindPreset('kerzz-red')], // veya 'ocean-blue', 'forest-green', vb.
  // ... diğer ayarlar
};
```

### 2. Theme Store Kullanımı

```typescript
import { useThemeStore } from '@kerzz/ui-theme';

function MyComponent() {
  const { isDark, activePresetId, setPreset, toggleTheme } = useThemeStore();

  return (
    <div>
      <button onClick={toggleTheme}>
        {isDark ? 'Light' : 'Dark'} Mode
      </button>
      <button onClick={() => setPreset('ocean-blue')}>
        Ocean Blue Temasına Geç
      </button>
    </div>
  );
}
```

### 3. Theme Preset Selector Komponenti

```typescript
import { ThemePresetSelector } from '@kerzz/ui-theme';

function SettingsPage() {
  return (
    <div>
      <h1>Tema Ayarları</h1>
      <ThemePresetSelector />
    </div>
  );
}
```

### 4. Semantic Token Kullanımı

```typescript
import { getPaymentCategoryColor, getStatusCategoryColor } from '@kerzz/ui-theme';

// Payment kategorisi rengi
const cashColor = getPaymentCategoryColor('cash', 'light');
// { bg: '#ecfdf5', border: '#10b981', text: '#047857' }

// Status rengi
const pendingColor = getStatusCategoryColor('pending', 'dark');
// { bg: 'rgba(251, 191, 36, 0.2)', border: '#fbbf24', text: '#fcd34d' }
```

### 5. Gradient Kullanımı

```typescript
import { getTimeGradient, createGradient } from '@kerzz/ui-theme';

const hour = new Date().getHours();
const gradient = getTimeGradient(hour); // Saat bazında gradient
const gradientCSS = createGradient(gradient);

// CSS'de kullanım
<div style={{ background: gradientCSS }} />
```

### 6. React Native (pos.kerzz.cloud) Kullanımı

```typescript
// apps/pos.kerzz.cloud/src/styles/theme.ts artık preset sistemini kullanır
import { useTheme } from '@hooks/useTheme';

function MyComponent() {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello World</Text>
    </View>
  );
}
```

## Mevcut Preset'ler

| ID | İsim | Açıklama |
|----|------|----------|
| `kerzz-red` | Kerzz Kırmızı | Klasik Kerzz teması (varsayılan) |
| `ocean-blue` | Okyanus Mavisi | Sakin ve profesyonel mavi tonları |
| `forest-green` | Orman Yeşili | Doğal ve huzurlu yeşil tonları |
| `sunset-orange` | Gün Batımı Turuncu | Enerjik ve sıcak turuncu tonları |
| `midnight-purple` | Gece Moru | Gizemli ve lüks mor tonları |

## Semantic Token Kategorileri

### Payment Categories
- `cash` - Nakit ödemeler
- `credit_card` - Kredi kartı
- `debit_card` - Banka kartı
- `meal_voucher` - Yemek çeki
- `voucher` - Kupon
- `mobile` - Mobil ödeme
- `other` - Diğer

### Status Categories
- `pending` - Beklemede
- `confirmed` - Onaylandı
- `cancelled` - İptal edildi
- `completed` - Tamamlandı
- `rejected` - Reddedildi

### Delivery Status
- `preparing` - Hazırlanıyor
- `ready` - Hazır
- `on_delivery` - Yolda
- `delivered` - Teslim edildi

## Hard-coded Renkleri Temizleme

Eski hard-coded renkleri semantic token'lara dönüştürme:

```typescript
// ❌ Önce (Hard-coded)
const colors = {
  cash: { bg: '#e8f5e9', border: '#4caf50', text: '#2e7d32' }
};

// ✅ Sonra (Token-based)
import { getPaymentCategoryColor } from '@kerzz/ui-theme';
const colors = getPaymentCategoryColor('cash', isDark ? 'dark' : 'light');
```

## Geliştirme

```bash
# Paketi build et
npm run build

# Type check
npm run type-check
```

## Lisans

Proprietary - Kerzz Cloud

