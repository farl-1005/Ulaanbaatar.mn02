/* ulaanbaatar.mn-ийн медиа: Live (Facebook видео), Фото сурвалжилга, Постер, Подкаст (build үед). */
const { fs, path, CACHE_MIN, CACHE, IMG_DIR, API_TYPE, FILE_URL, VIDEO_URL, paragraphs, ubDate, fetchJSON, thumb, readCache } = require('./shared');

const MEDIA_FILE = path.join(CACHE, 'media.json');
/* ---- Медиа: Live (Facebook видео), Фото сурвалжилга (зургийн цомог), Постер, Подкаст ----
   Нүүр зургийг мэдээнийх шиг жижигрүүлнэ. Цомгийн зургийн эх хаягийг хадгална (серверийн /api/img жижигрүүлж үзүүлнэ). */
const MEDIA_TYPES = [['LIVE', 'live', 12], ['PHOTO', 'photo', 12], ['POSTER', 'poster', 12], ['PODCAST', 'podcast', 6]];
async function refreshMedia(log) {
  const items = [];
  for (const [api, type, n] of MEDIA_TYPES) {
    const j = await fetchJSON(API_TYPE + api + '&pageSize=' + n);
    for (const a of (j && j.data && j.data.list) || []) {
      if (a.enable === false || !a.urlId) continue;
      const html = String(a.content || '');
      const photos = [...new Set([...(Array.isArray(a.photos) ? a.photos.map((p) => p && p.url) : []), ...[...html.matchAll(/<img[^>]+src="([^"]+)"/gi)].map((m) => m[1])])].filter((u) => FILE_URL.test(u || '')).slice(0, 60);
      const cover = a.coverImg && FILE_URL.test(a.coverImg.url || '') ? a.coverImg.url : photos[0];
      items.push({ id: 'md' + a.urlId, nid: String(a.urlId), type, d: ubDate(a.startDate || a.createdDate), views: +a.views || 0, t: String(a.title || '').trim(),
        body: paragraphs(html).slice(0, 10), video: type === 'live' && VIDEO_URL.test(a.videoUrl || '') ? a.videoUrl : '', photos: type === 'photo' ? photos : [], _src: cover });
    }
  }
  if (!items.length) throw new Error('медиа хоосон');
  fs.mkdirSync(IMG_DIR, { recursive: true });
  const queue = items.filter((m) => m._src);
  const fresh = queue.filter((m) => !fs.existsSync(path.join(IMG_DIR, m.nid + '.webp'))).length;
  if (fresh) log(`  ↓ ${fresh} медиа зураг татаж жижигрүүлж байна...`);
  await Promise.all(Array.from({ length: 4 }, async () => { for (let m; (m = queue.shift());) m.imgFile = await thumb(m.nid, m._src); }));
  items.forEach((m) => { m.imgSrc = m._src; delete m._src; });
  fs.writeFileSync(MEDIA_FILE, JSON.stringify({ at: Date.now(), items }));
  return items;
}
async function getLiveMedia({ force = false, log = console.log } = {}) {
  const cache = readCache(MEDIA_FILE);
  if (cache && Date.now() - cache.at < CACHE_MIN * 60000 && !force) return { items: cache.items, note: `кэшээс ${cache.items.length} медиа` };
  try { const items = await refreshMedia(log); return { items, note: `ulaanbaatar.mn-ээс ${items.length} медиа шинэчиллээ` }; }
  catch (e) { return cache ? { items: cache.items, note: `⚠ медиа API-д холбогдож чадсангүй (${e.message}), хуучин кэш` } : { items: [], note: `⚠ медиа API-д холбогдож чадсангүй (${e.message}), жишээ медиа` }; }
}

module.exports = { getLiveMedia };
