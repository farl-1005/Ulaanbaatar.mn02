#!/usr/bin/env bash
# GitHub дээрх шинэ кодыг сервер дээр гаргана:  sudo bash /opt/ulaanbaatar-mn/deploy/update.sh
set -euo pipefail
# Төслийн хавтас: скриптийн байрлалаас (bash <хавтас>/deploy/update.sh), эсвэл APP_DIR, эсвэл /opt/ulaanbaatar-mn
if [ -f "${BASH_SOURCE[0]:-}" ]; then cd "$(dirname "${BASH_SOURCE[0]}")/.."; else cd "${APP_DIR:-/opt/ulaanbaatar-mn}"; fi
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
# Хавтас өөр хэрэглэгчийнх бол (жишээ нь /home/<хэрэглэгч>/...) git-ийг тэр хэрэглэгчээр ажиллуулна
owner=$(stat -c %U . 2>/dev/null || echo root)
if [ "$(id -u)" = 0 ] && [ "$owner" != root ]; then sudo -u "$owner" git pull --ff-only; else git pull --ff-only; fi
ensure_pg
docker compose up -d --build
docker image prune -f >/dev/null
echo "✓ Шинэчлэгдлээ"
