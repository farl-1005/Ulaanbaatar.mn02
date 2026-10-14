/* Гадны эх сурвалжуудын нийтлэг хэрэгсэл: кэш, HTTP татах, HTML → цэвэр текст, огноо, зураг жижигрүүлэх, нэр засах.
   ulaanbaatar.mn-ийн API нь хөтчөөс шууд хандахыг (CORS) хаадаг тул бүгдийг сервер талд, сайтыг бүтээх үед татна. */
import * as fs from 'fs';
import * as path from 'path';
import { NEWS_CACHE } from '../config';
import { sharp } from '../common/sharp';

export const CACHE = NEWS_CACHE;
export const IMG_DIR = path.join(CACHE, 'img');
/** Кэш энэ хугацаанаас шинэ бол дахин татахгүй */
export const CACHE_MIN = 15;
export const TIMEOUT = 10000;
export const IMG_MAX_BYTES = 25e6;
const IMG_W = 960;
/* ulaanbaatar.mn-ийн API-г ердийн 443 портоор: 8443-ыг зарим сервер/галт хана гадагш хаадаг (ub.smartsolution.mn) */
export const API_TYPE = 'https://ulaanbaatar.mn/api/article?type=';
export const FILE_URL = /^https:\/\/ulaanbaatar\.mn\/files\/[^"'<>\s]+$/;
export const VIDEO_URL = /^https:\/\/(www\.|m\.|web\.)?(facebook\.com|fb\.watch|youtube\.com|youtu\.be)\//;

export interface SourceOptions {
  /** Кэшийг үл хайхран шууд татах (npm run news) */
  force?: boolean;
  log?: (msg: string) => void;
}

/* ---- HTML → цэвэр текстийн догол мөрүүд (клиент талд esc() хийгдэнэ) ---- */
const ENT: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', laquo: '«', raquo: '»', ndash: '–', mdash: '—', hellip: '…', middot: '·', bull: '•', deg: '°', times: '×' };
export const decode = (s: string) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
  if (e[0] === '#') { const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : +e.slice(1); return n ? String.fromCodePoint(n) : ''; }
  return ENT[e.toLowerCase()] != null ? ENT[e.toLowerCase()] : m;
});

export function paragraphs(html: unknown): string[] {
  return String(html || '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .split(/<\/(?:p|div|h[1-6]|li|blockquote)>/i)
    .map((p) => decode(p.replace(/<[^>]+>/g, '')).replace(/[ \t ]+/g, ' ').replace(/\s*\n\s*/g, ' ').trim())
    .filter((p) => p.length > 1);
}

/** Эхний догол мөрөөс товч агуулга (lead) гаргана: ~240 тэмдэгт хүртэлх бүтэн өгүүлбэрүүд. [lead, үлдсэн догол мөрүүд] */
export function splitLead(paras: string[]): [string, string[]] {
  if (!paras.length) return ['', []];
  const [first, ...rest] = paras;
  if (first.length <= 320) return [first, rest];
  const sents = first.match(/[^.!?]+[.!?]+["”»]?\s*|[^.!?]+$/g) || [first];
  let lead = '';
  for (const s of sents) { if (lead && (lead + s).length > 240) break; lead += s; }
  const remain = first.slice(lead.length).trim();
  return [lead.trim(), remain ? [remain, ...rest] : rest];
}

/** «2026-10-09T18:00:00» → «2026-10-09 18:00» */
export function ubDate(s: unknown): string {
  const m = String(s || '').match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}` : '';
}

export async function fetchJSON(url: string): Promise<any> {
  const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT), headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

/** Нүүр зургийг татаж 960px WebP болгоно (дунджаар 2.5MB → ~60KB). Амжилттай бол файлын нэр («23277.webp»), эс бөгөөс null. */
export async function thumb(id: string, url: string | undefined): Promise<string | null> {
  const out = path.join(IMG_DIR, id + '.webp');
  if (fs.existsSync(out)) return id + '.webp';
  if (!/^https:\/\/ulaanbaatar\.mn\/files\//.test(url || '') || !sharp) return null;
  try {
    const r = await fetch(url!, { signal: AbortSignal.timeout(TIMEOUT * 6) });
    if (!r.ok || +(r.headers.get('content-length') || 0) > IMG_MAX_BYTES) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    await sharp(buf, { limitInputPixels: 1e8 }).rotate().resize({ width: IMG_W, withoutEnlargement: true }).webp({ quality: 72 }).toFile(out);
    return id + '.webp';
  } catch { return null; }
}

/** Жагсаалтын элемент бүрд ажлыг 4-өөр нь зэрэг гүйцэтгэнэ (зураг татах) */
export async function eachParallel<T>(items: T[], work: (item: T) => Promise<void>, n = 4) {
  const queue = items.slice();
  await Promise.all(Array.from({ length: n }, async () => { while (queue.length) await work(queue.shift()!); }));
}

/* ---- Байгууллагын нэр ---- */
const ORG_ABBR = new Set(['ОНӨААТҮГ', 'НӨҮГ', 'УТҮГ', 'ОНӨТҮГ', 'ХК', 'ХХК', 'ЗАА', 'ТӨҮГ', 'НЗДТГ']);
const ORG_PROPER = ['улаанбаатар', 'монгол', 'нийслэл', 'багануур', 'багахангай', 'баянгол', 'баянзүрх', 'налайх', 'сонгинохайрхан', 'сүхбаатар', 'хан-уул', 'чингэлтэй', 'асгат', 'буян'];
/** «НИЙСЛЭЛИЙН ОНЦГОЙ БАЙДЛЫН ГАЗАР» → «Нийслэлийн онцгой байдлын газар» (товчлол, газар нэрийг хадгална). Аль хэдийн жижиг үсэгтэй нэрт хүрэхгүй. */
export function orgName(s: unknown): string {
  const name = String(s || '').replace(/\s+/g, ' ').trim().replace(/^M(?=[а-яөүё])/i, 'М');
  if (/[а-яөүё]/.test(name)) return name;
  return name.split(' ').map((w, i) => {
    if (ORG_ABBR.has(w) || /^[A-Z0-9.-]+$/.test(w)) return w;
    const lw = w.toLowerCase(), cap = lw.charAt(0).toUpperCase() + lw.slice(1);
    return i === 0 || ORG_PROPER.some((p) => lw.startsWith(p)) ? cap.replace(/-(\S)/, (m, c: string) => '-' + c.toUpperCase()) : lw;
  }).join(' ');
}

/* ---- Кэш ---- */
export function readCache<T>(file: string): (T & { at: number }) | null {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

export function writeCache(file: string, data: object) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data));
}

export const isFresh = (cache: { at: number } | null, maxMs = CACHE_MIN * 60000) => !!cache && Date.now() - cache.at < maxMs;
