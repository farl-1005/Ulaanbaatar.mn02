#!/usr/bin/env bash
# Өөрийн компьютерийн PostgreSQL-д (macOS: EDB суулгагч, Postgres.app, Homebrew) энэ сайтын өгөгдлийн санг үүсгэнэ:
#   bash deploy/local-postgres.sh
# «ubmn» хэрэглэгч, «ubmn» өгөгдлийн сан үүсгэж, .env-д DATABASE_URL бичнэ. postgres (superuser)-ийн нууц үгийг асууна.
# Дараа нь npm run dev-ийг дахин асаахад одоогийн SQLite-ийн өгөгдөл PostgreSQL руу автоматаар шилжинэ.
set -euo pipefail
cd "$(dirname "$0")/.."
PSQL=$(command -v psql || true)
for d in /Library/PostgreSQL/*/bin /Applications/Postgres.app/Contents/Versions/latest/bin /opt/homebrew/opt/postgresql@*/bin /usr/local/opt/postgresql@*/bin; do
  [ -z "$PSQL" ] && [ -x "$d/psql" ] && PSQL="$d/psql"
done
[ -n "$PSQL" ] || { echo "✗ psql олдсонгүй. PostgreSQL суулгана уу: https://www.postgresql.org/download/"; exit 1; }
HOST="${PGHOST:-localhost}"; PORT="${PGPORT:-5432}"; SUPER="${PGSUPERUSER:-postgres}"
echo "→ PostgreSQL: $PSQL ($HOST:$PORT, superuser: $SUPER)"
PW=$(openssl rand -hex 16)
echo "→ «$SUPER»-ийн нууц үгийг асуувал PostgreSQL суулгахдаа тавьсан нууц үгээ бичнэ үү:"
"$PSQL" -h "$HOST" -p "$PORT" -U "$SUPER" -d postgres -v ON_ERROR_STOP=1 -q <<SQL
DO \$\$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ubmn') THEN CREATE ROLE ubmn LOGIN PASSWORD '$PW';
  ELSE ALTER ROLE ubmn WITH LOGIN PASSWORD '$PW'; END IF;
END \$\$;
SELECT 'CREATE DATABASE ubmn OWNER ubmn' WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'ubmn')\gexec
SQL
URL="postgres://ubmn:$PW@$HOST:$PORT/ubmn"
touch .env; chmod 600 .env
if grep -q '^DATABASE_URL=' .env; then sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=$URL|" .env && rm -f .env.bak; else printf '\n# PostgreSQL (deploy/local-postgres.sh)\nDATABASE_URL=%s\n' "$URL" >> .env; fi
echo "✓ «ubmn» өгөгдлийн сан бэлэн, .env-д DATABASE_URL бичлээ."
echo "  Одоо npm run dev-ийг дахин асаана уу (Ctrl + C, дараа нь npm run dev). Хуучин SQLite-ийн өгөгдөл өөрөө шилжинэ."
