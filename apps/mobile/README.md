# Kerzz Manager Mobile

React Native mobil uygulaması - iOS ve Android için.

## Gereksinimler

- Node.js >= 22.11.0
- pnpm >= 10.x
- Xcode 15+ (iOS için)
- Android Studio (Android için)
- CocoaPods (iOS için)

## Kurulum

### 1. Bağımlılıkları Yükle

Monorepo kök dizininde:

```bash
pnpm install
```

### 2. iOS Kurulumu

```bash
cd apps/mobile/ios
bundle install
bundle exec pod install
cd ..
```

### 3. Firebase Yapılandırması (Push Notifications)

Firebase Console'dan proje oluşturup config dosyalarını indirin:

**iOS:**
- `GoogleService-Info.plist` dosyasını `ios/` klasörüne kopyalayın
- Xcode'da projeye ekleyin

**Android:**
- `google-services.json` dosyasını `android/app/` klasörüne kopyalayın

Örnek dosyalar:
- `ios/GoogleService-Info.plist.example`
- `android/app/google-services.json.example`

### 4. Environment Yapılandırması

`.env.example` dosyasını `.env` olarak kopyalayıp değerleri güncelleyin:

```bash
cp .env.example .env
```

## Geliştirme

### Metro Bundler Başlat

```bash
pnpm start
```

### iOS Simülatörde Çalıştır

```bash
pnpm ios
```

### Android Emülatörde Çalıştır

```bash
pnpm android
```

## Proje Yapısı

```
apps/mobile/
├── App.tsx                 # Ana uygulama bileşeni
├── src/
│   ├── config/            # Ortam yapılandırması
│   ├── hooks/             # Custom hooks
│   ├── lib/               # API client, storage utilities
│   ├── navigation/        # React Navigation yapılandırması
│   ├── screens/           # Ekran bileşenleri
│   │   ├── auth/          # Giriş ekranları
│   │   ├── main/          # Ana ekranlar
│   │   ├── notifications/ # Bildirim ekranları
│   │   └── details/       # Detay ekranları
│   ├── services/          # API servisleri
│   └── store/             # Zustand store'ları
├── ios/                   # iOS native kodu
├── android/               # Android native kodu
└── __tests__/             # Test dosyaları
```

## Özellikler

### Auth
- E-posta/şifre ile giriş
- SMS OTP ile giriş
- Güvenli token depolama (Keychain/Keystore)
- Çoklu lisans desteği

### Push Notifications
- Firebase Cloud Messaging entegrasyonu
- iOS APNs desteği
- Bildirime tıklayınca ilgili ekrana yönlendirme

### Deep Linking
- URL scheme: `kerzzio://`
- Universal links: `https://io.kerzz.com`

Desteklenen deep link'ler:
- `kerzzio://notification/:id` - Bildirim detayı
- `kerzzio://customer/:id` - Müşteri detayı
- `kerzzio://contract/:id` - Kontrat detayı
- `kerzzio://license/:id` - Lisans detayı

## Komutlar

| Komut | Açıklama |
|-------|----------|
| `pnpm start` | Metro bundler başlat |
| `pnpm ios` | iOS simülatörde çalıştır |
| `pnpm android` | Android emülatörde çalıştır |
| `pnpm lint` | ESLint kontrolü |
| `pnpm typecheck` | TypeScript tip kontrolü |
| `pnpm test` | Jest testlerini çalıştır |

## Release Checklist

### iOS App Store

1. [ ] Bundle ID doğrula: `com.kerzz.io`
2. [ ] Version/Build numaralarını güncelle
3. [ ] Firebase `GoogleService-Info.plist` production config
4. [ ] Push notification capability ekle
5. [ ] Associated Domains capability ekle (universal links için)
6. [ ] App Store Connect'te uygulama oluştur
7. [ ] Archive ve upload

### Google Play Store

1. [ ] Application ID doğrula: `com.kerzz.io`
2. [ ] Version code/name güncelle
3. [ ] Firebase `google-services.json` production config
4. [ ] Release keystore oluştur ve imzala
5. [ ] `assetlinks.json` dosyasını sunucuya yükle (app links için)
6. [ ] Play Console'da uygulama oluştur
7. [ ] AAB oluştur ve yükle

## Sorun Giderme

### iOS Pod Hataları

```bash
cd ios
rm -rf Pods Podfile.lock
bundle exec pod install --repo-update
```

### Android Build Hataları

```bash
cd android
./gradlew clean
cd ..
pnpm android
```

### Metro Cache Temizle

```bash
pnpm start --reset-cache
```

## Katkıda Bulunma

1. Feature branch oluştur
2. Değişiklikleri commit et
3. Pull request aç

## Lisans

Proprietary - Kerzz
