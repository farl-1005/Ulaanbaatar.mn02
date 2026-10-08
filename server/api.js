/* Backend API
   - Admin CMS: засвар бүр data/ub.sqlite-д хадгалагдаж, нээлттэй бүх хөтөч рүү /api/events-ээр шууд мэдэгдэнэ.
   - Иргэдийн маягт: эрсдэл мэдээлэх (зурагтай), санал хүсэлт, имэйл бүртгэл → submissions хүснэгт.
   - Admin нэвтрэлт: .env файлын ADMIN_PASSWORD. Анх асаахад файл байхгүй бол санамсаргүй нууц үг үүсгэнэ.
   build.js (npm run dev) болон server/index.js (npm start) хоёулаа энэ модулийг ашиглана. */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const Database = require('better-sqlite3');

const ROOT = path.join(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env');
if (!process.env.ADMIN_PASSWORD && !fs.existsSync(ENV_FILE)) {
  fs.writeFileSync(ENV_FILE, `# Admin-ы нууц үг. Энэ файлыг git-д оруулахгүй (.gitignore).\nADMIN_PASSWORD=${crypto.randomBytes(12).toString('base64url')}\n`, { mode: 0o600 });
  console.log('  🔑 Admin-ы нууц үгийг үүсгэж .env файлд хадгаллаа.');
}
try { process.loadEnvFile(ENV_FILE); } catch (e) { /* .env байхгүй бол орчны хувьсагчийг ашиглана */ }

const DATA = process.env.DATA_DIR || path.join(ROOT, 'data');
const UPLOADS = path.join(DATA, 'uploads');
fs.mkdirSync(UPLOADS, { recursive: true });

/* ================= Өгөгдлийн сан ================= */
const db = new Database(path.join(DATA, 'ub.sqlite'));
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS cms (col TEXT NOT NULL, id TEXT NOT NULL, body TEXT NOT NULL, updated_at TEXT NOT NULL, PRIMARY KEY (col, id));
  CREATE TABLE IF NOT EXISTS cms_log (n INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, action TEXT, col TEXT, id TEXT, title TEXT, by TEXT);
  CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, expires INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS submissions (id TEXT PRIMARY KEY, kind TEXT NOT NULL, data TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL, updated_at TEXT);
  CREATE INDEX IF NOT EXISTS submissions_kind ON submissions (kind, created_at);
`);
const Q = {
  cmsAll: db.prepare('SELECT col, id, body FROM cms'),
  cmsPut: db.prepare('INSERT INTO cms (col, id, body, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT (col, id) DO UPDATE SET body = excluded.body, updated_at = excluded.updated_at'),
  cmsDel: db.prepare('DELETE FROM cms WHERE col = ? AND id = ?'),
  logAdd: db.prepare('INSERT INTO cms_log (at, action, col, id, title, by) VALUES (?, ?, ?, ?, ?, ?)'),
  logRecent: db.prepare('SELECT at, action, col, id, title, by FROM cms_log ORDER BY n DESC LIMIT 20'),
  sessAdd: db.prepare('INSERT INTO sessions (token_hash, expires) VALUES (?, ?)'),
  sessGet: db.prepare('SELECT expires FROM sessions WHERE token_hash = ?'),
  sessDel: db.prepare('DELETE FROM sessions WHERE token_hash = ?'),
  sessGc: db.prepare('DELETE FROM sessions WHERE expires < ?'),
  subAdd: db.prepare('INSERT INTO submissions (id, kind, data, created_at) VALUES (?, ?, ?, ?)'),
  subCount: db.prepare('SELECT COUNT(*) AS n FROM submissions WHERE kind = ?'),
  subList: db.prepare('SELECT id, kind, data, status, created_at, updated_at FROM submissions ORDER BY created_at DESC LIMIT 300'),
  subGet: db.prepare('SELECT id, data FROM submissions WHERE id = ?'),
  subStatus: db.prepare('UPDATE submissions SET status = ?, updated_at = ? WHERE id = ?'),
  subDel: db.prepare('DELETE FROM submissions WHERE id = ?'),
  subNew: db.prepare("SELECT COUNT(*) AS n FROM submissions WHERE status = 'new'"),
  emailExists: db.prepare("SELECT 1 FROM submissions WHERE kind = 'digest' AND json_extract(data, '$.email') = ?"),
};

/* ================= Туслах ================= */
const COLS = ['news', 'alerts', 'events', 'projects', 'services', 'texts', 'settings', 'media',
  'mediaitems', 'sits', 'docs', 'struct', 'orgs', 'history', 'citydata', 'menu', 'rubrics', 'ecats', 'pcats', 'topics', 'faq'];   // src/cms.js-ийн CMS_COLS-тай ижил
const ID_RE = /^[\w.-]{1,80}$/;
const now = () => new Date().toISOString();
const sha = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const COOKIE = 'ubmn_admin', SESSION_DAYS = 7;

function send(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}
const fail = (res, code, error) => send(res, code, { error });

function readJSON(req, limit) {
  return new Promise((resolve, reject) => {
    if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) { reject({ code: 415, error: 'json_required' }); return; }
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > limit) { reject({ code: 413, error: 'too_large' }); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch (e) { reject({ code: 400, error: 'bad_json' }); } });
    req.on('error', () => reject({ code: 400, error: 'bad_request' }));
  });
}
function cookies(req) {
  const out = {}; String(req.headers.cookie || '').split(';').forEach((p) => { const i = p.indexOf('='); if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); });
  return out;
}
function isAdmin(req) {
  const tok = cookies(req)[COOKIE]; if (!tok) return false;
  const s = Q.sessGet.get(sha(tok)); return !!(s && s.expires > Date.now());
}
const clientIp = (req) => (process.env.TRUST_PROXY ? String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() : '') || req.socket.remoteAddress || '?';
const secure = (req) => !!(req.socket.encrypted || (process.env.TRUST_PROXY && req.headers['x-forwarded-proto'] === 'https'));

/* Энгийн хурдны хязгаар: key-ээр (IP + үйлдэл) тодорхой хугацаанд N удаа. */
const hits = new Map();
function limited(key, max, windowMs) {
  const t = Date.now(), arr = (hits.get(key) || []).filter((x) => t - x < windowMs);
  arr.push(t); hits.set(key, arr);
  return arr.length > max;
}
setInterval(() => { const t = Date.now(); for (const [k, v] of hits) if (!v.some((x) => t - x < 3600e3)) hits.delete(k); Q.sessGc.run(t); }, 600e3).unref();

/* ================= Шууд мэдэгдэл (Server-Sent Events) ================= */
const clients = new Set();
function broadcast(ev) { for (const res of clients) res.write(`event: ${ev}\ndata: ${Date.now()}\n\n`); }
setInterval(() => { for (const res of clients) res.write(': ping\n\n'); }, 25000).unref();

/* ================= Маягтын шалгалт ================= */
const str = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);
const REPORT_CATS = ['pothole', 'light', 'waste', 'water', 'building', 'other'];
const PREFIX = { report: 'UB', idea: 'SA', digest: 'EM' };
function savePhoto(id, dataUrl) {
  const m = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) return null;
  const buf = Buffer.from(m[2], 'base64'); if (buf.length > 3e6) return null;
  const file = `${id}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`;
  fs.writeFileSync(path.join(UPLOADS, file), buf);
  return '/uploads/' + file;
}
function validate(kind, b) {
  if (kind === 'report') {
    if (!REPORT_CATS.includes(b.cat)) return { error: 'bad_category' };
    const pt = Array.isArray(b.pt) && b.pt.length === 2 && b.pt.every((n) => Number.isFinite(+n)) ? [Math.round(+b.pt[0]), Math.round(+b.pt[1])] : null;
    if (!pt) return { error: 'bad_location' };
    return { data: { cat: b.cat, pt, dist: str(b.dist, 60), desc: str(b.desc, 2000) } };
  }
  if (kind === 'idea') {
    const text = str(b.text, 3000); if (!text) return { error: 'empty_text' };
    return { data: { topic: str(b.topic, 30), text, gov: !!b.gov } };
  }
  if (kind === 'digest') {
    const email = str(b.email, 200).toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'bad_email' };
    return { data: { email } };
  }
  return { error: 'unknown_form' };
}

/* ================= Чиглүүлэлт ================= */
const handles = (p) => p.startsWith('/api/') || p.startsWith('/uploads/');

async function handle(req, res) {
  const url = new URL(req.url, 'http://x'), p = url.pathname, m = req.method;
  // Өөр сайтаас ирсэн бичих хүсэлтийг хаана (CSRF)
  if (m !== 'GET' && m !== 'HEAD' && req.headers.origin) {
    let ok = false; try { ok = new URL(req.headers.origin).host === req.headers.host; } catch (e) { /* буруу origin */ }
    if (!ok) return fail(res, 403, 'bad_origin');
  }
  const admin = isAdmin(req), ip = clientIp(req);
  try {
    if (p === '/api/health') return send(res, 200, { ok: true });

    if (p === '/api/events' && m === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
      res.write('event: hello\ndata: 0\n\n'); clients.add(res); req.on('close', () => clients.delete(res)); return;
    }

    if (p === '/api/cms' && m === 'GET') {
      const data = {}; COLS.forEach((c) => { data[c] = {}; });
      for (const r of Q.cmsAll.all()) if (data[r.col]) data[r.col][r.id] = JSON.parse(r.body);
      return send(res, 200, { data, log: admin ? Q.logRecent.all() : [], admin, inboxNew: admin ? Q.subNew.get().n : 0 });
    }

    if (p === '/api/login' && m === 'POST') {
      if (limited('login:' + ip, 10, 15 * 60e3)) return fail(res, 429, 'too_many_attempts');
      const b = await readJSON(req, 4096), pw = process.env.ADMIN_PASSWORD || '';
      const ok = pw && crypto.timingSafeEqual(Buffer.from(sha(b.password || '')), Buffer.from(sha(pw)));
      if (!ok) return fail(res, 401, 'wrong_password');
      const tok = crypto.randomBytes(32).toString('base64url');
      Q.sessAdd.run(sha(tok), Date.now() + SESSION_DAYS * 864e5);
      res.setHeader('Set-Cookie', `${COOKIE}=${tok}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure(req) ? '; Secure' : ''}`);
      return send(res, 200, { ok: true });
    }
    if (p === '/api/logout' && m === 'POST') {
      const tok = cookies(req)[COOKIE]; if (tok) Q.sessDel.run(sha(tok));
      res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
      return send(res, 200, { ok: true });
    }

    let r;
    if ((r = p.match(/^\/api\/submit\/(report|idea|digest)$/)) && m === 'POST') {
      if (limited('submit:' + ip, 30, 3600e3)) return fail(res, 429, 'too_many_requests');
      const kind = r[1], b = await readJSON(req, 4.5e6), v = validate(kind, b);
      if (v.error) return fail(res, 400, v.error);
      if (kind === 'digest' && Q.emailExists.get(v.data.email)) return send(res, 200, { ok: true, id: null });
      let n = 48500 + Q.subCount.get(kind).n + 1, id;
      while (Q.subGet.get((id = `${PREFIX[kind]}-${new Date().getFullYear()}-${n}`))) n++;   // устгасан дугаар давхцахгүй
      if (kind === 'report' && b.photo) v.data.photo = savePhoto(id, b.photo);
      Q.subAdd.run(id, kind, JSON.stringify(v.data), now());
      broadcast('submission');
      return send(res, 201, { ok: true, id });
    }

    /* ---- Доорх бүх зүйл зөвхөн admin ---- */
    if (!admin) return fail(res, 401, 'unauthorized');

    if ((r = p.match(/^\/uploads\/([\w.-]+)$/)) && m === 'GET') {
      const f = path.join(UPLOADS, r[1]);
      if (!f.startsWith(UPLOADS + path.sep) || !fs.existsSync(f)) return fail(res, 404, 'not_found');
      res.writeHead(200, { 'Content-Type': { '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'private, max-age=3600' });
      return fs.createReadStream(f).pipe(res);
    }

    if ((r = p.match(/^\/api\/cms\/(\w+)\/([^/]+)$/))) {
      const col = r[1], id = decodeURIComponent(r[2]);
      if (!COLS.includes(col) || !ID_RE.test(id)) return fail(res, 400, 'bad_target');
      if (m === 'PUT') {
        const b = await readJSON(req, 1e6);
        if (!b || typeof b !== 'object' || Array.isArray(b)) return fail(res, 400, 'bad_body');
        Q.cmsPut.run(col, id, JSON.stringify(Object.assign(b, { id })), now()); broadcast('cms');
        return send(res, 200, { ok: true });
      }
      if (m === 'DELETE') { Q.cmsDel.run(col, id); broadcast('cms'); return send(res, 200, { ok: true }); }
    }
    if (p === '/api/cms-log' && m === 'POST') {
      const b = await readJSON(req, 8192);
      Q.logAdd.run(now(), str(b.action, 20), str(b.col, 20), str(b.id, 80), str(b.title, 140), 'admin');
      return send(res, 200, { ok: true });
    }

    if (p === '/api/submissions' && m === 'GET') {
      return send(res, 200, { list: Q.subList.all().map((x) => Object.assign({}, x, { data: JSON.parse(x.data) })) });
    }
    if ((r = p.match(/^\/api\/submissions\/([\w-]+)$/))) {
      if (m === 'PATCH') {
        const b = await readJSON(req, 1024);
        if (!['new', 'progress', 'done', 'rejected'].includes(b.status)) return fail(res, 400, 'bad_status');
        Q.subStatus.run(b.status, now(), r[1]); broadcast('submission'); return send(res, 200, { ok: true });
      }
      if (m === 'DELETE') {
        const row = Q.subGet.get(r[1]);
        if (row) { const ph = JSON.parse(row.data).photo; if (ph) fs.rm(path.join(UPLOADS, path.basename(ph)), () => {}); Q.subDel.run(r[1]); }
        broadcast('submission'); return send(res, 200, { ok: true });
      }
    }
    return fail(res, 404, 'not_found');
  } catch (e) {
    if (e && e.code && e.error) return fail(res, e.code, e.error);
    console.error('API алдаа:', e);
    return fail(res, 500, 'server_error');
  }
}

module.exports = { handles, handle };
