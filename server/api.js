/* Backend API
   - Admin CMS: засвар бүр data/ub.sqlite-д хадгалагдаж, нээлттэй бүх хөтөч рүү /api/events-ээр шууд мэдэгдэнэ.
   - Иргэдийн маягт: эрсдэл мэдээлэх (зурагтай), санал хүсэлт, имэйл бүртгэл → submissions хүснэгт.
   - Admin нэвтрэлт: .env файлын ADMIN_PASSWORD. Анх асаахад файл байхгүй бол санамсаргүй нууц үг үүсгэнэ.
   build.js (npm run dev) болон server/index.js (npm start) хоёулаа энэ модулийг ашиглана. */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const Database = require('better-sqlite3');

const ROOT = path.join(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env');
const PROD = process.env.NODE_ENV === 'production';
if (!process.env.ADMIN_PASSWORD && !fs.existsSync(ENV_FILE) && !PROD) {   // production-д нууц үгийг хостингийн тохиргооноос (env) өгнө
  fs.writeFileSync(ENV_FILE, `# Admin-ы нууц үг. Энэ файлыг git-д оруулахгүй (.gitignore).\nADMIN_PASSWORD=${crypto.randomBytes(12).toString('base64url')}\n`, { mode: 0o600 });
  console.log('  🔑 Admin-ы нууц үгийг үүсгэж .env файлд хадгаллаа.');
}
try { process.loadEnvFile(ENV_FILE); } catch (e) { /* .env байхгүй бол орчны хувьсагчийг ашиглана */ }
if (!process.env.ADMIN_PASSWORD) console.warn('  ⚠ ADMIN_PASSWORD тохируулаагүй тул admin нэвтрэлт идэвхгүй байна.');

const DATA = process.env.DATA_DIR || (PROD && fs.existsSync('/data') ? '/data' : path.join(ROOT, 'data'));   // Docker: /data volume
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
  CREATE TABLE IF NOT EXISTS air_log (ts INTEGER PRIMARY KEY, aqi INTEGER NOT NULL, main TEXT);
`);
const Q = {
  cmsAll: db.prepare('SELECT col, id, body FROM cms'),
  cmsCol: db.prepare('SELECT id, body FROM cms WHERE col = ?'),
  cmsOne: db.prepare('SELECT body FROM cms WHERE col = ? AND id = ?'),
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
  airAdd: db.prepare('INSERT OR IGNORE INTO air_log (ts, aqi, main) VALUES (?, ?, ?)'),
  airSince: db.prepare('SELECT ts, aqi FROM air_log WHERE ts >= ? ORDER BY ts'),
  airGc: db.prepare('DELETE FROM air_log WHERE ts < ?'),
  subDel: db.prepare('DELETE FROM submissions WHERE id = ?'),
  subNew: db.prepare("SELECT COUNT(*) AS n FROM submissions WHERE status = 'new'"),
  emailExists: db.prepare("SELECT 1 FROM submissions WHERE kind = 'digest' AND json_extract(data, '$.email') = ?"),
};

/* ================= Туслах ================= */
const COLS = ['news', 'alerts', 'events', 'projects', 'services', 'texts', 'settings', 'media',
  'mediaitems', 'sits', 'docs', 'struct', 'orgs', 'history', 'citydata', 'menu', 'rubrics', 'ecats', 'pcats', 'topics', 'faq', 'banners', 'govsched'];   // src/cms.js-ийн CMS_COLS-тай ижил
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

/* ================= Газрын зураг: hamuga.mn «UB Engineering Map server» =================
   Түлхүүрийг (HAMUGA_API_KEY, .env) хөтөч рүү гаргахгүйн тулд tile-ыг манай серверээр дамжуулна:
   /api/map/tiles/<layerId>/<z>/<x>/<y>.pbf, /api/map/tiles/map-info/<id>. Татсаныг 24 цаг санах ойд хадгална. */
const MAP_UP = 'https://gateway-city.hamuga.mn/', mapCache = new Map();
async function mapProxy(res, sub, ip) {
  const key = process.env.HAMUGA_API_KEY;
  if (!key) return fail(res, 503, 'map_key_missing');
  if (limited('map:' + ip, 3000, 60e3)) return fail(res, 429, 'too_many_requests');
  const hit = mapCache.get(sub);
  if (hit && Date.now() - hit.at < 864e5) { res.writeHead(hit.code, hit.h); res.end(hit.body); return; }
  let r;
  try { r = await fetch(MAP_UP + sub, { headers: { apikey: key, 'x-api-key': key }, signal: AbortSignal.timeout(15000) }); }
  catch (e) { return fail(res, 504, 'map_upstream_timeout'); }
  if (r.status === 401 || r.status === 403) { console.warn('  ⚠ Газрын зураг: hamuga.mn түлхүүрийг хүлээж авсангүй (' + r.status + ')'); return fail(res, 502, 'map_key_rejected'); }
  const body = Buffer.from(await r.arrayBuffer());
  const h = { 'Content-Type': r.headers.get('content-type') || (sub.endsWith('.pbf') ? 'application/x-protobuf' : 'application/json'), 'Cache-Control': r.ok ? 'public, max-age=86400' : 'no-store', 'X-Content-Type-Options': 'nosniff' };
  if (r.ok) { mapCache.set(sub, { at: Date.now(), code: r.status, h, body }); if (mapCache.size > 3000) mapCache.delete(mapCache.keys().next().value); }
  res.writeHead(r.status, h); res.end(body);
}

/* ================= Медиа зураг: ulaanbaatar.mn-ийн эх зургийг (2–5 МБ) жижигрүүлж WebP болгон диск дээр кэшлэнэ =================
   /api/img?w=240|1280&u=https://ulaanbaatar.mn/files/... (зөвхөн ulaanbaatar.mn/files). sharp байхгүй бол эх зураг руу шилжүүлнэ. */
const { IMG_DIR: NEWS_IMG } = require('../news');
const GAL_DIR = path.join(NEWS_IMG, 'g'), GAL_OK = /^https:\/\/ulaanbaatar\.mn\/files\/[\w/.%()-]+\.(jpe?g|png|webp|gif)$/i, galBusy = new Map();
let sharpLib; try { sharpLib = require('sharp'); } catch (e) { sharpLib = null; }
async function imgProxy(res, u, w, ip) {
  if (!GAL_OK.test(u) || ![240, 1280].includes(w)) return fail(res, 400, 'bad_image');
  if (!sharpLib) { res.writeHead(302, { Location: u }); res.end(); return; }
  const file = path.join(GAL_DIR, sha(u).slice(0, 32) + '-' + w + '.webp');
  if (!fs.existsSync(file)) {
    if (limited('img:' + ip, 240, 60e3)) return fail(res, 429, 'too_many_requests');
    if (!galBusy.has(file)) galBusy.set(file, (async () => {
      const r = await fetch(u, { signal: AbortSignal.timeout(60000) });
      if (!r.ok || +(r.headers.get('content-length') || 0) > 25e6) throw new Error('HTTP ' + r.status);
      fs.mkdirSync(GAL_DIR, { recursive: true });
      await sharpLib(Buffer.from(await r.arrayBuffer()), { limitInputPixels: 1e8 }).rotate().resize({ width: w, height: w === 240 ? 240 : undefined, fit: w === 240 ? 'cover' : 'inside', withoutEnlargement: true }).webp({ quality: w === 240 ? 60 : 78 }).toFile(file + '.tmp');
      fs.renameSync(file + '.tmp', file);
    })().finally(() => galBusy.delete(file)));
    try { await galBusy.get(file); } catch (e) { res.writeHead(302, { Location: u }); res.end(); return; }   // алдаа гарвал эх зураг
  }
  res.writeHead(200, { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=2592000, immutable', 'X-Content-Type-Options': 'nosniff' });
  fs.createReadStream(file).pipe(res);
}

/* ================= Агаарын чанар: IQAir / AirVisual (IQAIR_API_KEY, .env) =================
   Улаанбаатарын хэмжилт (AQI US, гол бохирдуулагч). Үнэгүй багц: сард 10 000 хүсэлт → 15 минут тутам уншина (сард ~2 900).
   Хэмжилт бүрийг air_log-д хадгалж, сүүлийн 24 цагийн графикийг бодит утгаар зурна. */
let airCache = null, airBusy = null;
const AIR_ERR = { incorrect_api_key: 'air_key_rejected', api_key_expired: 'air_key_rejected', call_limit_reached: 'air_limit', too_many_requests: 'air_limit' };
async function air(force) {
  const key = process.env.IQAIR_API_KEY;
  if (!key) { const e = new Error('air_key_missing'); e.code = 'air_key_missing'; throw e; }
  if (!force && airCache && Date.now() - airCache.at < 600e3) return airCache;
  if (!airBusy) airBusy = (async () => {
    try {
      const get = async (u) => { const r = await fetch(u + '&key=' + encodeURIComponent(key), { signal: AbortSignal.timeout(12000) }); return r.json(); };
      let j = await get('https://api.airvisual.com/v2/city?city=Ulaanbaatar&state=Ulaanbaatar&country=Mongolia');
      if (!j || j.status !== 'success') { const msg = j && j.data && j.data.message; if (AIR_ERR[msg]) { const e = new Error(msg); e.code = AIR_ERR[msg]; throw e; } j = await get('https://api.airvisual.com/v2/nearest_city?lat=47.9184&lon=106.9177'); }
      if (!j || j.status !== 'success') { const msg = (j && j.data && j.data.message) || 'bad_response'; const e = new Error(msg); e.code = AIR_ERR[msg] || 'air_unavailable'; throw e; }
      const p = j.data.current.pollution, ts = Date.parse(p.ts) || Date.now();
      Q.airAdd.run(ts, Math.round(p.aqius), p.mainus || null); Q.airGc.run(Date.now() - 7 * 864e5);   // 7 хоногийн түүх хадгална
      airCache = { at: Date.now(), ts, aqi: Math.round(p.aqius), main: p.mainus || '', aqicn: p.aqicn, city: j.data.city };
    } finally { airBusy = null; }
  })();
  await airBusy; return airCache;
}
/* Open-Meteo Air Quality (түлхүүргүй, CAMS загвар, CC BY 4.0): AQI US, PM2.5, PM10, NO₂, SO₂, CO, O₃ + сүүлийн 24 цагийн түүх.
   IQAir түлхүүргүй үед бүх өгөгдөл эндээс; түлхүүртэй үед бохирдуулагчийн хэмжээ, (түүх хангалтгүй бол) графикийг эндээс авна. */
const OM_AIR = 'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=47.9184&longitude=106.9177&current=us_aqi,us_aqi_pm2_5,us_aqi_pm10,us_aqi_nitrogen_dioxide,us_aqi_ozone,us_aqi_sulphur_dioxide,us_aqi_carbon_monoxide,pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,ozone&hourly=us_aqi&past_days=1&forecast_days=1&timezone=Asia%2FUlaanbaatar';
let omCache = null, omBusy = null;
const ubTs = (s) => Date.parse(s + ':00+08:00');   // «2026-10-09T18:00» (Улаанбаатарын цаг) → ms
async function airOM() {
  if (omCache && Date.now() - omCache.at < 600e3) return omCache;
  if (!omBusy) omBusy = (async () => {
    try {
      const r = await fetch(OM_AIR, { signal: AbortSignal.timeout(12000) }); if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json(), c = j.current, h = j.hourly, now = Date.now();
      const sub = { p2: c.us_aqi_pm2_5, p1: c.us_aqi_pm10, n2: c.us_aqi_nitrogen_dioxide, o3: c.us_aqi_ozone, s2: c.us_aqi_sulphur_dioxide, co: c.us_aqi_carbon_monoxide };
      const main = Object.keys(sub).filter((k) => typeof sub[k] === 'number').sort((a, b) => sub[b] - sub[a])[0] || '';
      omCache = { at: now, ts: ubTs(c.time), aqi: Math.round(c.us_aqi), main, src: 'openmeteo',
        pol: { pm25: c.pm2_5, pm10: c.pm10, no2: c.nitrogen_dioxide, so2: c.sulphur_dioxide, co: c.carbon_monoxide, o3: c.ozone },
        series: h.time.map((tm, i) => [ubTs(tm), h.us_aqi[i]]).filter(([ts, v]) => ts <= now && ts >= now - 25 * 3600e3 && typeof v === 'number') };
    } finally { omBusy = null; }
  })();
  await omBusy; return omCache;
}
/* /api/air: IQAir (түлхүүртэй бол, газар дээрх хэмжилт) → эс бөгөөс Open-Meteo. Бохирдуулагчийн хэмжээ үргэлж Open-Meteo-оос. */
async function airNow() {
  const [iq, om] = await Promise.allSettled([process.env.IQAIR_API_KEY ? air() : Promise.reject(new Error('no key')), airOM()]);
  const o = om.status === 'fulfilled' ? om.value : null, q = iq.status === 'fulfilled' ? iq.value : null;
  if (!q && !o) throw (iq.reason && iq.reason.code ? iq.reason : om.reason);
  if (!q) return o;
  const log = Q.airSince.all(Date.now() - 25 * 3600e3).map((r) => [r.ts, r.aqi]);
  return { at: q.at, ts: q.ts, aqi: q.aqi, main: q.main, src: 'iqair', pol: o ? o.pol : null, series: log.length >= 12 || !o ? log : o.series, seriesSrc: log.length >= 12 || !o ? 'iqair' : 'openmeteo' };
}
// Зочингүй үед ч 24 цагийн түүх тасрахгүйн тулд 15 минут тутам уншина (түлхүүртэй үед л)
setInterval(() => { if (process.env.IQAIR_API_KEY) air(true).catch((e) => console.warn('  ⚠ IQAir:', e.message)); }, 900e3).unref();
if (process.env.IQAIR_API_KEY) setTimeout(() => air().catch((e) => console.warn('  ⚠ IQAir:', e.message)), 3000).unref();

/* ================= Цаг агаар: Open-Meteo (түлхүүргүй, CC BY 4.0) =================
   Бүх зочин нэг хариуг хуваалцана: Open-Meteo руу 10 минутад нэг л удаа хандана. */
const WX_URL = 'https://api.open-meteo.com/v1/forecast?latitude=47.9184&longitude=106.9177&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FUlaanbaatar&forecast_days=6&wind_speed_unit=ms';
let wxCache = null, wxBusy = null;
async function weather() {
  if (wxCache && Date.now() - wxCache.at < 600e3) return wxCache;
  if (!wxBusy) wxBusy = (async () => {
    try {
      const r = await fetch(WX_URL, { signal: AbortSignal.timeout(10000) });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json(), c = j.current, d = j.daily;
      wxCache = { at: Date.now(), time: c.time, temp: c.temperature_2m, feels: c.apparent_temperature, hum: c.relative_humidity_2m, wind: c.wind_speed_10m, dir: c.wind_direction_10m, code: c.weather_code, day: c.is_day,
        daily: d.time.map((tm, i) => [tm, d.temperature_2m_max[i], d.temperature_2m_min[i], d.weather_code[i]]) };
    } finally { wxBusy = null; }
  })();
  await wxBusy; return wxCache;
}

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
    if (p === '/api/img' && m === 'GET') return imgProxy(res, url.searchParams.get('u') || '', +url.searchParams.get('w') || 0, ip);
    if (p === '/api/air' && m === 'GET') {
      try { const a = await airNow(); res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=120' }); res.end(JSON.stringify(a)); }
      catch (e) { if (omCache) return send(res, 200, omCache); return fail(res, 502, 'air_unavailable'); }   // түр тасарвал хуучин утга
      return;
    }
    if (p === '/api/weather' && m === 'GET') {
      try { const w = await weather(); res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300' }); res.end(JSON.stringify(w)); }
      catch (e) { if (wxCache) return send(res, 200, wxCache); return fail(res, 502, 'weather_unavailable'); }   // Open-Meteo түр тасарвал хуучин утгаа өгнө
      return;
    }
    let mp;
    if (m === 'GET' && (mp = p.match(/^\/api\/map\/(tiles\/[\w-]{1,64}\/\d{1,2}\/\d{1,7}\/\d{1,7}\.pbf|tiles\/map-info\/[\w-]{1,64})$/))) return mapProxy(res, mp[1], ip);

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

/* server/pages.js-д: admin-ы засварыг унших */
function cmsCol(col) { const out = {}; for (const r of Q.cmsCol.all(col)) out[r.id] = JSON.parse(r.body); return out; }
function cmsGet(col, id) { const r = Q.cmsOne.get(col, id); return r ? JSON.parse(r.body) : null; }

module.exports = { handles, handle, cmsCol, cmsGet, secure };
