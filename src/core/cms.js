/* ================= CMS: admin-ы засварыг сайтад тусгах =================
   Сайтын анхны агуулга нь src/data/, admin-ы засвар нь серверт (GET /api/cms). Хоёрыг энд нийлүүлнэ (applyOverlay).
   Засварыг /admin хийнэ (admin/ — тусдаа Next.js төсөл). Тэр нь анхны агуулга (DEF), applyOverlay-г assets/kit.js-ээр ашиглана.
   Сервергүй (нэг файлт хувилбар) үед анхны агуулга харагдана. */
const CMS_COLS = ['news', 'alerts', 'events', 'projects', 'services', 'texts', 'settings', 'media',
  'mediaitems', 'sits', 'docs', 'struct', 'orgs', 'history', 'citydata', 'menu', 'rubrics', 'ecats', 'pcats', 'topics', 'faq', 'banners', 'govsched'];
const cloneJ = (x) => JSON.parse(JSON.stringify(x));
const dISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const linesOf = (pairs) => pairs.map((p) => p[0] + ' | ' + (p[1] || '')).join('\n');
const pairsOf = (txt) => String(txt || '').split('\n').map((l) => l.split('|').map((x) => x.trim())).filter((p) => p[0]).map((p) => [p[0], p[1] || p[0]]);
const byOrd = (arr) => arr.sort((a, b) => (+a.ord || 0) - (+b.ord || 0));
const reEsc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/* Ангиллын объектыг (RUB, ECAT, PCAT) admin-ы жагсаалтаас дахин бүтээнэ; заавал байх түлхүүрийг (fallback) хадгална. */
function setTaxonomy(obj, items, keep, extra) {
  const next = {}; byOrd(items).forEach((x) => { next[x.id] = Object.assign({ c: x.c || '#64748B', t: x.t || [x.id, x.id] }, extra ? extra(x) : {}); });
  if (!next[keep]) { const d = (DEF_TAX[keep] || {}); next[keep] = d; }
  Object.keys(obj).forEach((k) => { delete obj[k]; }); Object.assign(obj, next);
}
const DEF_TAX = { city: cloneJ(RUB.city), zar: cloneJ(RUB.zar), civic: cloneJ(ECAT.civic), transport: cloneJ(PCAT.transport) };
const DEF = {
  news: NEWS.map((n) => { const c = cloneJ(n); delete c.ts; delete c.ago; return c; }),
  alerts: cloneJ(ALERTS), events: cloneJ(EVENTS), projects: cloneJ(PROJECTS), services: cloneJ(ALL_SVC), texts: cloneJ(I),
  settings: { heroId: HERO_ID, featuredId: FEATURED_ID, gov: GOV.slice(), tickerOn: true, season: 'auto', quick: QUICK.slice(), chatChips: linesOf(CHAT_CHIPS), popSearch: linesOf(SQ_POP) },
  // Сайтын бусад бүх агуулга (admin-аас засагдана). ord: жагсаалтын дараалал.
  mediaitems: MEDIA.map((m, i) => Object.assign({ id: 'm' + (i + 1), ord: (i + 1) * 10 }, cloneJ(m))),
  banners: cloneJ(BANNERS),
  govsched: cloneJ(GOV_SCHED),
  sits: SITS.map((x, i) => Object.assign({ ord: (i + 1) * 10 }, cloneJ(x))),
  docs: Object.keys(DOCS).flatMap((kind) => DOCS[kind].map((d, i) => { const x = Object.assign({ id: kind + (i + 1), kind }, cloneJ(d), { date: dISO(addDays(today(), -(d.ago || 0))) }); if (kind === 'tender') x.due = d.left ? dISO(addDays(today(), d.left)) : ''; delete x.ago; delete x.left; return x; })),
  struct: STRUCT.map((x, i) => Object.assign({ id: 'st' + (i + 1), ord: (i + 1) * 10 }, cloneJ(x))),
  orgs: ORGS.map((x, i) => Object.assign({ id: 'o' + (i + 1), ord: (i + 1) * 10 }, cloneJ(x))),
  history: ADMIN_NAMES.map(([y, mn, en], i) => ({ id: 'h' + (i + 1), y, t: [mn, en] })),
  citydata: [{ id: 'main', pop: POP.map(([mn, en, v]) => ({ n: [mn, en], v })), budget: BUDGET_Q.map(([plan, act]) => ({ plan, act })), roads: ROADS.map(([n, v]) => ({ n: cloneJ(n), v })) }],
  menu: MENU.map((m, i) => Object.assign({ id: 'menu' + (i + 1), ord: (i + 1) * 10 }, cloneJ(m))),
  rubrics: Object.keys(RUB).map((k, i) => ({ id: k, t: cloneJ(RUB[k].t), c: RUB[k].c, chip: NEWS_CATS.includes(k) ? 1 : 0, ord: NEWS_CATS.includes(k) ? NEWS_CATS.indexOf(k) * 10 : 100 + i * 10 })),   // шүүлтүүрийн анхны дараалал
  ecats: Object.keys(ECAT).map((k, i) => ({ id: k, t: cloneJ(ECAT[k].t), c: ECAT[k].c, ord: (i + 1) * 10 })),
  pcats: Object.keys(PCAT).map((k, i) => ({ id: k, t: cloneJ(PCAT[k].t), c: PCAT[k].c, i: PCAT[k].i, ord: (i + 1) * 10 })),
  topics: TOPICS.map(([k, mn, en], i) => ({ id: k, t: [mn, en], ord: (i + 1) * 10 })),
  faq: FAQ.map((f, i) => ({ id: 'f' + (i + 1), kw: f.re.source.replace(/\\b/g, '').split('|').join(', '), a: cloneJ(f.a), acts: f.acts || [] })).concat([{ id: 'f0', kw: '', a: cloneJ(FAQ_DEFAULT.a) }]),
};
/* mode: 'api' (сервертэй) | 'static' (сервергүй) */
const CMS = { mode: 'pending', data: {} };
CMS_COLS.forEach((c) => { CMS.data[c] = {}; });
let SET = Object.assign({}, DEF.settings);

function mergedItems(col) {
  const defs = DEF[col] || [], ov = CMS.data[col] || {}, out = [], seen = new Set();
  defs.forEach((d) => { seen.add(d.id); const o = ov[d.id]; if (o && o.deleted) return; const x = Object.assign(cloneJ(d), o || {}); if (o) x._edited = 1; out.push(x); });
  Object.keys(ov).forEach((id) => { const o = ov[id]; if (!seen.has(id) && !o.deleted) out.push(Object.assign({ _new: 1 }, cloneJ(o))); });
  return out;
}
const zipParas = (bt) => {
  const sp = (s) => String(s || '').split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
  const a = sp(bt[0]), b = sp(bt[1]);
  return Array.from({ length: Math.max(a.length, b.length) }, (_, i) => [a[i] || b[i] || '', b[i] || a[i] || '']);
};
/* Admin-аас оруулсан зураг/лого ('media:<id>') → data URL. Буруу эсвэл устсан бол хоосон. */
const mediaSrc = (key) => { const m = String(key || '').indexOf('media:') === 0 && CMS.data.media[String(key).slice(6)]; return m && /^data:image\/(webp|png|jpeg|gif);base64,[A-Za-z0-9+/=]+$/.test(m.src || '') ? m.src : ''; };
const dayOffset = (ds) => { const m = String(ds || '').match(/(\d{4})-(\d{2})-(\d{2})/); return m ? Math.round((new Date(+m[1], +m[2] - 1, +m[3]) - today()) / 864e5) : 0; };

function applyOverlay() {
  // Ангиллууд эхэлж (мэдээ, арга хэмжээ, төсөл тэдгээрийг ашиглана)
  const rubs = mergedItems('rubrics'); setTaxonomy(RUB, rubs, 'city'); if (!RUB.zar) RUB.zar = DEF_TAX.zar;
  NEWS_CATS.splice(0, NEWS_CATS.length, 'all', ...byOrd(rubs).filter((r) => r.chip && RUB[r.id]).map((r) => r.id));
  setTaxonomy(ECAT, mergedItems('ecats'), 'civic');
  setTaxonomy(PCAT, mergedItems('pcats'), 'transport', (x) => ({ i: x.i || 'hard-hat' }));
  // Агуулгын жагсаалтууд
  MEDIA.splice(0, MEDIA.length, ...byOrd(mergedItems('mediaitems')));
  BANNERS.splice(0, BANNERS.length, ...byOrd(mergedItems('banners')));
  GOV_SCHED.splice(0, GOV_SCHED.length, ...mergedItems('govsched').filter((e) => !e.off && /^\d{4}-\d\d-\d\d$/.test(e.date || '')).sort((a, b) => (a.date + a.from).localeCompare(b.date + b.from)));
  SITS.splice(0, SITS.length, ...byOrd(mergedItems('sits')).map((x) => Object.assign(x, { steps: (x.steps || []).filter((st) => st && st.t && (st.t[0] || st.t[1])) })));
  if (SITS.length && !SITS.find((x) => x.id === S.sit)) S.sit = SITS[0].id;
  const docs = mergedItems('docs');
  ['res', 'ord', 'tender'].forEach((k) => { DOCS[k] = docs.filter((d) => (d.kind || 'res') === k).map((d) => Object.assign(d, { ago: Math.max(0, -dayOffset(d.date)), left: d.due ? Math.max(0, dayOffset(d.due)) : 0, st: d.st || 'open', bud: +d.bud || 0 })).sort((a, b) => a.ago - b.ago); });
  STRUCT.splice(0, STRUCT.length, ...byOrd(mergedItems('struct')));
  ORGS.splice(0, ORGS.length, ...byOrd(mergedItems('orgs')));
  ADMIN_NAMES.splice(0, ADMIN_NAMES.length, ...mergedItems('history').map((h) => [+h.y || 0, (h.t || [])[0] || '', (h.t || [])[1] || (h.t || [])[0] || '']).sort((a, b) => a[0] - b[0]));
  const cd = mergedItems('citydata')[0] || cloneJ(DEF.citydata[0]);
  if ((cd.pop || []).length) POP.splice(0, POP.length, ...cd.pop.map((p) => [(p.n || [])[0] || '', (p.n || [])[1] || (p.n || [])[0] || '', +p.v || 0]).sort((a, b) => b[2] - a[2]));
  if ((cd.budget || []).length) BUDGET_Q.splice(0, BUDGET_Q.length, ...cd.budget.map((q) => [+q.plan || 0, +q.act || 0]));
  if ((cd.roads || []).length) ROADS.splice(0, ROADS.length, ...cd.roads.map((r) => [r.n || ['', ''], Math.max(0, Math.min(10, +r.v || 0))]));
  MENU.splice(0, MENU.length, ...byOrd(mergedItems('menu')).map((m) => Object.assign(m, { sec: m.sec || 'hero', items: (m.items || []).filter((it) => it && it.t && (it.t[0] || it.t[1])) })));
  TOPICS.splice(0, TOPICS.length, ...byOrd(mergedItems('topics')).map((x) => [x.id, (x.t || [])[0] || '', (x.t || [])[1] || (x.t || [])[0] || '']));
  const faq = mergedItems('faq'), fb = faq.find((f) => !String(f.kw || '').trim());
  FAQ.splice(0, FAQ.length, ...faq.filter((f) => String(f.kw || '').trim()).map((f) => ({ re: new RegExp(String(f.kw).split(',').map((w) => w.trim()).filter(Boolean).map(reEsc).join('|'), 'i'), a: f.a || ['', ''], acts: f.acts || [] })));
  FAQ_DEFAULT.a = fb ? fb.a : DEF.faq.find((f) => f.id === 'f0').a;
  for (const k in DEF.texts) { const o = CMS.data.texts[k]; I[k] = o ? [o.mn || DEF.texts[k][0], o.en || DEF.texts[k][1]] : DEF.texts[k].slice(); }
  SET = Object.assign({}, DEF.settings, (CMS.data.settings || {}).main || {});
  const news = mergedItems('news').filter((n) => !n.draft).map((n) => { if (!RUB[n.cat]) n.cat = 'city'; if (n.bt) n.b = zipParas(n.bt); n.ts = parseUB(n.d) || ubNow(); n.ago = Math.max(1, Math.round((ubNow() - n.ts) / 60000)); return n; }).sort((a, b) => b.ts - a.ts);
  NEWS.splice(0, NEWS.length, ...news);
  Object.keys(NEWS_BY).forEach((k) => { delete NEWS_BY[k]; });
  NEWS.forEach((n) => { NEWS_BY[n.id] = n; });
  const pics = NEWS.filter((n) => !n.zar);
  HERO_ID = NEWS_BY[SET.heroId] ? SET.heroId : ((pics[0] || NEWS[0] || {}).id);
  FEATURED_ID = NEWS_BY[SET.featuredId] && SET.featuredId !== HERO_ID ? SET.featuredId : ((pics.find((n) => n.id !== HERO_ID) || {}).id);
  GOV.splice(0, GOV.length, ...(SET.gov || []).filter((id) => NEWS_BY[id]).slice(0, 3));
  CHAT_CHIPS.splice(0, CHAT_CHIPS.length, ...pairsOf(SET.chatChips));
  SQ_POP.splice(0, SQ_POP.length, ...pairsOf(SET.popSearch));
  ALERTS.splice(0, ALERTS.length, ...mergedItems('alerts').filter((a) => !a.off));
  EVENTS.splice(0, EVENTS.length, ...mergedItems('events').map((e) => { if (!ECAT[e.c]) e.c = 'civic'; e.x = Math.max(5, Math.min(995, +e.x || 560)); e.y = Math.max(5, Math.min(615, +e.y || 285)); if (e.date) e.w = dayOffset(e.date); return e; }));
  PROJECTS.splice(0, PROJECTS.length, ...mergedItems('projects').map((p) => Object.assign(p, { p: p.p == null || p.p === '' ? null : Math.max(0, Math.min(100, +p.p || 0)), c: PCAT[p.c] ? p.c : 'transport', x: Math.max(5, Math.min(995, +p.x || 560)), y: Math.max(5, Math.min(615, +p.y || 300)), bud: +p.bud || 0 })));
  const svc = mergedItems('services').map((s) => Object.assign(s, { g: ['citizen', 'business', 'esys'].includes(s.g) ? s.g : 'citizen', m: ['on', 'off', 'sys'].includes(s.m) ? s.m : 'on' }));
  ALL_SVC.splice(0, ALL_SVC.length, ...svc);
  QUICK.splice(0, QUICK.length, ...(SET.quick || []).filter((id) => ALL_SVC.some((x) => x.id === id)));
  ['citizen', 'business', 'esys'].forEach((g) => { SERVICES[g] = svc.filter((s) => s.g === g); });
  S.breaking = NEWS.filter((n) => n.br).map((n) => ({ id: n.id, ts: n.ts })).sort((a, b) => b.ts - a.ts);
}

let applyT = null, firstApply = true;
function scheduleApply() { clearTimeout(applyT); applyT = setTimeout(runApply, 160); }
function runApply() {
  const before = new Set(NEWS.map((n) => n.id));
  applyOverlay();
  const added = NEWS.filter((n) => !before.has(n.id));
  const wasFirst = firstApply; firstApply = false;
  const y = window.scrollY; renderAll(); if (MODAL) paintModal(true); window.scrollTo(0, y);
  if (!wasFirst && added.length && S.route === 'home') toast(L(['Шинэ мэдээ нийтлэгдлээ', 'New story published']) + ': ' + L(added[0].t), 'bell-ring');
  if (S.pendingNews) {   // /news/<id> хаягаар орж ирсэн, admin-аас нэмсэн мэдээ
    const id = S.pendingNews; S.pendingNews = null;
    if (NEWS_BY[id]) { S.newsId = id; setRoute('news'); }
    else setRoute('404');
  }
}

/* ---- Backend API (server/). Маягт илгээхэд ч ашиглана (features/forms.js). ---- */
async function apiCall(path, opt = {}) {
  const init = { method: opt.method || 'GET', credentials: 'same-origin', headers: {} };
  if (opt.body !== undefined) { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(opt.body); }
  const r = await fetch('/api' + path, init);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw { code: j.error || 'http_' + r.status, status: r.status };
  return j;
}
async function cmsApiLoad() {
  const j = await apiCall('/cms');
  CMS_COLS.forEach((c) => { CMS.data[c] = (j.data && j.data[c]) || {}; });
}
async function cmsApiInit() {
  if (location.protocol === 'file:') return false;
  try { await Promise.race([cmsApiLoad(), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 4000))]); } catch (e) { return false; }
  CMS.mode = 'api';
  let tm = null;
  const reload = () => { clearTimeout(tm); tm = setTimeout(() => cmsApiLoad().then(() => { scheduleApply(); renderChrome(); }).catch(() => {}), 150); };
  try {
    const es = new EventSource('/api/events');
    es.addEventListener('cms', reload);
  } catch (e) { /* шууд шинэчлэлгүйгээр ажиллана */ }
  scheduleApply(); cmsReadyUI(); return true;
}
async function initCMS() {
  if (await cmsApiInit()) return;
  CMS.mode = 'static'; scheduleApply(); cmsReadyUI();   // сервергүй: анхны агуулга
}
function cmsReadyUI() {
  renderChrome(); setActiveNav(currentSec);
  const n = $('#navbar'), s = $('#nav-sentinel'); if (n && s) n.classList.toggle('stuck', s.getBoundingClientRect().top < 0);
}
