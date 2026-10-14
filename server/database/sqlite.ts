/* SQLite (DATABASE_URL байхгүй үед): data/ub.sqlite файл. Нэг серверт хангалттай, тохиргоо шаардахгүй. */
import BetterSqlite3 from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { DATA } from '../config';
import { Database } from './database';

export const SQLITE_FILE = path.join(DATA, 'ub.sqlite');

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS cms (col TEXT NOT NULL, id TEXT NOT NULL, body TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (col, id));
  CREATE TABLE IF NOT EXISTS cms_log (n INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, action TEXT, col TEXT, id TEXT, title TEXT, by TEXT);
  CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY, kind TEXT NOT NULL, data TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL, updated_at TEXT);
  CREATE INDEX IF NOT EXISTS submissions_kind ON submissions (kind, created_at);
  CREATE TABLE IF NOT EXISTS air_log (ts INTEGER PRIMARY KEY, aqi INTEGER NOT NULL, main TEXT);
`;

/** JSON текстийг объект болгоно (SQLite-д JSON-ыг текстээр хадгална) */
const json = (s: string | null) => (s == null ? s : JSON.parse(s));

export class SqliteDatabase extends Database {
  readonly kind = 'sqlite' as const;
  private readonly db: BetterSqlite3.Database;
  private readonly q: Record<string, BetterSqlite3.Statement>;

  constructor(readonly file = SQLITE_FILE) {
    super();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    this.db = new BetterSqlite3(file);
    this.db.pragma('journal_mode = WAL');
    this.db.exec(SCHEMA);
    const P = (sql: string) => this.db.prepare(sql);
    this.q = {
      cmsAll: P('SELECT col, id, body FROM cms'),
      cmsCol: P('SELECT id, body FROM cms WHERE col = ?'),
      cmsOne: P('SELECT body FROM cms WHERE col = ? AND id = ?'),
      cmsPut: P('INSERT INTO cms (col, id, body, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT (col, id) DO UPDATE SET body = excluded.body, updated_at = excluded.updated_at'),
      cmsDel: P('DELETE FROM cms WHERE col = ? AND id = ?'),
      logAdd: P('INSERT INTO cms_log (at, action, col, id, title, by) VALUES (?, ?, ?, ?, ?, ?)'),
      logRecent: P('SELECT at, action, col, id, title, by FROM cms_log ORDER BY n DESC LIMIT 20'),
      sessAdd: P('INSERT INTO sessions (token_hash, expires) VALUES (?, ?)'),
      sessGet: P('SELECT expires FROM sessions WHERE token_hash = ?'),
      sessDel: P('DELETE FROM sessions WHERE token_hash = ?'),
      sessGc: P('DELETE FROM sessions WHERE expires < ?'),
      subAdd: P('INSERT INTO submissions (id, kind, data, created_at) VALUES (?, ?, ?, ?)'),
      subCount: P('SELECT COUNT(*) AS n FROM submissions WHERE kind = ?'),
      subList: P('SELECT id, kind, data, status, created_at, updated_at FROM submissions ORDER BY created_at DESC LIMIT 300'),
      subGet: P('SELECT id, data FROM submissions WHERE id = ?'),
      subStatus: P('UPDATE submissions SET status = ?, updated_at = ? WHERE id = ?'),
      subDel: P('DELETE FROM submissions WHERE id = ?'),
      subNew: P("SELECT COUNT(*) AS n FROM submissions WHERE status = 'new'"),
      emailExists: P("SELECT 1 FROM submissions WHERE kind = 'digest' AND json_extract(data, '$.email') = ?"),
      airAdd: P('INSERT OR IGNORE INTO air_log (ts, aqi, main) VALUES (?, ?, ?)'),
      airSince: P('SELECT ts, aqi FROM air_log WHERE ts >= ? ORDER BY ts'),
      airGc: P('DELETE FROM air_log WHERE ts < ?'),
    };
  }

  async cmsAll() { return (this.q.cmsAll.all() as any[]).map((r) => ({ col: r.col, id: r.id, body: json(r.body) })); }
  async cmsCol(col: string) { return (this.q.cmsCol.all(col) as any[]).map((r) => ({ id: r.id, body: json(r.body) })); }
  async cmsOne(col: string, id: string) { const r = this.q.cmsOne.get(col, id) as any; return r ? json(r.body) : null; }
  async cmsPut(col: string, id: string, body: object, at: string) { this.q.cmsPut.run(col, id, JSON.stringify(body), at); }
  async cmsDel(col: string, id: string) { this.q.cmsDel.run(col, id); }
  async logAdd(at: string, action: string, col: string, id: string, title: string, by: string) { this.q.logAdd.run(at, action, col, id, title, by); }
  async logRecent() { return this.q.logRecent.all() as any[]; }

  async sessAdd(hash: string, expires: number) { this.q.sessAdd.run(hash, expires); }
  async sessGet(hash: string) { return (this.q.sessGet.get(hash) as { expires: number }) || null; }
  async sessDel(hash: string) { this.q.sessDel.run(hash); }
  async sessGc(now: number) { this.q.sessGc.run(now); }

  async subAdd(id: string, kind: string, data: object, at: string) { this.q.subAdd.run(id, kind, JSON.stringify(data), at); }
  async subCount(kind: string) { return (this.q.subCount.get(kind) as { n: number }).n; }
  async subList() { return (this.q.subList.all() as any[]).map((r) => Object.assign(r, { data: json(r.data) })); }
  async subGet(id: string) { const r = this.q.subGet.get(id) as any; return r ? { id: r.id, data: json(r.data) } : null; }
  async subStatus(status: string, at: string, id: string) { this.q.subStatus.run(status, at, id); }
  async subDel(id: string) { this.q.subDel.run(id); }
  async subNew() { return (this.q.subNew.get() as { n: number }).n; }
  async emailExists(email: string) { return !!this.q.emailExists.get(email); }

  async airAdd(ts: number, aqi: number, main: string | null) { this.q.airAdd.run(ts, aqi, main); }
  async airSince(ts: number) { return this.q.airSince.all(ts) as any[]; }
  async airGc(ts: number) { this.q.airGc.run(ts); }

  async close() { this.db.close(); }
}
