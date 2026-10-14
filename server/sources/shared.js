/* Гадны эх сурвалжуудын нийтлэг хэрэгсэл (build үед ашиглана):
   кэш хавтас (dist/.news, production-д NEWS_CACHE_DIR), HTTP татах, HTML → цэвэр текст, огноо, зураг жижигрүүлэх, нэр засах.
   ulaanbaatar.mn-ийн API нь хөтчөөс шууд хандахыг (CORS) хаадаг тул бүгдийг Node.js талд татна. */
const fs = require('fs'), path = require('path');

const CACHE_MIN = 15, IMG_W = 960, IMG_MAX_BYTES = 25e6, TIMEOUT = 10000;
const CACHE = process.env.NEWS_CACHE_DIR || path.join(__dirname, '..', '..', 'dist', '.news'),   // production-д байнгын диск дээр (Dockerfile)
      IMG_DIR = path.join(CACHE, 'img');
/* ulaanbaatar.mn-ийн API-г ердийн 443 портоор: 8443-ыг зарим сервер/галт хана гадагш хаадаг (ub.smartsolution.mn) */
const API_TYPE = 'https://ulaanbaatar.mn/api/article?type=';
const FILE_URL = /^https:\/\/ulaanbaatar\.mn\/files\/[^"'<>\s]+$/, VIDEO_URL = /^https:\/\/(www\.|m\.|web\.)?(facebook\.com|fb\.watch|youtube\.com|youtu\.be)\//;

/* ---- HTML → цэвэр текстийн догол мөрүүд (клиент талд esc() хийгдэнэ) ---- */
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', laquo: '«', raquo: '»', ndash: '–', mdash: '—', hellip: '…', middot: '·', bull: '•', deg: '°', times: '×' };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
  if (e[0] === '#') { const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1); return n ? String.fromCodePoint(n) : ''; }
  return ENT[e.toLowerCase()] != null ? ENT[e.toLowerCase()] : m;
});
function paragraphs(html) {
  return String(html || '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .split(/<\/(?:p|div|h[1-6]|li|blockquote)>/i)
    .map((p) => decode(p.replace(/<[^>]+>/g, '')).replace(/[ \t ]+/g, ' ').replace(/\s*\n\s*/g, ' ').trim())
    .filter((p) => p.length > 1);
}
/* Эхний догол мөрөөс товч агуулга (lead) гаргана: ~240 тэмдэгт хүртэлх бүтэн өгүүлбэрүүд. */
function splitLead(paras) {
  if (!paras.length) return ['', []];
  const [first, ...rest] = paras;
  if (first.length <= 320) return [first, rest];
  const sents = first.match(/[^.!?]+[.!?]+["”»]?\s*|[^.!?]+$/g) || [first];
  let lead = '';
  for (const s of sents) { if (lead && (lead + s).length > 240) break; lead += s; }
  const remain = first.slice(lead.length).trim();
  return [lead.trim(), remain ? [remain, ...rest] : rest];
}

function ubDate(s) {
  const m = String(s || '').match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}` : '';
}

async function fetchJSON(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT), headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

/* Нүүр зургийг татаж жижигрүүлнэ. Амжилттай бол файлын нэрийг (жишээ нь "23277.webp") буцаана. */
async function thumb(id, url) {
  const out = path.join(IMG_DIR, id + '.webp');
  if (fs.existsSync(out)) return id + '.webp';
  if (!/^https:\/\/ulaanbaatar\.mn\/files\//.test(url || '')) return null;
  let sharp; try { sharp = require('sharp'); } catch (e) { return null; }
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT * 6) });
    if (!r.ok || +(r.headers.get('content-length') || 0) > IMG_MAX_BYTES) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    await sharp(buf, { limitInputPixels: 1e8 }).rotate().resize({ width: IMG_W, withoutEnlargement: true }).webp({ quality: 72 }).toFile(out);
    return id + '.webp';
  } catch (e) { return null; }
}

/* ---- Байгууллагын нэр ---- */
const ORG_ABBR = new Set(['ОНӨААТҮГ', 'НӨҮГ', 'УТҮГ', 'ОНӨТҮГ', 'ХК', 'ХХК', 'ЗАА', 'ТӨҮГ', 'НЗДТГ']);
const ORG_PROPER = ['улаанбаатар', 'монгол', 'нийслэл', 'багануур', 'багахангай', 'баянгол', 'баянзүрх', 'налайх', 'сонгинохайрхан', 'сүхбаатар', 'хан-уул', 'чингэлтэй', 'асгат', 'буян'];
/* «НИЙСЛЭЛИЙН ОНЦГОЙ БАЙДЛЫН ГАЗАР» → «Нийслэлийн онцгой байдлын газар» (товчлол, газар нэрийг хадгална). Аль хэдийн жижиг үсэгтэй нэрт хүрэхгүй. */
function orgName(s) {
  s = String(s || '').replace(/\s+/g, ' ').trim().replace(/^M(?=[а-яөүё])/i, 'М');
  if (/[а-яөүё]/.test(s)) return s;
  return s.split(' ').map((w, i) => {
    if (ORG_ABBR.has(w) || /^[A-Z0-9.-]+$/.test(w)) return w;
    const lw = w.toLowerCase(), cap = lw.charAt(0).toUpperCase() + lw.slice(1);
    return i === 0 || ORG_PROPER.some((p) => lw.startsWith(p)) ? cap.replace(/-(\S)/, (m, c) => '-' + c.toUpperCase()) : lw;
  }).join(' ');
}
/* Кэш JSON-ийг уншина (байхгүй бол null) */
function readCache(file) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return null; } }

module.exports = { fs, path, CACHE_MIN, IMG_W, IMG_MAX_BYTES, TIMEOUT, CACHE, IMG_DIR, API_TYPE, FILE_URL, VIDEO_URL, decode, paragraphs, splitLead, ubDate, fetchJSON, thumb, orgName, readCache };
