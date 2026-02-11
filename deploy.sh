#!/bin/bash
set -e

# ========================================
# Kerzz Manager Deploy Script
# ========================================

SERVER="root@213.14.80.35"
REMOTE_WEB_PATH="/var/www/io.kerzz.com"
REMOTE_API_PATH="/var/www/kerzz-manager-api"
REMOTE_NGINX_PATH="/root/nginx"
PM2_APP_NAME="kerzz-manager-api"

# Renkli çıktı
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}[1/8] Shared paketler build ediliyor...${NC}"
cd packages/ui-theme
pnpm build
cd ../..

echo -e "${YELLOW}[2/8] Frontend build ediliyor...${NC}"
cd apps/web
pnpm build
cd ../..

echo -e "${YELLOW}[3/8] Backend build ediliyor...${NC}"
cd apps/api
pnpm build
cd ../..

echo -e "${YELLOW}[4/8] Sunucuda klasörler hazırlanıyor...${NC}"
ssh $SERVER "mkdir -p $REMOTE_WEB_PATH $REMOTE_API_PATH/dist $REMOTE_NGINX_PATH/conf"

echo -e "${YELLOW}[5/8] Dosyalar sunucuya yükleniyor (tar ile)...${NC}"
# Frontend upload (tek arşiv olarak)
tar -czf - -C apps/web/dist . | ssh $SERVER "tar -xzf - -C $REMOTE_WEB_PATH"

# Backend upload (dist + package.json)
tar -czf - -C apps/api dist package.json | ssh $SERVER "tar -xzf - -C $REMOTE_API_PATH"

echo -e "${YELLOW}[6/8] Nginx config güncelleniyor...${NC}"
# Nginx config ve docker-compose upload
scp ngnix_default2.conf $SERVER:$REMOTE_NGINX_PATH/conf/default.conf
scp docker-compose.nginx.yml $SERVER:$REMOTE_NGINX_PATH/docker-compose.yml

echo -e "${YELLOW}[7/8] Backend bağımlılıkları kuruluyor ve PM2 başlatılıyor...${NC}"
ssh $SERVER << 'ENDSSH'
cd /var/www/kerzz-manager-api

# npm ile production bağımlılıklarını kur
npm install --omit=dev

pm2 delete kerzz-manager-api 2>/dev/null || true
PORT=4008 pm2 start dist/main.js --name kerzz-manager-api
pm2 save
ENDSSH

echo -e "${YELLOW}[8/8] Nginx yeniden başlatılıyor (docker-compose)...${NC}"
ssh $SERVER << 'ENDSSH'
cd /root/nginx

# Sunucuda docker compose v2/v1 uyumluluğu
if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  echo "HATA: Ne 'docker compose' ne de 'docker-compose' bulundu."
  exit 1
fi

# Nginx container'ı compose ile yeniden başlat
$COMPOSE_CMD down 2>/dev/null || true
$COMPOSE_CMD up -d

# Config test
$COMPOSE_CMD exec -T nginx nginx -t
ENDSSH

echo -e "${GREEN}✅ Deploy tamamlandı!${NC}"
echo -e "Frontend: https://io.kerzz.com"
echo -e "API: https://io.kerzz.com/api"
