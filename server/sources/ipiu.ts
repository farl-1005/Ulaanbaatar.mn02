/* ipiu.mn (Нэгдсэн төслийн удирдлагын газар): мега төслийн албан ёсны тоо.
   api.ipiu.mn/public/projects: гүйцэтгэл, төсөв (сая $), хугацаа, үе шат, үзүүлэлт, ажлын хэсгийн явц, он дараалал. Зураг cdn.ipiu.mn-ээс. */
import * as path from 'path';
import { CACHE, fetchJSON, isFresh, readCache, SourceOptions, writeCache } from './shared';

const FILE = path.join(CACHE, 'ipiu.json'), IMG_KEY = /^[\w./-]+\.(jpe?g|png|webp)$/i;

/** [монгол, англи] */
type Bi = [string, string];
const bi = (o: any): Bi => [String((o && o.mn) || '').trim(), String((o && o.en) || '').trim()];

export interface IpiuProject {
  slug: string;
  /** ulaanbaatar.mn-ийн мега төслийн ангиллын нэрс (холбоход) */
  aliases: string[];
  name: Bi; short: Bi; tagline: Bi; desc: Bi; img: string; status: string;
  /** Төсөв (сая ам.доллар), нийт гүйцэтгэл (%) */
  budUsd: number | null; prog: number | null;
  from: number | null; to: number | null;
  metrics: { l: Bi; v: string }[];
  parts: { l: Bi; v: number }[];
  timeline: { d: string; t: Bi; n: Bi }[];
}

async function refresh(): Promise<{ at: number; projects: IpiuProject[] }> {
  const list = await fetchJSON('https://api.ipiu.mn/public/projects');
  if (!Array.isArray(list) || !list.length) throw new Error('ipiu хоосон');
  const projects = list.filter((p) => p && p.slug && p.published !== false).sort((a, b) => (a.order || 0) - (b.order || 0)).map((p): IpiuProject => ({
    slug: p.slug, aliases: p.apiCategoryAliases || [], name: bi(p.name), short: bi(p.shortName), tagline: bi(p.tagline), desc: bi(p.description),
    img: p.image && IMG_KEY.test(p.image.key || '') ? 'https://cdn.ipiu.mn/' + p.image.key : '',
    status: String(p.status || ''), budUsd: typeof p.budgetUsdM === 'number' ? p.budgetUsdM : null, prog: typeof p.overallProgress === 'number' ? p.overallProgress : null,
    from: p.startYear || null, to: p.endYear || null,
    metrics: (p.metrics || []).filter((m: any) => m && m.value != null && m.label).map((m: any) => ({ l: bi(m.label), v: String(m.value).trim() })),
    parts: (p.progress || []).filter((m: any) => m && m.label && typeof m.value === 'number').map((m: any) => ({ l: bi(m.label), v: m.value })),
    timeline: (p.timeline || []).filter((x: any) => x && (x.title || x.note)).map((x: any) => ({ d: String(x.date || '').trim(), t: bi(x.title), n: bi(x.note) })),
  }));
  const data = { at: Date.now(), projects };
  writeCache(FILE, data);
  return data;
}

export async function getLiveIpiu({ force = false }: SourceOptions = {}): Promise<{ projects: IpiuProject[]; note: string }> {
  const cache = readCache<{ projects: IpiuProject[] }>(FILE);
  if (cache && isFresh(cache) && !force) return Object.assign(cache, { note: `кэшээс ipiu.mn ${cache.projects.length} төсөл` });
  try {
    const d = await refresh();
    return Object.assign(d, { note: `ipiu.mn-ээс ${d.projects.length} төслийн албан ёсны мэдээлэл` });
  } catch (e) {
    const msg = (e as Error).message;
    return cache ? Object.assign(cache, { note: `⚠ ipiu.mn-д холбогдож чадсангүй (${msg}), хуучин кэш` }) : { projects: [], note: `⚠ ipiu.mn-д холбогдож чадсангүй (${msg})` };
  }
}
