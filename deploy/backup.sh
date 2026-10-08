#!/usr/bin/env bash
# Өгөгдлийн сан ба иргэдийн зургийг нөөцлөнө (/opt/ulaanbaatar-mn/backups). Өдөр бүр ажиллуулах:
#   echo "0 3 * * * root bash /opt/ulaanbaatar-mn/deploy/backup.sh" | sudo tee /etc/cron.d/ubmn-backup
set -euo pipefail
cd /opt/ulaanbaatar-mn
mkdir -p backups
STAMP=$(date +%F)
# SQLite-ийг ажиллаж байх үед нь найдвартай хуулна
docker compose exec -T app node -e "require('better-sqlite3')('/data/ub.sqlite').backup('/data/backup.sqlite').then(()=>console.log('db ok'))"
docker compose exec -T app tar czf - -C /data backup.sqlite uploads > "backups/ub-$STAMP.tgz"
docker compose exec -T app rm -f /data/backup.sqlite
find backups -name 'ub-*.tgz' -mtime +30 -delete   # 30 хоногоос хуучныг устгана
echo "✓ backups/ub-$STAMP.tgz"
