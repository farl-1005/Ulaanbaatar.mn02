/* ulaanbaatar.mn-ийн API-аас бодит мэдээ татна (build үед).
   - API нь хөтчөөс шууд хандахыг (CORS) хаадаг тул Node.js талд татна.
   - Үр дүнг dist/.news/ хавтсанд кэшлэнэ: CACHE_MIN минутаас шинэ бол дахин татахгүй, сүлжээ тасарвал хуучин кэшээ ашиглана.
   - Нүүр зургийг (дунджаар 2.5MB) татаж 960px WebP болгон жижигрүүлнэ; нэг удаа хийсэн зургийг дахин татахгүй.
   - `npm run news` гэж ажиллуулбал кэшийг үл хайхран шууд шинэчилнэ. */
const fs = require('fs'), path = require('path');

const API = 'https://ulaanbaatar.mn:8443/api/article?type=TIME_HISTORY&pageSize=';
const COUNT = 30, CACHE_MIN = 15, IMG_W = 960, IMG_MAX_BYTES = 25e6, TIMEOUT = 10000;
const CACHE = path.join(__dirname, 'dist', '.news'), IMG_DIR = path.join(CACHE, 'img'), JSON_FILE = path.join(CACHE, 'news.json');

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

/* ---- Рубрик: API-д ангилал байхгүй тул түлхүүр үгээр оноо өгч тааварлана (гарчиг ×3, эхний 2 догол мөр ×1) ---- */
const RUBRICS = {
  transport: /автобус|тээвр|замын хөдөлгөөн|авто зам|гүүр|метро|трамвай|дүүжин зам|такси|скүтер|мопед|дугуйн зам|уулзвар|нүхэн гарц|төмөр зам|зорчигч|зорчих|автомашин|машин, механизм|давс, бодис/gi,
  env: /агаарын бохирдол|утаа|мод тари|мод суулга|тэрбум мод|ногоон байгууламж|байгаль орчин|хог|цэвэрлэ|экологи|цэцэрлэгт хүрээлэн|голын эрэг|үер/gi,
  edu: /сургууль|боловсрол|сурагч|оюутан|багш|олимпиад|цэцэрлэг(?!т хүрээлэн)/gi,
  health: /эмнэлэг|эрүүл мэнд|вакцин|дархлаажуулалт|томуу|эмч|өвчин|халдвар/gi,
  build: /барилга|бүтээн байгуулалт|орон сууц|гэр хороолол|дахин төлөвлөлт|ашиглалтад|гүйцэтгэл|станц|байгууламж/gi,
  plan: /хот төлөвлөлт|ерөнхий төлөвлөгөө|газар зохион|ухаалаг хот/gi,
  culture: /соёл|урлаг|наадам|фестиваль|музей|театр|спорт|марафон|гүйлт|тэмцээн|хамтлаг|концерт/gi,
  util: /дулаан|халаалт|цахилгаан хангамж|эрчим хүч|ус хангамж|шугам сүлжээ|өвөлжилт|инженерийн/gi,
  biz: /бизнес|аж ахуй|стартап|хөрөнгө оруулалт|татвар|худалдаа|үйлдвэр|түншлэл|ногоо/gi,
  city: /хэлэлцүүл|төсөв|НИТХ|тогтоол|хамтын ажиллагаа|ахмад|нийгмийн үйлчилгээ|иргэд|хүний эрх|гамшиг/gi,
};
function classify(title, text = '') {
  let best = 'city', top = 0;
  for (const [cat, re] of Object.entries(RUBRICS)) {
    const sc = 3 * (String(title).match(re) || []).length + Math.min(3, (String(text).match(re) || []).length);
    if (sc > top) { best = cat; top = sc; }
  }
  return best;
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

async function refresh(log) {
  const j = await fetchJSON(API + COUNT);
  const list = (j && j.data && j.data.list) || [];
  if (!list.length) throw new Error('API хоосон хариу буцаалаа');
  fs.mkdirSync(IMG_DIR, { recursive: true });
  const items = list.filter((a) => a.enable !== false && a.urlId).map((a) => {
    const paras = paragraphs(a.content);
    const [lead, body] = splitLead(paras);
    const words = paras.join(' ').split(/\s+/).length;
    return {
      id: 'n' + a.urlId, live: 1,
      d: ubDate(a.startDate || a.createdDate), views: +a.views || 0, mins: Math.max(1, Math.round(words / 180)),
      cat: classify(a.title, paras.slice(0, 2).join(' ')),
      t: [String(a.title || '').trim(), ''], l: [lead, ''], b: body.map((p) => [p, '']),
      _src: a.coverImg && a.coverImg.url,
    };
  });
  // Зургуудыг 4-өөр нь зэрэг боловсруулна
  const queue = items.slice();
  const fresh = items.filter((n) => !fs.existsSync(path.join(IMG_DIR, n.id.slice(1) + '.webp'))).length;
  if (fresh) log(`  ↓ ${fresh} шинэ зураг татаж жижигрүүлж байна...`);
  await Promise.all(Array.from({ length: 4 }, async () => {
    for (let n; (n = queue.shift());) { n.imgFile = await thumb(n.id.slice(1), n._src); }
  }));
  items.forEach((n) => { n.imgSrc = n._src; delete n._src; });
  fs.writeFileSync(JSON_FILE, JSON.stringify({ at: Date.now(), items }));
  return items;
}

/** Бодит мэдээг буцаана: { items, note }. Алдаа гарвал кэш, кэш ч байхгүй бол хоосон жагсаалт. */
async function getLiveNews({ force = false, log = console.log } = {}) {
  let cache = null;
  try { cache = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8')); } catch (e) { /* кэш алга */ }
  const fresh = cache && Date.now() - cache.at < CACHE_MIN * 60000;
  if (fresh && !force) return { items: cache.items, note: `кэшээс ${cache.items.length} мэдээ` };
  try {
    const items = await refresh(log);
    return { items, note: `ulaanbaatar.mn-ээс ${items.length} мэдээ шинэчиллээ` };
  } catch (e) {
    if (cache) return { items: cache.items, note: `⚠ API-д холбогдож чадсангүй (${e.message}), хуучин кэшийг ашиглалаа` };
    return { items: [], note: `⚠ API-д холбогдож чадсангүй (${e.message}), жишээ мэдээг ашиглалаа` };
  }
}

module.exports = { getLiveNews, IMG_DIR, paragraphs, splitLead, classify };

if (require.main === module) {
  getLiveNews({ force: true }).then((r) => console.log('✓ ' + r.note));
}
