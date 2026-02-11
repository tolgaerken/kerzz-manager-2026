# Version Yönetim Sistemi

Bu proje semantic versioning kullanarak otomatik version yönetimi sağlar.

## Kullanım

### 1. Otomatik Version Bump (Git Commit Bazlı)

```bash
pnpm version:bump
```

Son 10 commit mesajına bakarak otomatik version yükseltir:
- `feat:` → **minor** bump (1.0.0 → 1.1.0)
- `fix:` → **patch** bump (1.0.0 → 1.0.1)  
- `BREAKING CHANGE:` veya `!:` → **major** bump (1.0.0 → 2.0.0)

**Örnek commit mesajları:**
```bash
git commit -m "feat: yeni dashboard eklendi"        # minor bump
git commit -m "fix: invoice hesaplama hatası"       # patch bump
git commit -m "feat!: API yapısı değiştirildi"      # major bump
```

### 2. Manuel Version Bump

```bash
# Patch artışı (1.0.0 → 1.0.1)
pnpm version:patch

# Minor artışı (1.0.0 → 1.1.0)  
pnpm version:minor

# Major artışı (1.0.0 → 2.0.0)
pnpm version:major

# Belirli bir version
pnpm version 2.1.5
```

### 3. Version Bilgisini Görüntüleme

**API Endpoint:**
```bash
curl http://localhost:3888/api/version
```

**Response:**
```json
{
  "version": "1.0.0",
  "name": "Kerzz Manager API"
}
```

**Frontend:**
- Sidebar'ın en altında versiyon bilgisi otomatik görünür
- Menü daraltıldığında sadece versiyon numarası (tooltip ile)
- Menü açıkken tam bilgi (uygulama adı + versiyon)

## Version Yükseltme Workflow

```bash
# 1. Değişikliklerinizi commit edin
git add .
git commit -m "feat: yeni özellik eklendi"

# 2. Version'u otomatik yükseltin
pnpm version:bump

# 3. Version değişikliğini commit edin
git add apps/*/package.json
git commit -m "chore: bump version to X.Y.Z"

# 4. Tag oluşturun
git tag vX.Y.Z

# 5. Push edin
git push && git push --tags
```

## Notlar

- Her iki package.json (`apps/api` ve `apps/web`) senkron tutulur
- Version bilgisi runtime'da `package.json`'dan okunur
- Frontend cache ayarı: `staleTime: Infinity` (sayfa yenilenmeden değişmez)
