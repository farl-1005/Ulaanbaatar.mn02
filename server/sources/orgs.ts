/* ulaanbaatar.mn-ийн харьяа байгууллагууд (ulaanbaatar.mn/government): ангилал, нэр, вэб сайт, лого.
   Лого бүрийг ил тод дэвсгэртэйгээр 200px WebP болгоно. Ховор өөрчлөгддөг тул 24 цаг кэшлэнэ. */
import * as fs from 'fs';
import * as path from 'path';
import { sharp } from '../common/sharp';
import { CACHE, eachParallel, fetchJSON, FILE_URL, IMG_DIR, IMG_MAX_BYTES, isFresh, orgName, readCache, SourceOptions, TIMEOUT, writeCache } from './shared';

const FILE = path.join(CACHE, 'orgs.json'), API_BASE = 'https://ulaanbaatar.mn/api/';

export interface LiveOrg { id: string; cat: string; t: string; url: string; logoFile?: string | null; logoSrc?: string }
export interface LiveOrgs { cats: { id: string; t: string }[]; orgs: LiveOrg[] }

async function logoThumb(id: string, url: string | undefined): Promise<string | null> {
  const name = 'org-' + id + '.webp', out = path.join(IMG_DIR, name);
  if (fs.existsSync(out)) return name;
  if (!FILE_URL.test(url || '') || !sharp) return null;
  try {
    const r = await fetch(url!, { signal: AbortSignal.timeout(TIMEOUT * 3) });
    if (!r.ok || +(r.headers.get('content-length') || 0) > IMG_MAX_BYTES) return null;
    await sharp(Buffer.from(await r.arrayBuffer()), { limitInputPixels: 1e8 }).rotate().trim({ threshold: 12 })
      .resize({ width: 200, height: 200, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88, alphaQuality: 90 }).toFile(out);
    return name;
  } catch { return null; }
}

async function refresh(log: (msg: string) => void): Promise<LiveOrgs & { at: number }> {
  const st = await fetchJSON(API_BASE + 'section-type?deleted=false&pageSize=999');
  const types: any[] = st?.data?.list || st?.data || [], cats: LiveOrgs['cats'] = [], orgs: (LiveOrg & { _src?: string })[] = [];
  for (const ty of types) {
    const j = await fetchJSON(API_BASE + 'section?deleted=false&pageSize=999&sectionType=' + encodeURIComponent(ty.id));
    const list = ((j?.data?.list || j?.data || []) as any[]).filter((o) => o && o.name);
    if (!list.length) continue;
    const cat = 'c' + (cats.length + 1);
    cats.push({ id: cat, t: orgName(ty.name) });
    for (const o of list) {
      const link = String(o.link || '').trim();
      orgs.push({ id: String(o.id), cat, t: orgName(o.name), url: /^https?:\/\//.test(link) ? link : '', _src: o.icon && o.icon.url });
    }
  }
  if (!orgs.length) throw new Error('байгууллага хоосон');
  fs.mkdirSync(IMG_DIR, { recursive: true });
  const fresh = orgs.filter((o) => o._src && !fs.existsSync(path.join(IMG_DIR, 'org-' + o.id + '.webp'))).length;
  if (fresh) log(`  ↓ ${fresh} байгууллагын лого татаж байна...`);
  await eachParallel(orgs, async (o) => { o.logoFile = await logoThumb(o.id, o._src); });
  orgs.forEach((o) => { o.logoSrc = o._src; delete o._src; });
  const data = { at: Date.now(), cats, orgs };
  writeCache(FILE, data);
  return data;
}

export async function getLiveOrgs({ force = false, log = console.log }: SourceOptions = {}): Promise<LiveOrgs & { note: string }> {
  const cache = readCache<LiveOrgs>(FILE);
  if (cache && isFresh(cache, 24 * 3600e3) && !force) return Object.assign(cache, { note: `кэшээс ${cache.orgs.length} байгууллага` });
  try {
    const d = await refresh(log);
    return Object.assign(d, { note: `ulaanbaatar.mn-ээс ${d.orgs.length} байгууллага шинэчиллээ` });
  } catch (e) {
    const msg = (e as Error).message;
    return cache ? Object.assign(cache, { note: `⚠ байгууллагын API-д холбогдож чадсангүй (${msg}), хуучин кэш` }) : { cats: [], orgs: [], note: `⚠ байгууллагын API-д холбогдож чадсангүй (${msg}), жишээ жагсаалт` };
  }
}
