/* PostgreSQL (DATABASE_URL өгсөн бол). Анх хоосон байхад data/ub.sqlite байвал өгөгдлийг нь автоматаар шилжүүлнэ. */
import * as fs from 'fs';
import { Pool, types } from 'pg';
import { Database } from './database';
import { SQLITE_FILE } from './sqlite';

types.setTypeParser(20, (v) => (v == null ? null : parseInt(v, 10)));   // BIGINT (огноо ms, COUNT) → Number

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS cms (col TEXT NOT NULL, id TEXT NOT NULL, body JSONB NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (col, id));
  CREATE TABLE IF NOT EXISTS cms_log (n BIGSERIAL PRIMARY KEY, at TEXT NOT NULL, action TEXT, col TEXT, id TEXT, title TEXT, by TEXT);
  CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires BIGINT NOT NULL);
  CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY, kind TEXT NOT NULL, data JSONB NOT NULL, status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL, updated_at TEXT);
  CREATE INDEX IF NOT EXISTS submissions_kind ON submissions (kind, created_at);
  CREATE INDEX IF NOT EXISTS submissions_email ON submissions ((data->>'email')) WHERE kind = 'digest';
  CREATE TABLE IF NOT EXISTS air_log (ts BIGINT PRIMARY KEY, aqi INTEGER NOT NULL, main TEXT);
`;

export class PostgresDatabase extends Database {
  readonly kind = 'postgres' as const;
  private readonly pool: Pool;
  /** Хүснэгтүүд бэлэн болох (асуулга бүр үүнийг хүлээнэ) */
  private readonly ready: Promise<void>;

  constructor(url: string) {
    super();
    const ssl = /[?&]sslmode=(require|verify)/.test(url) ? { rejectUnauthorized: !/sslmode=require/.test(url) } : undefined;
    this.pool = new Pool({ connectionString: url, max: +(process.env.DB_POOL || 0) || 10, ssl });
    this.pool.on('error', (e) => console.error('  ⚠ PostgreSQL:', e.message));
    this.ready = this.init();
    this.ready.catch((e) => console.error('  ✗ PostgreSQL-д холбогдож чадсангүй (DATABASE_URL-ийг шалгана уу):', e.message));
  }

  private async init() {
    await this.pool.query(SCHEMA);
    await this.migrateFromSqlite();
  }

  private async run(sql: string, args?: unknown[]) { await this.ready; return this.pool.query(sql, args); }
  private async one(sql: string, args?: unknown[]) { return (await this.run(sql, args)).rows[0] || null; }
  private async all(sql: string, args?: unknown[]) { return (await this.run(sql, args)).rows; }

  async cmsAll() { return this.all('SELECT col, id, body FROM cms'); }
  async cmsCol(col: string) { return this.all('SELECT id, body FROM cms WHERE col = $1', [col]); }
  async cmsOne(col: string, id: string) { const r = await this.one('SELECT body FROM cms WHERE col = $1 AND id = $2', [col, id]); return r ? r.body : null; }
  async cmsPut(col: string, id: string, body: object, at: string) {
    await this.run('INSERT INTO cms (col, id, body, updated_at) VALUES ($1, $2, $3, $4) ON CONFLICT (col, id) DO UPDATE SET body = EXCLUDED.body, updated_at = EXCLUDED.updated_at', [col, id, JSON.stringify(body), at]);
  }
  async cmsDel(col: string, id: string) { await this.run('DELETE FROM cms WHERE col = $1 AND id = $2', [col, id]); }
  async logAdd(at: string, action: string, col: string, id: string, title: string, by: string) {
    await this.run('INSERT INTO cms_log (at, action, col, id, title, by) VALUES ($1, $2, $3, $4, $5, $6)', [at, action, col, id, title, by]);
  }
  async logRecent() { return this.all('SELECT at, action, col, id, title, by FROM cms_log ORDER BY n DESC LIMIT 20'); }

  async sessAdd(hash: string, expires: number) { await this.run('INSERT INTO sessions (token_hash, expires) VALUES ($1, $2)', [hash, expires]); }
  async sessGet(hash: string) { return this.one('SELECT expires FROM sessions WHERE token_hash = $1', [hash]); }
  async sessDel(hash: string) { await this.run('DELETE FROM sessions WHERE token_hash = $1', [hash]); }
  async sessGc(now: number) { await this.run('DELETE FROM sessions WHERE expires < $1', [now]); }

  async subAdd(id: string, kind: string, data: object, at: string) {
    await this.run('INSERT INTO submissions (id, kind, data, created_at) VALUES ($1, $2, $3, $4)', [id, kind, JSON.stringify(data), at]);
  }
  async subCount(kind: string) { return (await this.one('SELECT COUNT(*) AS n FROM submissions WHERE kind = $1', [kind])).n; }
  async subList() { return this.all('SELECT id, kind, data, status, created_at, updated_at FROM submissions ORDER BY created_at DESC LIMIT 300'); }
  async subGet(id: string) { return this.one('SELECT id, data FROM submissions WHERE id = $1', [id]); }
  async subStatus(status: string, at: string, id: string) { await this.run('UPDATE submissions SET status = $1, updated_at = $2 WHERE id = $3', [status, at, id]); }
  async subDel(id: string) { await this.run('DELETE FROM submissions WHERE id = $1', [id]); }
  async subNew() { return (await this.one("SELECT COUNT(*) AS n FROM submissions WHERE status = 'new'")).n; }
  async emailExists(email: string) { return !!(await this.one("SELECT 1 FROM submissions WHERE kind = 'digest' AND data->>'email' = $1", [email])); }

  async airAdd(ts: number, aqi: number, main: string | null) { await this.run('INSERT INTO air_log (ts, aqi, main) VALUES ($1, $2, $3) ON CONFLICT (ts) DO NOTHING', [ts, aqi, main]); }
  async airSince(ts: number) { return this.all('SELECT ts, aqi FROM air_log WHERE ts >= $1 ORDER BY ts', [ts]); }
  async airGc(ts: number) { await this.run('DELETE FROM air_log WHERE ts < $1', [ts]); }

  async close() { await this.pool.end(); }

  /** PostgreSQL хоосон, хуучин data/ub.sqlite байвал бүх өгөгдлийг нэг удаа хуулна (давхардвал алгасна). */
  private async migrateFromSqlite() {
    if (!fs.existsSync(SQLITE_FILE)) return;
    const q = (sql: string, args?: unknown[]) => this.pool.query(sql, args);
    const used = (await q('SELECT (SELECT COUNT(*) FROM cms) + (SELECT COUNT(*) FROM submissions) + (SELECT COUNT(*) FROM cms_log) AS n')).rows[0];
    if (used && used.n > 0) return;
    let Sqlite: typeof import('better-sqlite3');
    try { Sqlite = require('better-sqlite3'); } catch { return; }
    const s = new Sqlite(SQLITE_FILE, { readonly: true, fileMustExist: true });
    const has = (t: string) => !!s.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(t);
    const rows = (t: string): any[] => (has(t) ? s.prepare(`SELECT * FROM ${t}`).all() : []);
    const n = { cms: 0, cms_log: 0, sessions: 0, submissions: 0, air_log: 0 };
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      for (const r of rows('cms')) { await client.query('INSERT INTO cms (col, id, body, updated_at) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING', [r.col, r.id, r.body, r.updated_at]); n.cms++; }
      for (const r of rows('cms_log')) { await client.query('INSERT INTO cms_log (at, action, col, id, title, by) VALUES ($1, $2, $3, $4, $5, $6)', [r.at, r.action, r.col, r.id, r.title, r.by]); n.cms_log++; }
      for (const r of rows('sessions')) { await client.query('INSERT INTO sessions (token_hash, expires) VALUES ($1, $2) ON CONFLICT DO NOTHING', [r.token_hash, r.expires]); n.sessions++; }
      for (const r of rows('submissions')) { await client.query('INSERT INTO submissions (id, kind, data, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING', [r.id, r.kind, r.data, r.status, r.created_at, r.updated_at]); n.submissions++; }
      for (const r of rows('air_log')) { await client.query('INSERT INTO air_log (ts, aqi, main) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [r.ts, r.aqi, r.main]); n.air_log++; }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
      s.close();
    }
    if (Object.values(n).some(Boolean)) console.log(`  ↪ SQLite-аас PostgreSQL руу шилжүүллээ: ${n.cms} засвар, ${n.submissions} хүсэлт, ${n.cms_log} түүх, ${n.sessions} нэвтрэлт, ${n.air_log} агаарын хэмжилт`);
  }
}
