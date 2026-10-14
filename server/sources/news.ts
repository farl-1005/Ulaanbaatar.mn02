/* ulaanbaatar.mn-ийн мэдээ: цаг үеийн мэдээ, харьяа газрын мэдээ, хэвлэлийн тойм.
   Нүүр зургийг 960px WebP болгон жижигрүүлнэ; нэг удаа хийсэн зургийг дахин татахгүй. */
import * as fs from 'fs';
import * as path from 'path';
import { API_TYPE, CACHE, eachParallel, fetchJSON, IMG_DIR, isFresh, paragraphs, readCache, SourceOptions, splitLead, thumb, ubDate, writeCache } from './shared';

const COUNT = 30;
/** ulaanbaatar.mn-ийн мэдээний төрөл → nt (src/sections/hub.js NEWS_NT). Цаг үеийн мэдээ заавал; бусад нь унавал алгасна. */
const NEWS_TYPES: [api: string, nt: string, count: number][] = [['TIME_HISTORY', 'time', COUNT], ['PLACE', 'place', 12], ['ISSUE_REVIEW', 'review', 12]];
const FILE = path.join(CACHE, 'news.json');

export interface LiveNews {
  id: string; live: 1; nt: string;
  /** «2026-10-09 18:00» */
  d: string; views: number;
  /** Унших хугацаа (минут) */
  mins: number;
  /** Рубрик: transport, env, edu ... */
  cat: string;
  /** [монгол, англи] — англи орчуулга байхгүй */
  t: [string, string]; l: [string, string]; b: [string, string][];
  /** Жижигрүүлсэн зураг (dist/.news/img/) ба эх зургийн хаяг */
  imgFile?: string | null; imgSrc?: string;
}

/* ---- Рубрик: API-д ангилал байхгүй тул түлхүүр үгээр оноо өгч тааварлана (гарчиг ×3, эхний 2 догол мөр ×1) ---- */
const RUBRICS: Record<string, RegExp> = {
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
function classify(title: string, text = ''): string {
  let best = 'city', top = 0;
  for (const [cat, re] of Object.entries(RUBRICS)) {
    const sc = 3 * (String(title).match(re) || []).length + Math.min(3, (String(text).match(re) || []).length);
    if (sc > top) { best = cat; top = sc; }
  }
  return best;
}

async function refresh(log: (msg: string) => void): Promise<LiveNews[]> {
  const list: any[] = [];
  for (const [api, nt, n] of NEWS_TYPES) {
    let j;
    try { j = await fetchJSON(API_TYPE + api + '&pageSize=' + n); } catch (e) { if (nt === 'time') throw e; log(`  ⚠ ${api} мэдээ татагдсангүй (${(e as Error).message})`); continue; }
    for (const a of j?.data?.list || []) list.push(Object.assign(a, { _nt: nt }));
  }
  if (!list.some((a) => a._nt === 'time')) throw new Error('API хоосон хариу буцаалаа');
  fs.mkdirSync(IMG_DIR, { recursive: true });
  const seen = new Set();
  const items = list.filter((a) => a.enable !== false && a.urlId && !seen.has(a.urlId) && seen.add(a.urlId)).map((a) => {
    const paras = paragraphs(a.content);
    const [lead, body] = splitLead(paras);
    const words = paras.join(' ').split(/\s+/).length;
    const n: LiveNews & { _src?: string } = {
      id: 'n' + a.urlId, live: 1, nt: a._nt,
      d: ubDate(a.startDate || a.createdDate), views: +a.views || 0, mins: Math.max(1, Math.round(words / 180)),
      cat: classify(a.title, paras.slice(0, 2).join(' ')),
      t: [String(a.title || '').trim(), ''], l: [lead, ''], b: body.map((p): [string, string] => [p, '']),
      _src: a.coverImg && a.coverImg.url,
    };
    return n;
  });
  const fresh = items.filter((n) => !fs.existsSync(path.join(IMG_DIR, n.id.slice(1) + '.webp'))).length;
  if (fresh) log(`  ↓ ${fresh} шинэ зураг татаж жижигрүүлж байна...`);
  await eachParallel(items, async (n) => { n.imgFile = await thumb(n.id.slice(1), n._src); });
  items.forEach((n) => { n.imgSrc = n._src; delete n._src; });
  writeCache(FILE, { at: Date.now(), items });
  return items;
}

/** Бодит мэдээ. Алдаа гарвал хуучин кэш, кэш ч байхгүй бол хоосон жагсаалт (src/data/news.js-ийн жишээ мэдээ харагдана). */
export async function getLiveNews({ force = false, log = console.log }: SourceOptions = {}): Promise<{ items: LiveNews[]; note: string }> {
  const cache = readCache<{ items: LiveNews[] }>(FILE);
  if (cache && isFresh(cache) && !force) return { items: cache.items, note: `кэшээс ${cache.items.length} мэдээ` };
  try {
    const items = await refresh(log);
    return { items, note: `ulaanbaatar.mn-ээс ${items.length} мэдээ шинэчиллээ` };
  } catch (e) {
    const msg = (e as Error).message;
    if (cache) return { items: cache.items, note: `⚠ API-д холбогдож чадсангүй (${msg}), хуучин кэшийг ашиглалаа` };
    return { items: [], note: `⚠ API-д холбогдож чадсангүй (${msg}), жишээ мэдээг ашиглалаа` };
  }
}
