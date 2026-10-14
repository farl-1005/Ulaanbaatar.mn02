/* Өгөгдлийн сангийн давхарга: PostgreSQL (DATABASE_URL өгсөн бол) эсвэл SQLite (data/ub.sqlite).
   server/api.js, server/pages.js зөвхөн эндээх async функцуудыг ашиглана. Хүснэгтүүд:
     cms          admin-ы засвар (col, id, body JSON)
     cms_log      admin-ы үйлдлийн түүх
     sessions     admin нэвтрэлт (token-ий sha256)
     submissions  иргэдийн маягт (эрсдэл, санал, имэйл бүртгэл)
     air_log      агаарын чанарын хэмжилт (IQAir)
   PostgreSQL анх хоосон байхад data/ub.sqlite байвал өгөгдлийг нь автоматаар шилжүүлнэ. */
const fs = require('fs'), path = require('path');

const PG_URL = process.env.DATABASE_URL || '';

/* ================= PostgreSQL ================= */
function pgBackend() {
  const pg = require('pg');
  pg.types.setTypeParser(20, (v) => (v == null ? null : parseInt(v, 10)));   // BIGINT (огноо ms, COUNT) → Number
  const ssl = /[?&]sslmode=(require|verify)/.test(PG_URL) ? { rejectUnauthorized: !/sslmode=require/.test(PG_URL) } : undefined;
  const pool = new pg.Pool({ connectionString: PG_URL, max: +process.env.DB_POOL || 10, ssl });
  pool.on('error', (e) => console.error('  ⚠ PostgreSQL:', e.message));
  const q = (sql, args) => pool.query(sql, args);
  const one = async (sql, args) => (await q(sql, args)).rows[0] || null;
  const all = async (sql, args) => (await q(sql, args)).rows;

  const init = (async () => {
    await q(`
      CREATE TABLE IF NOT EXISTS cms (col TEXT NOT NULL, id TEXT NOT NULL, body JSONB NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (col, id));
      CREATE TABLE IF NOT EXISTS cms_log (n BIGSERIAL PRIMARY KEY, at TEXT NOT NULL, action TEXT, col TEXT, id TEXT, title TEXT, by TEXT);
      CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires BIGINT NOT NULL);
      CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY, kind TEXT NOT NULL, data JSONB NOT NULL, status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL, updated_at TEXT);
      CREATE INDEX IF NOT EXISTS submissions_kind ON submissions (kind, created_at);
      CREATE INDEX IF NOT EXISTS submissions_email ON submissions ((data->>'email')) WHERE kind = 'digest';
      CREATE TABLE IF NOT EXISTS air_log (ts BIGINT PRIMARY KEY, aqi INTEGER NOT NULL, main TEXT);
    `);
    await migrateFromSqlite({ q, one });
  })();
  init.catch((e) => console.error('  ✗ PostgreSQL-д холбогдож чадсангүй (DATABASE_URL-ийг шалгана уу):', e.message));
  const w = (fn) => async (...a) => { await init; return fn(...a); };   // хүснэгт бэлэн болохыг хүлээнэ

  return {
    kind: 'postgres', ready: init,
    cmsAll: w(() => all('SELECT col, id, body FROM cms')),
    cmsCol: w((col) => all('SELECT id, body FROM cms WHERE col = $1', [col])),
    cmsOne: w(async (col, id) => { const r = await one('SELECT body FROM cms WHERE col = $1 AND id = $2', [col, id]); return r ? r.body : null; }),
    cmsPut: w((col, id, body, at) => q('INSERT INTO cms (col, id, body, updated_at) VALUES ($1, $2, $3, $4) ON CONFLICT (col, id) DO UPDATE SET body = EXCLUDED.body, updated_at = EXCLUDED.updated_at', [col, id, JSON.stringify(body), at])),
    cmsDel: w((col, id) => q('DELETE FROM cms WHERE col = $1 AND id = $2', [col, id])),
    logAdd: w((at, action, col, id, title, by) => q('INSERT INTO cms_log (at, action, col, id, title, by) VALUES ($1, $2, $3, $4, $5, $6)', [at, action, col, id, title, by])),
    logRecent: w(() => all('SELECT at, action, col, id, title, by FROM cms_log ORDER BY n DESC LIMIT 20')),
    sessAdd: w((hash, exp) => q('INSERT INTO sessions (token_hash, expires) VALUES ($1, $2)', [hash, exp])),
    sessGet: w((hash) => one('SELECT expires FROM sessions WHERE token_hash = $1', [hash])),
    sessDel: w((hash) => q('DELETE FROM sessions WHERE token_hash = $1', [hash])),
    sessGc: w((t) => q('DELETE FROM sessions WHERE expires < $1', [t])),
    subAdd: w((id, kind, data, at) => q('INSERT INTO submissions (id, kind, data, created_at) VALUES ($1, $2, $3, $4)', [id, kind, JSON.stringify(data), at])),
    subCount: w(async (kind) => (await one('SELECT COUNT(*) AS n FROM submissions WHERE kind = $1', [kind])).n),
    subList: w(() => all('SELECT id, kind, data, status, created_at, updated_at FROM submissions ORDER BY created_at DESC LIMIT 300')),
    subGet: w((id) => one('SELECT id, data FROM submissions WHERE id = $1', [id])),
    subStatus: w((status, at, id) => q('UPDATE submissions SET status = $1, updated_at = $2 WHERE id = $3', [status, at, id])),
    subDel: w((id) => q('DELETE FROM submissions WHERE id = $1', [id])),
    subNew: w(async () => (await one("SELECT COUNT(*) AS n FROM submissions WHERE status = 'new'")).n),
    emailExists: w(async (email) => !!(await one("SELECT 1 FROM submissions WHERE kind = 'digest' AND data->>'email' = $1", [email]))),
    airAdd: w((ts, aqi, main) => q('INSERT INTO air_log (ts, aqi, main) VALUES ($1, $2, $3) ON CONFLICT (ts) DO NOTHING', [ts, aqi, main])),
    airSince: w((ts) => all('SELECT ts, aqi FROM air_log WHERE ts >= $1 ORDER BY ts', [ts])),
    airGc: w((ts) => q('DELETE FROM air_log WHERE ts < $1', [ts])),
    close: () => pool.end(),
  };
}

/* PostgreSQL хоосон, хуучин data/ub.sqlite байвал бүх өгөгдлийг нэг удаа хуулна (давхардвал алгасна). */
async function migrateFromSqlite({ q, one }) {
  const file = sqliteFile();
  if (!fs.existsSync(file)) return;
  const used = await one('SELECT (SELECT COUNT(*) FROM cms) + (SELECT COUNT(*) FROM submissions) + (SELECT COUNT(*) FROM cms_log) AS n');
  if (used && used.n > 0) return;
  let Database; try { Database = require('better-sqlite3'); } catch (e) { return; }
  const s = new Database(file, { readonly: true, fileMustExist: true });
  const has = (t) => !!s.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(t);
  const rows = (t) => (has(t) ? s.prepare(`SELECT * FROM ${t}`).all() : []);
  const n = { cms: 0, cms_log: 0, sessions: 0, submissions: 0, air_log: 0 };
  await q('BEGIN');
  try {
    for (const r of rows('cms')) { await q('INSERT INTO cms (col, id, body, updated_at) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING', [r.col, r.id, r.body, r.updated_at]); n.cms++; }
    for (const r of rows('cms_log')) { await q('INSERT INTO cms_log (at, action, col, id, title, by) VALUES ($1, $2, $3, $4, $5, $6)', [r.at, r.action, r.col, r.id, r.title, r.by]); n.cms_log++; }
    for (const r of rows('sessions')) { await q('INSERT INTO sessions (token_hash, expires) VALUES ($1, $2) ON CONFLICT DO NOTHING', [r.token_hash, r.expires]); n.sessions++; }
    for (const r of rows('submissions')) { await q('INSERT INTO submissions (id, kind, data, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING', [r.id, r.kind, r.data, r.status, r.created_at, r.updated_at]); n.submissions++; }
    for (const r of rows('air_log')) { await q('INSERT INTO air_log (ts, aqi, main) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [r.ts, r.aqi, r.main]); n.air_log++; }
    await q('COMMIT');
  } catch (e) { await q('ROLLBACK'); s.close(); throw e; }
  s.close();
  if (Object.values(n).some(Boolean)) console.log(`  ↪ SQLite-аас PostgreSQL руу шилжүүллээ: ${n.cms} засвар, ${n.submissions} хүсэлт, ${n.cms_log} түүх, ${n.sessions} нэвтрэлт, ${n.air_log} агаарын хэмжилт`);
}

/* ================= SQLite (DATABASE_URL байхгүй үед) ================= */
function sqliteFile() {
  const DATA = process.env.DATA_DIR || (process.env.NODE_ENV === 'production' && fs.existsSync('/data') ? '/data' : path.join(__dirname, '..', 'data'));
  return path.join(DATA, 'ub.sqlite');
}
function sqliteBackend() {
  const Database = require('better-sqlite3');
  const file = sqliteFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS cms (col TEXT NOT NULL, id TEXT NOT NULL, body TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (col, id));
    CREATE TABLE IF NOT EXISTS cms_log (n INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, action TEXT, col TEXT, id TEXT, title TEXT, by TEXT);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY, kind TEXT NOT NULL, data TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL, updated_at TEXT);
    CREATE INDEX IF NOT EXISTS submissions_kind ON submissions (kind, created_at);
    CREATE TABLE IF NOT EXISTS air_log (ts INTEGER PRIMARY KEY, aqi INTEGER NOT NULL, main TEXT);
  `);
  const P = (sql) => db.prepare(sql), J = (s) => (s == null ? s : JSON.parse(s));
  const S = {
    cmsAll: P('SELECT col, id, body FROM cms'), cmsCol: P('SELECT id, body FROM cms WHERE col = ?'), cmsOne: P('SELECT body FROM cms WHERE col = ? AND id = ?'),
    cmsPut: P('INSERT INTO cms (col, id, body, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT (col, id) DO UPDATE SET body = excluded.body, updated_at = excluded.updated_at'),
    cmsDel: P('DELETE FROM cms WHERE col = ? AND id = ?'),
    logAdd: P('INSERT INTO cms_log (at, action, col, id, title, by) VALUES (?, ?, ?, ?, ?, ?)'), logRecent: P('SELECT at, action, col, id, title, by FROM cms_log ORDER BY n DESC LIMIT 20'),
    sessAdd: P('INSERT INTO sessions (token_hash, expires) VALUES (?, ?)'), sessGet: P('SELECT expires FROM sessions WHERE token_hash = ?'),
    sessDel: P('DELETE FROM sessions WHERE token_hash = ?'), sessGc: P('DELETE FROM sessions WHERE expires < ?'),
    subAdd: P('INSERT INTO submissions (id, kind, data, created_at) VALUES (?, ?, ?, ?)'), subCount: P('SELECT COUNT(*) AS n FROM submissions WHERE kind = ?'),
    subList: P('SELECT id, kind, data, status, created_at, updated_at FROM submissions ORDER BY created_at DESC LIMIT 300'), subGet: P('SELECT id, data FROM submissions WHERE id = ?'),
    subStatus: P('UPDATE submissions SET status = ?, updated_at = ? WHERE id = ?'), subDel: P('DELETE FROM submissions WHERE id = ?'),
    subNew: P("SELECT COUNT(*) AS n FROM submissions WHERE status = 'new'"), emailExists: P("SELECT 1 FROM submissions WHERE kind = 'digest' AND json_extract(data, '$.email') = ?"),
    airAdd: P('INSERT OR IGNORE INTO air_log (ts, aqi, main) VALUES (?, ?, ?)'), airSince: P('SELECT ts, aqi FROM air_log WHERE ts >= ? ORDER BY ts'), airGc: P('DELETE FROM air_log WHERE ts < ?'),
  };
  const A = (fn) => async (...a) => fn(...a);
  return {
    kind: 'sqlite', ready: Promise.resolve(), file,
    cmsAll: A(() => S.cmsAll.all().map((r) => ({ col: r.col, id: r.id, body: J(r.body) }))),
    cmsCol: A((col) => S.cmsCol.all(col).map((r) => ({ id: r.id, body: J(r.body) }))),
    cmsOne: A((col, id) => { const r = S.cmsOne.get(col, id); return r ? J(r.body) : null; }),
    cmsPut: A((col, id, body, at) => S.cmsPut.run(col, id, JSON.stringify(body), at)),
    cmsDel: A((col, id) => S.cmsDel.run(col, id)),
    logAdd: A((at, action, col, id, title, by) => S.logAdd.run(at, action, col, id, title, by)),
    logRecent: A(() => S.logRecent.all()),
    sessAdd: A((hash, exp) => S.sessAdd.run(hash, exp)), sessGet: A((hash) => S.sessGet.get(hash) || null),
    sessDel: A((hash) => S.sessDel.run(hash)), sessGc: A((t) => S.sessGc.run(t)),
    subAdd: A((id, kind, data, at) => S.subAdd.run(id, kind, JSON.stringify(data), at)), subCount: A((kind) => S.subCount.get(kind).n),
    subList: A(() => S.subList.all().map((r) => Object.assign(r, { data: J(r.data) }))),
    subGet: A((id) => { const r = S.subGet.get(id); return r ? { id: r.id, data: J(r.data) } : null; }),
    subStatus: A((status, at, id) => S.subStatus.run(status, at, id)), subDel: A((id) => S.subDel.run(id)),
    subNew: A(() => S.subNew.get().n), emailExists: A((email) => !!S.emailExists.get(email)),
    airAdd: A((ts, aqi, main) => S.airAdd.run(ts, aqi, main)), airSince: A((ts) => S.airSince.all(ts)), airGc: A((ts) => S.airGc.run(ts)),
    close: async () => db.close(),
  };
}

const db = PG_URL ? pgBackend() : sqliteBackend();
console.log(PG_URL ? '  🐘 Өгөгдлийн сан: PostgreSQL' : '  🗄  Өгөгдлийн сан: SQLite (' + db.file + ')');
module.exports = db;
