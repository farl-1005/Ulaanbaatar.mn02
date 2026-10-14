/* ulaanbaatar.mn-ийн медиа: Live (Facebook видео), Фото сурвалжилга (зургийн цомог), Постер, Подкаст.
   Нүүр зургийг мэдээнийх шиг жижигрүүлнэ. Цомгийн зургийн эх хаягийг хадгална (/api/img жижигрүүлж үзүүлнэ). */
import * as fs from 'fs';
import * as path from 'path';
import { API_TYPE, CACHE, eachParallel, fetchJSON, FILE_URL, IMG_DIR, isFresh, paragraphs, readCache, SourceOptions, thumb, ubDate, VIDEO_URL, writeCache } from './shared';

const MEDIA_TYPES: [api: string, type: string, count: number][] = [['LIVE', 'live', 12], ['PHOTO', 'photo', 12], ['POSTER', 'poster', 12], ['PODCAST', 'podcast', 6]];
const FILE = path.join(CACHE, 'media.json');

export interface LiveMedia {
  id: string;
  /** ulaanbaatar.mn-ийн дугаар (зургийн файлын нэр) */
  nid: string;
  type: string; d: string; views: number; t: string; body: string[];
  video: string; photos: string[];
  imgFile?: string | null; imgSrc?: string;
}

async function refresh(log: (msg: string) => void): Promise<LiveMedia[]> {
  const items: (LiveMedia & { _src?: string })[] = [];
  for (const [api, type, n] of MEDIA_TYPES) {
    const j = await fetchJSON(API_TYPE + api + '&pageSize=' + n);
    for (const a of j?.data?.list || []) {
      if (a.enable === false || !a.urlId) continue;
      const html = String(a.content || '');
      const fromList = Array.isArray(a.photos) ? a.photos.map((p: any) => p && p.url) : [];
      const fromHtml = [...html.matchAll(/<img[^>]+src="([^"]+)"/gi)].map((m) => m[1]);
      const photos = [...new Set<string>([...fromList, ...fromHtml])].filter((u) => FILE_URL.test(u || '')).slice(0, 60);
      const cover = a.coverImg && FILE_URL.test(a.coverImg.url || '') ? a.coverImg.url : photos[0];
      items.push({
        id: 'md' + a.urlId, nid: String(a.urlId), type, d: ubDate(a.startDate || a.createdDate), views: +a.views || 0, t: String(a.title || '').trim(),
        body: paragraphs(html).slice(0, 10), video: type === 'live' && VIDEO_URL.test(a.videoUrl || '') ? a.videoUrl : '', photos: type === 'photo' ? photos : [], _src: cover,
      });
    }
  }
  if (!items.length) throw new Error('медиа хоосон');
  fs.mkdirSync(IMG_DIR, { recursive: true });
  const withCover = items.filter((m) => m._src);
  const fresh = withCover.filter((m) => !fs.existsSync(path.join(IMG_DIR, m.nid + '.webp'))).length;
  if (fresh) log(`  ↓ ${fresh} медиа зураг татаж жижигрүүлж байна...`);
  await eachParallel(withCover, async (m) => { m.imgFile = await thumb(m.nid, m._src); });
  items.forEach((m) => { m.imgSrc = m._src; delete m._src; });
  writeCache(FILE, { at: Date.now(), items });
  return items;
}

export async function getLiveMedia({ force = false, log = console.log }: SourceOptions = {}): Promise<{ items: LiveMedia[]; note: string }> {
  const cache = readCache<{ items: LiveMedia[] }>(FILE);
  if (cache && isFresh(cache) && !force) return { items: cache.items, note: `кэшээс ${cache.items.length} медиа` };
  try {
    const items = await refresh(log);
    return { items, note: `ulaanbaatar.mn-ээс ${items.length} медиа шинэчиллээ` };
  } catch (e) {
    const msg = (e as Error).message;
    return cache ? { items: cache.items, note: `⚠ медиа API-д холбогдож чадсангүй (${msg}), хуучин кэш` } : { items: [], note: `⚠ медиа API-д холбогдож чадсангүй (${msg}), жишээ медиа` };
  }
}
