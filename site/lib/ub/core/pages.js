import { closeMenu, renderReact } from './bridge.js';
import { MENU, PRETTY, setHash } from './header.js';
import { $, $$, reduced } from './helpers.js';
import { HOME } from './home.js';
import { MODAL, closeModal } from './modal.js';
import { setRoute } from './router.js';
import { ALL_SVC, EN, L, S, t } from './state.js';
import { clock, fDate, num, pad, ubNow } from './time.js';
import { EVENTS } from '../data/events.js';
import { MEDIA } from '../data/media.js';
import { NEWS } from '../data/news.js';
import { PROJECTS } from '../data/projects.js';
import { SITS } from '../data/services.js';
import { DOCS } from '../data/transparency.js';
import { setEvView } from '../sections/events.js';
import { setHub, setNewsCat, setSvcTab } from '../sections/hub.js';
import { setSit } from '../sections/life-events.js';
import { mpUsd, selectProject } from '../sections/projects.js';
import { setTr } from '../sections/transparency.js';
/* ================= Тусдаа хуудсууд (/news, /services ...) =================
   Нүүр хуудас нь товч танилцуулга (landing). Цэс бүр өөрийн том хуудастай: толгой (#page-hero) + тухайн хэсгийн бүрэн агуулга.
   Нүүрний хэсгүүдийг дахин ашиглаж (secs), бусдыг нь нууна. hide: эхний хэсгийн гарчгийг нууна (толгойтой давхардахгүй). */
export const PAGES = {
  services: { secs: ['hub', 'situations'], mk: 'nav_services', c: '#D81E34', i: 'layout-grid', t: ['Үйлчилгээ', 'Services'], d: ['Иргэн, аж ахуйн нэгжид зориулсан бүх үйлчилгээ, амьдралын нөхцөл бүрт хэрэгтэй алхмууд нэг дор.', 'Every service for residents and businesses, with step-by-step guides for life events.'] },
  news: { secs: ['hub'], mk: 'nav_news', c: '#145095', i: 'newspaper', t: ['Мэдээ мэдээлэл', 'News'], d: ['Нийслэлийн Засаг дарга, дүүрэг, харьяа байгууллагуудын бүх мэдээ, зар мэдээлэл.', 'All news and notices from City Hall, districts and city agencies.'] },
  events: { secs: ['events'], mk: 'nav_news', c: '#E58A00', i: 'calendar-days', hide: 1, t: ['Арга хэмжээ', 'Events'], d: ['Хотод болох соёл, спорт, иргэний арга хэмжээ: жагсаалт, хуанли, газрын зураг.', 'Culture, sport and civic events: list, calendar and map.'] },
  media: { secs: ['media'], mk: 'nav_news', c: '#7C4DFF', i: 'clapperboard', hide: 1, t: ['Медиа', 'Media'], d: ['Нийслэлийн Live дамжуулалт, фото сурвалжилга, постер, подкаст.', 'Live streams, photo reports, posters and podcasts from City Hall.'] },
  projects: { secs: ['projects'], mk: 'nav_build', c: '#F08C1A', i: 'hard-hat', hide: 1, tk: 'nav_build', t: ['Бүтээн байгуулалт', 'Development'], d: ['Нийслэлийн 24 мега төслийн явцын мэдээ, гүйцэтгэлийг газрын зураг дээрээс хянаарай. Эх сурвалж: ulaanbaatar.mn', 'Progress updates on the 24 flagship projects, on the map. Source: ulaanbaatar.mn'] },
  data: { secs: ['data'], mk: 'nav_data', c: '#0EA068', i: 'activity', hide: 1, dark: 'var(--c-navy)', t: ['Хотын өгөгдөл', 'City data'], d: ['Агаарын чанар, түгжрэл, цаг агаар, хүн ам, төсвийн бодит цагийн самбар.', 'A live dashboard of air quality, traffic, weather, population and budget.'] },
  transparency: { secs: ['transparency'], mk: 'nav_open', c: '#0E9AA7', i: 'scroll-text', hide: 1, t: ['Ил тод байдал', 'Transparency'], d: ['Нийслэлийн ИТХ-ын тогтоол, Засаг даргын захирамж, тендерийн мэдээлэл нээлттэй.', "City Council resolutions, the Governor's orders and tenders, in the open."] },
  about: { secs: ['gov', 'about'], mk: 'nav_about', c: '#D81E34', i: 'landmark', t: ['Хотын тухай', 'About the city'], d: ['Нийслэлийн Засаг даргын ажлын хуваарь, хотын удирдлага, түүх, харьяа байгууллагууд.', "The Governor's schedule, city leadership, history and agencies."] },
};
export const PAGE_ONLY = ['about'];   // нүүрэнд харагдахгүй, зөвхөн өөрийн хуудсанд (template.html-д hidden)
export const pgMenu = (P) => P && MENU.find((m) => m.k === P.mk);   // хуудасны цэс (байрлалаар биш түлхүүрээр)
/* Хуудасны гарчиг: tk бол цэсний нэртэй ижил (жишээ нь «24 мега төсөл») */
export const pgT = (P) => (P.tk ? t(P.tk, { n: PROJECTS.length }) : L(P.t));
/* Цэсийн «go» холбоос аль хуудас руу очих вэ (нүүрний hero бол null) */
export function pageOf(o) {
  if (!o || !o.sec || o.sec === 'hero') return null;
  if (o.sec === 'hub') return o.hub === 'services' ? 'services' : o.hub === 'events' ? 'events' : 'news';
  const k = { situations: 'services', gov: 'about' }[o.sec] || o.sec;
  return PAGES[k] ? k : null;
}
export const pageHref = (k) => (PRETTY ? '/' + k : '#/' + k);
export function urlPage() {
  const m = PRETTY ? location.pathname.match(/^\/([a-z]+)\/?$/) : (location.hash || '').match(/^#\/([a-z]+)$/);
  return m && PAGES[m[1]] ? m[1] : null;
}
export function openPage(k, o = {}) {
  if (!PAGES[k]) return;
  closeMenu(); if (MODAL) closeModal(true);
  const nav = $('#navbar'); if (nav && nav._close) nav._close();
  const same = S.route === 'page' && S.page === k;
  if (k === 'services') S.hub = 'services'; else if (k === 'news') S.hub = 'news';
  const nt = o.nt || (o.cat ? 'all' : null), cat = o.cat || (o.nt ? 'all' : null);   // цэсний мэдээний төрөл ба ангилал нэг нэгнээ дахин эхлүүлнэ
  if (same) {   // хуудсан дотроо: зөвхөн төлөвийг хөдөлгөөнтэй солино
    if ((cat && cat !== S.newsCat) || (nt && nt !== S.newsType)) { if (nt) S.newsType = nt; setNewsCat(cat || S.newsCat); }
    if (o.svc && o.svc !== S.svcTab) setSvcTab(o.svc);
    if (o.sit && o.sit !== S.sit) setSit(o.sit);
    if (o.tr && o.tr !== S.tr) setTr(o.tr);
    renderPageLinks();
  } else {
    S.newsCat = cat || (k === 'news' ? 'all' : S.newsCat);
    if (k === 'news') S.newsType = nt || 'all';
    if (o.svc) { S.svcTab = o.svc; S.svcQ = ''; }
    if (o.sit) S.sit = o.sit;
    if (o.tr) S.tr = o.tr;
    S.newsN = 12; S.newsQ = ''; S.mediaQ = ''; S.mediaN = 12;
    if (S.route === 'home') S.homeY = window.scrollY;
    S.page = k; setRoute('page');
  }
  const sub = k === 'services' && o.sec === 'situations' ? 'situations' : k === 'about' && o.sec === 'about' && !o.hl ? 'about' : null, wait = same ? 0 : 380;
  if (sub) setTimeout(() => scrollToSec(sub), wait);
  else if (same && !o.hl && !o.pid && !o.ev) window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  if (o.pid) setTimeout(() => selectProject(o.pid, true), wait + 140);
  if (o.ev) setTimeout(() => { if (S.evView !== 'list') setEvView('list'); setTimeout(() => flashEl($(`[data-evcard="${o.ev}"]`)), 420); }, wait + 140);
  if (o.hl) setTimeout(() => { const el = $(`[data-card="${o.hl}"]`); if (el) { el.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' }); setTimeout(() => flashEl(el), 420); } }, wait + 140);
  if (o.focus === 'map') setTimeout(() => { const m = $('#proj-map .map-vp'); if (m) m.focus({ preventScroll: true }); }, wait + 220);
}
/* Нүүр ↔ хуудас: хэсгүүдийг харуулах/нуух */
export function pageView(on) {
  const home = $('#view-home'), P = on && PAGES[S.page];
  home.classList.toggle('page-mode', !!P); home.classList.toggle('pg-hide', !!(P && P.hide)); home.classList.toggle('pg-dark', !!(P && P.dark));
  $$(':scope > section', home).forEach((s) => {
    s.hidden = P ? !(s.id === 'page-hero' || P.secs.includes(s.id)) : s.id === 'page-hero' || PAGE_ONLY.includes(s.id);
    s.classList.toggle('pg-first', !!P && s.id === P.secs[0]);
  });
}
/* Хуудасны толгойн 3 тоо: [утга, шошго, data-live түлхүүр (5 секунд тутам шинэчлэгддэг бол)] */
export function pageStats(k) {
  const n = (v) => (typeof v === 'number' ? num(v) : v);
  const st = {
    news: () => [[NEWS.filter((x) => !x.draft).length, L(['мэдээ', 'stories'])], [NEWS.filter((x) => x.ago < 1440).length, L(['өнөөдөр', 'today'])], [NEWS.filter((x) => x.zar || x.cat === 'zar').length, L(['зар', 'notices'])]],
    services: () => [[ALL_SVC.length, L(['үйлчилгээ', 'services'])], [ALL_SVC.filter((s) => s.m === 'on').length, L(['онлайнаар', 'online'])], [SITS.length, L(['амьдралын нөхцөл', 'life events'])]],
    events: () => [[EVENTS.length, L(['арга хэмжээ', 'events'])], [EVENTS.filter((e) => e.w >= 0 && e.w < 7).length, L(['энэ 7 хоногт', 'this week'])], [EVENTS.filter((e) => !e.price).length, L(['үнэгүй', 'free'])]],
    media: () => [[MEDIA.filter((m) => m.type === 'live').length, 'Live'], [MEDIA.filter((m) => m.type === 'photo').length, L(['фото сурвалжилга', 'photo reports'])], [MEDIA.filter((m) => m.type === 'poster').length, L(['постер', 'posters'])]],
    projects: () => PROJECTS.some((p) => p.live) ? [[PROJECTS.length, L(['мега төсөл', 'projects'])], PROJECTS.some((p) => p.budUsd != null) ? [mpUsd(PROJECTS.reduce((a, p) => a + (p.ipOwn && p.budUsd ? p.budUsd : 0), 0)), L(['нийт төсөв', 'total budget'])] : [PROJECTS.reduce((a, p) => a + (p.ups || []).length, 0), L(['явцын мэдээ', 'updates'])], [PROJECTS.reduce((a, p) => a + (p.ups || []).length, 0), L(['явцын мэдээ', 'updates'])]]
      : [[PROJECTS.length, L(['мега төсөл', 'projects'])], [Math.round(PROJECTS.reduce((a, p) => a + (+p.p || 0), 0) / Math.max(1, PROJECTS.length)) + '%', L(['дундаж гүйцэтгэл', 'avg. progress'])], [PROJECTS.filter((p) => +p.p >= 100).length, L(['ашиглалтад орсон', 'completed'])]],
    data: () => [[S.aqi, 'AQI', 'aqi'], [S.temp + '°', L(['агаарын хэм', 'temperature'])], [S.traffic + '/10', L(['түгжрэл', 'congestion'])]],
    transparency: () => [[(DOCS.res || []).length, L(['тогтоол', 'resolutions'])], [(DOCS.ord || []).length, L(['захирамж', 'orders'])], [(DOCS.tender || []).length, L(['тендер', 'tenders'])]],
    about: () => [['1639', L(['онд үүссэн', 'founded'])], [EN() ? '4,704' : '4 704', L(['км² нутаг', 'km² area'])], ['9', L(['дүүрэг', 'districts'])]],
  }[k];
  return st ? st().map(([v, l, live]) => ({ v: String(n(v)), l, live: live || '' })) : [];
}
/* Хуудасны цэсийн холбоосууд (толгойн доод мөр). on: идэвхтэй эсэх */
export function pageLinks() {
  const P = PAGES[S.page], m = pgMenu(P); if (!m) return [];
  // идэвхтэй холбоос: тодорхой төлөвтэй (cat/tr/svc) нь таарвал түүнийг, үгүй бол энэ хуудас руу очих эхний холбоос
  const spec = (g) => g.cat || g.nt || g.tr || g.svc;
  const hit = (g) => (!g.cat || g.cat === S.newsCat) && (!g.nt || g.nt === S.newsType) && (!g.tr || g.tr === S.tr) && (!g.svc || g.svc === S.svcTab);
  const mine = m.items.map((it, k) => [it, k]).filter(([it]) => !it.href && pageOf(it.go) === S.page);
  const on = (mine.find(([it]) => spec(it.go) && hit(it.go)) || mine.find(([it]) => !spec(it.go)) || [])[1];
  return m.items.map((it, k) => ({ i: it.i, t: L(it.t), d: L(it.d) || '', href: it.href || '', go: it.href ? null : it.go || { sec: 'hero' }, on: k === on }));
}
/* Улаанбаатарын нар мандах/жаргах цаг (NOAA-ийн хялбаршуулсан томъёо; 47.92°N, 106.92°E, UTC+8). Буцаах: [мандах, жаргах] минутаар */
export function sunTimes(d = ubNow()) {
  const lat = 47.92, lon = 106.92, R = Math.PI / 180;
  const n = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(d.getFullYear(), 0, 0)) / 864e5), g = (2 * Math.PI / 365) * (n - 1);
  const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const dec = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const ha = Math.acos(Math.cos(90.833 * R) / (Math.cos(lat * R) * Math.cos(dec)) - Math.tan(lat * R) * Math.tan(dec)) / R;
  return [720 - 4 * (lon + ha) - eq + 480, 720 - 4 * (lon - ha) - eq + 480];
}
/* «Хотын өгөгдөл» хуудасны толгой: өдрийн нарны нум (нар одоо хаана явааг харуулна). features/weather.js минут тутам renderReact() дуудна. */
export function dataSun() {
  const d = ubNow(), [rise, set] = sunTimes(d), m = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
  const up = m >= rise && m <= set, k = Math.min(1, Math.max(0, (m - rise) / (set - rise)));
  const P0 = [12, 66], P1 = [130, -26], P2 = [248, 66], q = (a, b, c) => (1 - k) * (1 - k) * a + 2 * (1 - k) * k * b + k * k * c;
  const hm = (v) => pad(Math.floor(v / 60)) + ':' + pad(Math.round(v % 60) % 60);
  const dur = (v) => { const h = Math.floor(v / 60), mm = Math.round(v % 60) % 60; return L([(h ? h + ' ц ' : '') + mm + ' мин', (h ? h + ' h ' : '') + mm + ' min']); };
  return {
    up, done: (k * 100).toFixed(1), x: q(P0[0], P1[0], P2[0]).toFixed(1), y: q(P0[1], P1[1], P2[1]).toFixed(1), rise: hm(rise), set: hm(set),
    mid: up ? L(['Нар жаргахад ', 'Sunset in ']) + dur(set - m) : L(['Өдрийн урт ', 'Daylight ']) + dur(set - rise),
  };
}
/* Хуудасны цэсийн холбоосыг шинэчлэх (hub.js, transparency.js ... төлөв солиход дуудна): толгойг React дахин зурна */
export function renderPageLinks() { renderReact(); }
/* Тусдаа хуудасны толгойг (#page-hero) site/app/home/PageHero.tsx зурна. Энэ функц түүнд хэрэгтэй өгөгдлийг (сонгосон хэлээр) бэлдэнэ. */
export function pageHeroData() {
  const P = S.route === 'page' && PAGES[S.page]; if (!P) return null;
  const m = pgMenu(P), top = m && pageOf({ sec: m.sec });
  const isData = S.page === 'data';
  return {
    k: S.page, c: P.c, i: P.i, dark: P.dark ? `rgb(${P.dark})` : '',   // бараан хэсэгтэй хуудсанд толгой нь тэр дэвсгэртэйгээ нэг үргэлжилнэ
    home: t('home'), crumbLabel: L(['Байршил', 'Breadcrumb']),
    top: top && top !== S.page ? { k: top, label: m.lbl && L(m.lbl) ? L(m.lbl) : m.k ? t(m.k, { n: PROJECTS.length }) : '' } : null,
    title: pgT(P), desc: L(P.d),
    stats: isData ? [] : pageStats(S.page),
    clock: isData ? { live: L(['Шууд', 'Live']), date: fDate(ubNow(), true), time: clock(true), sun: dataSun() } : null,
    links: pageLinks(),
  };
}
HOME.pageHero = pageHeroData;
export function headerOffset() { const nav = $('#hdr-nav'), band = $('#hdr-band'); const h = innerWidth >= 1024 ? (nav ? nav.offsetHeight : 60) : (band ? band.offsetHeight : 56); return h + 14; }
export function scrollToSec(id) {
  const el = document.getElementById(id); if (!el) return;
  const y = id === 'hero' ? 0 : el.getBoundingClientRect().top + window.scrollY - headerOffset();
  window.scrollTo({ top: Math.max(0, y), behavior: reduced ? 'auto' : 'smooth' });
}
export function go(o) {
  closeMenu();
  if (MODAL) closeModal(true);
  const nav = $('#navbar'); if (nav && nav._close) nav._close();
  const pk = pageOf(o); if (pk) { openPage(pk, o); return; }   // цэсний хэсэг бүр өөрийн хуудастай
  if (S.route !== 'home') setRoute('home');
  if (o.hub && o.hub !== S.hub) { if (o.svc) S.svcTab = o.svc; if (o.cat) S.newsCat = o.cat; setHub(o.hub); }
  else { if (o.svc && o.svc !== S.svcTab) setSvcTab(o.svc); if (o.cat && o.cat !== S.newsCat) setNewsCat(o.cat); }
  if (o.sit && o.sit !== S.sit) setSit(o.sit);
  if (o.tr && o.tr !== S.tr) setTr(o.tr);
  scrollToSec(o.sec || 'hero'); setHash(o.sec || 'hero');
  if (o.pid) setTimeout(() => selectProject(o.pid, true), 520);
  if (o.ev) setTimeout(() => { if (S.evView !== 'list') setEvView('list'); setTimeout(() => flashEl($(`[data-evcard="${o.ev}"]`)), 420); }, 520);
  if (o.hl) setTimeout(() => flashEl($(`[data-card="${o.hl}"]`)), 680);
  if (o.focus === 'map') setTimeout(() => { const m = $('#proj-map .map-vp'); if (m) m.focus({ preventScroll: true }); }, 650);
}
export function flashEl(el) { if (!el) return; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
