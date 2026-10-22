import { closeMenu, renderReact } from './bridge.js';
import { $, store } from './helpers.js';
import { HOME } from './home.js';
import { closeModal, openModal } from './modal.js';
import { go } from './pages.js';
import { setRoute } from './router.js';
import { ALL_SVC, L, t } from './state.js';
import { evDate, fDate, fill } from './time.js';
import { EVENTS } from '../data/events.js';
import { NEWS, RUB } from '../data/news.js';
import { PCAT, PROJECTS } from '../data/projects.js';
import { SITS } from '../data/services.js';
import { toggleChat } from '../features/assistant.js';
import { openReport, openVote } from '../features/forms.js';
import { openNews } from '../features/news-reader.js';
import { openService } from '../features/services.js';
/* ================= Search (command palette) ================= */
export let SQ = { q: '', idx: 0, items: [], scope: 'all', n: 0 };   // n: дахин зурах тоолуур (хөдөлгөөн)
export const SQ_SCOPES = [['all', ['Бүгд', 'All'], 'search'], ['svc', ['Үйлчилгээ', 'Services'], 'layout-grid'], ['sit', ['Амьдралын нөхцөл', 'Life events'], 'route'], ['news', ['Мэдээ', 'News'], 'newspaper'], ['proj', ['Төсөл', 'Projects'], 'hard-hat'], ['ev', ['Арга хэмжээ', 'Events'], 'calendar-days']];
export const SQ_TYPE = { act: ['bg-ubred/10 text-ubred', ['Шуурхай үйлдэл', 'Quick actions']], svc: ['bg-ubblue/10 text-ubblue', ['Үйлчилгээ', 'Services']], sit: ['bg-ubred/10 text-ubred', ['Амьдралын нөхцөл', 'Life events']], news: ['bg-ubamber/15 text-amberink', ['Мэдээ', 'News']], proj: ['bg-ubgreen/15 text-greenink', ['Төсөл', 'Projects']], ev: ['bg-soft text-ink', ['Арга хэмжээ', 'Events']] };
export const SQ_ACTS = [['report', ['Эрсдэл мэдээлэх', 'Report a hazard'], 'siren', 'эрсдэл мэдээлэх нүх эвдрэл гэрэлтүүлэг хог гоожсон аюул report hazard pothole'], ['vote', ['Санал өгөх', 'Have your say'], 'vote', 'санал асуулга хүсэлт vote poll suggestion'], ['my', ['Миний булан', 'My page'], 'circle-user-round', 'миний булан хүсэлт төлбөр хороо my page requests payments'], ['chat', ['AI туслахаас асуух', 'Ask the AI assistant'], 'sparkles', 'ai туслах асуух чат chat assistant help'], ['data', ['Агаарын чанар, түгжрэл', 'Air quality and traffic'], 'activity', 'агаар aqi утаа түгжрэл цаг агаар air traffic weather']];
export const SQ_POP = [['Хүүхдийн мөнгө', 'Child benefit'], ['Халуун ус', 'Hot water'], ['Тендер', 'Tender'], ['Цэцэрлэг', 'Kindergarten'], ['Дүүжин зам', 'Cable car']];
export function searchIndex() {
  const out = [];
  SQ_ACTS.forEach(([id, tt, i, kw]) => out.push({ type: 'act', id, t: tt, m: kw, sub: L(['Шуурхай үйлдэл', 'Quick action']), i }));
  ALL_SVC.forEach((s) => out.push({ type: 'svc', id: s.id, t: s.t, m: s.d[0] + ' ' + s.d[1], sub: L(s.d), i: s.i }));
  SITS.forEach((s) => out.push({ type: 'sit', id: s.id, t: s.t, m: s.steps.map((x) => x.t[0] + ' ' + x.t[1]).join(' '), sub: t('stepsN', { n: s.steps.length }), i: s.i }));
  NEWS.forEach((n) => out.push({ type: 'news', id: n.id, t: n.t, m: fill(n.l[0]) + ' ' + (n.l[1] || ''), sub: `${L((RUB[n.cat] || RUB.city).t)}${n.ts ? ', ' + fDate(n.ts) : ''}`, i: n.zar ? 'megaphone' : 'newspaper' }));
  PROJECTS.forEach((p) => out.push({ type: 'proj', id: p.id, t: p.n, m: PCAT[p.c].t[0] + ' ' + PCAT[p.c].t[1], sub: `${L(PCAT[p.c].t)}${p.p != null ? ', ' + p.p + '%' : ''}`, i: PCAT[p.c].i }));
  EVENTS.forEach((e) => out.push({ type: 'ev', id: e.id, t: e.t, m: e.v[0] + ' ' + e.v[1], sub: `${fDate(evDate(e.w), true)}, ${L(e.v)}`, i: 'calendar-days' }));
  return out;
}
export function searchResults(q) {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean); if (!words.length) return [];
  const order = ['act', 'svc', 'sit', 'news', 'proj', 'ev'];
  return searchIndex().map((x) => {
    const title = (x.t[0] + ' ' + x.t[1]).toLowerCase(), hay = title + ' ' + String(x.m).toLowerCase();
    if (!words.every((w) => hay.includes(w))) return null;
    const lt = L(x.t).toLowerCase(); x.score = (lt.startsWith(words[0]) ? 3 : 0) + (words.every((w) => title.includes(w)) ? 2 : 0); return x;
  }).filter(Boolean).sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type) || b.score - a.score);
}
/* Хайлтын үгийг тодруулах: [хэсэг, тодруулсан эсэх][] (site/app/modals/Search.tsx <mark class="sq-mark">) */
export function sqParts(text, q) {
  const s = String(text), low = s.toLowerCase(), marks = [];
  q.trim().toLowerCase().split(/\s+/).filter(Boolean).forEach((w) => { let i = low.indexOf(w); while (i >= 0) { marks.push([i, i + w.length]); i = low.indexOf(w, i + w.length); } });
  if (!marks.length) return [[s, false]];
  marks.sort((a, b) => a[0] - b[0]); const mm = [];
  marks.forEach((m) => { const last = mm[mm.length - 1]; if (last && m[0] <= last[1]) last[1] = Math.max(last[1], m[1]); else mm.push(m.slice()); });
  const out = []; let pos = 0;
  mm.forEach(([a, b]) => { if (a > pos) out.push([s.slice(pos, a), false]); out.push([s.slice(a, b), true]); pos = b; });
  if (pos < s.length) out.push([s.slice(pos), false]);
  return out;
}
export const sqRecent = () => store.get('recentQ', []);
export function sqAddRecent(q) { q = String(q || '').trim(); if (q.length < 2) return; store.set('recentQ', [q].concat(sqRecent().filter((x) => x !== q)).slice(0, 5)); }
/* Хайлтын цонхны өгөгдөл (site/app/modals/Search.tsx): SQ төлөвөөс сонгосон хэлээр. SQ.items-ийг (гараар сонгох, Enter) энд шинэчилнэ. */
export function searchData() {
  const q = SQ.q.trim(), all = q ? searchResults(q) : [], cnt = {};
  all.forEach((x) => { cnt[x.type] = (cnt[x.type] || 0) + 1; });
  const d = {
    q: SQ.q, idx: SQ.idx, n: SQ.n, ph: t('searchPh'), label: t('search'), close: t('close'),
    scopes: SQ_SCOPES.map(([v, l, i]) => ({ v, i, label: L(l), on: SQ.scope === v, n: q ? String(v === 'all' ? all.length : cnt[v] || 0) : '' })),
    home: null, groups: [], none: null,
  };
  if (!q) {
    SQ.items = [];
    const top = ['c2', 'c3', 'c4', 'c8'].map((id) => ALL_SVC.find((s) => s.id === id)).filter(Boolean);
    d.home = {
      recent: sqRecent(),
      top: top.map((s) => ({ id: s.id, i: s.i, title: L(s.t), mode: s.m === 'off' ? t('inperson') : s.m === 'sys' ? t('system') : t('online') })),
      pop: SQ_POP.map((p) => L(p)),
      acts: SQ_ACTS.slice(0, 4).map(([v, l, i]) => ({ v, i, label: L(l) })),
    };
    return d;
  }
  const list = (SQ.scope === 'all' ? all : all.filter((x) => x.type === SQ.scope)).slice(0, 24);
  SQ.items = list; if (SQ.idx >= list.length) SQ.idx = 0;
  d.idx = SQ.idx;
  if (!list.length) {
    d.none = {
      title: L([`«${q}» гэсэн хайлтаар илэрц олдсонгүй`, `No results for "${q}"`]),
      hint: all.length && SQ.scope !== 'all' ? L(['Бусад ангилалд илэрц байна, «Бүгд»-ийг сонгоно уу.', 'There are matches in other categories; choose "All".']) : L(['Өөр үгээр хайх эсвэл AI туслахаас асууж болно.', 'Try other words, or ask the AI assistant.']),
    };
    return d;
  }
  list.forEach((x, k) => {
    let g = d.groups[d.groups.length - 1];
    if (!g || g.type !== x.type) { g = { type: x.type, label: L(SQ_TYPE[x.type][1]), n: cnt[x.type], rows: [] }; d.groups.push(g); }
    g.rows.push({ k, type: x.type, id: String(x.id), i: x.i, cls: SQ_TYPE[x.type][0], title: sqParts(L(x.t), q), sub: sqParts(x.sub, q) });
  });
  return d;
}
HOME.search = searchData;
/** Талбарт бичих (site/app/modals/Search.tsx) */
HOME.searchInput = (v) => { SQ.q = v; SQ.idx = 0; sqRender(); };
/** Хулганаар мөр сонгох */
HOME.searchHover = (k) => { if (k !== SQ.idx) { SQ.idx = k; renderReact(); } };
/* Илэрцийг дахин зурна (features/wiring.js 'sq', 'sq-scope', 'sq-clear' ... дууддаг): мөрүүдийн sq-in хөдөлгөөн дахин тоглож, жагсаалт дээш гүйлгэгдэнэ */
export function sqRender() { SQ.n++; renderReact(); const rs = $('#sres'); if (rs) rs.scrollTop = 0; }
export function sqMove(d) {
  const n = SQ.items.length; if (!n) return;
  SQ.idx = (SQ.idx + d + n) % n; renderReact();
  const cur = $(`#sres [data-k="${SQ.idx}"]`); if (cur) cur.scrollIntoView({ block: 'nearest' });
}
export function openSearch(q = '') {
  closeMenu();
  SQ = { q, idx: 0, items: [], scope: 'all', n: 0 };
  openModal({ size: 'search', top: true, label: t('search'), view: 'Search' });
}
export function sqAct(v) {
  if (v === 'report') openReport(); else if (v === 'vote') openVote(); else if (v === 'my') setRoute('my');
  else if (v === 'chat') toggleChat(true); else go({ sec: 'data', hl: 'aqi' });
}
export function searchGo(type, id) {
  sqAddRecent(SQ.q);
  closeModal(true);
  if (type === 'act') sqAct(id);
  else if (type === 'svc') { const s = ALL_SVC.find((x) => x.id === id); if (!s) return; go({ sec: 'hub', hub: 'services', svc: s.g }); setTimeout(() => openService(id), 450); }
  else if (type === 'sit') go({ sec: 'situations', sit: id });
  else if (type === 'news') openNews(id);
  else if (type === 'proj') go({ sec: 'projects', pid: id });
  else if (type === 'ev') go({ sec: 'events', ev: id });
}

