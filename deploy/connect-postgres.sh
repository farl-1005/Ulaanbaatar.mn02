#!/usr/bin/env bash
# Байгаа PostgreSQL сервер рүү (жишээ нь pgAdmin-д харагдах «farl») сайтыг холбоно: холболтыг шалгаад .env-д бичнэ.
#   bash deploy/connect-postgres.sh <хост> <порт> <өгөгдлийн сан> <хэрэглэгч> [schema]
#   bash deploy/connect-postgres.sh 172.16.10.20 5432 farl_db farl
# Нууц үгийг асууна (эсвэл PGPASSWORD орчны хувьсагчаас): дэлгэцэнд харагдахгүй, зөвхөн .env-д (git-д орохгүй) хадгалагдана.
# Сайтын хүснэгтүүд тусдаа schema-д (анхдагч нь ubmn) үүснэ: тухайн өгөгдлийн сангийн бусад хүснэгтэд хүрэхгүй.
# Дараа нь npm run dev-ийг дахин асаахад одоогийн SQLite-ийн өгөгдөл (data/ub.sqlite) тэр schema руу автоматаар шилжинэ.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ $# -lt 4 ]; then
  echo "Хэрэглээ: bash deploy/connect-postgres.sh <хост> <порт> <өгөгдлийн сан> <хэрэглэгч> [schema]"
  exit 1
fi
[ -d node_modules/pg ] || { echo "✗ Эхлээд npm install гэж ажиллуулна уу."; exit 1; }

if [ -n "${PGPASSWORD:-}" ]; then PGPW="$PGPASSWORD"; else
  read -rsp "PostgreSQL нууц үг ($4@$1): " PGPW < /dev/tty
  echo
fi

PGPW="$PGPW" node - "$@" <<'JS'
const fs = require('fs');
const { Client } = require('pg');
const [host, port, db, user, schema = 'ubmn'] = process.argv.slice(2);
if (!/^[a-z_][a-z0-9_]{0,62}$/.test(schema)) { console.error('✗ schema-ийн нэр буруу: ' + schema); process.exit(1); }
const url = `postgres://${encodeURIComponent(user)}:${encodeURIComponent(process.env.PGPW)}@${host}:${port}/${encodeURIComponent(db)}`;

(async () => {
  const c = new Client({ connectionString: url, connectionTimeoutMillis: 8000 });
  try { await c.connect(); } catch (e) { console.error('✗ Холбогдож чадсангүй: ' + e.message); process.exit(1); }
  const v = (await c.query("SELECT current_setting('server_version') AS v, has_database_privilege(current_user, current_database(), 'CREATE') AS can")).rows[0];
  const own = (await c.query('SELECT COUNT(*)::int AS n FROM information_schema.tables WHERE table_schema = $1', [schema])).rows[0].n;
  await c.end();
  console.log(`✓ Холбогдлоо: PostgreSQL ${v.v}, ${db} (${user}@${host}:${port})`);
  console.log(`  Зөвхөн «${schema}» schema-г ашиглана (одоо ${own} хүснэгттэй). Бусад schema, өгөгдлийн санд хүрэхгүй.`);
  if (!v.can && !own) { console.error(`✗ ${user} хэрэглэгч ${db}-д schema үүсгэх эрхгүй байна. pgAdmin-д: CREATE SCHEMA ${schema} AUTHORIZATION ${user};`); process.exit(1); }

  // .env: хуучин DATABASE_URL, DATABASE_SCHEMA мөрийг солино
  const lines = (fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '').split('\n').filter((l) => !/^(DATABASE_URL|DATABASE_SCHEMA)=/.test(l));
  while (lines.length && lines[lines.length - 1] === '') lines.pop();
  lines.push(`DATABASE_URL=${url}`, `DATABASE_SCHEMA=${schema}`, '');
  fs.writeFileSync('.env', lines.join('\n'), { mode: 0o600 });
  fs.chmodSync('.env', 0o600);   // зөвхөн эзэмшигч уншина
  console.log('✓ .env-д DATABASE_URL, DATABASE_SCHEMA бичлээ.');
  console.log('  Одоо npm run dev-ийг дахин асаана уу (Ctrl + C, дараа нь npm run dev).');
})();
JS
