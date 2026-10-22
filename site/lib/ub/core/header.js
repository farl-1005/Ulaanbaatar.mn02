import { Scene } from '../art/scene.js';
import { $, $$, esc, reduced } from './helpers.js';
import { PAGES } from './pages.js';
import { L, NEWS_BY, S, t } from './state.js';
import { aqiCat, aqiPos, clock } from './time.js';
import { ROADS } from '../data/city-stats.js';
import { HERO_ID, NEWS_SRC } from '../data/news.js';
import { PCAT, PROJECTS } from '../data/projects.js';
import { SITS } from '../data/services.js';
import { projBadge } from '../sections/projects.js';
/* ================= Navigation model ================= */
/* Дараалал: Хотын тухай, Мэдээ, 24 мега төсөл, Үйлчилгээ, Ил тод байдал, Хотын өгөгдөл. id нь admin-ы засварыг (cms menu) байрлалаас үл хамааран холбоно. */
export const MENU = [
  { id: 'menu6', k: 'nav_about', sec: 'about', items: [
    { i: 'info', t: ['Хотын тухай', 'About the city'], d: ['Нийслэлийн товч танилцуулга, үндсэн баримт', 'The capital at a glance'], go: { sec: 'about' } },
    { i: 'network', t: ['Удирдлагын бүтэц', 'How the city is governed'], d: ['ИТХ, Засаг дарга, Тамгын газар, дүүргүүд', 'Council, Governor, City Hall, districts'], go: { sec: 'about', hl: 'leadership' } },
    { i: 'history', t: ['Засаг захиргааны нэрийн түүх', 'A century of city administration'], d: ['1924 оноос хойших нэрийн өөрчлөлт', 'Every name since 1924'], go: { sec: 'about', hl: 'adminhist' } } ] },
  { id: 'menu2', k: 'nav_news', sec: 'hub', items: [
    { i: 'newspaper', t: ['Бүх мэдээ', 'All news'], d: ['Хотын захиргаа, дүүрэг, байгууллагын мэдээ', 'From City Hall, districts and agencies'], go: { sec: 'hub', hub: 'news', cat: 'all', nt: 'all' } },
    { i: 'clock-3', t: ['Цаг үеийн мэдээ', 'Current news'], d: ['Нийслэлийн удирдлага, хотын өдөр тутмын мэдээ', 'Daily news from City Hall'], go: { sec: 'hub', hub: 'news', nt: 'time' } },
    { i: 'building-2', t: ['Харьяа газрын мэдээ', 'Agency news'], d: ['Нийслэлийн харьяа газар, агентлагуудын мэдээ', 'News from city agencies and departments'], go: { sec: 'hub', hub: 'news', nt: 'place' } },
    { i: 'book-open', t: ['Хэвлэлийн тойм', 'Press review'], d: ['Ярилцлага, нийтлэл, хэвлэлд гарсан тойм', 'Interviews and articles from the press'], go: { sec: 'hub', hub: 'news', nt: 'review' } },
    { i: 'megaphone', t: ['Зар', 'Notices'], d: ['Хуваарь, хаалт, ажлын байр, мэдэгдэл', 'Schedules, closures, jobs, announcements'], go: { sec: 'hub', hub: 'news', cat: 'zar' } },
    { i: 'calendar-days', t: ['Арга хэмжээ', 'Events'], d: ['Хотод болох соёл, спорт, иргэний арга хэмжээ', 'Culture, sport and civic events'], go: { sec: 'events' } },
    { i: 'clapperboard', t: ['Медиа', 'Media'], d: ['Live, фото сурвалжилга, постер, подкаст', 'Live, photo reports, posters, podcasts'], go: { sec: 'media' } } ] },
  { id: 'menu3', k: 'nav_build', sec: 'projects', items: [
    { i: 'hard-hat', t: ['24 мега төсөл', '24 flagship projects'], d: ['Төсөл бүрийн гүйцэтгэл, төсөв, хугацаа', 'Progress, budget and timeline for each'], go: { sec: 'projects' } },
    { i: 'map-pinned', t: ['Газрын зураг', 'Map'], d: ['Бүх төслийг газрын зураг дээр', 'Every project on the map'], go: { sec: 'projects', focus: 'map' } } ] },
  { id: 'menu1', k: 'nav_services', sec: 'situations', items: [
    { i: 'route', t: ['Амьдралын нөхцөл', 'Life events'], d: ['Хүүхэд төрөх, гэрлэх, бизнес эхлүүлэх үед хэрэгтэй бүх алхам', 'Every step for a new baby, marriage or a new business'], go: { sec: 'situations' } },
    { i: 'user-round', t: ['Иргэн', 'Residents'], d: ['Лавлагаа, тэтгэмж, төлбөр, бүртгэл', 'Certificates, benefits, payments, registration'], go: { sec: 'hub', hub: 'services', svc: 'citizen' } },
    { i: 'briefcase', t: ['Аж ахуйн нэгж', 'Businesses'], d: ['Зөвшөөрөл, тендер, газар эзэмшил', 'Permits, tenders, land use'], go: { sec: 'hub', hub: 'services', svc: 'business' } },
    { i: 'monitor-smartphone', t: ['Цахим системүүд', 'E-services'], d: ['Хотын бүх цахим үйлчилгээ нэг дор', 'All city e-services in one place'], go: { sec: 'hub', hub: 'services', svc: 'esys' } } ] },
  { id: 'menu5', k: 'nav_open', sec: 'transparency', items: [
    { i: 'scroll-text', t: ['Тогтоол', 'Resolutions'], d: ['Нийслэлийн ИТХ-ын тогтоолууд', 'City Council resolutions'], go: { sec: 'transparency', tr: 'res' } },
    { i: 'stamp', t: ['Захирамж, шийдвэр', 'Orders and decisions'], d: ['Засаг даргын захирамж, шийдвэрүүд', "The Governor's orders"], go: { sec: 'transparency', tr: 'ord' } },
    { i: 'gavel', t: ['Тендер', 'Tenders'], d: ['Нээлттэй тендер, гэрээ, үр дүн', 'Open tenders, contracts, results'], go: { sec: 'transparency', tr: 'tender' } } ] },
  { id: 'menu4', k: 'nav_data', sec: 'data', items: [
    { i: 'activity', t: ['Бодит цагийн самбар', 'Live dashboard'], d: ['Агаар, түгжрэл, цаг агаар', 'Air, traffic and weather'], go: { sec: 'data' } },
    { i: 'chart-column', t: ['Статистик', 'Statistics'], d: ['Хүн ам, төсөв, нийгмийн үзүүлэлт', 'Population, budget, social indicators'], go: { sec: 'data', hl: 'pop' } } ] },
];
export function goAttrs(go) { return Object.entries(go).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' '); }
/* Цэсийн холбоос: сайтын хэсэг (go) эсвэл гадаад хаяг (href). Admin-ы «Үндсэн цэс»-ээс засагдана. */
export function itemAct(it) { return it.href ? `data-act="ext-link" data-href="${esc(it.href)}"` : `data-act="go" ${goAttrs(it.go || { sec: 'hero' })}`; }
export function menuLabel(m) { return m.lbl && L(m.lbl) ? esc(L(m.lbl)) : m.k ? esc(t(m.k, { n: PROJECTS.length })) : ''; }

/* ================= Header (site/app/chrome/ — React) ================= */
/* Горим солих: шинэ горим дарсан цэгээс (origin) тойрог хэлбэрээр тэлж бүх дэлгэцийг бүрхэнэ (View Transitions API). */
export function applyTheme(animate, extra, origin) {
  const root = document.documentElement;
  const run = () => { root.setAttribute('data-theme', S.theme); const m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', S.theme === 'dark' ? '#060E22' : '#0B1D45'); if (extra) extra(); };
  if (animate && !reduced && document.startViewTransition) {
    try {
      const x = origin ? origin.x : innerWidth - 48, y = origin ? origin.y : 48;
      const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));   // хамгийн алс булан хүртэлх зай
      root.classList.add('theme-vt');
      const vt = document.startViewTransition(run);
      vt.ready.then(() => root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 820, easing: 'cubic-bezier(.33, 1, .68, 1)', pseudoElement: '::view-transition-new(root)' },
      )).catch(() => {});
      vt.finished.finally(() => root.classList.remove('theme-vt'));
      return;
    } catch (e) { root.classList.remove('theme-vt'); }
  }
  run();
}
export function applyA11y() { document.documentElement.classList.toggle('a11y', !!S.a11y); }
/* Мэдээний хаяг: сервер (server/pages/) /news/<id> хуудсыг үйлчилдэг бол тэр хаягийг, үгүй бол (нэг файлт хувилбар, статик хостинг) #news/<id> */
export const PRETTY = !!document.querySelector('meta[name="ubmn-routes"]');
export const newsHref = (id) => (PRETTY ? '/news/' + encodeURIComponent(id) : '#news/' + id);
export const newsUrl = (n) => (PRETTY ? location.origin + newsHref(n.id) : NEWS_SRC + n.id.slice(1));   // share хийх хаяг
export function urlNewsId() {
  const m = PRETTY && location.pathname.match(/^\/news\/([^/]+)\/?$/);
  if (m) { try { return decodeURIComponent(m[1]); } catch (e) { return null; } }
  const h = decodeURIComponent((location.hash || '').slice(1));
  return h.startsWith('news/') ? h.slice(5) : null;
}
export function setHash(sec) {
  try {
    const h = sec && sec !== 'hero' ? '#' + sec : '';
    if (PRETTY) { if (location.pathname !== '/' || location.hash !== h) history.replaceState(null, '', '/' + h); }
    else if (location.hash !== h) history.replaceState(null, '', h || location.pathname + location.search);
  } catch (e) { /* ignore */ }
}
/* ================= Цаг агаар (WMO код → нэр, тэмдэг) ================= */
export const WX = [
  [[0], ['Цэлмэг', 'Clear'], 'sun', 'moon'], [[1], ['Ихэвчлэн цэлмэг', 'Mostly clear'], 'sun', 'moon'], [[2], ['Багавтар үүлтэй', 'Partly cloudy'], 'cloud-sun', 'cloud-moon'],
  [[3], ['Үүлэрхэг', 'Cloudy'], 'cloud', 'cloud'], [[45, 48], ['Манантай', 'Fog'], 'cloud-fog'], [[51, 53, 55, 56, 57], ['Шиврээ бороо', 'Drizzle'], 'cloud-drizzle'],
  [[61, 63, 65, 66, 67], ['Бороо', 'Rain'], 'cloud-rain'], [[80, 81, 82], ['Аадар бороо', 'Showers'], 'cloud-rain-wind'], [[71, 73, 75, 77, 85, 86], ['Цас', 'Snow'], 'cloud-snow'],
  [[95, 96, 99], ['Аянга цахилгаантай', 'Thunderstorm'], 'cloud-lightning'],
];
export function wxInfo(code, day = 1) { const r = WX.find((x) => x[0].includes(+code)) || WX[3]; return { t: L(r[1]), i: (!day && r[3]) || r[2] }; }
export function wxDir(deg) { const k = Math.round((((+deg % 360) + 360) % 360) / 45) % 8; return L([['хойноос', 'зүүн хойноос', 'зүүнээс', 'зүүн өмнөөс', 'өмнөөс', 'баруун өмнөөс', 'баруунаас', 'баруун хойноос'][k], ['from N', 'from NE', 'from E', 'from SE', 'from S', 'from SW', 'from W', 'from NW'][k]]); }
export const wxT = (v) => Math.round(+v);
/* Толгойн мөрийн цаг агаар, агаарын чанар, түгжрэл (site/app/chrome/TopStrip.tsx зурна) */
export function pulse() {
  const w = S.wx, wi = wxInfo(w.code, w.day), cat = aqiCat(S.aqi);
  return {
    temp: wxT(w.temp), feels: wxT(w.feels), wxText: wi.t, wxIcon: wi.i, wind: Math.round(w.wind), dir: wxDir(w.dir), hum: Math.round(w.hum), wxLive: !!w.live,
    aqi: S.aqi, aqiLabel: t(cat.k), aqiColor: cat.c, aqiAdvice: t(cat.adv), aqiPos: Math.min(98, aqiPos(S.aqi) * 100),
    airSrc: S.air && S.air.live ? (S.air.src === 'iqair' ? 'IQAir' : 'Open-Meteo · CAMS') : '',
    traffic: S.traffic, roads: ROADS.map(([n, v]) => [L(n), v]),
  };
}
/* Мега цэсний баруун талын онцлох хэсэг (HTML). Цэсийг site/app/chrome/Dock.tsx зурна. */
export function megaFeat(i) {
  const m = MENU[i]; if (!m) return '';
  return ({
    nav_services: () => { const s = SITS[0]; if (!s) return ''; return `<p class="text-[13px] text-muted">${t('s_sits')}</p><p class="mt-1 text-[17px] font-extrabold">${esc(L(s.t))}</p><p class="mt-1 text-[13.5px] text-muted">${t('stepsOnline', { n: s.steps.length, o: s.steps.filter((x) => x.m === 'on').length })}</p><button type="button" class="btn btn-sm btn-ink mt-4" data-act="go" data-sec="situations" data-sit="${esc(s.id)}">${t('sitPromoB')}</button>`; },
    nav_news: () => { const n = NEWS_BY[HERO_ID]; if (!n) return ''; return `<div class="scene rounded-xl aspect-[16/9]">${Scene(n.img)}</div><p class="mt-3 text-[14.5px] font-bold leading-snug line-clamp-3">${esc(L(n.t))}</p><button type="button" class="mt-2 text-[13px] font-bold text-ubblue" data-act="news" data-id="${HERO_ID}">${t('read')}</button>`; },
    nav_build: () => { const p = PROJECTS[0]; if (!p || !PCAT[p.c]) return ''; return `<div class="flex items-center gap-4">${projBadge(p, 64, 7, 15)}<div><p class="text-[13px] text-muted">${esc(L(PCAT[p.c].t))}</p><p class="font-extrabold leading-snug">${esc(L(p.n))}</p><p class="text-[13px] text-muted mt-0.5">${p.p != null ? `<b class="text-[22px] text-ink tnum">${p.p}%</b>` : p.ups && p.ups[0] ? esc(p.ups[0].t).slice(0, 70) + '…' : ''}</p></div></div><button type="button" class="btn btn-sm btn-ink mt-4" data-act="go" data-sec="projects" data-pid="p1">${t('showOnMap')}</button>`; },
    nav_data: () => { const c = aqiCat(S.aqi); return `<p class="text-[13px] text-muted">${t('aqi')}</p><p class="text-[40px] leading-none font-extrabold tnum mt-1"><span data-live="aqi">${S.aqi}</span></p><p class="font-semibold mt-1" style="color:${c.c}">${t(c.k)}</p><p class="text-[13px] text-muted mt-2">${t('updated')} <span class="tnum" data-live="clock">${clock()}</span></p>`; },
    nav_open: () => `<p class="text-[13px] text-muted">${t('trStat2')}</p><p class="text-[40px] leading-none font-extrabold tnum mt-1">37</p><p class="text-[13.5px] text-muted mt-2">${t('trStat1')}: <b class="text-ink tnum">1 248</b></p>`,
    nav_about: () => `<p class="text-[13px] text-muted">${t('founded')}</p><p class="text-[40px] leading-none font-extrabold tnum mt-1">1639</p><p class="text-[13.5px] text-muted mt-2">${t('adminV')}</p>`,
  }[m.k] || (() => ''))();
}
/* Алхан хээ хуудсыг гүйлгэх тусам өнгөөр дүүрнэ (нүүр хуудсанд) */
export let dockRaf = 0;
export function queueDockProgress() { if (!dockRaf) dockRaf = requestAnimationFrame(() => { dockRaf = 0; dockProgress(); }); }
export function dockProgress() {
  const n = $('#navbar'); if (!n) return;
  const h = document.documentElement.scrollHeight - innerHeight, w = n.offsetWidth;
  n.style.setProperty('--prog', (S.route === 'home' || S.route === 'page') && h > 0 ? Math.min(1, Math.max(0, scrollY / h)).toFixed(4) : '0');
  n.style.setProperty('--gx', Math.round((scrollY * 0.45) % (w + 480) - 240) + 'px');   // шилэн дээгүүр гулсах туяа: гүйлгэх тусам зүүнээс баруун тийш
  // Adaptive glass: цэсийн доорх хэсэг бараан бол шил бараан, бичиг цагаан болно
  let dark = false;
  if (n.classList.contains('stuck')) { const r = n.getBoundingClientRect(); dark = isDarkBg(document.elementFromPoint(r.left + r.width / 2, r.bottom + 8)); }
  n.classList.toggle('on-dark', dark);
}
export function isDarkBg(el) {   // хамгийн ойрын тунгалаг бус дэвсгэрийн гэрэлтэлт
  for (; el && el !== document.documentElement; el = el.parentElement) {
    const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    if (m && (m.length < 4 || +m[3] > 0.5)) return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 < 0.42;
  }
  return false;
}
export function setActiveNav(sec) {
  const map = { hero: 'nav_news', hub: S.hub === 'services' ? 'nav_services' : 'nav_news', gov: 'nav_about', situations: 'nav_services', media: 'nav_news', projects: 'nav_build', data: 'nav_data', events: 'nav_news', transparency: 'nav_open', about: 'nav_about' };
  const pg = S.route === 'page' && PAGES[S.page], key = pg ? pg.mk : map[sec], idx = MENU.findIndex((m) => m.k === key);
  $$('.nav-btn').forEach((b) => b.classList.toggle('is-active', +b.dataset.menu === idx && (!!pg || sec !== 'hero')));
  const nav = $('#navbar'); if (nav && nav._moveInd) nav._moveInd();
  const hb = nav && $('.nav-home', nav); if (hb) hb.classList.toggle('is-active', S.route === 'home' && sec === 'hero');   // «Нүүр» цэс үргэлж байна; нүүрний эхэнд байхад тодорно
  const bb = pg ? { services: 'services', news: 'news', events: 'news', media: 'news' }[S.page] || '' : { hero: 'home', hub: S.hub === 'services' ? 'services' : 'news', situations: 'services', media: 'news', events: 'news' }[sec] || 'home';
  $$('.bb-item').forEach((b) => b.setAttribute('aria-current', String(S.route === 'my' ? b.dataset.bb === 'my' : b.dataset.bb === bb)));
}

