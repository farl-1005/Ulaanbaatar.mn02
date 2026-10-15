#!/usr/bin/env bash
# nginx аль хэдийн ажиллаж буй (бусад сайттай) Ubuntu/Debian сервер дээр суулгана. Бусад сайт, 80/443 порт, галт ханад хүрэхгүй.
#   curl -fsSL https://raw.githubusercontent.com/farl-1005/Ulaanbaatar.mn02/main/deploy/setup-nginx.sh | sudo bash -s -- ub.example.mn [порт] [имэйл]
# Порт: апп-ын дотоод порт (анхдагч 3010, зөвхөн 127.0.0.1). Имэйл: Let's Encrypt-ийн мэдэгдэлд (заавал биш).
set -euo pipefail
DOMAIN="${1:?Домэйн нэрээ өгнө үү: setup-nginx.sh ub.example.mn}"
PORT="${2:-3010}"
EMAIL="${3:-}"
REPO="https://github.com/farl-1005/Ulaanbaatar.mn02.git"
DIR=/opt/ulaanbaatar-mn
[ "$(id -u)" -eq 0 ] || { echo "✗ sudo-гаар ажиллуулна уу"; exit 1; }
command -v nginx >/dev/null || { echo "✗ nginx олдсонгүй. nginx-гүй шинэ серверт deploy/setup-ubuntu.sh-г ашиглана."; exit 1; }
if ss -ltn | grep -q "127.0.0.1:$PORT \|0.0.0.0:$PORT \|\[::\]:$PORT \|\*:$PORT "; then
  [ -f "$DIR/.env" ] && grep -q "^APP_PORT=$PORT$" "$DIR/.env" || { echo "✗ $PORT порт өөр программд эзлэгдсэн байна. Өөр порт өгнө үү (жишээ: ... $DOMAIN 3020)"; exit 1; }
fi

echo "→ Docker..."
if ! command -v docker >/dev/null; then echo "  Docker суулгаж байна"; curl -fsSL https://get.docker.com | sh; fi
docker compose version >/dev/null 2>&1 || { echo "✗ 'docker compose' (v2) хэрэгтэй"; exit 1; }

echo "→ Кодыг татаж байна ($DIR)..."
command -v git >/dev/null || apt-get install -y git >/dev/null
if [ -d "$DIR/.git" ]; then git -C "$DIR" pull --ff-only; else git clone "$REPO" "$DIR"; fi
cd "$DIR"

echo "→ Тохиргоо (.env)..."
umask 077
touch .env
grep -q '^ADMIN_PASSWORD=' .env || { printf 'ADMIN_PASSWORD=%s\n' "$(openssl rand -base64 18 | tr -d '/+=')" >> .env; echo "  Admin-ы нууц үг үүсгэлээ (харах: sudo cat $DIR/.env)"; }
set_env() { if grep -q "^$1=" .env; then sed -i "s|^$1=.*|$1=$2|" .env; else printf '%s=%s\n' "$1" "$2" >> .env; fi; }
set_env SITE_URL "https://$DOMAIN"
set_env APP_PORT "$PORT"
grep -q "^COMPOSE_FILE=.*compose.pg" .env || set_env COMPOSE_FILE "deploy/docker-compose.nginx.yml"   # update.sh, backup.sh энэ горимыг ашиглана (ensure_pg PostgreSQL-ийг нэмнэ)
set_env COMPOSE_PROJECT_NAME "ulaanbaatar-mn"
sed -i '/^DOMAIN=/d' .env   # Caddy-ийн тохиргоо, энд хэрэггүй
# PostgreSQL-ийн нууц үг, холболтын хаягийг .env-д үүсгэнэ (байхгүй бол). Анх асахад апп хуучин SQLite-ийн өгөгдлийг өөрөө шилжүүлнэ.
ensure_pg() {
  grep -q '^POSTGRES_PASSWORD=' .env 2>/dev/null || { (umask 077; printf 'POSTGRES_PASSWORD=%s\n' "$(openssl rand -hex 16)" >> .env); echo "→ PostgreSQL-ийн нууц үгийг .env-д үүсгэлээ"; }
  local pw; pw=$(grep '^POSTGRES_PASSWORD=' .env | head -1 | cut -d= -f2-)
  grep -q '^DATABASE_URL=' .env || printf 'DATABASE_URL=postgres://ubmn:%s@db:5432/ubmn\n' "$pw" >> .env
  # PostgreSQL-ийн нэмэлт compose файлыг идэвхжүүлнэ (nginx горим эсвэл Caddy горим)
  local cf; cf=$(grep '^COMPOSE_FILE=' .env | head -1 | cut -d= -f2-)
  case "$cf" in
    *compose.pg*) ;;
    *docker-compose.nginx.yml*) sed -i "s|^COMPOSE_FILE=.*|COMPOSE_FILE=deploy/docker-compose.nginx.yml:deploy/compose.pg.nginx.yml|" .env ;;
    "") printf 'COMPOSE_FILE=docker-compose.yml:deploy/compose.pg.yml\n' >> .env ;;
    *) sed -i "s|^COMPOSE_FILE=.*|COMPOSE_FILE=$cf:deploy/compose.pg.yml|" .env ;;
  esac
}
ensure_pg

echo "→ Апп-ыг асааж байна (анх удаа 3–5 минут)..."
docker compose up -d --build
for i in $(seq 1 90); do curl -fs "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1 && break; sleep 4; done
curl -fs "http://127.0.0.1:$PORT/api/health" >/dev/null || { echo "✗ Апп асахгүй байна: cd $DIR && docker compose logs --tail 80 app"; exit 1; }
echo "  ✓ Апп 127.0.0.1:$PORT дээр ажиллаж байна"

echo "→ nginx ($DOMAIN)..."
if [ -d /etc/nginx/sites-available ]; then CONF=/etc/nginx/sites-available/$DOMAIN.conf; LINK=/etc/nginx/sites-enabled/$DOMAIN.conf; else CONF=/etc/nginx/conf.d/$DOMAIN.conf; LINK=; fi
if [ -f "$CONF" ] && ! grep -q 'setup-nginx.sh' "$CONF"; then echo "✗ $CONF аль хэдийн байна (өөр хүн үүсгэсэн). Түүнийг шалгаад дахин ажиллуулна уу."; exit 1; fi
if grep -rqs "server_name[^;]*\b$DOMAIN\b" /etc/nginx --exclude="$DOMAIN.conf"; then echo "✗ $DOMAIN өөр nginx тохиргоонд бүртгэлтэй байна:"; grep -rls "server_name[^;]*\b$DOMAIN\b" /etc/nginx --exclude="$DOMAIN.conf"; exit 1; fi
if [ ! -f "$CONF" ]; then sed -e "s/__DOMAIN__/$DOMAIN/g" -e "s/__PORT__/$PORT/g" deploy/nginx-site.conf > "$CONF"; [ -n "$LINK" ] && ln -sf "$CONF" "$LINK"; fi
if ! nginx -t 2>/dev/null; then echo "✗ nginx тохиргоо алдаатай болсон тул буцаалаа"; rm -f "$CONF" ${LINK:+"$LINK"}; nginx -t; exit 1; fi
systemctl reload nginx
echo "  ✓ http://$DOMAIN → апп"

echo "→ HTTPS сертификат (Let's Encrypt)..."
if ! command -v certbot >/dev/null; then apt-get update -qq && apt-get install -y -qq certbot python3-certbot-nginx >/dev/null || true; fi
if command -v certbot >/dev/null; then
  if grep -q 'listen 443' "$CONF"; then echo "  Сертификат аль хэдийн тохируулсан"
  else
    CB=(certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --redirect)
    if [ -n "$EMAIL" ]; then CB+=(-m "$EMAIL"); else CB+=(--register-unsafely-without-email); fi
    if "${CB[@]}"; then echo "  ✓ https://$DOMAIN"
    else echo "  ⚠ Сертификат авч чадсангүй. DNS ($DOMAIN → энэ сервер) зөв эсэхийг шалгаад: sudo certbot --nginx -d $DOMAIN"; fi
  fi
else echo "  ⚠ certbot олдсонгүй. HTTPS-ийн тулд: sudo apt install certbot python3-certbot-nginx && sudo certbot --nginx -d $DOMAIN"; fi

echo
echo "✓ Боллоо: https://$DOMAIN   Admin: https://$DOMAIN/admin (нууц үг: sudo grep ADMIN_PASSWORD $DIR/.env)"
echo "  Шинэчлэх: sudo bash $DIR/deploy/update.sh    Лог: cd $DIR && sudo docker compose logs -f app"
