/* ipiu.mn (Нэгдсэн төслийн удирдлагын газар): мега төслийн албан ёсны тоо (build үед). */
const { fs, path, CACHE_MIN, CACHE, fetchJSON, readCache } = require('./shared');

/* ---- ipiu.mn (Нэгдсэн төслийн удирдлагын газар): мега төслийн албан ёсны тоо ----
   api.ipiu.mn/public/projects: гүйцэтгэл, төсөв (сая $), хугацаа, үе шат, үзүүлэлт, ажлын хэсгийн явц, он дараалал. Зураг cdn.ipiu.mn-ээс. */
const IPIU_FILE = path.join(CACHE, 'ipiu.json'), IPIU_IMG = /^[\w./-]+\.(jpe?g|png|webp)$/i;
const bi = (o) => [String((o && o.mn) || '').trim(), String((o && o.en) || '').trim()];
async function refreshIpiu() {
  const list = await fetchJSON('https://api.ipiu.mn/public/projects');
  if (!Array.isArray(list) || !list.length) throw new Error('ipiu хоосон');
  const projects = list.filter((p) => p && p.slug && p.published !== false).sort((a, b) => (a.order || 0) - (b.order || 0)).map((p) => ({
    slug: p.slug, aliases: p.apiCategoryAliases || [], name: bi(p.name), short: bi(p.shortName), tagline: bi(p.tagline), desc: bi(p.description),
    img: p.image && IPIU_IMG.test(p.image.key || '') ? 'https://cdn.ipiu.mn/' + p.image.key : '',
    status: String(p.status || ''), budUsd: typeof p.budgetUsdM === 'number' ? p.budgetUsdM : null, prog: typeof p.overallProgress === 'number' ? p.overallProgress : null,
    from: p.startYear || null, to: p.endYear || null,
    metrics: (p.metrics || []).filter((m) => m && m.value != null && m.label).map((m) => ({ l: bi(m.label), v: String(m.value).trim() })),
    parts: (p.progress || []).filter((m) => m && m.label && typeof m.value === 'number').map((m) => ({ l: bi(m.label), v: m.value })),
    timeline: (p.timeline || []).filter((x) => x && (x.title || x.note)).map((x) => ({ d: String(x.date || '').trim(), t: bi(x.title), n: bi(x.note) })),
  }));
  const data = { at: Date.now(), projects };
  fs.writeFileSync(IPIU_FILE, JSON.stringify(data));
  return data;
}
async function getLiveIpiu({ force = false } = {}) {
  const cache = readCache(IPIU_FILE);
  if (cache && Date.now() - cache.at < CACHE_MIN * 60000 && !force) return Object.assign(cache, { note: `кэшээс ipiu.mn ${cache.projects.length} төсөл` });
  try { fs.mkdirSync(CACHE, { recursive: true }); const d = await refreshIpiu(); return Object.assign(d, { note: `ipiu.mn-ээс ${d.projects.length} төслийн албан ёсны мэдээлэл` }); }
  catch (e) { return cache ? Object.assign(cache, { note: `⚠ ipiu.mn-д холбогдож чадсангүй (${e.message}), хуучин кэш` }) : { projects: [], note: `⚠ ipiu.mn-д холбогдож чадсангүй (${e.message})` }; }
}

module.exports = { getLiveIpiu };
