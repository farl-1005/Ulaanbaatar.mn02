/* ulaanbaatar.mn-ийн 24 мега төсөл (ulaanbaatar.mn/mega-project): ангилал = төсөл, мэдээ бүр = явцын мэдээлэл.
   Зургийг бүтээх үед татахгүй (151+ том зураг): хөтөч /api/img-ээр шаардлагатай үед нь жижигрүүлж авна.
   Гүйцэтгэлийн хувийг зөвхөн «нийт гүйцэтгэл NN хувь», «барилга угсралтын ажил NN хувь» гэх мэт тодорхой өгүүлбэрээс, эх өгүүлбэртэй нь авна. */
import * as path from 'path';
import { CACHE, fetchJSON, FILE_URL, isFresh, orgName, paragraphs, readCache, SourceOptions, ubDate, VIDEO_URL, writeCache } from './shared';

const FILE = path.join(CACHE, 'mega.json');
const PCT_RE = [
  /нийт\s+гүйцэтгэл(?:ийн)?\s*(?:нь)?\s*(\d{1,3}(?:[.,]\d+)?)\s*(?:орчим\s*)?хув/i,
  /(?:барилга(?:ын)?\s+угсралтын|барилгын|бүтээн\s+байгуулалтын)\s+(?:ажил|ажлын\s+явц|явц)(?:\s+нь)?\s*(\d{1,3}(?:[.,]\d+)?)\s*(?:орчим\s*)?хув/i,
];

/** Явцын мэдээ */
export interface MegaUpdate { id: string; d: string; t: string; img: string; video: string; b: string[] }
export interface MegaProject {
  key: string; name: string;
  /** Мэдээнээс олсон хамгийн сүүлийн гүйцэтгэлийн хувь, эх өгүүлбэртэй нь */
  pct: { v: number; src: string; d: string; id: string } | null;
  ups: MegaUpdate[];
}

/** Хамгийн сүүлийн тодорхой хувь; эх өгүүлбэрийг тухайн хэсгээс нь (гарчиг, догол мөр) таслан авна */
function findProgress(ups: (MegaUpdate & { _seg: string[] })[]): MegaProject['pct'] {
  for (const u of ups) {
    for (const seg of u._seg) {
      for (const re of PCT_RE) {
        const m = seg.match(re);
        if (!m) continue;
        const v = parseFloat(m[1].replace(',', '.'));
        if (!(v >= 0 && v <= 100)) continue;
        const s0 = Math.max(seg.lastIndexOf('. ', m.index) + 1, 0), e0 = seg.indexOf('. ', m.index! + m[0].length);
        return { v: Math.round(v), src: seg.slice(s0, e0 < 0 ? undefined : e0 + 1).trim().slice(0, 240), d: u.d, id: u.id };
      }
    }
  }
  return null;
}

async function refresh(): Promise<{ at: number; projects: MegaProject[] }> {
  const j = await fetchJSON('https://ulaanbaatar.mn/api/mega-projects?count=400');
  const list = ((j?.data?.list || []) as any[]).filter((a) => a && a.isPublished !== false && a.category && a.title);
  if (!list.length) throw new Error('мега төсөл хоосон');
  const by = new Map<string, { key: string; name: string; ups: (MegaUpdate & { _seg: string[] })[] }>();
  for (const a of list) {
    const paras = paragraphs(a.content);
    const u: MegaUpdate = {
      id: String(a.id), d: ubDate(a.createdDate), t: String(a.title).replace(/\s+/g, ' ').trim(), img: FILE_URL.test(a.image || '') ? a.image : '',
      video: VIDEO_URL.test(a.videoUrl || '') ? a.videoUrl : '', b: paras.slice(0, 3).map((p) => (p.length > 700 ? p.slice(0, 700).replace(/\s+\S*$/, '') + '…' : p)),
    };
    if (!by.has(a.category)) by.set(a.category, { key: a.category, name: orgName(a.categoryName || a.category), ups: [] });
    const seg = [a.title, a.description].concat(paras).map((x) => String(x || '').replace(/\s+/g, ' ').trim()).filter(Boolean);
    by.get(a.category)!.ups.push(Object.assign(u, { _seg: seg }));
  }
  const projects = [...by.values()].map((p): MegaProject => {
    p.ups.sort((x, y) => y.d.localeCompare(x.d));
    const pct = findProgress(p.ups);
    return { key: p.key, name: p.name, pct, ups: p.ups.map(({ _seg, ...u }) => u) };
  }).sort((a, b) => b.ups[0].d.localeCompare(a.ups[0].d));
  const data = { at: Date.now(), projects };
  writeCache(FILE, data);
  return data;
}

export async function getLiveMega({ force = false }: SourceOptions = {}): Promise<{ projects: MegaProject[]; note: string }> {
  const cache = readCache<{ projects: MegaProject[] }>(FILE);
  if (cache && isFresh(cache) && !force) return Object.assign(cache, { note: `кэшээс ${cache.projects.length} мега төсөл` });
  try {
    const d = await refresh();
    return Object.assign(d, { note: `ulaanbaatar.mn-ээс ${d.projects.length} мега төсөл (${d.projects.reduce((n, p) => n + p.ups.length, 0)} мэдээ)` });
  } catch (e) {
    const msg = (e as Error).message;
    return cache ? Object.assign(cache, { note: `⚠ мега төслийн API-д холбогдож чадсангүй (${msg}), хуучин кэш` }) : { projects: [], note: `⚠ мега төслийн API-д холбогдож чадсангүй (${msg}), жишээ төсөл` };
  }
}
