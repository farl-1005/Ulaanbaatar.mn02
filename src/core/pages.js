/* ================= Тусдаа хуудсууд (/news, /services ...) =================
   Нүүр хуудас нь товч танилцуулга (landing). Цэс бүр өөрийн том хуудастай: толгой (#page-hero) + тухайн хэсгийн бүрэн агуулга.
   Нүүрний хэсгүүдийг дахин ашиглаж (secs), бусдыг нь нууна. hide: эхний хэсгийн гарчгийг нууна (толгойтой давхардахгүй). */
const PAGES = {
  services: { secs: ['hub', 'situations'], mk: 'nav_services', c: '#D81E34', i: 'layout-grid', t: ['Үйлчилгээ', 'Services'], d: ['Иргэн, аж ахуйн нэгжид зориулсан бүх үйлчилгээ, амьдралын нөхцөл бүрт хэрэгтэй алхмууд нэг дор.', 'Every service for residents and businesses, with step-by-step guides for life events.'] },
  news: { secs: ['hub'], mk: 'nav_news', c: '#145095', i: 'newspaper', t: ['Мэдээ мэдээлэл', 'News'], d: ['Нийслэлийн Засаг дарга, дүүрэг, харьяа байгууллагуудын бүх мэдээ, зар мэдээлэл.', 'All news and notices from City Hall, districts and city agencies.'] },
  events: { secs: ['events'], mk: 'nav_news', c: '#E58A00', i: 'calendar-days', hide: 1, t: ['Арга хэмжээ', 'Events'], d: ['Хотод болох соёл, спорт, иргэний арга хэмжээ: жагсаалт, хуанли, газрын зураг.', 'Culture, sport and civic events: list, calendar and map.'] },
  media: { secs: ['media'], mk: 'nav_news', c: '#7C4DFF', i: 'clapperboard', hide: 1, t: ['Медиа', 'Media'], d: ['Нийслэлийн Live дамжуулалт, фото сурвалжилга, постер, подкаст.', 'Live streams, photo reports, posters and podcasts from City Hall.'] },
  projects: { secs: ['projects'], mk: 'nav_build', c: '#F08C1A', i: 'hard-hat', hide: 1, tk: 'nav_build', t: ['Бүтээн байгуулалт', 'Development'], d: ['Нийслэлийн 24 мега төслийн явцын мэдээ, гүйцэтгэлийг газрын зураг дээрээс хянаарай. Эх сурвалж: ulaanbaatar.mn', 'Progress updates on the 24 flagship projects, on the map. Source: ulaanbaatar.mn'] },
  data: { secs: ['data'], mk: 'nav_data', c: '#0EA068', i: 'activity', hide: 1, dark: 'var(--c-navy)', t: ['Хотын өгөгдөл', 'City data'], d: ['Агаарын чанар, түгжрэл, цаг агаар, хүн ам, төсвийн бодит цагийн самбар.', 'A live dashboard of air quality, traffic, weather, population and budget.'] },
  transparency: { secs: ['transparency'], mk: 'nav_open', c: '#0E9AA7', i: 'scroll-text', hide: 1, t: ['Ил тод байдал', 'Transparency'], d: ['Нийслэлийн ИТХ-ын тогтоол, Засаг даргын захирамж, тендерийн мэдээлэл нээлттэй.', "City Council resolutions, the Governor's orders and tenders, in the open."] },
  about: { secs: ['gov', 'about'], mk: 'nav_about', c: '#D81E34', i: 'landmark', t: ['Хотын тухай', 'About the city'], d: ['Нийслэлийн Засаг даргын ажлын хуваарь, хотын удирдлага, түүх, харьяа байгууллагууд.', "The Governor's schedule, city leadership, history and agencies."] },
};
const PAGE_ONLY = ['about'];   // нүүрэнд харагдахгүй, зөвхөн өөрийн хуудсанд (template.html-д hidden)
const pgMenu = (P) => P && MENU.find((m) => m.k === P.mk);   // хуудасны цэс (байрлалаар биш түлхүүрээр)
/* Хуудасны гарчиг: tk бол цэсний нэртэй ижил (жишээ нь «24 мега төсөл») */
const pgT = (P) => (P.tk ? t(P.tk, { n: PROJECTS.length }) : L(P.t));
/* Цэсийн «go» холбоос аль хуудас руу очих вэ (нүүрний hero бол null) */
function pageOf(o) {
  if (!o || !o.sec || o.sec === 'hero') return null;
  if (o.sec === 'hub') return o.hub === 'services' ? 'services' : o.hub === 'events' ? 'events' : 'news';
  const k = { situations: 'services', gov: 'about' }[o.sec] || o.sec;
  return PAGES[k] ? k : null;
}
const pageHref = (k) => (PRETTY ? '/' + k : '#/' + k);
function urlPage() {
  const m = PRETTY ? location.pathname.match(/^\/([a-z]+)\/?$/) : (location.hash || '').match(/^#\/([a-z]+)$/);
  return m && PAGES[m[1]] ? m[1] : null;
}
function openPage(k, o = {}) {
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
function pageView(on) {
  const home = $('#view-home'), P = on && PAGES[S.page];
  home.classList.toggle('page-mode', !!P); home.classList.toggle('pg-hide', !!(P && P.hide)); home.classList.toggle('pg-dark', !!(P && P.dark));
  $$(':scope > section', home).forEach((s) => {
    s.hidden = P ? !(s.id === 'page-hero' || P.secs.includes(s.id)) : s.id === 'page-hero' || PAGE_ONLY.includes(s.id);
    s.classList.toggle('pg-first', !!P && s.id === P.secs[0]);
  });
}
function pageStats(k) {
  const n = (v) => (typeof v === 'number' ? num(v) : v);
  const st = {
    news: () => [[NEWS.filter((x) => !x.draft).length, L(['мэдээ', 'stories'])], [NEWS.filter((x) => x.ago < 1440).length, L(['өнөөдөр', 'today'])], [NEWS.filter((x) => x.zar || x.cat === 'zar').length, L(['зар', 'notices'])]],
    services: () => [[ALL_SVC.length, L(['үйлчилгээ', 'services'])], [ALL_SVC.filter((s) => s.m === 'on').length, L(['онлайнаар', 'online'])], [SITS.length, L(['амьдралын нөхцөл', 'life events'])]],
    events: () => [[EVENTS.length, L(['арга хэмжээ', 'events'])], [EVENTS.filter((e) => e.w >= 0 && e.w < 7).length, L(['энэ 7 хоногт', 'this week'])], [EVENTS.filter((e) => !e.price).length, L(['үнэгүй', 'free'])]],
    media: () => [[MEDIA.filter((m) => m.type === 'live').length, 'Live'], [MEDIA.filter((m) => m.type === 'photo').length, L(['фото сурвалжилга', 'photo reports'])], [MEDIA.filter((m) => m.type === 'poster').length, L(['постер', 'posters'])]],
    projects: () => PROJECTS.some((p) => p.live) ? [[PROJECTS.length, L(['мега төсөл', 'projects'])], PROJECTS.some((p) => p.budUsd != null) ? [mpUsd(PROJECTS.reduce((a, p) => a + (p.ipOwn && p.budUsd ? p.budUsd : 0), 0)), L(['нийт төсөв', 'total budget'])] : [PROJECTS.reduce((a, p) => a + (p.ups || []).length, 0), L(['явцын мэдээ', 'updates'])], [PROJECTS.reduce((a, p) => a + (p.ups || []).length, 0), L(['явцын мэдээ', 'updates'])]]
      : [[PROJECTS.length, L(['мега төсөл', 'projects'])], [Math.round(PROJECTS.reduce((a, p) => a + (+p.p || 0), 0) / Math.max(1, PROJECTS.length)) + '%', L(['дундаж гүйцэтгэл', 'avg. progress'])], [PROJECTS.filter((p) => +p.p >= 100).length, L(['ашиглалтад орсон', 'completed'])]],
    data: () => [[`<span data-live="aqi">${S.aqi}</span>`, 'AQI'], [S.temp + '°', L(['агаарын хэм', 'temperature'])], [S.traffic + '/10', L(['түгжрэл', 'congestion'])]],
    transparency: () => [[(DOCS.res || []).length, L(['тогтоол', 'resolutions'])], [(DOCS.ord || []).length, L(['захирамж', 'orders'])], [(DOCS.tender || []).length, L(['тендер', 'tenders'])]],
    about: () => [['1639', L(['онд үүссэн', 'founded'])], [EN() ? '4,704' : '4 704', L(['км² нутаг', 'km² area'])], ['9', L(['дүүрэг', 'districts'])]],
  }[k];
  return st ? st().map(([v, l]) => [n(v), l]) : [];
}
function pageLinksHTML() {
  const P = PAGES[S.page], m = pgMenu(P); if (!m) return '';
  // идэвхтэй холбоос: тодорхой төлөвтэй (cat/tr/svc) нь таарвал түүнийг, үгүй бол энэ хуудас руу очих эхний холбоос
  const spec = (g) => g.cat || g.nt || g.tr || g.svc;
  const hit = (g) => (!g.cat || g.cat === S.newsCat) && (!g.nt || g.nt === S.newsType) && (!g.tr || g.tr === S.tr) && (!g.svc || g.svc === S.svcTab);
  const mine = m.items.map((it, k) => [it, k]).filter(([it]) => !it.href && pageOf(it.go) === S.page);
  const on = (mine.find(([it]) => spec(it.go) && hit(it.go)) || mine.find(([it]) => !spec(it.go)) || [])[1];
  return m.items.map((it, k) => `<button type="button" class="pg-link" style="--i:${k}" ${itemAct(it)} aria-current="${k === on}">${ic(it.i, 'w-4 h-4')}${esc(L(it.t))}</button>`).join('');
}
/* Улаанбаатарын нар мандах/жаргах цаг (NOAA-ийн хялбаршуулсан томъёо; 47.92°N, 106.92°E, UTC+8). Буцаах: [мандах, жаргах] минутаар */
function sunTimes(d = ubNow()) {
  const lat = 47.92, lon = 106.92, R = Math.PI / 180;
  const n = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(d.getFullYear(), 0, 0)) / 864e5), g = (2 * Math.PI / 365) * (n - 1);
  const eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const dec = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const ha = Math.acos(Math.cos(90.833 * R) / (Math.cos(lat * R) * Math.cos(dec)) - Math.tan(lat * R) * Math.tan(dec)) / R;
  return [720 - 4 * (lon + ha) - eq + 480, 720 - 4 * (lon - ha) - eq + 480];
}
/* «Хотын өгөгдөл» хуудасны толгой: секунд тоолох цаг + өдрийн нарны нум (нар одоо хаана явааг харуулна) */
function dataSunInner() {
  const d = ubNow(), [rise, set] = sunTimes(d), m = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
  const up = m >= rise && m <= set, k = Math.min(1, Math.max(0, (m - rise) / (set - rise)));
  const P0 = [12, 66], P1 = [130, -26], P2 = [248, 66], q = (a, b, c) => (1 - k) * (1 - k) * a + 2 * (1 - k) * k * b + k * k * c;
  const x = q(P0[0], P1[0], P2[0]), y = q(P0[1], P1[1], P2[1]), hm = (v) => pad(Math.floor(v / 60)) + ':' + pad(Math.round(v % 60) % 60);
  const len = set - rise, left = up ? set - m : 0;
  const dur = (v) => { const h = Math.floor(v / 60), mm = Math.round(v % 60) % 60; return L([(h ? h + ' ц ' : '') + mm + ' мин', (h ? h + ' h ' : '') + mm + ' min']); };
  return `<svg viewBox="0 0 260 74" class="dsun-arc" aria-hidden="true"><defs><linearGradient id="dsg" x1="0" x2="1"><stop offset="0" stop-color="#FFB547"/><stop offset="1" stop-color="#FF6B5A"/></linearGradient></defs>
      <path class="dsun-track" d="M12 66Q130 -26 248 66"/><path class="dsun-done" d="M12 66Q130 -26 248 66" pathLength="100" style="stroke-dasharray:${(k * 100).toFixed(1)} 100"/><line x1="0" y1="66.5" x2="260" y2="66.5" class="dsun-hz"/>
      <circle class="dsun-glow ${up ? '' : 'is-night'}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="13"/><circle class="dsun-dot ${up ? '' : 'is-night'}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6"/></svg>
    <div class="dsun-meta tnum"><span>${ic('sunrise', 'w-4 h-4')}${hm(rise)}</span><span class="dsun-mid">${up ? L(['Нар жаргахад ', 'Sunset in ']) + dur(left) : L(['Өдрийн урт ', 'Daylight ']) + dur(len)}</span><span>${hm(set)}${ic('sunset', 'w-4 h-4')}</span></div>`;
}
function dataClockHTML() {
  return `<div class="dclock"><p class="dclock-top"><span class="live" style="--dot:#33D69F"></span>${L(['Шууд', 'Live'])}<span class="opacity-50">·</span><span>${esc(fDate(ubNow(), true))}</span></p>
    <p class="dclock-t tnum" data-live="clocks">${clock(true)}</p><div id="dsun">${dataSunInner()}</div></div>`;
}
function renderPageLinks() { if (S.route !== 'page') return; const el = $('#pg-links'); if (el) el.innerHTML = pageLinksHTML(); }
function renderPageHero() {
  const P = PAGES[S.page], el = $('#page-hero'); if (!P || !el) return;
  const m = pgMenu(P), top = m && pageOf({ sec: m.sec });
  const crumbs = [`<button type="button" data-act="home">${t('home')}</button>`];
  if (top && top !== S.page) crumbs.push(`<button type="button" data-act="page" data-v="${top}">${menuLabel(m)}</button>`);
  crumbs.push(`<span aria-current="page">${esc(pgT(P))}</span>`);
  el.style.background = P.dark ? `rgb(${P.dark})` : '';   // бараан хэсэгтэй хуудсанд толгой нь тэр дэвсгэртэйгээ нэг үргэлжилнэ
  const side = S.page === 'data' ? dataClockHTML() : `<dl class="pg-stats">${pageStats(S.page).map(([v, l], i) => `<div style="--i:${i}"><dt>${esc(l)}</dt><dd class="tnum">${v}</dd></div>`).join('')}</dl>`;
  el.innerHTML = `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 pt-5 lg:pt-7"><div class="pg-hero ${P.dark ? 'is-dark' : ''}" style="--pc:${P.c}">
    <span class="pg-aur" aria-hidden="true"></span><span class="pg-big" aria-hidden="true">${ic(P.i, 'w-full h-full', 1.1)}</span>
    <nav class="pg-crumbs" aria-label="${L(['Байршил', 'Breadcrumb'])}">${crumbs.join(ic('chevron-right', 'w-3.5 h-3.5 opacity-50'))}</nav>
    <div class="pg-main"><div class="min-w-0"><span class="pg-ic">${ic(P.i, 'w-6 h-6')}</span><h1 class="pg-t">${esc(pgT(P))}</h1><p class="pg-d">${esc(L(P.d))}</p></div>
      ${side}</div>
    <div class="pg-links" id="pg-links">${pageLinksHTML()}</div>
  </div></div>`;
}
function headerOffset() { const nav = $('#hdr-nav'), band = $('#hdr-band'); const h = innerWidth >= 1024 ? (nav ? nav.offsetHeight : 60) : (band ? band.offsetHeight : 56); return h + 14; }
function scrollToSec(id) {
  const el = document.getElementById(id); if (!el) return;
  const y = id === 'hero' ? 0 : el.getBoundingClientRect().top + window.scrollY - headerOffset();
  window.scrollTo({ top: Math.max(0, y), behavior: reduced ? 'auto' : 'smooth' });
}
function go(o) {
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
function flashEl(el) { if (!el) return; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
