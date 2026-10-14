/* Гадны бодит цагийн өгөгдлийг манай серверээр дамжуулна: түлхүүрийг хөтөч рүү гаргахгүй, бүх зочин нэг кэшийг хуваалцана.
     /api/map/...   газрын зураг (hamuga.mn)            /api/img      ulaanbaatar.mn-ийн зургийг жижигрүүлэх
     /api/air       агаарын чанар (IQAir, Open-Meteo)    /api/weather  цаг агаар (Open-Meteo)
   Чиглүүлэлт нь server/api.js-д. */
const fs = require('fs'), path = require('path');
require('./config');   // .env (HAMUGA_API_KEY, IQAIR_API_KEY)
const db = require('./db');
const { sha, send, fail, limited } = require('./http');
const { IMG_DIR: NEWS_IMG } = require('./sources');

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
      await db.airAdd(ts, Math.round(p.aqius), p.mainus || null); await db.airGc(Date.now() - 7 * 864e5);   // 7 хоногийн түүх хадгална
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
  const log = (await db.airSince(Date.now() - 25 * 3600e3)).map((r) => [r.ts, r.aqi]);
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

/* /api/air, /api/weather-ийн хариу. Эх сурвалж түр тасарвал сүүлийн утгаа өгнө. */
async function sendAir(res) {
  try { const a = await airNow(); res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=120' }); res.end(JSON.stringify(a)); }
  catch (e) { if (omCache) return send(res, 200, omCache); return fail(res, 502, 'air_unavailable'); }
}
async function sendWeather(res) {
  try { const w = await weather(); res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300' }); res.end(JSON.stringify(w)); }
  catch (e) { if (wxCache) return send(res, 200, wxCache); return fail(res, 502, 'weather_unavailable'); }
}

module.exports = { mapProxy, imgProxy, sendAir, sendWeather };
