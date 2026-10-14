#!/usr/bin/env bash
# Өгөгдлийн сан ба иргэдийн зургийг нөөцлөнө (/opt/ulaanbaatar-mn/backups). Өдөр бүр ажиллуулах:
#   echo "0 3 * * * root bash /opt/ulaanbaatar-mn/deploy/backup.sh" | sudo tee /etc/cron.d/ubmn-backup
set -euo pipefail
cd /opt/ulaanbaatar-mn
mkdir -p backups
STAMP=$(date +%F)
TMP=$(mktemp -d)
# PostgreSQL (DATABASE_URL тохируулсан бол) эсвэл SQLite-ийг ажиллаж байх үед нь найдвартай хуулна
if grep -q '^DATABASE_URL=' .env 2>/dev/null; then
  docker compose exec -T db pg_dump -U ubmn -d ubmn --no-owner --clean --if-exists > "$TMP/db.sql" && echo "db ok (PostgreSQL)"
else
  docker compose exec -T app node -e "require('better-sqlite3')('/data/ub.sqlite').backup('/data/backup.sqlite').then(()=>console.log('db ok (SQLite)'))"
  docker compose exec -T app cat /data/backup.sqlite > "$TMP/backup.sqlite"; docker compose exec -T app rm -f /data/backup.sqlite
fi
docker compose exec -T app tar czf - -C /data uploads > "$TMP/uploads.tgz"
tar czf "backups/ub-$STAMP.tgz" -C "$TMP" .
rm -rf "$TMP"
find backups -name 'ub-*.tgz' -mtime +30 -delete   # 30 хоногоос хуучныг устгана
echo "✓ backups/ub-$STAMP.tgz"
