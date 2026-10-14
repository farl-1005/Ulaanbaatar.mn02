/* ulaanbaatar.mn-ийн 24 мега төсөл ба явцын мэдээ (build үед). */
const { fs, path, CACHE_MIN, CACHE, FILE_URL, VIDEO_URL, paragraphs, ubDate, fetchJSON, orgName, readCache } = require('./shared');

/* ---- 24 мега төсөл (ulaanbaatar.mn/mega-project): ангилал = төсөл, мэдээ бүр = явцын мэдээлэл ----
   Зургийг build үед татахгүй (151+ том зураг): хөтөч /api/img-ээр шаардлагатай үед нь жижигрүүлж авна.
   Гүйцэтгэлийн хувийг зөвхөн «нийт гүйцэтгэл NN хувь», «барилга угсралтын ажил NN хувь» гэх мэт тодорхой өгүүлбэрээс, эх өгүүлбэртэй нь авна. */
const MEGA_FILE = path.join(CACHE, 'mega.json');
const PCT_RE = [
  /нийт\s+гүйцэтгэл(?:ийн)?\s*(?:нь)?\s*(\d{1,3}(?:[.,]\d+)?)\s*(?:орчим\s*)?хув/i,
  /(?:барилга(?:ын)?\s+угсралтын|барилгын|бүтээн\s+байгуулалтын)\s+(?:ажил|ажлын\s+явц|явц)(?:\s+нь)?\s*(\d{1,3}(?:[.,]\d+)?)\s*(?:орчим\s*)?хув/i,
];
async function refreshMega() {
  const j = await fetchJSON('https://ulaanbaatar.mn/api/mega-projects?count=400');
  const list = ((j && j.data && j.data.list) || []).filter((a) => a && a.isPublished !== false && a.category && a.title);
  if (!list.length) throw new Error('мега төсөл хоосон');
  const by = new Map();
  for (const a of list) {
    const paras = paragraphs(a.content);
    const u = { id: String(a.id), d: ubDate(a.createdDate), t: String(a.title).replace(/\s+/g, ' ').trim(), img: FILE_URL.test(a.image || '') ? a.image : '',
      video: VIDEO_URL.test(a.videoUrl || '') ? a.videoUrl : '', b: paras.slice(0, 3).map((p) => (p.length > 700 ? p.slice(0, 700).replace(/\s+\S*$/, '') + '…' : p)) };
    if (!by.has(a.category)) by.set(a.category, { key: a.category, name: orgName(a.categoryName || a.category), ups: [] });
    by.get(a.category).ups.push(Object.assign(u, { _seg: [a.title, a.description].concat(paras).map((x) => String(x || '').replace(/\s+/g, ' ').trim()).filter(Boolean) }));
  }
  const projects = [...by.values()].map((p) => {
    p.ups.sort((x, y) => y.d.localeCompare(x.d));
    let pct = null;
    for (const u of p.ups) {   // хамгийн сүүлийн тодорхой хувь; эх өгүүлбэрийг тухайн хэсгээс нь (гарчиг, догол мөр) таслан авна
      for (const seg of u._seg) {
        for (const re of PCT_RE) {
          const m = seg.match(re); if (!m) continue;
          const v = parseFloat(m[1].replace(',', '.')); if (!(v >= 0 && v <= 100)) continue;
          const s0 = Math.max(seg.lastIndexOf('. ', m.index) + 1, 0), e0 = seg.indexOf('. ', m.index + m[0].length);
          pct = { v: Math.round(v), src: seg.slice(s0, e0 < 0 ? undefined : e0 + 1).trim().slice(0, 240), d: u.d, id: u.id }; break;
        }
        if (pct) break;
      }
      if (pct) break;
    }
    p.ups.forEach((u) => delete u._seg);
    return { key: p.key, name: p.name, pct, ups: p.ups };
  }).sort((a, b) => b.ups[0].d.localeCompare(a.ups[0].d));
  const data = { at: Date.now(), projects };
  fs.writeFileSync(MEGA_FILE, JSON.stringify(data));
  return data;
}
async function getLiveMega({ force = false } = {}) {
  const cache = readCache(MEGA_FILE);
  if (cache && Date.now() - cache.at < CACHE_MIN * 60000 && !force) return Object.assign(cache, { note: `кэшээс ${cache.projects.length} мега төсөл` });
  try { fs.mkdirSync(CACHE, { recursive: true }); const d = await refreshMega(); return Object.assign(d, { note: `ulaanbaatar.mn-ээс ${d.projects.length} мега төсөл (${d.projects.reduce((n, p) => n + p.ups.length, 0)} мэдээ)` }); }
  catch (e) { return cache ? Object.assign(cache, { note: `⚠ мега төслийн API-д холбогдож чадсангүй (${e.message}), хуучин кэш` }) : { projects: [], note: `⚠ мега төслийн API-д холбогдож чадсангүй (${e.message}), жишээ төсөл` }; }
}

module.exports = { getLiveMega };
