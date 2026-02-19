# Version Yonetim Sistemi

Bu proje semantic versioning (semver) kullanir. Baslangic versiyonu `0.0.1`'dir.

## Deploy ile Otomatik Patch Artisi

`deploy.sh` her calistiginda patch versiyonu otomatik artar:

```
0.0.1 -> 0.0.2 -> 0.0.3 -> ...
```

Ekstra bir islem yapmaniza gerek yok; deploy scripti basinda `node scripts/version.js patch` cagirir.

## Manuel Version Bump

Major veya minor artisi icin asagidaki komutlari kullanin:

```bash
# Patch artisi (0.0.1 -> 0.0.2)
pnpm version:patch

# Minor artisi (0.0.2 -> 0.1.0)
pnpm version:minor

# Major artisi (0.1.0 -> 1.0.0)
pnpm version:major

# Belirli bir version
pnpm version 2.1.5
```

## Version Bilgisini Goruntuleme

**API Endpoint:**

```bash
curl http://localhost:3888/api/version
```

**Response:**

```json
{
  "version": "0.0.1",
  "name": "Kerzz Manager API"
}
```

**Frontend:**

- Sidebar'da versiyon bilgisi her zaman gorunur
- Menu daraltildiginda badge olarak `vX.Y.Z`
- Menu acikken uygulama adi + versiyon

## Ornek Workflow

```bash
# 1. Degisikliklerinizi commit edin
git add .
git commit -m "feat: yeni ozellik eklendi"

# 2. Deploy calistirin (patch otomatik artar)
./deploy.sh

# 3. Eger major/minor artisi gerekiyorsa deploy oncesi:
pnpm version:minor   # veya version:major
./deploy.sh
```

## Notlar

- `apps/api/package.json` ve `apps/web/package.json` senkron tutulur
- Version bilgisi runtime'da `package.json`'dan okunur
- Frontend cache ayari: `staleTime: Infinity` (sayfa yenilenmeden degismez)
