#!/usr/bin/env bash
# Шинэ Ubuntu 22.04/24.04 VPS дээр нэг удаа ажиллуулна (root эсвэл sudo эрхтэй):
#   curl -fsSL https://raw.githubusercontent.com/farl-1005/Ulaanbaatar.mn02/main/deploy/setup-ubuntu.sh | sudo bash -s -- ulaanbaatar.example.mn
# Аргумент: домэйн нэр (заавал биш). Домэйнгүй бол IP хаягаар ажиллана.
set -euo pipefail
DOMAIN="${1:-}"
REPO="https://github.com/farl-1005/Ulaanbaatar.mn02.git"
DIR=/opt/ulaanbaatar-mn

echo "→ Docker суулгаж байна..."
command -v docker >/dev/null || curl -fsSL https://get.docker.com | sh

echo "→ Галт хана: SSH, HTTP, HTTPS-ийг нээнэ..."
if command -v ufw >/dev/null; then ufw allow OpenSSH >/dev/null; ufw allow 80/tcp >/dev/null; ufw allow 443/tcp >/dev/null; ufw --force enable >/dev/null; fi

echo "→ Кодыг татаж байна..."
if [ -d "$DIR/.git" ]; then git -C "$DIR" pull --ff-only; else git clone "$REPO" "$DIR"; fi
cd "$DIR"

if [ ! -f .env ]; then
  umask 077
  printf 'ADMIN_PASSWORD=%s\n' "$(openssl rand -base64 18 | tr -d '/+=')" > .env
  [ -n "$DOMAIN" ] && printf 'DOMAIN=%s\n' "$DOMAIN" >> .env   # хоосон DOMAIN мөр Caddy-г эвдэнэ
  echo "→ Admin-ы нууц үгийг $DIR/.env файлд үүсгэлээ (харах: sudo cat $DIR/.env)"
fi

echo "→ Сайтыг асааж байна (анх удаа 2–4 минут)..."
docker compose up -d --build
echo "✓ Боллоо: ${DOMAIN:+https://$DOMAIN}${DOMAIN:-http://<серверийн IP>}   Admin: /#admin"
