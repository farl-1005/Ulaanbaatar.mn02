/* ulaanbaatar.mn-ийн мэдээ: цаг үеийн мэдээ, харьяа газрын мэдээ, хэвлэлийн тойм (build үед).
   Үр дүнг кэшлэнэ: CACHE_MIN минутаас шинэ бол дахин татахгүй, сүлжээ тасарвал хуучин кэшээ ашиглана.
   Нүүр зургийг (дунджаар 2.5MB) татаж 960px WebP болгон жижигрүүлнэ; нэг удаа хийсэн зургийг дахин татахгүй. */
const { fs, path, CACHE_MIN, CACHE, IMG_DIR, API_TYPE, paragraphs, splitLead, ubDate, fetchJSON, thumb, readCache } = require('./shared');

const COUNT = 30;
/* ulaanbaatar.mn-ийн мэдээний төрлүүд → nt (src/sections/hub.js NEWS_NT). Цаг үеийн мэдээ заавал; бусад нь унавал алгасна. */
const NEWS_TYPES = [['TIME_HISTORY', 'time', COUNT], ['PLACE', 'place', 12], ['ISSUE_REVIEW', 'review', 12]];
const JSON_FILE = path.join(CACHE, 'news.json');

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

async function refresh(log) {
  const list = [];
  for (const [api, nt, n] of NEWS_TYPES) {
    let j;
    try { j = await fetchJSON(API_TYPE + api + '&pageSize=' + n); } catch (e) { if (nt === 'time') throw e; log(`  ⚠ ${api} мэдээ татагдсангүй (${e.message})`); continue; }
    for (const a of (j && j.data && j.data.list) || []) list.push(Object.assign(a, { _nt: nt }));
  }
  if (!list.some((a) => a._nt === 'time')) throw new Error('API хоосон хариу буцаалаа');
  fs.mkdirSync(IMG_DIR, { recursive: true });
  const seen = new Set();
  const items = list.filter((a) => a.enable !== false && a.urlId && !seen.has(a.urlId) && seen.add(a.urlId)).map((a) => {
    const paras = paragraphs(a.content);
    const [lead, body] = splitLead(paras);
    const words = paras.join(' ').split(/\s+/).length;
    return {
      id: 'n' + a.urlId, live: 1, nt: a._nt,
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
  const cache = readCache(JSON_FILE);
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

module.exports = { getLiveNews, classify };
