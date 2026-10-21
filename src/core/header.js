/* ================= Navigation model ================= */
/* Дараалал: Хотын тухай, Мэдээ, 24 мега төсөл, Үйлчилгээ, Ил тод байдал, Хотын өгөгдөл. id нь admin-ы засварыг (cms menu) байрлалаас үл хамааран холбоно. */
const MENU = [
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
function goAttrs(go) { return Object.entries(go).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' '); }
/* Цэсийн холбоос: сайтын хэсэг (go) эсвэл гадаад хаяг (href). Admin-ы «Үндсэн цэс»-ээс засагдана. */
function itemAct(it) { return it.href ? `data-act="ext-link" data-href="${esc(it.href)}"` : `data-act="go" ${goAttrs(it.go || { sec: 'hero' })}`; }
function menuLabel(m) { return m.lbl && L(m.lbl) ? esc(L(m.lbl)) : m.k ? esc(t(m.k, { n: PROJECTS.length })) : ''; }

/* ================= Header ================= */
function langToggle(dark) {
  return `<div class="flex items-center rounded-xl p-0.5 ${dark ? 'bg-white/10' : 'bg-soft border border-line'}" role="group" aria-label="Language">${['mn', 'en'].map((l) => `<button type="button" data-act="lang" data-v="${l}" aria-pressed="${S.lang === l}" class="h-8 px-2.5 rounded-[8px] text-[12.5px] font-bold transition-colors ${S.lang === l ? (dark ? 'bg-white text-navy' : 'bg-ink text-card') : (dark ? 'text-white/70 hover:text-white' : 'text-muted hover:text-ink')}">${l === 'mn' ? 'МН' : 'EN'}</button>`).join('')}</div>`;
}
function themeBtn(dark) {
  const d = S.theme === 'dark', lbl = esc(d ? t('themeLight') : t('themeDark'));
  return `<button type="button" data-act="theme" class="icon-btn ${dark ? 'hover:bg-white/10' : '!rounded-lg border border-line hover:bg-soft'}" aria-label="${lbl}" title="${lbl}">${ic(d ? 'sun' : 'moon', 'w-[19px] h-[19px]')}</button>`;
}
/* Горим солих: шинэ горим дарсан цэгээс (origin) тойрог хэлбэрээр тэлж бүх дэлгэцийг бүрхэнэ (View Transitions API). */
function applyTheme(animate, extra, origin) {
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
function a11yBtn() {
  const lbl = esc(t('a11yMode'));
  return `<button type="button" data-act="a11y" aria-pressed="${!!S.a11y}" class="icon-btn !rounded-lg border transition-colors ${S.a11y ? 'bg-ink text-card border-transparent' : 'border-line hover:bg-soft'}" aria-label="${lbl}" title="${lbl}">${ic('eye', 'w-[19px] h-[19px]')}</button>`;
}
function applyA11y() { document.documentElement.classList.toggle('a11y', !!S.a11y); }
/* Мэдээний хаяг: сервер (server/pages/) /news/<id> хуудсыг үйлчилдэг бол тэр хаягийг, үгүй бол (нэг файлт хувилбар, статик хостинг) #news/<id> */
const PRETTY = !!document.querySelector('meta[name="ubmn-routes"]');
const newsHref = (id) => (PRETTY ? '/news/' + encodeURIComponent(id) : '#news/' + id);
const newsUrl = (n) => (PRETTY ? location.origin + newsHref(n.id) : NEWS_SRC + n.id.slice(1));   // share хийх хаяг
function urlNewsId() {
  const m = PRETTY && location.pathname.match(/^\/news\/([^/]+)\/?$/);
  if (m) { try { return decodeURIComponent(m[1]); } catch (e) { return null; } }
  const h = decodeURIComponent((location.hash || '').slice(1));
  return h.startsWith('news/') ? h.slice(5) : null;
}
function setHash(sec) {
  try {
    const h = sec && sec !== 'hero' ? '#' + sec : '';
    if (PRETTY) { if (location.pathname !== '/' || location.hash !== h) history.replaceState(null, '', '/' + h); }
    else if (location.hash !== h) history.replaceState(null, '', h || location.pathname + location.search);
  } catch (e) { /* ignore */ }
}
/* ================= Цаг агаар (WMO код → нэр, тэмдэг) ================= */
const WX = [
  [[0], ['Цэлмэг', 'Clear'], 'sun', 'moon'], [[1], ['Ихэвчлэн цэлмэг', 'Mostly clear'], 'sun', 'moon'], [[2], ['Багавтар үүлтэй', 'Partly cloudy'], 'cloud-sun', 'cloud-moon'],
  [[3], ['Үүлэрхэг', 'Cloudy'], 'cloud', 'cloud'], [[45, 48], ['Манантай', 'Fog'], 'cloud-fog'], [[51, 53, 55, 56, 57], ['Шиврээ бороо', 'Drizzle'], 'cloud-drizzle'],
  [[61, 63, 65, 66, 67], ['Бороо', 'Rain'], 'cloud-rain'], [[80, 81, 82], ['Аадар бороо', 'Showers'], 'cloud-rain-wind'], [[71, 73, 75, 77, 85, 86], ['Цас', 'Snow'], 'cloud-snow'],
  [[95, 96, 99], ['Аянга цахилгаантай', 'Thunderstorm'], 'cloud-lightning'],
];
function wxInfo(code, day = 1) { const r = WX.find((x) => x[0].includes(+code)) || WX[3]; return { t: L(r[1]), i: (!day && r[3]) || r[2] }; }
function wxDir(deg) { const k = Math.round((((+deg % 360) + 360) % 360) / 45) % 8; return L([['хойноос', 'зүүн хойноос', 'зүүнээс', 'зүүн өмнөөс', 'өмнөөс', 'баруун өмнөөс', 'баруунаас', 'баруун хойноос'][k], ['from N', 'from NE', 'from E', 'from SE', 'from S', 'from SW', 'from W', 'from NW'][k]]); }
const wxT = (v) => Math.round(+v);
function pulseSegs(mobile) {
  const w = S.wx, wi = wxInfo(w.code, w.day);
  const cat = aqiCat(S.aqi);
  const segCls = mobile ? 'h-11 px-3.5 rounded-xl bg-white/[.07] border border-white/10 whitespace-nowrap' : 'h-full px-3 xl:px-4 hover:bg-white/10 whitespace-nowrap';
  const bar = Array.from({ length: 10 }, (_, i) => `<i class="w-[3px] h-3 rounded-full ${i < S.traffic ? 'bg-ubamber' : 'bg-white/20'}"></i>`).join('');
  const segs = [
    { hl: 'weather', html: `${ic(wi.i, 'w-[22px] h-[22px] text-white/90')}<span class="text-left leading-tight"><b class="block tnum text-[15px]">${wxT(w.temp)}°C</b><span class="block lg:hidden xl:block text-[11.5px] text-white/60">${esc(wi.t)}</span></span>`,
      pop: `<p class="text-[13px] text-muted">${t('weather')} · ${esc(wi.t)}</p><p class="text-[26px] font-extrabold tnum mt-1">${wxT(w.temp)}°C <span class="text-[14px] font-semibold text-muted">${t('feels')} ${wxT(w.feels)}°</span></p><div class="grid grid-cols-2 gap-2 mt-3 text-[13px]"><span class="text-muted">${t('wind')}</span><b>${Math.round(w.wind)} ${L(['м/с', 'm/s'])}, ${wxDir(w.dir)}</b><span class="text-muted">${t('humidity')}</span><b>${Math.round(w.hum)}%</b></div>${w.live ? `<p class="mt-3 text-[11.5px] text-muted">${L(['Эх сурвалж', 'Source'])}: Open-Meteo</p>` : ''}` },
    { hl: 'aqi', html: `<span class="live" style="--dot:${cat.c}"></span><span class="text-left leading-tight"><b class="block tnum text-[15px]">AQI <span data-live="aqi">${S.aqi}</span></b><span class="block lg:hidden xl:block text-[11.5px] text-white/60">${t(cat.k)}</span></span>`,
      pop: `<p class="text-[13px] text-muted">${t('aqi')}</p><p class="text-[26px] font-extrabold tnum mt-1"><span data-live="aqi">${S.aqi}</span> <span class="text-[14px] font-semibold" style="color:${cat.c}">${t(cat.k)}</span></p><div class="mt-3 h-2 rounded-full relative" style="background:linear-gradient(90deg,#10A36A 0 16.67%,#E5A800 16.67% 33.33%,#F08C1A 33.33% 50%,#D81E34 50% 66.67%,#8F3F97 66.67% 83.33%,#7E0023 83.33%)"><i class="absolute -top-1 w-1.5 h-4 rounded-[3px] bg-ink" style="left:calc(${Math.min(98, aqiPos(S.aqi) * 100).toFixed(1)}% - 3px)"></i></div><p class="text-[13px] text-muted mt-3 leading-snug">${t(cat.adv)}</p>${S.air && S.air.live ? `<p class="mt-2 text-[11.5px] text-muted">${L(['Эх сурвалж', 'Source'])}: ${S.air.src === 'iqair' ? 'IQAir' : 'Open-Meteo · CAMS'}</p>` : ''}` },
    { hl: 'traffic', html: `${ic('car-front', 'w-[22px] h-[22px] text-white/90')}<span class="text-left leading-tight"><b class="block tnum text-[15px]">${S.traffic}/10</b><span class="flex items-center gap-[2px] mt-1">${bar}</span></span>`,
      pop: `<p class="text-[13px] text-muted">${t('congestion')}</p><p class="text-[26px] font-extrabold tnum mt-1">${S.traffic}/10 <span class="text-[14px] font-semibold text-amberink">${t('busy')}</span></p><ul class="mt-3 space-y-2 text-[13px]">${ROADS.map(([n, v]) => `<li class="flex justify-between gap-3"><span>${esc(L(n))}</span><b class="tnum">${v}</b></li>`).join('')}</ul>` },
  ];
  const shs = [`${ic(wi.i, 'w-4 h-4 text-white/85')}<b class="tnum">${wxT(w.temp)}°C</b><span class="text-white/60">${esc(wi.t)}</span>`, `<span class="live" style="--dot:${cat.c}"></span><b class="tnum">AQI <span data-live="aqi">${S.aqi}</span></b><span class="text-white/60">${t(cat.k)}</span>`, `${ic('car-front', 'w-4 h-4 text-white/85')}<span class="text-white/60">${t('traffic')}</span><b class="tnum">${S.traffic}/10</b><span class="flex items-center gap-[2px]">${bar}</span>`];
  if (mobile === 'strip') return `<div class="flex items-center -ml-3">${segs.map((s, i) => `${i ? '<span class="w-px h-4 bg-white/15 mx-1"></span>' : ''}<div class="pulse-seg"><button type="button" class="h-[38px] px-3 flex items-center gap-2 text-[12.5px] rounded-md hover:bg-white/10 transition-colors whitespace-nowrap" data-act="go" data-sec="data" data-hl="${s.hl}">${shs[i]}</button><div class="pop"><div class="card p-4 text-ink shadow-2xl">${s.pop}<button type="button" class="mt-3 text-[13px] font-bold text-ubblue inline-flex items-center gap-1" data-act="go" data-sec="data" data-hl="${s.hl}">${t('more')}${ic('chevron-right', 'w-4 h-4')}</button></div></div></div>`).join('')}</div>`;
  if (mobile) return `<div class="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2.5">${segs.map((s) => `<button type="button" class="${segCls} flex items-center gap-2.5 shrink-0" data-act="go" data-sec="data" data-hl="${s.hl}">${s.html}</button>`).join('')}<span class="shrink-0 h-11 px-3 flex items-center gap-2 text-[12.5px] text-white/60 tnum">${ic('clock-3', 'w-4 h-4')}<span data-live="clock">${clock()}</span></span></div>`;
  return `<div class="flex items-stretch h-12 rounded-2xl border border-white/15 bg-white/[.05]">${segs.map((s, i) => `${i ? '<span class="w-px bg-white/15 my-2.5"></span>' : ''}<div class="pulse-seg"><button type="button" class="${segCls} flex items-center gap-2.5 ${i === 0 ? 'rounded-l-2xl' : ''} ${i === 2 ? 'rounded-r-2xl' : ''} transition-colors" data-act="go" data-sec="data" data-hl="${s.hl}">${s.html}</button><div class="pop"><div class="card p-4 text-ink shadow-2xl">${s.pop}<button type="button" class="mt-3 text-[13px] font-bold text-ubblue inline-flex items-center gap-1" data-act="go" data-sec="data" data-hl="${s.hl}">${t('more')}${ic('chevron-right', 'w-4 h-4')}</button></div></div></div>`).join('')}</div>`;
}
function userBtn() {
  if (!S.user) return `<button type="button" data-act="login" class="h-10 px-4 rounded-lg btn-navy font-bold text-[14px] inline-flex items-center gap-2">${ic('fingerprint', 'w-[18px] h-[18px]')}${t('login')}</button>`;
  return `<div class="relative" data-userwrap><button type="button" data-act="user-menu" aria-expanded="false" class="h-10 pl-1 pr-2.5 rounded-lg border border-line hover:bg-soft inline-flex items-center gap-2 transition-colors"><span class="w-8 h-8 rounded-md bg-ubred text-white grid place-items-center text-[12.5px] font-extrabold">${esc(L(ME.ini))}</span><span class="hidden xl:inline text-[14px] font-semibold">${esc(L(ME.n))}</span>${ic('chevron-down', 'w-4 h-4 opacity-60')}</button>
  <div class="absolute right-0 top-[calc(100%+8px)] w-56 card shadow-2xl p-1.5 text-ink hidden z-[61]" data-usermenu><button type="button" data-act="my" class="w-full flex items-center gap-2.5 px-3 h-10 rounded-lg hover:bg-soft text-[14px] font-semibold">${ic('layout-dashboard', 'w-[18px] h-[18px]')}${t('myCorner')}</button><button type="button" data-act="logout" class="w-full flex items-center gap-2.5 px-3 h-10 rounded-lg hover:bg-soft text-[14px] font-semibold text-ubred">${ic('log-out', 'w-[18px] h-[18px]')}${t('logout')}</button></div></div>`;
}
function renderHeader() {
  const band = $('#hdr-band');
  if (!band.dataset.built) {
    band.innerHTML = `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 h-[62px] lg:h-[84px] flex items-center gap-3 lg:gap-6"><div id="hb-left" class="shrink-0 min-w-0"></div><div id="hb-sky" class="hidden lg:block flex-1 min-w-[120px] self-stretch relative sky-mask" aria-hidden="true"></div><div id="hb-right" class="flex items-center gap-1.5 sm:gap-2 ml-auto lg:ml-0 shrink-0"></div></div>`;
    band.dataset.built = '1';
    $('#hb-sky').innerHTML = skylineSVG('skd'); watchSky($('#hb-sky'));
  }
  const hl = $('#hb-left');
  if (!hl.dataset.built) {   // нэг удаа бүтээнэ: дараагийн renderHeader (хэл, горим солих) орох хөдөлгөөнийг таслахгүй
    hl.dataset.built = '1';
    hl.innerHTML = `<button type="button" data-act="home" class="logo-btn ${S.intro ? 'logo-intro' : ''} flex items-center gap-3 text-left">${logoEmblem('w-10 h-10 lg:w-[52px] lg:h-[52px]')}<span class="leading-tight min-w-0"><span class="logo-word block font-extrabold text-[19px] lg:text-[24px] tracking-[-0.025em]" data-brand></span><span class="logo-slogan hidden sm:block text-[12px] lg:text-[13px] font-semibold text-ubblue leading-[1.25] max-w-[160px] lg:max-w-none lg:whitespace-nowrap" data-slogan></span></span></button>`;
    if (S.intro) setTimeout(() => { const lb = $('.logo-btn', hl); if (lb) lb.classList.remove('logo-intro'); }, 2400);
  }
  $('.logo-btn', hl).setAttribute('aria-label', t('homeAria')); $('[data-brand]', hl).textContent = t('brand'); $('[data-slogan]', hl).textContent = t('slogan');
  const other = S.lang === 'mn' ? 'en' : 'mn';
  $('#hb-right').innerHTML = `<button type="button" data-act="search" class="w-10 h-10 rounded-lg btn-navy grid place-items-center" aria-label="${esc(t('search'))}" title="${esc(t('search'))} (Ctrl K)">${ic('search', 'w-[18px] h-[18px]')}</button>
    <div class="hidden sm:flex h-10 px-3 rounded-lg border border-line items-center gap-2.5 text-[13px] font-bold" role="group" aria-label="Language">${['mn', 'en'].map((l, i) => `${i ? '<span class="w-px h-4 bg-line"></span>' : ''}<button type="button" data-act="lang" data-v="${l}" aria-pressed="${S.lang === l}" class="transition-colors ${S.lang === l ? 'text-ink' : 'text-muted hover:text-ink'}">${l === 'mn' ? 'МН' : 'EN'}</button>`).join('')}</div>
    <button type="button" class="sm:hidden h-10 min-w-[40px] px-2 rounded-lg border border-line text-[13px] font-bold" data-act="lang" data-v="${other}" aria-label="${other === 'en' ? 'English' : 'Монгол'}">${other === 'en' ? 'EN' : 'МН'}</button>
    <span class="hidden md:inline-flex">${a11yBtn()}</span><span class="hidden md:inline-flex">${themeBtn(false)}</span>
    <span class="hidden md:block">${userBtn()}</span>
    <button type="button" data-act="menu" class="lg:hidden w-10 h-10 rounded-lg border border-line grid place-items-center hover:bg-soft" aria-label="${esc(t('menu'))}">${ic('menu')}</button>`;
  $('#topstrip').innerHTML = `<div class="hidden lg:block"><div class="max-w-site mx-auto px-8 h-[38px] flex items-center justify-between gap-6"><div id="pulse-strip">${pulseSegs('strip')}</div><div class="flex items-center gap-5 text-[12.5px] text-white/70 whitespace-nowrap"><span class="inline-flex items-center gap-1.5 tnum">${ic('clock-3', 'w-3.5 h-3.5')}<span data-live="clock">${clock()}</span></span><span class="inline-flex items-center gap-1.5">${ic('phone', 'w-3.5 h-3.5')}${t('hotlineShort')} <b class="text-white tnum">1200</b></span></div></div></div><div class="lg:hidden">${pulseSegs(true)}</div>`;
  /* Цэс: хөвөгч «dock» капсул. Шингэн тодруулга, гэрэлтэх хүрээ, доод ирмэгт уншилтын явцыг харуулах алхан хээ (setupNav). */
  const navBtn = (m, i) => `<li class="flex"><button type="button" class="nav-btn" data-menu="${i}" data-sec="${esc(m.sec)}" aria-expanded="false" aria-haspopup="true"><span>${menuLabel(m)}</span>${ic('chevron-down', 'nav-chev w-3.5 h-3.5')}</button></li>`;
  $('#hdr-nav').innerHTML = `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8"><nav class="dock" id="navbar" aria-label="Main"><span class="dock-glass" aria-hidden="true"><i></i></span><div class="dock-in">
    <button type="button" data-act="home" class="mini-logo shrink-0" tabindex="-1" aria-hidden="true">${logoEmblem('w-[34px] h-[34px]')}</button>
    <ul class="dock-items" id="nav-items"><li class="nav-pill" id="nav-pill" aria-hidden="true"></li><li class="nav-home-li"><button type="button" class="nav-btn nav-home" data-act="home">${ic('house', 'w-[17px] h-[17px]')}<span>${L(['Нүүр', 'Home'])}</span></button></li>${MENU.map(navBtn).join('')}</ul>
    <div class="ml-auto flex items-center gap-2 pl-3 shrink-0">
      <button type="button" data-act="search" class="dock-search" aria-label="${esc(t('search'))}" title="${esc(t('search'))} (Ctrl K)">${ic('search', 'w-[18px] h-[18px]')}</button>
    </div>
    <div class="mega" id="mega" role="region"><span class="mega-caret" aria-hidden="true"></span><div class="mega-card"><div class="mega-body"></div></div></div>
  </div><span class="dock-orn" aria-hidden="true"><i></i><i class="dock-orn-fill"></i></span></nav></div>`;
  setupNav();
}
function megaHTML(i) {
  const m = MENU[i];
  const feat = ({   // цэс бүрийн баруун талын онцлох хэсэг (түлхүүрээр)
    nav_services: () => { const s = SITS[0]; if (!s) return ''; return `<p class="text-[13px] text-muted">${t('s_sits')}</p><p class="mt-1 text-[17px] font-extrabold">${esc(L(s.t))}</p><p class="mt-1 text-[13.5px] text-muted">${t('stepsOnline', { n: s.steps.length, o: s.steps.filter((x) => x.m === 'on').length })}</p><button type="button" class="btn btn-sm btn-ink mt-4" data-act="go" data-sec="situations" data-sit="${esc(s.id)}">${t('sitPromoB')}</button>`; },
    nav_news: () => { const n = NEWS_BY[HERO_ID]; if (!n) return ''; return `<div class="scene rounded-xl aspect-[16/9]">${Scene(n.img)}</div><p class="mt-3 text-[14.5px] font-bold leading-snug line-clamp-3">${esc(L(n.t))}</p><button type="button" class="mt-2 text-[13px] font-bold text-ubblue" data-act="news" data-id="${HERO_ID}">${t('read')}</button>`; },
    nav_build: () => { const p = PROJECTS[0]; if (!p || !PCAT[p.c]) return ''; return `<div class="flex items-center gap-4">${projBadge(p, 64, 7, 15)}<div><p class="text-[13px] text-muted">${esc(L(PCAT[p.c].t))}</p><p class="font-extrabold leading-snug">${esc(L(p.n))}</p><p class="text-[13px] text-muted mt-0.5">${p.p != null ? `<b class="text-[22px] text-ink tnum">${p.p}%</b>` : p.ups && p.ups[0] ? esc(p.ups[0].t).slice(0, 70) + '…' : ''}</p></div></div><button type="button" class="btn btn-sm btn-ink mt-4" data-act="go" data-sec="projects" data-pid="p1">${t('showOnMap')}</button>`; },
    nav_data: () => { const c = aqiCat(S.aqi); return `<p class="text-[13px] text-muted">${t('aqi')}</p><p class="text-[40px] leading-none font-extrabold tnum mt-1"><span data-live="aqi">${S.aqi}</span></p><p class="font-semibold mt-1" style="color:${c.c}">${t(c.k)}</p><p class="text-[13px] text-muted mt-2">${t('updated')} <span class="tnum" data-live="clock">${clock()}</span></p>`; },
    nav_open: () => `<p class="text-[13px] text-muted">${t('trStat2')}</p><p class="text-[40px] leading-none font-extrabold tnum mt-1">37</p><p class="text-[13.5px] text-muted mt-2">${t('trStat1')}: <b class="text-ink tnum">1 248</b></p>`,
    nav_about: () => `<p class="text-[13px] text-muted">${t('founded')}</p><p class="text-[40px] leading-none font-extrabold tnum mt-1">1639</p><p class="text-[13.5px] text-muted mt-2">${t('adminV')}</p>`,
  }[m.k] || (() => ''))();
  return `<div class="p-4 xl:p-5 grid grid-cols-12 gap-4 xl:gap-5">
    <div class="col-span-8 grid grid-cols-2 gap-1 content-start">${m.items.map((it, k) => `<button type="button" class="mega-item" style="--i:${k}" ${itemAct(it)}><span class="mega-ic">${ic(it.i)}</span><span class="min-w-0 flex-1"><b class="block text-[15px] leading-snug">${esc(L(it.t))}</b><span class="block text-[13px] text-muted leading-snug mt-0.5">${esc(L(it.d))}</span></span><span class="mega-go">${ic(it.href ? 'arrow-up-right' : 'arrow-right', 'w-4 h-4')}</span></button>`).join('')}</div>
    <div class="col-span-4 mega-feat" style="--i:${m.items.length}">${feat}</div></div>`;
}
let megaTimer = null, megaOpen = -1, hoverOpen = false;
const NAV_EASE = 'cubic-bezier(.22, 1, .36, 1)';
function setupNav() {
  const nav = $('#navbar'); if (!nav) return;
  const mega = $('#mega'), card = $('.mega-card', mega), body = $('.mega-body', mega), caret = $('.mega-caret', mega), pill = $('#nav-pill');
  let pillOn = false;
  /* Шингэн тодруулга: шинэ зүйл рүү шилжихдээ эхлээд хоёуланг нь хамрах хүртэл сунаж, дараа нь хумигдана */
  const pillTo = (btn) => {
    if (!btn) { pill.style.opacity = '0'; pillOn = false; return; }
    const x = btn.parentElement.offsetLeft, w = btn.offsetWidth;
    const cs = getComputedStyle(pill), x0 = new DOMMatrixReadOnly(cs.transform === 'none' ? undefined : cs.transform).m41, w0 = parseFloat(cs.width) || w;
    pill.getAnimations().forEach((a) => a.cancel());
    pill.style.width = w + 'px'; pill.style.transform = `translateX(${x}px)`;
    if (pillOn && !reduced && Math.abs(x0 - x) > 1) {
      const l = Math.min(x0, x), r = Math.max(x0 + w0, x + w);
      // 1) 200мс: хоёуланг нь бүрхтэл сунана  2) 280мс: шинэ байрлалдаа зөөлөн хумигдана
      pill.animate([
        { transform: `translateX(${x0}px)`, width: w0 + 'px', easing: 'cubic-bezier(.45, 0, .25, 1)' },
        { transform: `translateX(${l}px)`, width: r - l + 'px', offset: 0.42, easing: NAV_EASE },
        { transform: `translateX(${x}px)`, width: w + 'px' },
      ], { duration: 480 });
    }
    pill.style.opacity = '1'; pillOn = true;
  };
  const placeCaret = (btn) => { const r = btn.getBoundingClientRect(), m = mega.getBoundingClientRect(); caret.style.transform = `translateX(${Math.round(r.left + r.width / 2 - m.left - 7)}px) rotate(45deg)`; };
  const open = (i, byHover) => {
    clearTimeout(megaTimer);
    if (megaOpen === i) { if (!byHover) hoverOpen = false; return; }
    const prev = megaOpen, btn = $(`.nav-btn[data-menu="${i}"]`, nav);
    hoverOpen = !!byHover; megaOpen = i;
    if (prev < 0) {
      body.innerHTML = megaHTML(i);
      caret.style.transition = 'none'; placeCaret(btn); void caret.offsetWidth; caret.style.transition = '';
      mega.classList.add('open');
    } else {   // нээлттэй үед өөр цэс рүү: өндөр нь зөөлөн өөрчлөгдөж, агуулга чиглэлээрээ гулсана
      const h0 = card.offsetHeight; body.innerHTML = megaHTML(i); const h1 = card.offsetHeight;
      if (!reduced) {
        const dir = i > prev ? 1 : -1;
        card.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 380, easing: NAV_EASE });
        body.animate([{ opacity: 0, transform: `translateX(${dir * 26}px)` }, { opacity: 1, transform: 'none' }], { duration: 380, easing: NAV_EASE });
      }
      placeCaret(btn);
    }
    $$('.nav-btn[data-menu]', nav).forEach((b) => b.setAttribute('aria-expanded', String(+b.dataset.menu === i)));
    pillTo(btn);
  };
  const close = () => { megaOpen = -1; mega.classList.remove('open'); $$('.nav-btn[data-menu]', nav).forEach((b) => b.setAttribute('aria-expanded', 'false')); pillTo(null); };
  nav._close = close; nav._moveInd = () => { if (megaOpen < 0) pillTo(null); };
  nav.addEventListener('mouseover', (e) => { const b = e.target.closest('.nav-btn[data-menu]'); if (b) open(+b.dataset.menu, true); else if (e.target.closest('#mega')) clearTimeout(megaTimer); });
  nav.addEventListener('mouseleave', () => { megaTimer = setTimeout(close, 160); });
  nav.addEventListener('click', (e) => { const b = e.target.closest('.nav-btn[data-menu]'); if (b) { const i = +b.dataset.menu, pk = MENU[i] && pageOf({ sec: MENU[i].sec }); if (pk) { close(); openPage(pk); return; } if (megaOpen === i && !hoverOpen) close(); else open(i, false); } else if (e.target.closest('[data-act="go"], [data-act="ext-link"]')) close(); });
  nav.addEventListener('focusout', (e) => { if (!nav.contains(e.relatedTarget)) close(); });
  /* Курсорын байрлалд хүрээ гэрэлтэнэ (.dock::before) */
  nav.addEventListener('pointermove', (e) => { const r = nav.getBoundingClientRect(); nav.style.setProperty('--mx', Math.round(e.clientX - r.left) + 'px'); nav.style.setProperty('--my', Math.round(e.clientY - r.top) + 'px'); });
  megaOpen = -1; dockProgress();
}
/* Алхан хээ хуудсыг гүйлгэх тусам өнгөөр дүүрнэ (нүүр хуудсанд) */
let dockRaf = 0;
function dockProgress() {
  const n = $('#navbar'); if (!n) return;
  const h = document.documentElement.scrollHeight - innerHeight, w = n.offsetWidth;
  n.style.setProperty('--prog', (S.route === 'home' || S.route === 'page') && h > 0 ? Math.min(1, Math.max(0, scrollY / h)).toFixed(4) : '0');
  n.style.setProperty('--gx', Math.round((scrollY * 0.45) % (w + 480) - 240) + 'px');   // шилэн дээгүүр гулсах туяа: гүйлгэх тусам зүүнээс баруун тийш
  // Adaptive glass: цэсийн доорх хэсэг бараан бол шил бараан, бичиг цагаан болно
  let dark = false;
  if (n.classList.contains('stuck')) { const r = n.getBoundingClientRect(); dark = isDarkBg(document.elementFromPoint(r.left + r.width / 2, r.bottom + 8)); }
  n.classList.toggle('on-dark', dark);
}
function isDarkBg(el) {   // хамгийн ойрын тунгалаг бус дэвсгэрийн гэрэлтэлт
  for (; el && el !== document.documentElement; el = el.parentElement) {
    const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    if (m && (m.length < 4 || +m[3] > 0.5)) return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 < 0.42;
  }
  return false;
}
function setActiveNav(sec) {
  const map = { hero: 'nav_news', hub: S.hub === 'services' ? 'nav_services' : 'nav_news', gov: 'nav_about', situations: 'nav_services', media: 'nav_news', projects: 'nav_build', data: 'nav_data', events: 'nav_news', transparency: 'nav_open', about: 'nav_about' };
  const pg = S.route === 'page' && PAGES[S.page], key = pg ? pg.mk : map[sec], idx = MENU.findIndex((m) => m.k === key);
  $$('.nav-btn').forEach((b) => b.classList.toggle('is-active', +b.dataset.menu === idx && (!!pg || sec !== 'hero')));
  const nav = $('#navbar'); if (nav && megaOpen < 0 && nav._moveInd) nav._moveInd($('.nav-btn.is-active', nav));
  const hb = nav && $('.nav-home', nav); if (hb) hb.classList.toggle('is-active', S.route === 'home' && sec === 'hero');   // «Нүүр» цэс үргэлж байна; нүүрний эхэнд байхад тодорно
  const bb = pg ? { services: 'services', news: 'news', events: 'news', media: 'news' }[S.page] || '' : { hero: 'home', hub: S.hub === 'services' ? 'services' : 'news', situations: 'services', media: 'news', events: 'news' }[sec] || 'home';
  $$('.bb-item').forEach((b) => b.setAttribute('aria-current', String(S.route === 'my' ? b.dataset.bb === 'my' : b.dataset.bb === bb)));
}

