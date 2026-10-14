/* ulaanbaatar.mn-ийн харьяа байгууллагууд: ангилал, нэр, вэб сайт, лого (build үед, 24 цаг кэш). */
const { fs, path, IMG_MAX_BYTES, TIMEOUT, CACHE, IMG_DIR, FILE_URL, fetchJSON, orgName, readCache } = require('./shared');

/* ---- Харьяа байгууллагууд (ulaanbaatar.mn/government): ангилал, нэр, вэб сайт, лого ----
   Лого бүрийг ил тод дэвсгэртэйгээр 200px WebP болгоно. Ховор өөрчлөгддөг тул 24 цаг кэшлэнэ. */
const ORG_FILE = path.join(CACHE, 'orgs.json'), API_BASE = 'https://ulaanbaatar.mn/api/';
async function logoThumb(id, url) {
  const out = path.join(IMG_DIR, 'org-' + id + '.webp');
  if (fs.existsSync(out)) return 'org-' + id + '.webp';
  if (!FILE_URL.test(url || '')) return null;
  let sharp; try { sharp = require('sharp'); } catch (e) { return null; }
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT * 3) });
    if (!r.ok || +(r.headers.get('content-length') || 0) > IMG_MAX_BYTES) return null;
    await sharp(Buffer.from(await r.arrayBuffer()), { limitInputPixels: 1e8 }).rotate().trim({ threshold: 12 }).resize({ width: 200, height: 200, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88, alphaQuality: 90 }).toFile(out);
    return 'org-' + id + '.webp';
  } catch (e) { return null; }
}
async function refreshOrgs(log) {
  const st = await fetchJSON(API_BASE + 'section-type?deleted=false&pageSize=999');
  const types = (st && st.data && (st.data.list || st.data)) || [], cats = [], orgs = [];
  for (const ty of types) {
    const j = await fetchJSON(API_BASE + 'section?deleted=false&pageSize=999&sectionType=' + encodeURIComponent(ty.id));
    const list = ((j && j.data && (j.data.list || j.data)) || []).filter((o) => o && o.name);
    if (!list.length) continue;
    const cat = 'c' + (cats.length + 1);
    cats.push({ id: cat, t: orgName(ty.name) });
    list.forEach((o) => orgs.push({ id: String(o.id), cat, t: orgName(o.name), url: /^https?:\/\//.test(String(o.link || '').trim()) ? String(o.link).trim() : '', _src: o.icon && o.icon.url }));
  }
  if (!orgs.length) throw new Error('байгууллага хоосон');
  fs.mkdirSync(IMG_DIR, { recursive: true });
  const queue = orgs.slice(), fresh = orgs.filter((o) => o._src && !fs.existsSync(path.join(IMG_DIR, 'org-' + o.id + '.webp'))).length;
  if (fresh) log(`  ↓ ${fresh} байгууллагын лого татаж байна...`);
  await Promise.all(Array.from({ length: 4 }, async () => { for (let o; (o = queue.shift());) o.logoFile = await logoThumb(o.id, o._src); }));
  orgs.forEach((o) => { o.logoSrc = o._src; delete o._src; });
  const data = { at: Date.now(), cats, orgs };
  fs.writeFileSync(ORG_FILE, JSON.stringify(data));
  return data;
}
async function getLiveOrgs({ force = false, log = console.log } = {}) {
  const cache = readCache(ORG_FILE);
  if (cache && Date.now() - cache.at < 24 * 3600e3 && !force) return Object.assign(cache, { note: `кэшээс ${cache.orgs.length} байгууллага` });
  try { const d = await refreshOrgs(log); return Object.assign(d, { note: `ulaanbaatar.mn-ээс ${d.orgs.length} байгууллага шинэчиллээ` }); }
  catch (e) { return cache ? Object.assign(cache, { note: `⚠ байгууллагын API-д холбогдож чадсангүй (${e.message}), хуучин кэш` }) : { cats: [], orgs: [], note: `⚠ байгууллагын API-д холбогдож чадсангүй (${e.message}), жишээ жагсаалт` }; }
}

module.exports = { getLiveOrgs };
