/* ================= CMS data layer =================
   Built-in content is the default; edits live in an overlay that is either the
   artifact's shared db (cms/site/<collection>/<id>, admin-only writes, live for
   every signed-in viewer) or, outside claude.ai, this browser's storage. */
const CMS_COLS = ['news', 'alerts', 'events', 'projects', 'services', 'texts', 'settings', 'media',
  'mediaitems', 'sits', 'docs', 'struct', 'orgs', 'history', 'citydata', 'menu', 'rubrics', 'ecats', 'pcats', 'topics', 'faq'];
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
  settings: { heroId: HERO_ID, featuredId: FEATURED_ID, gov: GOV.slice(), tickerOn: true, quick: QUICK.slice(), chatChips: linesOf(CHAT_CHIPS), popSearch: linesOf(SQ_POP) },
  // Сайтын бусад бүх агуулга (admin-аас засагдана). ord: жагсаалтын дараалал.
  mediaitems: MEDIA.map((m, i) => Object.assign({ id: 'm' + (i + 1), ord: (i + 1) * 10 }, cloneJ(m))),
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
const CMS = { mode: 'pending', db: null, user: null, uid: null, canEdit: false, isOwner: false, data: {}, log: [] };
CMS_COLS.forEach((c) => { CMS.data[c] = {}; });
let SET = Object.assign({}, DEF.settings);

function cmsLocalLoad() { const x = store.get('cms', null) || {}; CMS_COLS.forEach((c) => { CMS.data[c] = x[c] || {}; }); CMS.log = x.log || []; }
function cmsLocalSave() { const x = { log: CMS.log.slice(0, 40) }; CMS_COLS.forEach((c) => { x[c] = CMS.data[c]; }); try { localStorage.setItem('ubmn:cms', JSON.stringify(x)); return true; } catch (e) { return false; } }

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
const dayOffset = (ds) => { const m = String(ds || '').match(/(\d{4})-(\d{2})-(\d{2})/); return m ? Math.round((new Date(+m[1], +m[2] - 1, +m[3]) - today()) / 864e5) : 0; };

function applyOverlay() {
  // Ангиллууд эхэлж (мэдээ, арга хэмжээ, төсөл тэдгээрийг ашиглана)
  const rubs = mergedItems('rubrics'); setTaxonomy(RUB, rubs, 'city'); if (!RUB.zar) RUB.zar = DEF_TAX.zar;
  NEWS_CATS.splice(0, NEWS_CATS.length, 'all', ...byOrd(rubs).filter((r) => r.chip && RUB[r.id]).map((r) => r.id));
  setTaxonomy(ECAT, mergedItems('ecats'), 'civic');
  setTaxonomy(PCAT, mergedItems('pcats'), 'transport', (x) => ({ i: x.i || 'hard-hat' }));
  // Агуулгын жагсаалтууд
  MEDIA.splice(0, MEDIA.length, ...byOrd(mergedItems('mediaitems')));
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
  PROJECTS.splice(0, PROJECTS.length, ...mergedItems('projects').map((p) => Object.assign(p, { p: Math.max(0, Math.min(100, +p.p || 0)), c: PCAT[p.c] ? p.c : 'transport', x: Math.max(5, Math.min(995, +p.x || 560)), y: Math.max(5, Math.min(615, +p.y || 300)), bud: +p.bud || 0 })));
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
  if (S.route === 'admin') { admRefresh(); return; }
  const y = window.scrollY; renderAll(); if (MODAL) paintModal(true); window.scrollTo(0, y);
  if (!wasFirst && added.length && S.route === 'home') toast(L(['Шинэ мэдээ нийтлэгдлээ', 'New story published']) + ': ' + L(added[0].t), 'bell-ring');
  if (S.pendingNews) {   // /news/<id> хаягаар орж ирсэн, admin-аас нэмсэн мэдээ
    const id = S.pendingNews; S.pendingNews = null;
    if (NEWS_BY[id]) { S.newsId = id; setRoute('news'); }
    else { if (PRETTY) try { history.replaceState(null, '', '/'); } catch (e) { /* ignore */ } setRoute('home'); }
  }
}

/* ---- Backend API (server/api.js). Сервергүй (нэг файлт хувилбар) үед local горимд шилжинэ. ---- */
async function apiCall(path, opt = {}) {
  const init = { method: opt.method || 'GET', credentials: 'same-origin', headers: {} };
  if (opt.body !== undefined) { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(opt.body); }
  const r = await fetch('/api' + path, init);
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (r.status === 401 && CMS.mode === 'api' && CMS.canEdit && path !== '/login') { CMS.canEdit = CMS.isOwner = false; if (S.route === 'admin') setTimeout(renderAdmin, 0); }
    throw { code: j.error || 'http_' + r.status, status: r.status };
  }
  return j;
}
async function cmsApiLoad() {
  const j = await apiCall('/cms');
  CMS_COLS.forEach((c) => { CMS.data[c] = (j.data && j.data[c]) || {}; });
  CMS.log = j.log || []; CMS.canEdit = CMS.isOwner = !!j.admin; CMS.uid = j.admin ? 'admin' : null; CMS.inboxNew = j.inboxNew || 0;
}
async function cmsApiInit() {
  if (location.protocol === 'file:') return false;
  try { await Promise.race([cmsApiLoad(), new Promise((_, no) => setTimeout(() => no(new Error('timeout')), 4000))]); } catch (e) { return false; }
  CMS.mode = 'api';
  let tm = null;
  const reload = () => { clearTimeout(tm); tm = setTimeout(() => cmsApiLoad().then(() => { scheduleApply(); renderHeader(); }).catch(() => {}), 150); };
  try {
    const es = new EventSource('/api/events');
    es.addEventListener('cms', reload);
    es.addEventListener('submission', () => { if (!CMS.canEdit) return; reload(); if (typeof admInboxChanged === 'function') admInboxChanged(); });
  } catch (e) { /* шууд шинэчлэлгүйгээр ажиллана */ }
  scheduleApply(); cmsReadyUI(); return true;
}
async function cmsLogin(password) { await apiCall('/login', { method: 'POST', body: { password } }); await cmsApiLoad(); scheduleApply(); cmsReadyUI(); }
async function cmsLogout() { try { await apiCall('/logout', { method: 'POST', body: {} }); } catch (e) { /* ignore */ } CMS.canEdit = CMS.isOwner = false; CMS.uid = null; CMS.log = []; cmsReadyUI(); }

async function initCMS() {
  const hasRuntime = !!(window.claude && typeof window.claude.use === 'function');
  if (!hasRuntime && await cmsApiInit()) return;
  if (!hasRuntime) {
    cmsLocalLoad(); CMS.mode = 'local'; CMS.canEdit = true;
    // Admin in one tab, site in another: pick up edits from other tabs of the same browser instantly.
    window.addEventListener('storage', (e) => { if (e.key === 'ubmn:cms') { cmsLocalLoad(); scheduleApply(); } });
    scheduleApply(); cmsReadyUI(); return;
  }
  let db = null, user = null;
  try { [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]); } catch (e) { /* resolves null on failure */ }
  CMS.user = user;
  if (!db) { CMS.mode = 'static'; CMS.canEdit = false; cmsReadyUI(); return; }
  CMS.db = db; CMS.mode = 'db';
  if (user) { CMS.canEdit = !!(await user.canEdit()); CMS.isOwner = !!(await user.isOwner()); CMS.uid = await user.id(); }
  const base = db.doc('cms/site');
  CMS_COLS.forEach((col) => {
    base.collection(col).onSnapshot((snap) => {
      const m = {}; snap.docs.forEach((d) => { if (d.exists) m[d.id] = Object.assign({}, d.data(), { id: d.id }); });
      CMS.data[col] = m; scheduleApply();
    }, (e) => console.warn('cms', col, e && e.code));
  });
  base.collection('log').orderBy('at', 'desc').limit(20).onSnapshot((snap) => {
    CMS.log = snap.docs.filter((d) => d.exists).map((d) => Object.assign({ id: d.id }, d.data()));
    if (S.route === 'admin' && ADM.view === 'dash') admRefresh();
  }, () => {});
  cmsReadyUI();
}
function cmsReadyUI() {
  renderHeader(); setActiveNav(currentSec);
  const n = $('#navbar'), s = $('#nav-sentinel'); if (n && s) n.classList.toggle('stuck', s.getBoundingClientRect().top < 0);
  if (S.route === 'admin') renderAdmin();
}

/* ---- writes ---- */
const isDefaultId = (col, id) => (DEF[col] || []).some((x) => x.id === id);
function cleanBody(o) { const b = cloneJ(o); ['ts', 'ago', '_edited', '_new', 'b', 'w', 'd_'].forEach((k) => { delete b[k]; }); return b; }
async function cmsWrite(col, id, body) {
  if (CMS.mode === 'api') { await apiCall(`/cms/${col}/${encodeURIComponent(id)}`, { method: 'PUT', body }); CMS.data[col][id] = Object.assign({}, body, { id }); scheduleApply(); return; }
  if (CMS.mode === 'db') { await CMS.db.doc(`cms/site/${col}/${id}`).set(body); return; }
  if (CMS.mode !== 'local') throw { code: 'not_granted' };
  const prev = CMS.data[col][id]; CMS.data[col][id] = Object.assign({}, body, { id });
  if (!cmsLocalSave()) { if (prev) CMS.data[col][id] = prev; else delete CMS.data[col][id]; throw { code: 'quota_exceeded' }; }
  scheduleApply();
}
async function cmsDelete(col, id) {
  if (CMS.mode === 'api') { await apiCall(`/cms/${col}/${encodeURIComponent(id)}`, { method: 'DELETE' }); delete CMS.data[col][id]; scheduleApply(); return; }
  if (CMS.mode === 'db') { await CMS.db.doc(`cms/site/${col}/${id}`).delete(); return; }
  delete CMS.data[col][id]; cmsLocalSave(); scheduleApply();
}
const stamp = () => ({ updatedAt: new Date().toISOString(), by: CMS.uid || 'local' });
async function cmsSave(col, id, data, title, action) { await cmsWrite(col, id, Object.assign(cleanBody(data), { id }, stamp())); cmsLog(action || 'update', col, id, title); }
async function cmsRemove(col, id, title) { if (isDefaultId(col, id)) await cmsWrite(col, id, Object.assign({ id, deleted: true }, stamp())); else await cmsDelete(col, id); cmsLog('delete', col, id, title); }
async function cmsRevert(col, id, title) { await cmsDelete(col, id); cmsLog('revert', col, id, title); }
async function cmsLog(action, col, id, title) {
  const e = Object.assign({ at: new Date().toISOString(), action, col, id, title: String(title || '').slice(0, 140) }, { by: CMS.uid || 'local' });
  try { if (CMS.mode === 'api') { CMS.log.unshift(e); await apiCall('/cms-log', { method: 'POST', body: e }); } else if (CMS.mode === 'db') await CMS.db.collection('cms/site/log').add(e); else { CMS.log.unshift(e); cmsLocalSave(); } } catch (er) { /* activity log is best-effort */ }
}
function cmsErr(e) {
  const c = e && e.code;
  if (c === 'quota_exceeded') return L(['Хадгалах багтаамж дүүрсэн байна', 'Storage is full']);
  if (c === 'unauthorized') return L(['Нэвтрэх хугацаа дууссан. Дахин нэвтэрнэ үү.', 'Your session expired. Sign in again.']);
  if (c === 'too_large') return L(['Өгөгдөл хэт том байна', 'The data is too large']);
  if (c === 'invalid_argument') return L(['Хадгалах эрх байхгүй эсвэл өгөгдөл хэт том байна', 'No permission, or the data is too large']);
  return L(['Хадгалж чадсангүй. Дахин оролдоно уу.', "Couldn't save. Try again."]);
}
