#!/bin/bash
set -e

# ========================================
# SSL Sertifika Deploy Script
# ========================================
# Kullanım:
#   ./deploy-certs.sh              → Her iki domain için deploy
#   ./deploy-certs.sh kerzz        → Sadece *.kerzz.com
#   ./deploy-certs.sh cloudlabs    → Sadece *.cloudlabs.com.tr

SERVER="root@213.14.80.35"
REMOTE_CERTS_PATH="/root/nginx/certs"
LOCAL_CERTS_PATH="certs"

# Renkli çıktı
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

deploy_cert() {
  local DOMAIN=$1
  local LOCAL_DIR=$2
  local CERT_FILE=$3
  local KEY_FILE=$4
  local CA_FILE="ca-root.cert"

  echo -e "${YELLOW}[$DOMAIN] Sertifika bilgileri kontrol ediliyor...${NC}"
  openssl x509 -in "$LOCAL_DIR/$CERT_FILE" -noout -subject -dates
  echo ""

  echo -e "${YELLOW}[$DOMAIN] Fullchain sertifika oluşturuluyor...${NC}"
  # Sertifikalar arası newline garanti et (bad end line hatasını önler)
  { cat "$LOCAL_DIR/$CERT_FILE"; echo; cat "$LOCAL_DIR/$CA_FILE"; } > "$LOCAL_DIR/fullchain.pem"

  ssh $SERVER "mkdir -p $REMOTE_CERTS_PATH"

  echo -e "${YELLOW}[$DOMAIN] Sertifikalar sunucuya yükleniyor...${NC}"
  scp "$LOCAL_DIR/fullchain.pem" "$SERVER:$REMOTE_CERTS_PATH/$DOMAIN.fullchain.pem"
  scp "$LOCAL_DIR/$KEY_FILE"     "$SERVER:$REMOTE_CERTS_PATH/$DOMAIN.key"

  rm -f "$LOCAL_DIR/fullchain.pem"

  echo -e "${GREEN}[$DOMAIN] Sertifikalar yüklendi.${NC}"
}

# Hangi domainler deploy edilecek?
DEPLOY_KERZZ=false
DEPLOY_CLOUDLABS=false

case "${1:-all}" in
  kerzz)
    DEPLOY_KERZZ=true
    ;;
  cloudlabs)
    DEPLOY_CLOUDLABS=true
    ;;
  all|"")
    DEPLOY_KERZZ=true
    DEPLOY_CLOUDLABS=true
    ;;
  *)
    echo -e "${RED}Geçersiz parametre: $1${NC}"
    echo "Kullanım: ./deploy-certs.sh [kerzz|cloudlabs|all]"
    exit 1
    ;;
esac

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  SSL Sertifika Deploy${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

if [ "$DEPLOY_KERZZ" = true ]; then
  deploy_cert "kerzz.com" \
    "$LOCAL_CERTS_PATH/kerzz.com" \
    "kerzz.com.cert" \
    "kerzz.com.key"
  echo ""
fi

if [ "$DEPLOY_CLOUDLABS" = true ]; then
  deploy_cert "cloudlabs.com.tr" \
    "$LOCAL_CERTS_PATH/cloudlabs.com.tr" \
    "cloudlabs.com.tr.cert" \
    "cloudlabs.com.tr.key"
  echo ""
fi

echo -e "${YELLOW}Sunucudaki sertifika dosyaları:${NC}"
ssh $SERVER "ls -la $REMOTE_CERTS_PATH/"
echo ""

echo -e "${YELLOW}Nginx config test ediliyor ve reload yapılıyor...${NC}"
ssh $SERVER << 'ENDSSH'
cd /root/nginx

if docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD="docker-compose"
else
  echo "HATA: Ne 'docker compose' ne de 'docker-compose' bulundu."
  exit 1
fi

$COMPOSE_CMD exec -T nginx nginx -t
if [ $? -eq 0 ]; then
  $COMPOSE_CMD exec -T nginx nginx -s reload
  echo "Nginx başarıyla reload edildi."
else
  echo "HATA: Nginx config test başarısız! Reload yapılmadı."
  exit 1
fi
ENDSSH

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Sertifika deploy tamamlandı!${NC}"
echo -e "${GREEN}========================================${NC}"
