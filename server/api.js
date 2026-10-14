/* Backend API: чиглүүлэлт (/api/..., /uploads/...)
   - Admin CMS: засвар бүр өгөгдлийн санд (server/db.js) хадгалагдаж, нээлттэй бүх хөтөч рүү /api/events-ээр шууд мэдэгдэнэ.
   - Иргэдийн маягт: эрсдэл мэдээлэх (зурагтай), санал хүсэлт, имэйл бүртгэл → submissions хүснэгт.
   - Admin нэвтрэлт: .env файлын ADMIN_PASSWORD (server/config.js).
   - Гадны өгөгдөл (газрын зураг, зураг, агаар, цаг агаар): server/live.js.
   build.js (npm run dev) болон server/index.js (npm start) хоёулаа энэ модулийг ашиглана. */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const { UPLOADS } = require('./config');   // .env-ийг db.js-ээс өмнө ачаална
const db = require('./db');
const { sha, send, fail, readJSON, cookies, clientIp, secure, limited } = require('./http');
const live = require('./live');

/* ================= Admin нэвтрэлт, CMS ================= */
const COLS = ['news', 'alerts', 'events', 'projects', 'services', 'texts', 'settings', 'media',
  'mediaitems', 'sits', 'docs', 'struct', 'orgs', 'history', 'citydata', 'menu', 'rubrics', 'ecats', 'pcats', 'topics', 'faq', 'banners', 'govsched'];   // src/admin/cms.js-ийн CMS_COLS-тай ижил
const ID_RE = /^[\w.-]{1,80}$/;
const now = () => new Date().toISOString();
const COOKIE = 'ubmn_admin', SESSION_DAYS = 7;

async function isAdmin(req) {
  const tok = cookies(req)[COOKIE]; if (!tok) return false;
  const s = await db.sessGet(sha(tok)); return !!(s && s.expires > Date.now());
}
setInterval(() => db.sessGc(Date.now()).catch(() => {}), 600e3).unref();   // хугацаа дууссан нэвтрэлтийг цэвэрлэнэ

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
  const ip = clientIp(req);
  try {
    if (p === '/api/health') return send(res, 200, { ok: true, db: db.kind });
    const admin = await isAdmin(req);
    if (p === '/api/img' && m === 'GET') return live.imgProxy(res, url.searchParams.get('u') || '', +url.searchParams.get('w') || 0, ip);
    if (p === '/api/air' && m === 'GET') return live.sendAir(res);
    if (p === '/api/weather' && m === 'GET') return live.sendWeather(res);
    let mp;
    if (m === 'GET' && (mp = p.match(/^\/api\/map\/(tiles\/[\w-]{1,64}\/\d{1,2}\/\d{1,7}\/\d{1,7}\.pbf|tiles\/map-info\/[\w-]{1,64})$/))) return live.mapProxy(res, mp[1], ip);

    if (p === '/api/events' && m === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
      res.write('event: hello\ndata: 0\n\n'); clients.add(res); req.on('close', () => clients.delete(res)); return;
    }

    if (p === '/api/cms' && m === 'GET') {
      const data = {}; COLS.forEach((c) => { data[c] = {}; });
      for (const r of await db.cmsAll()) if (data[r.col]) data[r.col][r.id] = r.body;
      return send(res, 200, { data, log: admin ? await db.logRecent() : [], admin, inboxNew: admin ? await db.subNew() : 0 });
    }

    if (p === '/api/login' && m === 'POST') {
      if (limited('login:' + ip, 10, 15 * 60e3)) return fail(res, 429, 'too_many_attempts');
      const b = await readJSON(req, 4096), pw = process.env.ADMIN_PASSWORD || '';
      const ok = pw && crypto.timingSafeEqual(Buffer.from(sha(b.password || '')), Buffer.from(sha(pw)));
      if (!ok) return fail(res, 401, 'wrong_password');
      const tok = crypto.randomBytes(32).toString('base64url');
      await db.sessAdd(sha(tok), Date.now() + SESSION_DAYS * 864e5);
      res.setHeader('Set-Cookie', `${COOKIE}=${tok}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${secure(req) ? '; Secure' : ''}`);
      return send(res, 200, { ok: true });
    }
    if (p === '/api/logout' && m === 'POST') {
      const tok = cookies(req)[COOKIE]; if (tok) await db.sessDel(sha(tok));
      res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
      return send(res, 200, { ok: true });
    }

    let r;
    if ((r = p.match(/^\/api\/submit\/(report|idea|digest)$/)) && m === 'POST') {
      if (limited('submit:' + ip, 30, 3600e3)) return fail(res, 429, 'too_many_requests');
      const kind = r[1], b = await readJSON(req, 4.5e6), v = validate(kind, b);
      if (v.error) return fail(res, 400, v.error);
      if (kind === 'digest' && await db.emailExists(v.data.email)) return send(res, 200, { ok: true, id: null });
      let n = 48500 + (await db.subCount(kind)) + 1, id;
      while (await db.subGet((id = `${PREFIX[kind]}-${new Date().getFullYear()}-${n}`))) n++;   // устгасан дугаар давхцахгүй
      if (kind === 'report' && b.photo) v.data.photo = savePhoto(id, b.photo);
      await db.subAdd(id, kind, v.data, now());
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
        await db.cmsPut(col, id, Object.assign(b, { id }), now()); broadcast('cms');
        return send(res, 200, { ok: true });
      }
      if (m === 'DELETE') { await db.cmsDel(col, id); broadcast('cms'); return send(res, 200, { ok: true }); }
    }
    if (p === '/api/cms-log' && m === 'POST') {
      const b = await readJSON(req, 8192);
      await db.logAdd(now(), str(b.action, 20), str(b.col, 20), str(b.id, 80), str(b.title, 140), 'admin');
      return send(res, 200, { ok: true });
    }

    if (p === '/api/submissions' && m === 'GET') {
      return send(res, 200, { list: await db.subList() });
    }
    if ((r = p.match(/^\/api\/submissions\/([\w-]+)$/))) {
      if (m === 'PATCH') {
        const b = await readJSON(req, 1024);
        if (!['new', 'progress', 'done', 'rejected'].includes(b.status)) return fail(res, 400, 'bad_status');
        await db.subStatus(b.status, now(), r[1]); broadcast('submission'); return send(res, 200, { ok: true });
      }
      if (m === 'DELETE') {
        const row = await db.subGet(r[1]);
        if (row) { const ph = row.data && row.data.photo; if (ph) fs.rm(path.join(UPLOADS, path.basename(ph)), () => {}); await db.subDel(r[1]); }
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

/* server/pages.js-д: admin-ы засварыг унших */
async function cmsCol(col) { const out = {}; for (const r of await db.cmsCol(col)) out[r.id] = r.body; return out; }
function cmsGet(col, id) { return db.cmsOne(col, id); }

module.exports = { handles, handle, cmsCol, cmsGet, secure, db };
