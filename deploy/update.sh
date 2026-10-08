#!/usr/bin/env bash
# GitHub дээрх шинэ кодыг сервер дээр гаргана:  sudo bash /opt/ulaanbaatar-mn/deploy/update.sh
set -euo pipefail
cd /opt/ulaanbaatar-mn
git pull --ff-only
docker compose up -d --build
docker image prune -f >/dev/null
echo "✓ Шинэчлэгдлээ"
