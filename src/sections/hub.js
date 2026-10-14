/* ================= Hub: news / services / events ================= */
const HUBS = ['news', 'services', 'events'];
const NEWS_CATS = ['all', 'biz', 'city', 'transport', 'edu', 'env', 'util', 'health', 'zar'];
/* Мэдээний төрөл (ulaanbaatar.mn-ийнхтэй ижил, server/sources/news.ts). nt-гүй мэдээ = цаг үеийн мэдээ. */
const NEWS_NT = { time: ['Цаг үеийн мэдээ', 'Current news'], place: ['Харьяа газрын мэдээ', 'Agency news'], review: ['Хэвлэлийн тойм', 'Press review'] };
const ntOf = (n) => (NEWS_NT[n.nt] ? n.nt : 'time');
/* ---- Нүүр хуудас: хэсэг бүрийн товч хувилбар. Бүтэн агуулга нь цэсний хуудсанд (/events, /data ...) ---- */
const onHome = () => S.route !== 'page';
function homeHead(title, desc, act, label) {
  return `<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7"><div class="min-w-0"><h2 class="h-section">${title}</h2>${desc ? `<p class="mt-2 text-muted max-w-[62ch]">${desc}</p>` : ''}</div><button type="button" class="btn btn-ghost self-start sm:self-auto shrink-0" ${act}>${label || L(['Бүгдийг үзэх', 'See all'])}${ic('arrow-right', 'w-[18px] h-[18px]')}</button></div>`;
}
const homeWrap = (inner, card) => `${card ? '<div class="bg-card border-y border-line">' : ''}<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">${inner}</div>${card ? '</div>' : ''}`;
function renderHub() {
  // Тусдаа хуудсанд (/news, /services) энэ хэсэг бүрэн жагсаалт болж хувирна
  if (S.route === 'page' && S.page === 'news') { $('#hub').innerHTML = newsAllHTML(); seasonBind(); return; }
  if (S.route === 'page' && S.page === 'services') { $('#hub').innerHTML = `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-14 lg:pb-20"><div id="hub-panel">${svcPanel()}</div></div>`; return; }
  $('#hub').innerHTML = `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 pb-14 lg:pb-20"><div class="border-t border-line pt-10 lg:pt-14">
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-7"><div><h2 class="h-section">${t('hubTitle')}</h2><p class="mt-2 text-muted max-w-[60ch]">${t('hubDesc')}</p></div>
    ${tabs('hub', [['news', t('tab_news'), 'newspaper'], ['services', t('tab_services'), 'layout-grid'], ['events', t('tab_events'), 'calendar-days']], S.hub, { lg: 1, label: t('hubTitle'), cls: 'self-start lg:self-auto' })}</div>
    <div id="hub-panel">${hubPanel()}</div></div></div>`;
  seasonBind();
}
function hubPanel() {
  const more = (k, label) => `<div class="mt-6"><button type="button" class="btn btn-ghost" data-act="page" data-v="${k}">${label}${ic('arrow-right', 'w-[18px] h-[18px]')}</button></div>`;
  if (S.hub === 'news') return seasonWrap(newsPanel() + more('news', `${t('allNews')} (${num(NEWS.filter((n) => !n.draft).length)})`));   // улирлын мод, тоосонцор (features/season.js)
  if (S.hub === 'services') return svcPanel() + (S.route === 'page' ? '' : more('services', L(['Бүх үйлчилгээ', 'All services'])));
  return evTeaser();
}
/* ---- /news хуудас: бүх мэдээ, хайлт, ангилал, эрэмбэ, «Цааш үзэх» ---- */
const NEWS_STEP = 12;
function newsAllHTML() {
  return `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-16 lg:pb-24">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="relative w-full sm:max-w-[420px]">${ic('search', 'w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none')}<input id="news-q" data-input="newsQ" type="search" value="${esc(S.newsQ)}" placeholder="${esc(L(['Мэдээ хайх...', 'Search news...']))}" class="field !pl-11" aria-label="${esc(L(['Мэдээ хайх', 'Search news']))}" autocomplete="off"/></div>
      ${tabs('nsort', [['new', L(['Шинэ нь эхэндээ', 'Newest']), 'clock-3'], ['top', L(['Их уншсан', 'Most read']), 'flame']], S.newsSort, { label: L(['Эрэмбэ', 'Sort']), cls: 'self-start sm:self-auto' })}
    </div>
    <div class="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0" id="news-chips">${chips('news-cat', NEWS_CATS.map((c) => [c, c === 'all' ? t('f_all') : L(RUB[c].t), c === 'all' ? '' : RUB[c].c]), S.newsCat)}</div>
    <div class="mt-6">${seasonWrap(`<div id="news-grid">${newsGridAll()}</div>`)}</div></div>`;
}
function newsGridAll(fromN = 0) {
  const q = S.newsQ.trim().toLowerCase();
  let list = NEWS.filter((n) => !n.draft);
  if (S.newsType !== 'all') list = list.filter((n) => ntOf(n) === S.newsType);
  if (S.newsCat !== 'all') list = list.filter((n) => n.cat === S.newsCat || (S.newsCat === 'city' && n.cat === 'plan') || (S.newsCat === 'zar' && n.zar));
  if (q) list = list.filter((n) => (L(n.t) + ' ' + Lf(n.l)).toLowerCase().includes(q));
  list = list.slice().sort(S.newsSort === 'top' ? (a, b) => (b.views || 0) - (a.views || 0) : (a, b) => a.ago - b.ago);
  if (!list.length) return `<div class="card p-12 text-center text-muted">${ic('search-x', 'w-8 h-8 mx-auto mb-3 opacity-60')}${t('noResults')}</div>`;
  const feat = !q && S.newsCat === 'all' && S.newsSort === 'new', shown = list.slice(0, S.newsN - (feat ? 1 : 0));   // өргөн карт 2 зай эзэлдэг тул тор тэгш дүүрнэ
  const cards = shown.map((n, i) => newsCard(n, feat && i === 0).replace('<button ', `<button data-na="${i >= fromN ? 1 : 0}" style="--i:${Math.max(0, i - fromN)}" `)).join('');
  const pct = Math.round((shown.length / list.length) * 100);
  return `<p class="mb-4 text-[13.5px] text-muted">${S.newsType !== 'all' ? `<b class="text-ink">${esc(L(NEWS_NT[S.newsType]))}</b> · ` : ''}${q ? L([`«${esc(S.newsQ.trim())}»: ${list.length} илэрц`, `“${esc(S.newsQ.trim())}”: ${list.length} results`]) : L([`Нийт ${num(list.length)} мэдээ`, `${num(list.length)} stories`])}</p>
    <div class="na-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">${cards}</div>
    <div class="mt-10 flex flex-col items-center gap-3"><span class="text-[13px] text-muted tnum">${L([`${num(list.length)} мэдээнээс ${num(shown.length)}-г үзлээ`, `Showing ${num(shown.length)} of ${num(list.length)}`])}</span><span class="na-prog"><i style="width:${pct}%"></i></span>
      ${list.length > shown.length ? `<button type="button" class="btn btn-ink mt-1" data-act="news-more">${ic('chevrons-down', 'w-[18px] h-[18px]')}${L(['Цааш үзэх', 'Load more'])}</button>` : ''}</div>`;
}
function setNewsSort(v) {
  if (v === S.newsSort) return;
  S.newsSort = v; S.newsN = NEWS_STEP; selectTab('nsort', v);
  swap($('#news-grid'), newsGridAll(), 0);
}
function newsPanel() {
  return `<div class="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0" id="news-chips">${chips('news-cat', NEWS_CATS.map((c) => [c, c === 'all' ? t('f_all') : L(RUB[c].t), c === 'all' ? '' : RUB[c].c]), S.newsCat)}</div><div id="news-grid">${newsGrid()}</div>`;
}
function newsGrid() {
  let list = NEWS.filter((n) => n.id !== HERO_ID);
  if (S.newsCat !== 'all') list = list.filter((n) => n.cat === S.newsCat || (S.newsCat === 'city' && n.cat === 'plan'));
  list = list.slice().sort((a, b) => a.ago - b.ago);
  // нүүрэнд 2 мөр: онцлох (2 багана) + 4, ангиллаар шүүхэд 6
  if (S.newsCat === 'all') list = [NEWS_BY[FEATURED_ID]].filter(Boolean).concat(list.filter((n) => n.id !== FEATURED_ID)).slice(0, 5);
  else list = list.slice(0, 6);
  if (!list.length) return `<p class="text-muted py-10 text-center">${t('noResults')}</p>`;
  return `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">${list.map((n, i) => newsCard(n, i === 0 && S.newsCat === 'all')).join('')}</div>`;
}
function newsCard(n, feat) {
  const meta = `<span class="mt-auto pt-4 flex items-center gap-4 text-[12.5px] text-muted">${ago(n.ago)}<span class="inline-flex items-center gap-1 tnum">${ic('eye', 'w-4 h-4')}${num(n.views)}</span></span>`;
  const hov = 'group-hover:text-ubred transition-colors';
  if (n.zar) return `<button type="button" class="group lift card text-left p-5 flex flex-col relative overflow-hidden" data-act="news" data-id="${n.id}"><span class="absolute inset-x-0 top-0 h-1 bg-ubyellow"></span><span class="flex items-center gap-2.5 text-[12.5px] font-semibold text-muted"><span class="w-8 h-8 rounded-lg bg-ubyellow/25 text-amberink grid place-items-center">${ic('megaphone', 'w-[18px] h-[18px]')}</span>${esc(L(RUB.zar.t))}</span><span class="mt-3 text-[17px] font-bold leading-snug ${hov}">${esc(L(n.t))}</span><span class="mt-2 text-[14px] text-muted leading-relaxed line-clamp-3">${esc(Lf(n.l))}</span>${meta}</button>`;
  if (feat) return `<button type="button" class="group lift card text-left overflow-hidden sm:col-span-2 grid grid-cols-1 sm:grid-cols-2" data-act="news" data-id="${n.id}"><div class="scene zoom aspect-[16/10] sm:aspect-auto sm:h-full min-h-[220px]">${Scene(n.img)}</div><div class="p-6 flex flex-col">${rubTag(n)}<span class="mt-3 text-[24px] font-extrabold leading-[1.14] tracking-[-0.022em] ${hov}">${esc(L(n.t))}</span><span class="mt-3 text-[15px] text-muted leading-relaxed line-clamp-4">${esc(Lf(n.l))}</span>${meta}</div></button>`;
  return `<button type="button" class="group lift card text-left overflow-hidden flex flex-col" data-act="news" data-id="${n.id}"><div class="scene zoom aspect-[16/10]">${Scene(n.img)}</div><div class="p-5 flex flex-col flex-1">${rubTag(n)}<span class="mt-2.5 text-[17px] font-bold leading-snug line-clamp-3 ${hov}">${esc(L(n.t))}</span>${meta}</div></button>`;
}

function svcPanel() {
  return `<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">${tabs('svc', [['citizen', L(['Иргэн', 'Residents']), 'user-round'], ['business', L(['Аж ахуйн нэгж', 'Businesses']), 'briefcase'], ['esys', L(['Цахим системүүд', 'E-services']), 'monitor-smartphone']], S.svcTab, { label: t('tab_services') })}
    <div class="relative w-full md:w-80">${ic('search', 'w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none')}<input id="svc-q" data-input="svcQ" type="search" value="${esc(S.svcQ)}" placeholder="${esc(t('svcSearch'))}" class="field !pl-11" aria-label="${esc(t('svcSearch'))}" autocomplete="off"/></div></div>
    <div id="svc-grid">${svcGrid()}</div>
    <div class="mt-6 rounded-[8px] bg-card border border-line p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"><span class="w-12 h-12 rounded-2xl bg-ubred/10 text-ubred grid place-items-center shrink-0">${ic('route', 'w-6 h-6')}</span><div class="flex-1"><b class="block text-[16px]">${t('sitPromoT')}</b><span class="text-[14px] text-muted">${t('sitPromoD')}</span></div><button type="button" class="btn btn-ink" data-act="go" data-sec="situations">${t('sitPromoB')}</button></div>`;
}
function svcGrid() {
  const q = S.svcQ.trim().toLowerCase();
  const list = q ? ALL_SVC.filter((s) => (s.t[0] + ' ' + s.t[1] + ' ' + s.d[0] + ' ' + s.d[1]).toLowerCase().includes(q)) : ALL_SVC.filter((s) => s.g === S.svcTab);
  if (!list.length) return `<div class="card p-10 text-center text-muted">${ic('search-x', 'w-8 h-8 mx-auto mb-3 opacity-60')}${t('noResults')}</div>`;
  return `<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">${list.map(svcTile).join('')}</div>`;
}
function modeBadge(m) {
  if (m === 'sys') return `<span class="badge b-blue">${ic('external-link', 'w-3.5 h-3.5')}${t('system')}</span>`;
  return m === 'on' ? `<span class="badge b-on">${ic('wifi', 'w-3.5 h-3.5')}${t('online')}</span>` : `<span class="badge b-off">${ic('footprints', 'w-3.5 h-3.5')}${t('inperson')}</span>`;
}
function svcTile(s) {
  return `<button type="button" class="lift lift-blue card p-4 sm:p-5 text-left flex flex-col gap-3 h-full" data-act="svc" data-id="${s.id}"><span class="w-11 h-11 rounded-xl bg-ubblue/10 text-ubblue grid place-items-center">${ic(s.i, 'w-[22px] h-[22px]')}</span><span class="font-bold text-[15.5px] leading-snug">${esc(L(s.t))}</span><span class="text-[13.5px] text-muted leading-snug line-clamp-2">${esc(L(s.d))}</span><span class="mt-auto pt-1">${modeBadge(s.m)}</span></button>`;
}
function evTeaser() {
  const list = EVENTS.map((e) => Object.assign({}, e, { d: evDate(e.w) })).sort(evSort).slice(0, 4);
  return `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">${list.map(evCard).join('')}</div><div class="mt-6"><button type="button" class="btn btn-ghost" data-act="go" data-sec="events">${ic('calendar-days', 'w-[18px] h-[18px]')}${t('allEvents')}</button></div>`;
}
function setHub(v) {
  if (v === S.hub) return;
  const dir = HUBS.indexOf(v) > HUBS.indexOf(S.hub) ? 1 : -1;
  S.hub = v; selectTab('hub', v);
  swap($('#hub-panel'), hubPanel(), dir, (el) => { initTabs(el); seasonBind(); });
  setActiveNav(currentSec);
}
function setSvcTab(v) {
  const order = ['citizen', 'business', 'esys'], dir = order.indexOf(v) >= order.indexOf(S.svcTab) ? 1 : -1;
  S.svcTab = v; S.svcQ = '';
  const q = $('#svc-q'); if (q) q.value = '';
  if (!$('#svc-grid')) return;
  selectTab('svc', v); swap($('#svc-grid'), svcGrid(), dir);
  renderPageLinks();
}
function setNewsCat(v) {
  S.newsCat = v; S.newsN = NEWS_STEP;
  $$('[data-act="news-cat"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
  if ($('#news-grid')) swap($('#news-grid'), S.route === 'page' && S.page === 'news' ? newsGridAll() : newsGrid(), 0);
  renderPageLinks();
}

