import { Scene } from '../art/scene.js';
import { closeMenu, renderReact } from '../core/bridge.js';
import { MENU, PRETTY, newsHref, newsUrl, urlNewsId } from '../core/header.js';
import { HOME } from '../core/home.js';
import { MODAL, closeModal } from '../core/modal.js';
import { pageOf, urlPage } from '../core/pages.js';
import { setRoute } from '../core/router.js';
import { EN, L, NEWS_BY, S, t } from '../core/state.js';
import { Lf, ago, fDate, hhmm, num } from '../core/time.js';
import { NEWS, NEWS_SRC, RUB } from '../data/news.js';
import { PROJECTS } from '../data/projects.js';
import { newsProgress, renderSeason } from './season.js';
import { newsCard } from '../sections/hub.js';
/* ================= Мэдээ унших хуудас, 404 =================
   Харагдацыг React зурна: site/app/views/NewsView.tsx (#view-news), site/app/views/NotFoundView.tsx (#view-404).
   Өгөгдөл: newsPageData() (HOME.newsPage), notFoundData() (HOME.notFound). Товчнуудыг (news, news-back, nfb, print, copy-link ...) features/wiring.js барина. */
/* Мэдээний доорх «дараагийн алхам» товч: data-act + data-* атрибутууд */
export function newsAction(n) {
  const b = (act, icon, label, extra = {}) => ({ icon, label, attrs: Object.assign({ 'data-act': act }, extra) });
  if (n.act === 'biz') return b('go', 'briefcase', L(['Бизнес эхлүүлэх алхмууд', 'Steps to start a business']), { 'data-sec': 'situations', 'data-sit': 'business' });
  if (n.act === 'map') return b('go', 'map-pinned', t('showOnMap'), { 'data-sec': 'projects', 'data-pid': String(n.pid) });
  if (n.act === 'events') return b('go', 'calendar-days', t('allEvents'), { 'data-sec': 'events' });
  if (n.act === 'data') return b('go', 'activity', t('nav_data'), { 'data-sec': 'data', 'data-hl': 'aqi' });
  if (n.act === 'tr') return b('go', 'scroll-text', t('nav_open'), { 'data-sec': 'transparency' });
  if (n.act === 'idea') return b('vote', 'message-square-plus', t('cta_vote'), { 'data-tab': 'idea', 'data-topic': 'plan' });
  if (n.act === 'poll') return b('vote', 'vote', t('vPoll'), { 'data-tab': 'poll' });
  return null;
}
/* ---- Мэдээний дэлгэрэнгүй хуудас (/news/<id>, сервергүй үед #news/<id>) ---- */
export function openNews(id) {
  if (!NEWS_BY[id]) return;
  if (MODAL) closeModal(true);
  closeMenu();
  if (S.route === 'home') S.homeY = window.scrollY;
  if (S.route === 'page') { S.pageY = window.scrollY; S.pageFor = S.page; }
  S.newsId = id; S.newsFb = false;
  try { if ((PRETTY ? location.pathname : location.hash) !== newsHref(id)) history.pushState({ ubNews: 1 }, '', newsHref(id)); } catch (e) { /* ignore */ }
  setRoute('news');
}
export function newsBack() {
  if (history.state && history.state.ubNews) history.back(); else setRoute('home');
}
/* Хөтчийн «Буцах», «Урагшлах»: хаягаар нь хуудсаа нээнэ (init() дуудна) */
export function watchHistory() {
  window.addEventListener('popstate', () => {
    const id = urlNewsId(), pk = urlPage();
    if (id && NEWS_BY[id]) { S.newsId = id; S.newsFb = false; setRoute('news'); }
    else if (pk) { if (S.route !== 'page' || S.page !== pk) { S.page = pk; if (pk === 'services') S.hub = 'services'; else if (pk === 'news') S.hub = 'news'; setRoute('page'); } }
    else if (/^#admin(\/|$)/.test(location.hash)) openAdmin(location.hash.slice(7));
    else if (PRETTY && !/^\/(index\.html)?$/.test(location.pathname)) { if (S.route !== '404') setRoute('404'); }
    else if (S.route === 'news' || S.route === 'page' || S.route === '404') setRoute('home');
  });
}
/* Admin (/admin, тусдаа төсөл) руу шилжинэ. view: «news» эсвэл «news/n123» (тэр мэдээг засахаар нээнэ) */
export function openAdmin(view) { location.href = '/admin/' + (view ? '#' + view : ''); }
/* ---- 404 «Хуудас олдсонгүй»: сервер <meta name="ubmn-404"> гэж тэмдэглэсэн, эсвэл мэдээ олдоогүй үед.
   setRoute('404') / хэл солиход (renderAll) дуудна: React (NotFoundView) шинэ төлөвөөр дахин зурна. */
export function render404() { renderReact(); }
export function notFoundData() {
  let path = location.pathname;
  try { path = decodeURI(path); } catch (e) { /* ignore */ }
  return {
    scene: Scene('skyline:dusk:44'), path,
    links: MENU.map((m) => [pageOf({ sec: m.sec }), m]).filter(([k]) => k).map(([k, m]) => ({ k, label: m.lbl && L(m.lbl) ? L(m.lbl) : m.k ? t(m.k, { n: PROJECTS.length }) : '' })),
  };
}
HOME.notFound = notFoundData;
export function newsMins(n) {
  if (n.mins) return n.mins;
  const words = [n.l].concat(n.b || []).map((x) => L(x) || '').join(' ').split(/\s+/).length;
  return Math.max(1, Math.round(words / 180));
}
/* setRoute('news') / хэл солиход (renderAll) дуудна: гарчиг, React (NewsView) дахин зурах, уншилтын явц, улирлын эффект */
export function renderNewsPage() {
  const n = NEWS_BY[S.newsId];
  if (!n) { setRoute('home'); return; }
  document.title = L(n.t) + ' · ulaanbaatar.mn';
  renderReact();
  newsProgress();
  renderSeason(true);
}
/* React-д (site/app/views/NewsView.tsx): S.newsId мэдээг сонгосон хэлээр бэлэн текст болгоно. Мэдээ олдохгүй бол null. */
export function newsPageData() {
  const n = NEWS_BY[S.newsId];
  if (!n) return null;
  const r = RUB[n.cat] || RUB.city;
  const list = NEWS.slice().sort((a, b) => a.ago - b.ago);
  const idx = list.findIndex((x) => x.id === n.id);
  const newer = idx > 0 ? list[idx - 1] : null, older = idx >= 0 ? list[idx + 1] : null;
  const rel = (n.rel || NEWS.filter((x) => x.cat === n.cat && x.id !== n.id).slice(0, 3).map((x) => x.id)).map((x) => NEWS_BY[x]).filter(Boolean);
  const top = NEWS.filter((x) => x.id !== n.id && !x.zar).sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  const latest = list.filter((x) => x.id !== n.id && !rel.includes(x)).slice(0, 4);
  const enOnlyMn = EN() && n.live;   // бодит мэдээний бүтэн текст зөвхөн монголоор байдаг
  const paras = (enOnlyMn ? (n.sumEn || []).map((x) => [x, x]) : (n.b || [])).map((p) => Lf(p));
  const url = encodeURIComponent(newsUrl(n));
  const side = (x) => ({ id: x.id, title: L(x.t), ago: ago(x.ago || 0), views: num(x.views || 0), scene: x.img ? Scene(x.img) : '' });
  const nav = (x) => (x ? { id: x.id, title: L(x.t) } : null);
  return {
    id: n.id, cat: n.cat, title: L(n.t), lead: Lf(n.l), rub: L(r.t), rubColor: r.c, br: !!n.br, zar: n.zar ? L(RUB.zar.t) : '',
    when: n.ts ? fDate(n.ts, true) + ', ' + hhmm(n.ts) : ago(n.ago || 0), mins: String(newsMins(n)), views: num(n.views || 0),
    img: n.img ? Scene(n.img) : '', photo: /^(assets|https:)/.test(n.img || ''),
    enOnlyMn: !!enOnlyMn, sumEn: !!(n.sumEn && n.sumEn.length),
    // Эхний догол мөр: онцлох оршил (standfirst), бусад нь үндсэн текст. Ганц догол мөртэй бол энгийн текст.
    intro: paras.length > 1 ? paras[0] : '', paras: paras.length > 1 ? paras.slice(1) : paras,
    action: newsAction(n),
    src: n.d ? { live: !!n.live, href: NEWS_SRC + n.id.slice(1) } : null,
    fb: !!S.newsFb,
    share: { fb: 'https://www.facebook.com/sharer/sharer.php?u=' + url, x: 'https://x.com/intent/post?url=' + url + '&text=' + encodeURIComponent(L(n.t)) },
    older: nav(older), newer: nav(newer),
    top: top.map(side), latest: latest.map(side),
    rel: rel.map((x) => newsCard(x, false)),
  };
}
HOME.newsPage = newsPageData;
