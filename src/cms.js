/* ================= CMS data layer =================
   Built-in content is the default; edits live in an overlay that is either the
   artifact's shared db (cms/site/<collection>/<id>, admin-only writes, live for
   every signed-in viewer) or, outside claude.ai, this browser's storage. */
const CMS_COLS = ['news', 'alerts', 'events', 'projects', 'services', 'texts', 'settings', 'media'];
const cloneJ = (x) => JSON.parse(JSON.stringify(x));
const DEF = {
  news: NEWS.map((n) => { const c = cloneJ(n); delete c.ts; delete c.ago; return c; }),
  alerts: cloneJ(ALERTS), events: cloneJ(EVENTS), projects: cloneJ(PROJECTS), services: cloneJ(ALL_SVC), texts: cloneJ(I),
  settings: { heroId: HERO_ID, featuredId: FEATURED_ID, gov: GOV.slice(), tickerOn: true },
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
  ALERTS.splice(0, ALERTS.length, ...mergedItems('alerts').filter((a) => !a.off));
  EVENTS.splice(0, EVENTS.length, ...mergedItems('events').map((e) => { if (!ECAT[e.c]) e.c = 'civic'; e.x = Math.max(5, Math.min(995, +e.x || 560)); e.y = Math.max(5, Math.min(615, +e.y || 285)); if (e.date) e.w = dayOffset(e.date); return e; }));
  PROJECTS.splice(0, PROJECTS.length, ...mergedItems('projects').map((p) => Object.assign(p, { p: Math.max(0, Math.min(100, +p.p || 0)), c: PCAT[p.c] ? p.c : 'transport', x: Math.max(5, Math.min(995, +p.x || 560)), y: Math.max(5, Math.min(615, +p.y || 300)), bud: +p.bud || 0 })));
  const svc = mergedItems('services').map((s) => Object.assign(s, { g: ['citizen', 'business', 'esys'].includes(s.g) ? s.g : 'citizen', m: ['on', 'off', 'sys'].includes(s.m) ? s.m : 'on' }));
  ALL_SVC.splice(0, ALL_SVC.length, ...svc);
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
}

async function initCMS() {
  const hasRuntime = !!(window.claude && typeof window.claude.use === 'function');
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
  if (CMS.mode === 'db') { await CMS.db.doc(`cms/site/${col}/${id}`).set(body); return; }
  if (CMS.mode !== 'local') throw { code: 'not_granted' };
  const prev = CMS.data[col][id]; CMS.data[col][id] = Object.assign({}, body, { id });
  if (!cmsLocalSave()) { if (prev) CMS.data[col][id] = prev; else delete CMS.data[col][id]; throw { code: 'quota_exceeded' }; }
  scheduleApply();
}
async function cmsDelete(col, id) {
  if (CMS.mode === 'db') { await CMS.db.doc(`cms/site/${col}/${id}`).delete(); return; }
  delete CMS.data[col][id]; cmsLocalSave(); scheduleApply();
}
const stamp = () => ({ updatedAt: new Date().toISOString(), by: CMS.uid || 'local' });
async function cmsSave(col, id, data, title, action) { await cmsWrite(col, id, Object.assign(cleanBody(data), { id }, stamp())); cmsLog(action || 'update', col, id, title); }
async function cmsRemove(col, id, title) { if (isDefaultId(col, id)) await cmsWrite(col, id, Object.assign({ id, deleted: true }, stamp())); else await cmsDelete(col, id); cmsLog('delete', col, id, title); }
async function cmsRevert(col, id, title) { await cmsDelete(col, id); cmsLog('revert', col, id, title); }
async function cmsLog(action, col, id, title) {
  const e = Object.assign({ at: new Date().toISOString(), action, col, id, title: String(title || '').slice(0, 140) }, { by: CMS.uid || 'local' });
  try { if (CMS.mode === 'db') await CMS.db.collection('cms/site/log').add(e); else { CMS.log.unshift(e); cmsLocalSave(); } } catch (er) { /* activity log is best-effort */ }
}
function cmsErr(e) {
  const c = e && e.code;
  if (c === 'quota_exceeded') return L(['Хадгалах багтаамж дүүрсэн байна', 'Storage is full']);
  if (c === 'invalid_argument') return L(['Хадгалах эрх байхгүй эсвэл өгөгдөл хэт том байна', 'No permission, or the data is too large']);
  return L(['Хадгалж чадсангүй. Дахин оролдоно уу.', "Couldn't save. Try again."]);
}
