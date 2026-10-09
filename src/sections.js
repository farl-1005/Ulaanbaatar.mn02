/* ================= Hero ================= */
function rubTag(n) { const r = RUB[n.cat]; return `<span class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted"><i class="w-2 h-2 rounded-full" style="background:${r.c}"></i>${esc(L(r.t))}</span>`; }
function breakingHTML(newId) {
  const now = ubNow();
  return S.breaking.map((b) => {
    const n = NEWS_BY[b.id], r = RUB[n.cat], hot = Math.round((now - b.ts) / 60000) < 30, dot = hot ? 'rgb(var(--c-red))' : r.c;
    return `<li class="brk-item ${b.id === newId ? 'brk-new' : ''}"><span class="brk-time tnum ${hot ? 'text-ubred' : 'text-muted'}">${dkey(b.ts) === dkey(today()) ? hhmm(b.ts) : (b.ts.getMonth() + 1) + '/' + pad(b.ts.getDate())}</span><span class="brk-dot ${hot ? 'live' : ''}" style="--dot:${dot};background:${dot}"></span><button type="button" class="brk group" data-act="news" data-id="${n.id}"><span class="flex items-center gap-2 text-[12px] font-semibold text-muted"><span class="truncate">${esc(L(r.t))}</span>${b.fresh ? `<span class="badge bg-ubred text-white !h-[18px] !px-1.5 !text-[10.5px]">${t('isNew')}</span>` : ''}</span><span class="block mt-0.5 text-[15px] font-semibold leading-snug group-hover:text-ubred transition-colors">${esc(L(n.t))}</span></button></li>`;
  }).join('');
}

function govHTML() {
  return `<div class="card overflow-hidden">
    <div class="bg-navy text-white p-5 relative overflow-hidden"><svg viewBox="0 0 40 40" class="absolute -right-10 -top-10 w-44 h-44 text-white/[.07]" aria-hidden="true"><circle cx="20" cy="20" r="9.6" fill="none" stroke="currentColor" stroke-width="1.2"/><path d="M20 2v8M20 30v8M2 20h8M30 20h8M7 7l6 6M27 27l6 6M7 33l6-6M27 13l6-6" stroke="currentColor" stroke-width="1.2"/></svg>
      <div class="relative flex items-center gap-3"><span class="w-12 h-12 rounded-2xl bg-white/10 grid place-items-center">${logoMark('w-8 h-8')}</span><div class="min-w-0"><h2 class="font-extrabold text-[17px] leading-tight">${t('govNews')}</h2><p class="text-[12.5px] text-white/65 leading-snug mt-0.5">${t('govRole')}</p></div></div></div>
    <ul class="divide-y divide-line">${GOV.map((gid) => NEWS_BY[gid]).map((g) => `<li><button type="button" class="w-full text-left px-5 py-4 hover:bg-soft transition-colors" data-act="news" data-id="${g.id}"><span class="block text-[12.5px] text-muted">${ago(g.ago)}</span><span class="block mt-1 text-[14.5px] font-semibold leading-snug">${esc(L(g.t))}</span></button></li>`).join('')}</ul>
    <button type="button" class="w-full flex items-center justify-between px-5 py-4 border-t border-line text-[14px] font-bold text-ubblue hover:bg-soft transition-colors" data-act="vote" data-tab="idea" data-gov="1">${t('govLetter')}${ic('pen-line', 'w-[18px] h-[18px]')}</button></div>
  <div class="grid gap-3 mt-4">
    ${ctaCard('report', 'cta-red', 'siren', t('cta_report'), t('reportDesc'), L(['24/7 · ~1 минут', '24/7 · ~1 min']))}
    ${ctaCard('vote', 'cta-blue', 'vote', t('cta_vote'), t('voteDesc'), L(['Таны санал хотыг өөрчилнө', 'Your voice shapes the city']))}</div>`;
}
/* Hero хажуугийн том CTA карт: градиент, гялбаа, хөдөлгөөнт тэмдэг */
function ctaCard(act, cls, icon, title, desc, meta) {
  return `<button type="button" class="cta-card ${cls} group" data-act="${act}">
    <span class="flex items-start justify-between w-full"><span class="cta-ic">${animIcon(icon, 'w-[26px] h-[26px]')}</span><span class="cta-arrow">${ic('arrow-up-right', 'w-[18px] h-[18px]')}</span></span>
    <span class="block mt-4"><b class="block text-[18px] leading-tight tracking-[-0.01em]">${title}</b><span class="block mt-1.5 text-[13.5px] text-white/80 leading-snug">${desc}</span></span>
    <span class="cta-meta">${ic(act === 'report' ? 'clock-3' : 'sparkles', 'w-3.5 h-3.5')}${meta}</span>
    <span class="cta-bg" aria-hidden="true">${ic(icon, 'w-full h-full', 1.4)}</span></button>`;
}
function renderHero() {
  const m = NEWS_BY[HERO_ID]; if (!m) { $('#hero').innerHTML = ''; return; }
  const rub = RUB[m.cat] || RUB.city, rel = (m.rel || []).map((id) => NEWS_BY[id]).filter((x) => x && x.id !== m.id);
  NEWS.forEach((n) => { if (rel.length < 3 && n.id !== m.id && !n.zar && !rel.includes(n)) rel.push(n); });
  $('#hero').innerHTML = `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-9 pb-12 lg:pb-16 ${S.intro ? 'intro' : ''}">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-7 gap-y-10">
    <article class="md:col-span-2 lg:col-span-6 lg:order-2 min-w-0">
      <button type="button" class="block w-full text-left zoom-on" data-act="news" data-id="${m.id}" aria-label="${esc(L(m.t))}"><div class="scene zoom hero-img aspect-[16/9] rounded-[20px]">${Scene(m.img)}<span class="absolute left-4 top-4 inline-flex items-center gap-2 h-8 px-3 rounded-full bg-white/90 text-[#0B1D45] text-[13px] font-bold"><i class="w-2 h-2 rounded-full" style="background:${rub.c}"></i>${esc(L(rub.t))}</span></div></button>
      <div class="hero-fade" style="--d:.5s">
        <div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted"><span class="inline-flex items-center gap-1.5">${ic('clock-3', 'w-4 h-4')}${ago(m.ago)}</span><span class="inline-flex items-center gap-1.5">${ic('book-open', 'w-4 h-4')}${t('minRead', { n: m.mins || Math.max(1, Math.ceil((String((m.l || [''])[0]).length + (m.b || []).reduce((a, p) => a + String(p[0] || '').length, 0)) / 900)) })}</span><span class="inline-flex items-center gap-1.5 tnum">${ic('eye', 'w-4 h-4')}${num(m.views)}</span></div>
        <h1 class="mt-3 text-[27px] sm:text-[34px] xl:text-[40px] leading-[1.08] font-extrabold tracking-[-0.028em]"><button type="button" class="text-left hover:text-ubred transition-colors" data-act="news" data-id="${m.id}">${esc(L(m.t))}</button></h1>
        <p class="mt-4 text-[16.5px] leading-relaxed text-muted max-w-[62ch]">${esc(Lf(m.l))}</p>
        <div class="mt-6 flex flex-wrap gap-3"><button type="button" class="btn btn-ink" data-act="news" data-id="${m.id}">${ic('book-open', 'w-[18px] h-[18px]')}${t('read')}</button><button type="button" class="btn btn-ghost" data-act="vote" data-tab="idea">${ic('message-square-plus', 'w-[18px] h-[18px]')}${t('cta_vote')}</button></div>
      </div>
      <div class="hero-fade mt-8 pt-5 border-t border-line grid grid-cols-1 sm:grid-cols-3 gap-5" style="--d:.7s">${rel.map((r) => `<button type="button" class="group text-left flex sm:block gap-3 zoom-on" data-act="news" data-id="${r.id}"><div class="scene zoom rounded-xl w-24 h-[72px] sm:w-full sm:h-auto sm:aspect-[16/9] shrink-0">${Scene(r.img)}</div><span class="block sm:mt-3 text-[14.5px] font-semibold leading-snug group-hover:text-ubred transition-colors line-clamp-3">${esc(L(r.t))}</span></button>`).join('')}</div>
    </article>
    <aside class="lg:col-span-3 lg:order-1 min-w-0 hero-fade" style="--d:.25s" aria-label="${esc(t('breaking'))}">
      <div class="brk-head mb-2 px-1"><h2 class="text-[19px] font-extrabold tracking-tight flex items-center gap-2.5">${fireIcon()}${t('breaking')}</h2><p class="text-[12.5px] text-muted mt-0.5 pl-[32px]">${t('liveUpd')}</p></div>
      <ol id="brk-list" class="space-y-0.5 max-h-[660px] overflow-auto thin-scroll fade-b pb-8 relative">${breakingHTML()}</ol>
      <button type="button" class="mt-1 px-1 text-[14px] font-bold text-ubblue inline-flex items-center gap-1" data-act="go" data-sec="hub" data-hub="news">${t('allNews')}${ic('chevron-right', 'w-4 h-4')}</button>
    </aside>
    <aside class="lg:col-span-3 lg:order-3 min-w-0 hero-fade" style="--d:.4s">${govHTML()}</aside>
  </div>${quickHTML()}</div>`;
}
const QUICK = ['c2', 'c3', 'c4', 'c8', 'c1', 'c5', 'b1', 'e1'];
function quickHTML() {
  const items = QUICK.map((id) => ALL_SVC.find((s) => s.id === id)).filter(Boolean);
  const mode = (m) => (m === 'off' ? ['bg-ubamber', t('inperson')] : m === 'sys' ? ['bg-ubblue', t('system')] : ['bg-ubgreen', t('online')]);
  return `<div class="quick-rail hero-fade mt-12 lg:mt-14" style="--d:.85s"><div class="flex items-end justify-between gap-4 mb-4"><h2 class="text-[20px] font-extrabold tracking-tight">${t('popularSvc')}</h2><button type="button" class="text-[14px] font-bold text-ubblue inline-flex items-center gap-1" data-act="go" data-sec="hub" data-hub="services">${t('allServices')}${ic('chevron-right', 'w-4 h-4')}</button></div>
  <div class="panel !rounded-[22px] overflow-hidden"><div class="grid grid-flow-col auto-cols-[minmax(152px,1fr)] overflow-x-auto no-scrollbar snap-x">${items.map((s) => { const [dc, ml] = mode(s.m); return `<button type="button" class="group snap-start relative flex flex-col items-start gap-3 p-4 sm:p-5 min-h-[150px] text-left border-r border-line last:border-r-0 hover:bg-soft transition-colors" data-act="svc" data-id="${s.id}"><span class="w-11 h-11 rounded-[14px] grid place-items-center bg-ubred/10 text-ubred transition-all duration-300 group-hover:bg-ubred group-hover:text-white group-hover:-rotate-6">${ic(s.i, 'w-[22px] h-[22px]')}</span><span class="font-bold text-[14.5px] leading-snug pr-3">${esc(L(s.t))}</span><span class="mt-auto inline-flex items-center gap-1.5 text-[12.5px] text-muted"><i class="w-1.5 h-1.5 rounded-full ${dc}"></i>${ml}</span>${ic('arrow-up-right', 'w-4 h-4 absolute right-3.5 top-4 text-muted opacity-0 -translate-x-1 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0')}</button>`; }).join('')}</div></div></div>`;
}

/* ================= Hub: news / services / events ================= */
const HUBS = ['news', 'services', 'events'];
const NEWS_CATS = ['all', 'biz', 'city', 'transport', 'edu', 'env', 'util', 'health', 'zar'];
function renderHub() {
  $('#hub').innerHTML = `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 pb-14 lg:pb-20"><div class="border-t border-line pt-10 lg:pt-14">
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-7"><div><h2 class="h-section">${t('hubTitle')}</h2><p class="mt-2 text-muted max-w-[60ch]">${t('hubDesc')}</p></div>
    ${tabs('hub', [['news', t('tab_news'), 'newspaper'], ['services', t('tab_services'), 'layout-grid'], ['events', t('tab_events'), 'calendar-days']], S.hub, { lg: 1, label: t('hubTitle'), cls: 'self-start lg:self-auto' })}</div>
    <div id="hub-panel">${hubPanel()}</div></div></div>`;
}
function hubPanel() { return S.hub === 'news' ? newsPanel() : S.hub === 'services' ? svcPanel() : evTeaser(); }
function newsPanel() {
  return `<div class="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0" id="news-chips">${chips('news-cat', NEWS_CATS.map((c) => [c, c === 'all' ? t('f_all') : L(RUB[c].t), c === 'all' ? '' : RUB[c].c]), S.newsCat)}</div><div id="news-grid">${newsGrid()}</div>`;
}
function newsGrid() {
  let list = NEWS.filter((n) => n.id !== HERO_ID);
  if (S.newsCat !== 'all') list = list.filter((n) => n.cat === S.newsCat || (S.newsCat === 'city' && n.cat === 'plan'));
  list = list.slice().sort((a, b) => a.ago - b.ago);
  if (S.newsCat === 'all') list = [NEWS_BY[FEATURED_ID]].filter(Boolean).concat(list.filter((n) => n.id !== FEATURED_ID)).slice(0, 8);
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
    <div class="mt-6 rounded-[18px] bg-card border border-line p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"><span class="w-12 h-12 rounded-2xl bg-ubred/10 text-ubred grid place-items-center shrink-0">${ic('route', 'w-6 h-6')}</span><div class="flex-1"><b class="block text-[16px]">${t('sitPromoT')}</b><span class="text-[14px] text-muted">${t('sitPromoD')}</span></div><button type="button" class="btn btn-ink" data-act="go" data-sec="situations">${t('sitPromoB')}</button></div>`;
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
  swap($('#hub-panel'), hubPanel(), dir, (el) => initTabs(el));
  setActiveNav(currentSec);
}
function setSvcTab(v) {
  const order = ['citizen', 'business', 'esys'], dir = order.indexOf(v) >= order.indexOf(S.svcTab) ? 1 : -1;
  S.svcTab = v; S.svcQ = '';
  const q = $('#svc-q'); if (q) q.value = '';
  if (!$('#svc-grid')) return;
  selectTab('svc', v); swap($('#svc-grid'), svcGrid(), dir);
}
function setNewsCat(v) {
  S.newsCat = v;
  $$('[data-act="news-cat"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
  if ($('#news-grid')) swap($('#news-grid'), newsGrid(), 0);
}

/* ================= Life events ================= */
function sitList() {
  return SITS.map((s) => {
    const d = (S.sitDone[s.id] || []).length, n = s.steps.length, on = s.id === S.sit;
    return `<button type="button" class="shrink-0 w-[244px] lg:w-full text-left flex items-center gap-3 p-3 rounded-2xl border transition-colors ${on ? 'border-ink/70 bg-soft' : 'border-line hover:bg-soft'}" data-act="sit" data-v="${s.id}" aria-pressed="${on}"><span class="w-11 h-11 rounded-xl grid place-items-center shrink-0 transition-colors ${on ? 'bg-ubred text-white' : 'bg-ubred/10 text-ubred'}">${ic(s.i, 'w-[22px] h-[22px]')}</span><span class="flex-1 min-w-0"><b class="block text-[15px] truncate">${esc(L(s.t))}</b><span class="mt-1.5 flex items-center gap-2"><span class="flex-1 h-1.5 rounded-full bg-line overflow-hidden"><span class="block h-full rounded-full bg-ubgreen transition-[width] duration-500" style="width:${(d / n) * 100}%"></span></span><span class="text-[12px] text-muted tnum">${d}/${n}</span></span></span></button>`;
  }).join('');
}
function stepCard(x, i, done, next) {
  return `<li class="card p-5 ${next ? 'ring-2 ring-ubblue/45 border-transparent' : ''} ${done ? 'bg-soft' : ''}"><div class="flex items-start gap-4">
    <button type="button" class="w-10 h-10 rounded-full grid place-items-center border-2 font-extrabold shrink-0 transition-colors ${done ? 'bg-ubgreen border-ubgreen text-white' : next ? 'border-ubblue text-ubblue' : 'border-line text-muted'}" data-act="sit-toggle" data-i="${i}" data-stepcheck="${i}" aria-label="${esc(done ? t('undo') : t('markDone'))}">${done ? ic('check', 'w-5 h-5', 2.6) : i + 1}</button>
    <div class="flex-1 min-w-0"><h4 class="font-bold text-[16px] leading-snug ${done ? 'text-muted' : ''}">${esc(L(x.t))}</h4>
      <div class="mt-1.5 flex flex-wrap items-center gap-1.5">${modeBadge(x.m)}<span class="badge b-mute">${ic('clock-3', 'w-3.5 h-3.5')}${esc(L(x.tm))}</span>${next ? `<span class="badge b-blue">${t('nextStep')}</span>` : ''}${done ? `<span class="badge b-on">${ic('check', 'w-3.5 h-3.5', 2.6)}${t('doneLbl')}</span>` : ''}</div>
      <p class="mt-2.5 text-[14px] text-muted leading-relaxed">${esc(L(x.d))}</p>
      <div class="mt-4 flex flex-wrap gap-2">${done ? `<button type="button" class="btn btn-sm btn-ghost" data-act="sit-toggle" data-i="${i}">${ic('undo-2', 'w-4 h-4')}${t('undo')}</button>` : `<button type="button" class="btn btn-sm ${x.m === 'on' ? 'btn-blue' : 'btn-ink'}" data-act="sit-apply" data-i="${i}">${ic(x.m === 'on' ? 'send' : 'calendar-clock', 'w-4 h-4')}${x.m === 'on' ? t('applyOnline') : t('book')}</button><button type="button" class="btn btn-sm btn-ghost" data-act="sit-toggle" data-i="${i}">${t('markDone')}</button>`}</div>
    </div></div></li>`;
}
function sitPanel(prev) {
  const s = SITS.find((x) => x.id === S.sit), d = S.sitDone[s.id] || [], n = s.steps.length;
  const nextI = s.steps.findIndex((_, i) => !d.includes(i)), pv = prev || d, online = s.steps.filter((x) => x.m === 'on').length;
  return `<div class="panel p-5 sm:p-7 relative overflow-hidden" id="sit-card">
    <div class="flex flex-wrap items-start justify-between gap-4"><div class="flex items-center gap-4"><span class="w-14 h-14 rounded-2xl bg-ubred/10 text-ubred grid place-items-center">${ic(s.i, 'w-7 h-7')}</span><div><h3 class="text-[23px] font-extrabold tracking-tight leading-tight">${esc(L(s.t))}</h3><p class="text-[14px] text-muted mt-0.5">${t('stepsOnline', { n, o: online })}</p></div></div>
    ${d.length ? `<button type="button" class="btn btn-sm btn-ghost" data-act="sit-reset">${ic('rotate-ccw', 'w-4 h-4')}${t('restart')}</button>` : ''}</div>
    <div class="mt-6"><div class="flex justify-between text-[13.5px] font-semibold"><span>${t('progress')}</span><span class="tnum text-muted">${t('doneOf', { d: d.length, n })}</span></div>
      <div class="mt-2.5 grid gap-1.5" style="grid-template-columns:repeat(${n},minmax(0,1fr))">${s.steps.map((_, i) => `<div class="h-2.5 rounded-full bg-line overflow-hidden"><div class="seg-fill h-full rounded-full bg-ubgreen" data-seg="${i}" style="width:${pv.includes(i) ? 100 : 0}%"></div></div>`).join('')}</div>
      <div class="mt-2 hidden sm:grid gap-1.5 text-[12px] text-muted" style="grid-template-columns:repeat(${n},minmax(0,1fr))">${s.steps.map((x, i) => `<span class="truncate ${i === nextI ? 'text-ubblue font-semibold' : ''}">${i + 1}. ${esc(L(x.t))}</span>`).join('')}</div></div>
    ${d.length === n ? `<div class="mt-6 rounded-2xl bg-ubgreen/10 border border-ubgreen/30 p-4 flex items-center gap-3"><span class="w-10 h-10 rounded-full bg-ubgreen text-white grid place-items-center shrink-0">${ic('party-popper', 'w-5 h-5')}</span><div><b class="block">${t('allDone')}</b><span class="text-[13.5px] text-muted">${t('allDoneD')}</span></div></div>` : ''}
    <ol class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">${s.steps.map((x, i) => stepCard(x, i, d.includes(i), i === nextI)).join('')}</ol></div>`;
}
function renderSits() {
  $('#situations').innerHTML = `<div class="bg-card border-y border-line"><div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20"><div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
    <div class="lg:col-span-4 min-w-0"><h2 class="h-section">${t('sitTitle')}</h2><p class="mt-3 text-muted leading-relaxed">${t('sitDesc')}</p>
      <div class="mt-6 flex lg:flex-col gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 pb-1" id="sit-list">${sitList()}</div></div>
    <div class="lg:col-span-8 min-w-0" id="sit-panel">${sitPanel()}</div></div></div></div>`;
}
function paintSit(prev, popIdx) {
  const panel = $('#sit-panel'); if (!panel) return;
  panel.innerHTML = sitPanel(prev); $('#sit-list').innerHTML = sitList();
  const d = S.sitDone[S.sit] || [];
  requestAnimationFrame(() => requestAnimationFrame(() => $$('[data-seg]', panel).forEach((el) => { el.style.width = d.includes(+el.dataset.seg) ? '100%' : '0%'; })));
  if (popIdx != null) { const b = $(`[data-stepcheck="${popIdx}"]`, panel); if (b) b.classList.add('check-pop'); }
}
function setSit(id) {
  if (!SITS.find((s) => s.id === id)) return;
  const order = SITS.map((s) => s.id), dir = order.indexOf(id) >= order.indexOf(S.sit) ? 1 : -1;
  S.sit = id; $('#sit-list').innerHTML = sitList();
  swap($('#sit-panel'), sitPanel(), dir);
}
function toggleStep(i, forceDone) {
  const prev = (S.sitDone[S.sit] || []).slice(), was = prev.includes(i);
  let d = prev.slice();
  if (forceDone) { if (!was) d.push(i); } else d = was ? d.filter((x) => x !== i) : d.concat(i);
  S.sitDone[S.sit] = d; store.set('sitDone', S.sitDone);
  paintSit(prev, d.includes(i) && !was ? i : null);
  const n = SITS.find((s) => s.id === S.sit).steps.length;
  if (d.length === n && prev.length < n) confetti($('#sit-card'));
}
function confetti(host) {
  if (!host || reduced) return;
  const cols = ['#D81E34', '#1D5BFF', '#FFC524', '#10A36A'];
  for (let k = 0; k < 40; k++) { const c = document.createElement('i'); c.className = 'confetti'; c.style.left = 8 + Math.random() * 84 + '%'; c.style.background = cols[k % 4]; c.style.setProperty('--dx', Math.random() * 180 - 90 + 'px'); c.style.setProperty('--rot', Math.random() * 720 - 360 + 'deg'); c.style.animationDelay = Math.random() * 0.3 + 's'; host.appendChild(c); setTimeout(() => c.remove(), 2200); }
}

/* ================= Media ================= */
const MEDIA_F = ['all', 'video', 'live', 'photo', 'podcast'];
function mediaCards() {
  const list = MEDIA.map((m, i) => ({ m, i })).filter(({ m }) => S.media === 'all' || m.type === S.media);
  return list.map(({ m, i }) => {
    const feat = m.type === 'live' && S.media === 'all';
    const pill = 'inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-black/55 backdrop-blur text-[12.5px] font-bold';
    const badge = m.type === 'live' ? `<span class="inline-flex items-center gap-2 h-7 px-2.5 rounded-full bg-ubred text-white text-[12.5px] font-bold"><span class="live" style="--dot:#fff"></span>${t('m_live')}</span>`
      : m.type === 'video' ? `<span class="${pill}">${ic('play', 'w-3.5 h-3.5')}${t('m_video')}</span>`
      : m.type === 'photo' ? `<span class="${pill}">${ic('images', 'w-3.5 h-3.5')}${t('photosN', { n: m.n })}</span>`
      : `<span class="${pill}"><span class="eq text-ubyellow"><i></i><i></i><i></i><i></i></span>${t('m_podcast')} ${m.ep}</span>`;
    const meta = m.type === 'live' ? `<span class="inline-flex items-center gap-1.5 tnum">${ic('eye', 'w-4 h-4')}${t('watching', { n: num(m.viewers) })}</span>`
      : m.type === 'photo' ? `<span class="flex gap-1">${[0, 1, 2, 3, 4].map((k) => `<i class="w-1.5 h-1.5 rounded-full ${k ? 'bg-white/40' : 'bg-white'}"></i>`).join('')}</span>`
      : `<span class="inline-flex items-center gap-1.5 tnum">${ic(m.type === 'podcast' ? 'headphones' : 'clock-3', 'w-4 h-4')}${m.dur}</span>`;
    return `<button type="button" class="group snap-start shrink-0 relative overflow-hidden rounded-[20px] text-left zoom-on ${feat ? 'w-[86vw] sm:w-[560px]' : 'w-[76vw] sm:w-[340px]'} h-[300px] sm:h-[380px]" data-act="media-open" data-i="${i}"><div class="scene zoom !absolute inset-0">${Scene(m.img)}</div><div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/5"></div>
      <div class="absolute left-4 top-4">${badge}</div>
      ${m.type === 'video' || m.type === 'live' ? `<span class="absolute inset-0 grid place-items-center"><span class="w-16 h-16 rounded-full bg-white/90 text-[#0B1D45] grid place-items-center shadow-xl transition-transform duration-300 group-hover:scale-110">${ic('play', 'w-7 h-7 ml-1')}</span></span>` : ''}
      <div class="absolute inset-x-0 bottom-0 p-5"><p class="text-[13px] text-white/65">${esc(L(m.d))}</p><p class="mt-1 ${feat ? 'text-[22px]' : 'text-[18px]'} font-extrabold leading-snug">${esc(L(m.t))}</p><div class="mt-3 flex items-center gap-3 text-[13px] text-white/75">${meta}</div></div></button>`;
  }).join('');
}
function renderMedia() {
  $('#media').innerHTML = `<div class="media-band text-white relative overflow-hidden isolate">${mediaBg()}<div class="relative max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-5"><div><h2 class="h-section text-white">${t('mediaTitle')}</h2><p class="mt-2 text-white/60">${t('mediaDesc')}</p></div>
      <div class="flex items-center gap-3 min-w-0"><div class="flex gap-2 overflow-x-auto no-scrollbar" id="media-chips">${chips('media-f', MEDIA_F.map((v) => [v, v === 'all' ? t('f_all') : t('m_' + v)]), S.media, true)}</div>
      <div class="hidden md:flex gap-2 shrink-0"><button type="button" class="icon-btn border border-white/20 hover:bg-white/10" data-act="media-scroll" data-d="-1" aria-label="${esc(t('prev'))}">${ic('chevron-left')}</button><button type="button" class="icon-btn border border-white/20 hover:bg-white/10" data-act="media-scroll" data-d="1" aria-label="${esc(t('next'))}">${ic('chevron-right')}</button></div></div></div>
    <div id="media-track" class="mt-8 flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 scroll-smooth">${mediaCards()}</div>
    <div class="mt-6 h-[3px] rounded-full bg-white/10 overflow-hidden"><div id="media-prog" class="h-full bg-ubred rounded-full transition-[width] duration-300" style="width:30%"></div></div></div></div>`;
  const tr = $('#media-track'), pr = $('#media-prog');
  const upd = () => { const max = tr.scrollWidth - tr.clientWidth; pr.style.width = (max <= 2 ? 100 : Math.max(10, ((tr.scrollLeft + tr.clientWidth) / tr.scrollWidth) * 100)) + '%'; };
  tr.addEventListener('scroll', upd, { passive: true }); requestAnimationFrame(upd);
  // хөдөлгөөнт дэвсгэр: дэлгэцэнд харагдахгүй үед зогсоно
  if (MEDIA_IO) MEDIA_IO.disconnect();
  const bg = $('#media .media-bg');
  if (bg && 'IntersectionObserver' in window) { MEDIA_IO = new IntersectionObserver(([en]) => bg.classList.toggle('is-off', !en.isIntersecting)); MEDIA_IO.observe(bg); }
}
/* Медиа хэсгийн хөдөлгөөнт вектор дэвсгэр: туйлын туяа (3 гэрэлтэлт), урсах дууны долгион, дамжуулалтын цагираг. input.css .mb-* */
let MEDIA_IO = null;
function mediaBg() {
  // Q/T муруйгаар синус долгион; 2880 өргөн (2 үе) тул -50% шилжихэд тасралтгүй давтагдана
  const wave = (y, a, len) => { let d = `M0 ${y} Q${len / 4} ${y - a} ${len / 2} ${y}`; for (let x = len; x <= 2880; x += len / 2) d += ` T${x} ${y}`; return d; };
  const lines = [[150, 26, 480, 'a'], [190, 40, 720, 'b'], [228, 18, 360, 'c'], [262, 34, 576, 'b'], [300, 22, 480, 'a']];
  return `<div class="media-bg" aria-hidden="true">
    <i class="mb-blob mb-b1"></i><i class="mb-blob mb-b2"></i><i class="mb-blob mb-b3"></i>
    <svg class="mb-waves" viewBox="0 0 1440 420" preserveAspectRatio="none"><defs><linearGradient id="mbw" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff"/><stop offset=".7" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
      ${lines.map(([y, a, len, c], k) => `<g class="mb-line mb-l${k + 1}"><path class="mb-${c}" d="${wave(y, a, len)}"/></g>`).join('')}</svg>
    <span class="mb-rings"><i></i><i></i><i></i></span>
  </div>`;
}
function setMediaF(v) {
  S.media = v; $$('[data-act="media-f"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
  const tr = $('#media-track'); tr.scrollLeft = 0;
  swap(tr, mediaCards(), 0, () => tr.dispatchEvent(new Event('scroll')));
}

/* ================= Map view (schematic, clustered) ================= */
const MAPS = {};
class MapView {
  constructor(host, o) {
    this.o = o; this.k = 1; this.tx = 0; this.ty = 0; this.sel = o.sel || null; this.markers = []; this.sig = ''; this.ptrs = new Map();
    host.innerHTML = `<div class="map-vp w-full h-full" tabindex="0" role="application" aria-label="${esc(t('schematic'))}"><svg viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g data-g>${mapBaseSVG()}</g></svg><div class="mk-layer"></div>
      <div class="absolute right-3 top-3 flex flex-col gap-1.5 z-[7]"><button type="button" class="icon-btn card !rounded-xl shadow-md hover:bg-soft" data-z="in" aria-label="${esc(t('zoomIn'))}">${ic('plus')}</button><button type="button" class="icon-btn card !rounded-xl shadow-md hover:bg-soft" data-z="out" aria-label="${esc(t('zoomOut'))}">${ic('minus')}</button><button type="button" class="icon-btn card !rounded-xl shadow-md hover:bg-soft" data-z="reset" aria-label="${esc(t('resetMap'))}">${ic('locate-fixed')}</button></div>
      <div class="map-hint z-[8]"><span class="px-4 py-2 rounded-xl bg-black/60 text-[14px]">${t('zoomHint')}</span></div></div>`;
    this.vp = host.firstElementChild; this.g = this.vp.querySelector('[data-g]'); this.layer = this.vp.querySelector('.mk-layer'); this.hint = this.vp.querySelector('.map-hint');
    this.labels = Array.from(this.g.querySelectorAll('[data-fs]'));
    this.measure(); this.apply(); this.recluster(true); this.bind();
    if ('ResizeObserver' in window) { this.ro = new ResizeObserver(() => { const w = this.W, h = this.H; this.measure(); if (Math.abs(w - this.W) > 1 || Math.abs(h - this.H) > 1) { this.clamp(); this.apply(); this.recluster(true); } }); this.ro.observe(this.vp); }
  }
  destroy() { if (this.ro) this.ro.disconnect(); cancelAnimationFrame(this.raf); }
  measure() { const r = this.vp.getBoundingClientRect(), ow = this.vp.offsetWidth; this.z = ow && r.width ? r.width / ow : 1; this.W = ow || 800; this.H = this.vp.offsetHeight || 500; this.s0 = Math.max(this.W / 1000, this.H / 620); this.ox = (this.W - 1000 * this.s0) / 2; this.oy = (this.H - 620 * this.s0) / 2; }
  toScreen(x, y) { return [this.ox + this.s0 * (this.tx + this.k * x), this.oy + this.s0 * (this.ty + this.k * y)]; }
  toMap(sx, sy) { return [((sx - this.ox) / this.s0 - this.tx) / this.k, ((sy - this.oy) / this.s0 - this.ty) / this.k]; }
  clamp() {
    const w = this.s0 * this.k * 1000, h = this.s0 * this.k * 620;
    let l = this.ox + this.s0 * this.tx; l = w <= this.W ? (this.W - w) / 2 : Math.min(0, Math.max(this.W - w, l)); this.tx = (l - this.ox) / this.s0;
    let tp = this.oy + this.s0 * this.ty; tp = h <= this.H ? (this.H - h) / 2 : Math.min(0, Math.max(this.H - h, tp)); this.ty = (tp - this.oy) / this.s0;
  }
  apply() {
    this.g.setAttribute('transform', `translate(${this.tx.toFixed(2)} ${this.ty.toFixed(2)}) scale(${this.k.toFixed(4)})`);
    for (const l of this.labels) l.setAttribute('font-size', (l.dataset.fs / this.k).toFixed(2));
    for (const m of this.markers) { if (!m.el) continue; const [sx, sy] = this.toScreen(m.x, m.y); m.el.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)`; }
    this.vp.classList.toggle('zoomed', this.k > 1.05);
  }
  zoomTo(k2, sx, sy) { k2 = Math.max(1, Math.min(7, k2)); const [mx, my] = this.toMap(sx, sy); this.k = k2; this.tx = (sx - this.ox) / this.s0 - k2 * mx; this.ty = (sy - this.oy) / this.s0 - k2 * my; this.clamp(); this.apply(); }
  zoomAt(f, sx, sy) { const k2 = Math.max(1, Math.min(7, this.k * f)), [mx, my] = this.toMap(sx, sy); this.animateTo(k2, (sx - this.ox) / this.s0 - k2 * mx, (sy - this.oy) / this.s0 - k2 * my); }
  centerOn(x, y, k) { const k2 = Math.max(this.k, k || 2.4); this.animateTo(k2, (this.W / 2 - this.ox) / this.s0 - k2 * x, (this.H / 2 - this.oy) / this.s0 - k2 * y); }
  animateTo(k2, tx2, ty2) {
    const from = [this.k, this.tx, this.ty]; this.k = k2; this.tx = tx2; this.ty = ty2; this.clamp(); const to = [this.k, this.tx, this.ty]; [this.k, this.tx, this.ty] = from;
    cancelAnimationFrame(this.raf);
    if (reduced) { [this.k, this.tx, this.ty] = to; this.apply(); this.recluster(); return; }
    const t0 = performance.now(), dur = 440;
    const step = (tm) => { const p = Math.min(1, (tm - t0) / dur), e = 1 - Math.pow(1 - p, 3); this.k = from[0] + (to[0] - from[0]) * e; this.tx = from[1] + (to[1] - from[1]) * e; this.ty = from[2] + (to[2] - from[2]) * e; this.apply(); if (p < 1) this.raf = requestAnimationFrame(step); else this.recluster(); };
    this.raf = requestAnimationFrame(step);
  }
  select(id, pan) { this.sel = id; if (id && pan) { const p = this.o.points().find((q) => q.id === id); if (p) { this.centerOn(p.x, p.y, 2.6); return; } } this.recluster(true); }
  showHint() { this.hint.classList.add('show'); clearTimeout(this.ht); this.ht = setTimeout(() => this.hint.classList.remove('show'), 1100); }
  recluster(force) {
    const pts = this.o.points(), R = 46, used = new Set(), groups = [];
    const scr = pts.map((p) => { const [sx, sy] = this.toScreen(p.x, p.y); return { p, sx, sy }; });
    for (const a of scr) {
      if (used.has(a.p.id)) continue; used.add(a.p.id); const g = [a];
      if (this.o.cluster !== false) for (const b of scr) { if (!used.has(b.p.id) && Math.hypot(a.sx - b.sx, a.sy - b.sy) < R) { used.add(b.p.id); g.push(b); } }
      groups.push(g);
    }
    const sig = groups.map((g) => g.map((x) => x.p.id).join('+')).join('|') + '#' + this.sel;
    if (!force && sig === this.sig) return;
    const anim = this.sig !== ''; this.sig = sig; this.markers = [];
    let html = '';
    for (const g of groups) {
      if (g.length > 1) {
        const x = g.reduce((s, q) => s + q.p.x, 0) / g.length, y = g.reduce((s, q) => s + q.p.y, 0) / g.length, v = Math.round(g.reduce((s, q) => s + (q.p.v || 0), 0) / g.length);
        this.markers.push({ x, y }); html += `<div class="mk"><button type="button" class="cluster ${anim ? 'mk-in' : ''}" style="--p:${v}" data-cl="1" data-x="${x}" data-y="${y}" aria-label="${g.length}"><span>${g.length}</span></button></div>`;
      } else {
        const p = g[0].p; this.markers.push({ x: p.x, y: p.y });
        html += `<div class="mk"><button type="button" class="pin ${p.id === this.sel ? 'sel' : ''} ${anim ? 'mk-in' : ''}" style="--c:${p.c}" data-pin="${p.id}" aria-label="${esc(p.label || p.id)}"><span class="pin-head">${ic(p.i || 'map-pin', 'w-4 h-4', 2.2)}</span>${p.tag ? `<span class="pin-tag tnum">${esc(p.tag)}</span>` : ''}</button></div>`;
      }
    }
    const selP = this.sel && pts.find((p) => p.id === this.sel);
    if (selP && this.o.popup) {
      if (this.W < 560) html += `<div class="absolute left-3 right-3 bottom-3 z-[9] pointer-events-auto">${this.o.popup(this.sel)}</div>`;
      else if (groups.some((g) => g.length === 1 && g[0].p.id === this.sel)) { this.markers.push({ x: selP.x, y: selP.y }); html += `<div class="mk z-[9]"><div class="mpop">${this.o.popup(this.sel)}</div></div>`; }
    }
    this.layer.innerHTML = html;
    const els = this.layer.querySelectorAll('.mk'); this.markers.forEach((m, i) => { m.el = els[i]; });
    this.apply();
  }
  bind() {
    const vp = this.vp;
    vp.addEventListener('click', (e) => {
      const z = e.target.closest('[data-z]');
      if (z) { if (z.dataset.z === 'in') this.zoomAt(1.6, this.W / 2, this.H / 2); else if (z.dataset.z === 'out') this.zoomAt(1 / 1.6, this.W / 2, this.H / 2); else this.animateTo(1, 0, 0); return; }
      const cl = e.target.closest('[data-cl]');
      if (cl) { const [sx, sy] = this.toScreen(+cl.dataset.x, +cl.dataset.y); this.zoomAt(2.2, sx, sy); return; }
      const pin = e.target.closest('[data-pin]');
      if (pin && this.o.onSelect) this.o.onSelect(pin.dataset.pin);
    });
    vp.addEventListener('pointerdown', (e) => {
      if (e.button > 0 || e.target.closest('button, .mpop')) return;
      this.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.ptrs.size === 1) this.drag = { x: e.clientX, y: e.clientY, tx: this.tx, ty: this.ty, moved: false };
      else if (this.ptrs.size === 2) { const [a, b] = Array.from(this.ptrs.values()); this.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, k: this.k }; }
      try { vp.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    vp.addEventListener('pointermove', (e) => {
      if (!this.ptrs.has(e.pointerId)) return;
      this.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.ptrs.size === 2 && this.pinch) { const [a, b] = Array.from(this.ptrs.values()), r = vp.getBoundingClientRect(); this.zoomTo(this.pinch.k * Math.hypot(a.x - b.x, a.y - b.y) / this.pinch.d, ((a.x + b.x) / 2 - r.left) / this.z, ((a.y + b.y) / 2 - r.top) / this.z); return; }
      if (!this.drag) return;
      const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
      if (!this.drag.moved && Math.hypot(dx, dy) < 5) return;
      this.drag.moved = true; vp.classList.add('dragging');
      this.tx = this.drag.tx + dx / this.z / this.s0; this.ty = this.drag.ty + dy / this.z / this.s0; this.clamp(); this.apply();
    });
    const end = (e) => {
      if (!this.ptrs.has(e.pointerId)) return;
      this.ptrs.delete(e.pointerId);
      if (this.pinch && this.ptrs.size < 2) { this.pinch = null; this.drag = null; this.recluster(); }
      if (this.ptrs.size === 0) {
        const d = this.drag; this.drag = null; vp.classList.remove('dragging');
        if (d && !d.moved && e.type === 'pointerup' && this.o.onPick) { const r = vp.getBoundingClientRect(); const [mx, my] = this.toMap((e.clientX - r.left) / this.z, (e.clientY - r.top) / this.z); this.o.onPick(Math.max(5, Math.min(995, mx)), Math.max(5, Math.min(615, my))); }
      }
    };
    vp.addEventListener('pointerup', end); vp.addEventListener('pointercancel', end);
    vp.addEventListener('wheel', (e) => {
      if (!(e.ctrlKey || e.metaKey)) { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) this.showHint(); return; }
      e.preventDefault(); const r = vp.getBoundingClientRect();
      this.zoomTo(this.k * (e.deltaY < 0 ? 1.12 : 1 / 1.12), (e.clientX - r.left) / this.z, (e.clientY - r.top) / this.z);
      clearTimeout(this.wt); this.wt = setTimeout(() => this.recluster(), 120);
    }, { passive: false });
    vp.addEventListener('dblclick', (e) => { if (e.target.closest('button, .mpop')) return; const r = vp.getBoundingClientRect(); this.zoomAt(1.8, (e.clientX - r.left) / this.z, (e.clientY - r.top) / this.z); });
    vp.addEventListener('keydown', (e) => {
      if (e.target !== vp) return;
      const st = 50 / this.s0;
      if (e.key === '+' || e.key === '=') this.zoomAt(1.5, this.W / 2, this.H / 2);
      else if (e.key === '-') this.zoomAt(1 / 1.5, this.W / 2, this.H / 2);
      else if (e.key.indexOf('Arrow') === 0) { if (e.key === 'ArrowLeft') this.tx += st; if (e.key === 'ArrowRight') this.tx -= st; if (e.key === 'ArrowUp') this.ty += st; if (e.key === 'ArrowDown') this.ty -= st; this.clamp(); this.apply(); }
      else return;
      e.preventDefault();
    });
  }
}

/* ================= Projects ================= */
const pStatus = (p) => (p.p >= 100 ? 'done' : p.p < 20 ? 'planned' : 'progress');
function projFiltered() { return PROJECTS.filter((p) => S.projSt === 'all' || pStatus(p) === S.projSt); }
function pctRing(p, size, stroke, color, fs) { return `<span class="relative grid place-items-center shrink-0">${ring(p, size, stroke, color)}<b class="absolute tnum" style="font-size:${fs}px">${p}%</b></span>`; }
function projList() {
  const list = projFiltered();
  if (!list.length) return `<li class="p-6 text-center text-muted">${t('noResults')}</li>`;
  return list.map((p) => { const c = PCAT[p.c], z = inDistrict(p.x, p.y), sel = p.id === S.projSel;
    return `<li><button type="button" class="w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition-colors ${sel ? 'bg-soft ring-1 ring-line' : 'hover:bg-soft'}" data-act="proj" data-id="${p.id}" aria-pressed="${sel}">${pctRing(p.p, 44, 4.5, c.c, 11)}<span class="min-w-0 flex-1"><b class="block text-[14.5px] leading-snug truncate">${esc(L(p.n))}</b><span class="block text-[12.5px] text-muted truncate">${esc(L(z.n))}, ${esc(L(c.t))}</span></span>${ic('chevron-right', 'w-4 h-4 text-muted')}</button></li>`; }).join('');
}
function projPopup(id) {
  const p = PROJECTS.find((x) => x.id === id), c = PCAT[p.c], z = inDistrict(p.x, p.y), st = pStatus(p);
  return `<div class="card shadow-2xl p-4 text-ink"><div class="flex items-start gap-3">${pctRing(p.p, 56, 6, c.c, 13)}<div class="min-w-0 flex-1"><p class="text-[12px] font-bold" style="color:${c.c}">${esc(L(c.t))}</p><p class="font-extrabold leading-snug text-[15px]">${esc(L(p.n))}</p><p class="text-[12.5px] text-muted mt-0.5">${esc(L(z.n))} ${L(['дүүрэг', 'District'])}</p></div><button type="button" class="icon-btn !w-8 !h-8 hover:bg-soft -mr-1 -mt-1" data-act="proj-close" aria-label="${esc(t('close'))}">${ic('x', 'w-4 h-4')}</button></div>
    <div class="mt-3 grid grid-cols-3 gap-2 text-[12px]"><div class="rounded-lg bg-soft p-2"><p class="text-muted">${t('budget')}</p><b class="tnum text-[12.5px]">${bn(p.bud)}</b></div><div class="rounded-lg bg-soft p-2"><p class="text-muted">${t('dueYear')}</p><b class="tnum text-[12.5px]">${esc(p.due)}</b></div><div class="rounded-lg bg-soft p-2"><p class="text-muted">${L(['Төлөв', 'Status'])}</p><b class="text-[12.5px]">${t(st === 'done' ? 'st_done' : st === 'planned' ? 'st_planned' : 'st_progress')}</b></div></div></div>`;
}
function renderProjects() {
  const avg = Math.round(PROJECTS.reduce((a, p) => a + p.p, 0) / PROJECTS.length), done = PROJECTS.filter((p) => p.p >= 100).length;
  const stat = (v, l) => `<div><p class="text-[30px] font-extrabold tnum leading-none tracking-tight">${v}</p><p class="text-[13px] text-muted mt-1.5">${l}</p></div>`;
  $('#projects').innerHTML = `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6"><div><h2 class="h-section">${t('projTitle')}</h2><p class="mt-2 text-muted max-w-[62ch]">${t('projDesc')}</p></div>
    <div class="flex flex-wrap gap-x-9 gap-y-3">${stat(PROJECTS.length, L(['мега төсөл', 'flagship projects']))}${stat(avg + '%', t('avgProgress'))}${stat(done, L(['ашиглалтад орсон', 'completed']))}</div></div>
    <div class="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-8 relative min-w-0"><div id="proj-map" class="rounded-[22px] overflow-hidden border border-line h-[440px] sm:h-[520px] lg:h-[600px]"></div>
        <div class="absolute left-3 top-3 card !rounded-xl px-3 py-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-semibold max-w-[calc(100%-80px)] shadow-lg pointer-events-none z-[7]">${Object.values(PCAT).map((c) => `<span class="inline-flex items-center gap-1.5"><i class="w-2.5 h-2.5 rounded-full" style="background:${c.c}"></i>${esc(L(c.t))}</span>`).join('')}</div></div>
      <div class="lg:col-span-4 min-w-0 card flex flex-col lg:h-[600px] min-h-0 overflow-hidden"><div class="p-3 border-b border-line flex gap-2 overflow-x-auto no-scrollbar" id="proj-chips">${chips('proj-st', [['all', t('f_all')], ['progress', t('st_progress')], ['done', t('st_done')], ['planned', t('st_planned')]], S.projSt)}</div><ul id="proj-list" class="relative flex-1 overflow-auto thin-scroll p-2 max-h-[420px] lg:max-h-none">${projList()}</ul></div>
    </div></div>`;
  if (MAPS.proj) MAPS.proj.destroy();
  MAPS.proj = new MapView($('#proj-map'), { points: () => projFiltered().map((p) => ({ id: p.id, x: p.x, y: p.y, c: PCAT[p.c].c, i: PCAT[p.c].i, tag: p.p + '%', v: p.p, label: L(p.n) })), sel: S.projSel, onSelect: (id) => selectProject(id, false), popup: projPopup });
}
function selectProject(id, pan) {
  S.projSel = id;
  const list = $('#proj-list'); if (list) list.innerHTML = projList();
  if (MAPS.proj) MAPS.proj.select(id, pan !== false);
  const btn = list && id && list.querySelector(`[data-id="${id}"]`);
  if (btn) list.scrollTo({ top: btn.offsetTop - list.clientHeight / 2 + 30, behavior: reduced ? 'auto' : 'smooth' });
}
function setProjSt(v) {
  S.projSt = v; $$('[data-act="proj-st"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
  if (S.projSel && !projFiltered().some((p) => p.id === S.projSel)) S.projSel = null;
  $('#proj-list').innerHTML = projList();
  if (MAPS.proj) { MAPS.proj.sel = S.projSel; MAPS.proj.recluster(true); }
}

/* ================= City data ================= */
function aqiSeries() { const h = ubNow().getHours(), shift = S.aqi - AQI_PROFILE[h]; return Array.from({ length: 24 }, (_, i) => { const hr = (h - 23 + i + 24) % 24; return { hr, v: Math.max(15, Math.round(AQI_PROFILE[hr] + shift * (i / 23))) }; }); }
function aqiPaths() {
  const d = aqiSeries(), W = 600, H = 200, X = (i) => (i / 23) * W, Y = (v) => H - (Math.min(v, 200) / 200) * H;
  let p = `M0 ${Y(d[0].v).toFixed(1)}`;
  for (let i = 1; i < 24; i++) { const x0 = X(i - 1), y0 = Y(d[i - 1].v), x1 = X(i), y1 = Y(d[i].v), cx = (x0 + x1) / 2; p += ` C${cx.toFixed(1)} ${y0.toFixed(1)} ${cx.toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`; }
  return { d, p, area: p + ` L${W} ${H} L0 ${H} Z`, Y };
}
function aqiChart() {
  const { d, p, area, Y } = aqiPaths();
  const bands = [[0, 50, '#10A36A'], [50, 100, '#E5A800'], [100, 150, '#F08C1A'], [150, 200, '#D81E34']];
  return `<div class="relative" id="aqi-wrap"><svg viewBox="0 0 600 200" preserveAspectRatio="none" class="w-full h-[170px] block overflow-visible" role="img" aria-label="AQI, 24h"><defs><linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F08C1A" stop-opacity=".38"/><stop offset="1" stop-color="#F08C1A" stop-opacity="0"/></linearGradient></defs>
    ${bands.map(([a, b, c]) => `<rect x="0" y="${Y(b)}" width="600" height="${Y(a) - Y(b)}" fill="${c}" opacity=".07"/>`).join('')}
    ${[50, 100, 150].map((v) => `<line x1="0" x2="600" y1="${Y(v)}" y2="${Y(v)}" stroke="rgb(var(--c-line))" stroke-dasharray="4 5" vector-effect="non-scaling-stroke"/>`).join('')}
    <path class="aqi-area" id="aqi-area" d="${area}" fill="url(#aqiFill)"/><path class="aqi-line" id="aqi-line" pathLength="1" d="${p}" fill="none" stroke="#F08C1A" stroke-width="3" stroke-linecap="round"/>
    <line id="aqi-x" x1="0" x2="0" y1="0" y2="200" stroke="rgb(var(--c-ink))" stroke-opacity=".3" vector-effect="non-scaling-stroke" style="display:none"/></svg>
    <span id="aqi-now" class="absolute w-3 h-3 rounded-full bg-[#F08C1A] ring-4 ring-[#F08C1A]/25 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style="left:100%;top:${(Y(d[23].v) / 200) * 100}%"></span>
    <div id="aqi-tip" class="absolute -translate-x-1/2 -translate-y-full -mt-3 card !rounded-lg px-2.5 py-1.5 text-[12.5px] font-bold shadow-lg pointer-events-none whitespace-nowrap" style="display:none"></div>
    ${[50, 100, 150].map((v) => `<span class="absolute -left-1 text-[10.5px] text-muted tnum -translate-y-1/2 bg-card pr-1" style="top:${(Y(v) / 200) * 100}%">${v}</span>`).join('')}</div>
    <div class="relative h-4 mt-2 text-[11.5px] text-muted tnum">${d.map((x, i) => (i % 4 === 3 ? `<span class="absolute ${i === 23 ? '-translate-x-full' : '-translate-x-1/2'}" style="left:${(i / 23) * 100}%">${pad(x.hr)}:00</span>` : '')).join('')}</div>`;
}
function updAqiChart() {
  const line = $('#aqi-line'); if (!line) return;
  const { d, p, area, Y } = aqiPaths();
  line.setAttribute('d', p); $('#aqi-area').setAttribute('d', area); $('#aqi-now').style.top = (Y(d[23].v) / 200) * 100 + '%';
}
function liveBadge(color) { return `<span class="live-badge"><span class="live" style="--dot:${color}"></span>${t('live')}</span>`; }
/* ================= «Амьд хот»: өгөгдлөөс хамаарах хөдөлгөөн (Хотын өгөгдөл) ================= */
let DATA_IO = null;
const rnd = (a, b) => a + Math.random() * (b - a);
/* Эргэлддэг цифр (одометр): цифр бүр 0–9 баганаар, --d-ээр байрлана. fromZero: эхлээд 0, харагдах үед жинхэнэ утга руу эргэлдэнэ */
function rollWrap(v, fromZero) {
  let k = 0;
  return `<span class="sr-only">${esc(String(v))}</span><span class="rd-w" aria-hidden="true">${[...String(v)].map((ch) => (/\d/.test(ch)
    ? `<span class="rd"><span class="rd-s" style="--d:${fromZero ? 0 : ch};--k:${k++}" ${fromZero ? `data-to="${ch}"` : ''}>${'0123456789'.split('').map((n) => `<i>${n}</i>`).join('')}</span></span>`
    : `<span class="rd-c">${/\s/.test(ch) ? '&nbsp;' : esc(ch)}</span>`)).join('')}</span>`;
}
function rollTo(el, v) {
  const s = String(v), sr = el.querySelector('.sr-only'), cols = el.querySelectorAll('.rd-w > span');
  if (!sr || cols.length !== s.length || [...s].some((ch, i) => /\d/.test(ch) !== cols[i].classList.contains('rd'))) { el.innerHTML = rollWrap(s); return; }
  sr.textContent = s;
  [...s].forEach((ch, i) => { if (/\d/.test(ch)) { const c = cols[i].firstElementChild; c.removeAttribute('data-to'); c.style.setProperty('--d', ch); } });   // харагдахаас өмнө шинэчлэгдсэн бол хуучин утга руу буцахгүй
}
/* «Таны амьсгалж буй агаар»: AQI ихсэх тусам тоосонцор олширч, өнгө нь AQI ангиллын өнгө */
function pmFX() {
  const c = aqiCat(S.aqi), n = S.aqi <= 50 ? 8 : S.aqi <= 100 ? 22 : S.aqi <= 150 ? 34 : 48;
  return `<div class="pm-field" aria-hidden="true" style="--pc:${c.c}">${Array.from({ length: n }, () => `<i style="--x:${rnd(0, 100).toFixed(1)}%;--y:${rnd(0, 100).toFixed(1)}%;--s:${rnd(2, 6).toFixed(1)}px;--t:${rnd(9, 20).toFixed(1)}s;--dl:${(-rnd(0, 20)).toFixed(1)}s;--dx:${Math.round(rnd(-46, 46))}px;--dy:${Math.round(rnd(-34, 34))}px;--o:${rnd(0.16, 0.5).toFixed(2)}"></i>`).join('')}</div>`;
}
/* Цаг агаарын амьд тэнгэр: 0°-оос доош бол цас, үүлтэй, Улаанбаатарын цагаар үүр/өдөр/үдэш/шөнө (шөнө од) */
function skyFX() {
  const h = ubNow().getHours(), tod = h >= 20 || h < 6 ? 'night' : h < 9 ? 'dawn' : h >= 17 ? 'dusk' : 'day';
  const snow = S.temp <= 0 ? Array.from({ length: 36 }, () => `<i style="--x:${rnd(0, 100).toFixed(1)}%;--s:${rnd(2, 5).toFixed(1)}px;--t:${rnd(8, 16).toFixed(1)}s;--dl:${(-rnd(0, 16)).toFixed(1)}s;--dx:${Math.round(rnd(-36, 36))}px;--o:${rnd(0.3, 0.85).toFixed(2)}"></i>`).join('') : '';
  const stars = tod === 'night' ? Array.from({ length: 18 }, () => `<b style="--x:${rnd(2, 98).toFixed(1)}%;--y:${rnd(3, 42).toFixed(1)}%;--t:${rnd(2, 5).toFixed(1)}s;--dl:${(-rnd(0, 5)).toFixed(1)}s"></b>`).join('') : '';
  return `<div class="sky sky-${tod}" aria-hidden="true"><span class="sky-glow"></span>${stars}<span class="sky-cloud sky-c1"></span><span class="sky-cloud sky-c2"></span>${snow}</div>`;
}
function renderData() {
  const c = aqiCat(S.aqi), tot = POP.reduce((a, p) => a + p[2], 0), max = POP[0][2];
  const plan = BUDGET_Q.reduce((a, q) => a + q[0], 0), act = BUDGET_Q.reduce((a, q) => a + q[1], 0), bpct = Math.round((act / plan) * 100), bmx = Math.max(...BUDGET_Q.map((q) => q[0]));
  const ang = -90 + (S.traffic / 10) * 180;
  const others = POP.slice(6).reduce((a, p) => a + p[2], 0);
  const popRows = POP.slice(0, 6).map((p) => [EN() ? p[1] : p[0], p[2]]).concat([[L(['Бусад 3 дүүрэг', 'Other 3 districts']), others]]);
  const k = (v) => (EN() ? Math.round(v / 1000) + 'k' : Math.round(v / 1000) + ' мян');
  const drawn = $('#data').classList.contains('drawn');
  $('#data').innerHTML = `<div class="on-navy"><div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20"><div>
  <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-4"><div><h2 class="h-section">${t('dataTitle')}</h2><p class="mt-2 text-muted max-w-[62ch]">${t('dataDesc')}</p></div><span class="live-badge self-start lg:self-auto"><span class="live" style="--dot:rgb(var(--c-green))"></span>${t('updated')} <span class="tnum text-ink" data-live="clocks">${clock(true)}</span></span></div>
  <div class="mt-8 grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 lg:gap-5" id="data-grid">
    <div class="card fx-card p-5 sm:p-6 md:col-span-6 lg:col-span-7" data-card="aqi">${pmFX()}<div class="flex items-start justify-between gap-3"><div><h3 class="font-bold text-[17px]">${t('aqi')}</h3><p class="text-[13px] text-muted">${t('aqi24')}</p></div>${liveBadge(c.c)}</div>
      <div class="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3"><div><p class="text-[60px] leading-[.9] font-extrabold tnum tracking-tight" data-live="aqi" data-roll>${rollWrap(S.aqi, !drawn)}</p><p class="mt-2 font-bold" style="color:${c.c}">${t(c.k)}</p></div><p class="text-[13.5px] text-muted max-w-[36ch] leading-snug">${t('aqiAdvice')}</p>
      <div class="ml-auto grid grid-cols-2 gap-x-5 gap-y-1 text-[13px]"><span class="text-muted">PM2.5</span><b class="tnum"><span data-live="pm25" data-roll>${rollWrap(pm25(), !drawn)}</span> µg/m³</b><span class="text-muted">PM10</span><b class="tnum">58 µg/m³</b><span class="text-muted">NO2</span><b class="tnum">21 ppb</b></div></div>
      <div class="mt-5 pl-5">${aqiChart()}</div></div>
    <div class="card fx-card p-5 sm:p-6 md:col-span-6 lg:col-span-5 flex flex-col" data-card="weather">${skyFX()}<div class="flex items-start justify-between gap-3"><div><h3 class="font-bold text-[17px]">${t('weather')}</h3><p class="text-[13px] text-muted">${fDate(today(), true)}</p></div>${liveBadge('#0EA5E9')}</div>
      <div class="mt-4 flex items-center gap-5"><span class="wx-ic w-20 h-20 rounded-3xl bg-ubblue/10 text-ubblue grid place-items-center">${ic('cloud-sun', 'w-11 h-11', 1.6)}</span><div><p class="text-[56px] leading-none font-extrabold tnum tracking-tight">${S.temp}°</p><p class="font-semibold text-muted mt-1">${t('cloudy')}, ${t('feels').toLowerCase()} ${S.temp - 5}°</p></div></div>
      <div class="mt-5 grid grid-cols-2 gap-2 text-[13.5px]"><div class="rounded-xl bg-soft p-3 flex items-center gap-2">${ic('wind', 'w-[18px] h-[18px] text-muted')}<span class="text-muted">${t('wind')}</span><b class="ml-auto tnum">4 м/с</b></div><div class="rounded-xl bg-soft p-3 flex items-center gap-2">${ic('droplet', 'w-[18px] h-[18px] text-muted')}<span class="text-muted">${t('humidity')}</span><b class="ml-auto tnum">58%</b></div></div>
      <div class="mt-auto pt-5 grid grid-cols-5 gap-1 text-center">${FORECAST.map((f, i) => { const dd = addDays(today(), i + 1); return `<div class="rounded-xl py-2"><p class="text-[12px] font-semibold text-muted">${EN() ? EN_WD[dd.getDay()] : MN_WDS[dd.getDay()]}</p>${ic(f[2], 'w-6 h-6 mx-auto my-1.5 text-ink/80', 1.7)}<p class="text-[13px] font-bold tnum">${f[0]}°</p><p class="text-[12px] text-muted tnum">${f[1]}°</p></div>`; }).join('')}</div></div>
    <div class="card p-5 sm:p-6 md:col-span-3 lg:col-span-4" data-card="traffic"><div class="flex items-start justify-between gap-3"><div><h3 class="font-bold text-[17px]">${t('congestion')}</h3><p class="text-[13px] text-muted">0–10</p></div>${liveBadge('rgb(var(--c-amber))')}</div>
      <div class="mt-3 mx-auto w-[210px]"><svg viewBox="0 0 200 108" class="w-full" aria-hidden="true"><defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#10A36A"/><stop offset=".5" stop-color="#E5A800"/><stop offset="1" stop-color="#D81E34"/></linearGradient></defs><path d="M16 100 A84 84 0 0 1 184 100" fill="none" stroke="rgb(var(--c-line))" stroke-width="14" stroke-linecap="round"/><path d="M16 100 A84 84 0 0 1 184 100" fill="none" stroke="url(#gg)" stroke-width="14" stroke-linecap="round" opacity=".9"/><g class="needle" data-ang="${ang}" style="transform-origin:100px 100px;transform:rotate(-90deg)"><path d="M100 100 L100 34" stroke="rgb(var(--c-ink))" stroke-width="4" stroke-linecap="round"/></g><circle cx="100" cy="100" r="7" fill="rgb(var(--c-ink))"/></svg><p class="text-center -mt-1"><b class="text-[30px] font-extrabold tnum">${S.traffic}</b><span class="text-muted font-semibold">/10</span> <span class="text-[13px] font-semibold text-amberink">${t('busy')}</span></p></div>
      <p class="mt-4 text-[13px] font-semibold text-muted">${t('busiest')}</p><ul class="mt-2 space-y-2.5">${ROADS.map(([n, v]) => `<li><div class="flex justify-between text-[13.5px]"><span>${esc(L(n))}</span><b class="tnum">${v}</b></div><div class="mt-1 h-1.5 rounded-full bg-line overflow-hidden"><div class="hbar h-full rounded-full" style="width:${v * 10}%;background:${v > 8 ? '#D81E34' : '#F08C1A'}"></div></div></li>`).join('')}</ul></div>
    <div class="card p-5 sm:p-6 md:col-span-3 lg:col-span-4" data-card="pop"><h3 class="font-bold text-[17px]">${t('population')}</h3><p class="text-[13px] text-muted">${t('popNote')}</p><p class="mt-3 text-[40px] leading-none font-extrabold tnum tracking-tight" data-count="${tot}">${num(tot)}</p>
      <ul class="mt-5 space-y-2">${popRows.map(([n, v]) => `<li class="grid grid-cols-[minmax(0,118px)_1fr_auto] items-center gap-3 text-[13px]"><span class="truncate">${esc(n)}</span><span class="h-2 rounded-full bg-line overflow-hidden"><span class="hbar block h-full rounded-full bg-ubblue" style="width:${(v / max) * 100}%"></span></span><b class="tnum text-[12.5px]">${k(v)}</b></li>`).join('')}</ul></div>
    <div class="card p-5 sm:p-6 md:col-span-6 lg:col-span-4" data-card="budget"><h3 class="font-bold text-[17px]">${t('budgetExec')}</h3><p class="text-[13px] text-muted">${t('budgetNote', { v: EN() ? '₮3.9 trn' : '3.9 их наяд ₮' })}</p>
      <div class="mt-4 flex items-center gap-5"><span class="relative grid place-items-center">${ring(bpct, 96, 10, 'rgb(var(--c-blue))')}<b class="absolute text-[22px] font-extrabold tnum">${bpct}%</b></span><div class="text-[13px] space-y-1.5"><p class="flex items-center gap-2"><i class="w-2.5 h-2.5 rounded-sm bg-line"></i>${t('plan')}</p><p class="flex items-center gap-2"><i class="w-2.5 h-2.5 rounded-sm bg-ubblue"></i>${t('actual')}</p></div></div>
      <div class="mt-5 h-[110px] flex items-end gap-4">${BUDGET_Q.map((q, i) => `<div class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"><div class="w-full flex items-end gap-1 h-full"><span class="bar-grow flex-1 rounded-t-md bg-line" style="height:${(q[0] / bmx) * 100}%"></span><span class="bar-grow flex-1 rounded-t-md bg-ubblue" style="height:${(q[1] / bmx) * 100}%;transition-delay:${0.1 + i * 0.08}s"></span></div><span class="text-[11.5px] text-muted font-semibold">${['I', 'II', 'III', 'IV'][i]}</span></div>`).join('')}</div></div>
    <div class="card p-5 sm:p-6 md:col-span-6 lg:col-span-12" data-card="transit"><div class="flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-10"><div class="flex items-center gap-3 lg:w-[230px] shrink-0"><span class="w-12 h-12 rounded-2xl bg-ubred/10 text-ubred grid place-items-center">${ic('bus-front', 'w-6 h-6')}</span><div><h3 class="font-bold text-[17px]">${t('transit')}</h3><span class="mt-1 inline-flex">${liveBadge('rgb(var(--c-red))')}</span></div></div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-5 flex-1">${[[`<span data-live="buses" data-roll>${rollWrap(num(S.buses), !drawn)}</span>`, t('busesNow')], [`<span data-live="riders" data-roll>${rollWrap(num(S.riders), !drawn)}</span>`, t('ridersToday')], ['6.4 ' + t('minShort'), t('avgWait')], ['91%', t('onTime')]].map(([v, l]) => `<div><p class="text-[28px] font-extrabold tnum leading-none">${v}</p><p class="text-[13px] text-muted mt-1.5">${l}</p></div>`).join('')}</div></div></div>
  </div></div></div></div>`;
  const grid = $('#data-grid'), sec = $('#data');
  const reveal = () => {
    sec.classList.add('drawn');
    const n = $('.needle', grid); if (n) n.style.transform = `rotate(${n.dataset.ang}deg)`;
    if (!sec.dataset.counted) { sec.dataset.counted = '1'; countUp($('[data-count]', grid), tot); }
    $$('.rd-s[data-to]', grid).forEach((s) => { s.style.setProperty('--d', s.dataset.to); s.removeAttribute('data-to'); });   // цифрүүд 0-ээс эргэлдэнэ
  };
  if (sec.classList.contains('drawn')) reveal(); else observeOnce(grid, reveal, 0.15);
  if (DATA_IO) DATA_IO.disconnect();   // цас, тоосонцор: дэлгэцэнд харагдахгүй үед зогсоно
  if ('IntersectionObserver' in window) { DATA_IO = new IntersectionObserver(([en]) => sec.classList.toggle('fx-off', !en.isIntersecting)); DATA_IO.observe(sec); }
  const wrap = $('#aqi-wrap');
  if (wrap) {
    const tip = $('#aqi-tip'), xl = $('#aqi-x');
    const move = (cx) => { const r = wrap.getBoundingClientRect(), i = Math.max(0, Math.min(23, Math.round(((cx - r.left) / r.width) * 23))), d = aqiSeries()[i], cat = aqiCat(d.v); xl.style.display = ''; xl.setAttribute('x1', (i / 23) * 600); xl.setAttribute('x2', (i / 23) * 600); tip.style.display = ''; tip.style.left = (i / 23) * 100 + '%'; tip.style.top = (200 - Math.min(d.v, 200)) / 2 + '%'; tip.innerHTML = `<span class="text-muted font-semibold">${pad(d.hr)}:00</span> AQI ${d.v} <span style="color:${cat.c}">${t(cat.k)}</span>`; };
    wrap.addEventListener('pointermove', (e) => move(e.clientX));
    wrap.addEventListener('pointerleave', () => { tip.style.display = 'none'; xl.style.display = 'none'; });
  }
}

/* ================= Events ================= */
function evSort(a, b) { return (a.d || evDate(a.w)) - (b.d || evDate(b.w)) || a.tm.localeCompare(b.tm); }
function evList(f) {
  const F = f || S.evF, wk = weekendKeys(), tk = dkey(today());
  return EVENTS.map((e) => Object.assign({}, e, { d: evDate(e.w) })).filter((e) => F === 'all' || (F === 'today' && dkey(e.d) === tk) || (F === 'weekend' && wk.includes(dkey(e.d))) || (F === 'free' && !e.price)).sort(evSort);
}
function evCard(e) {
  const d = e.d || evDate(e.w), c = ECAT[e.c], saved = S.evSaved.includes(e.id);
  return `<article class="card overflow-hidden flex flex-col relative transition-colors hover:border-ink/25" data-evcard="${e.id}"><button type="button" class="group text-left flex flex-col flex-1 zoom-on" data-act="ev-open" data-id="${e.id}"><div class="scene zoom aspect-[16/9] relative">${Scene(e.img)}<span class="absolute left-3 top-3 w-14 rounded-xl bg-white text-[#0E1630] text-center py-1.5 shadow-lg"><b class="block text-[20px] leading-none tnum">${d.getDate()}</b><span class="block text-[11px] font-bold text-[#56617A] mt-0.5">${EN() ? EN_MON[d.getMonth()] : d.getMonth() + 1 + '-р сар'}</span></span>${!e.price ? `<span class="absolute right-3 top-3 badge bg-ubgreen text-white">${t('free')}</span>` : ''}</div>
    <div class="p-5 flex-1 flex flex-col"><span class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted"><i class="w-2 h-2 rounded-full" style="background:${c.c}"></i>${esc(L(c.t))}</span><span class="mt-2 text-[17px] font-bold leading-snug group-hover:text-ubred transition-colors">${esc(L(e.t))}</span>
    <span class="mt-3 space-y-1.5 text-[13.5px] text-muted block"><span class="flex items-center gap-2">${ic('clock-3', 'w-4 h-4')}${fDate(d, true)}, ${esc(e.tm)}</span><span class="flex items-center gap-2 min-w-0">${ic('map-pin', 'w-4 h-4')}<span class="truncate">${esc(L(e.v))}</span></span></span>
    <span class="mt-auto pt-4 font-bold text-[14.5px] pr-12">${e.price ? money(e.price) : t('free')}</span></div></button>
    <button type="button" class="absolute right-3 bottom-3 icon-btn ${saved ? 'bg-ubred text-white' : 'bg-soft hover:bg-line'}" data-act="ev-save" data-id="${e.id}" aria-pressed="${saved}" aria-label="${esc(saved ? t('saved') : t('save'))}">${ic(saved ? 'bookmark-check' : 'bookmark', 'w-5 h-5')}</button></article>`;
}
function evRow(e, mapMode) {
  const d = e.d || evDate(e.w), c = ECAT[e.c], sel = mapMode && S.evSel === e.id;
  return `<button type="button" class="w-full text-left card p-3 flex items-center gap-3 transition-colors ${sel ? '!border-ubblue ring-1 ring-ubblue' : 'hover:bg-soft'}" data-act="${mapMode ? 'ev-mapsel' : 'ev-open'}" data-id="${e.id}"><span class="w-14 shrink-0 rounded-xl bg-soft text-center py-1.5"><b class="block text-[18px] leading-none tnum">${esc(e.tm)}</b><span class="block text-[11px] text-muted mt-1">${EN() ? EN_WD[d.getDay()] : MN_WDS[d.getDay()]}</span></span><span class="min-w-0 flex-1"><span class="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted"><i class="w-2 h-2 rounded-full" style="background:${c.c}"></i>${esc(L(c.t))}</span><b class="block text-[14.5px] leading-snug truncate">${esc(L(e.t))}</b><span class="block text-[12.5px] text-muted truncate">${esc(L(e.v))}</span></span><span class="text-[13px] font-bold shrink-0">${e.price ? money(e.price) : t('free')}</span></button>`;
}
function keyToDate(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m, d); }
function calHTML() {
  const td = today(); if (!S.calYM) S.calYM = [td.getFullYear(), td.getMonth()]; if (!S.calDay) S.calDay = dkey(td);
  const [y, m] = S.calYM, startDow = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
  const byDay = {}; evList().forEach((e) => { const k = dkey(e.d); (byDay[k] = byDay[k] || []).push(e); });
  let cells = ''; for (let i = 0; i < startDow; i++) cells += '<span></span>';
  for (let dn = 1; dn <= days; dn++) {
    const dt = new Date(y, m, dn), k = dkey(dt), list = byDay[k] || [], isT = k === dkey(td), past = dt < td, on = S.calDay === k;
    cells += `<button type="button" class="cal-d ${past && !on ? 'text-muted/50' : ''} ${isT && !on ? 'ring-1 ring-ubred text-ubred' : ''}" data-act="cal-day" data-k="${k}" aria-pressed="${on}" aria-label="${esc(fDate(dt, true))}"><span class="tnum">${dn}</span><span class="flex gap-0.5 h-1.5">${list.slice(0, 3).map((e) => `<i class="w-1.5 h-1.5 rounded-full" style="background:${ECAT[e.c].c}"></i>`).join('')}</span></button>`;
  }
  const sel = byDay[S.calDay] || [], selD = keyToDate(S.calDay);
  return `<div class="grid grid-cols-1 lg:grid-cols-12 gap-6"><div class="lg:col-span-7 card p-4 sm:p-6"><div class="flex items-center justify-between mb-4"><b class="text-[18px]">${fMonth(y, m)}</b><div class="flex gap-1"><button type="button" class="icon-btn hover:bg-soft" data-act="cal-m" data-d="-1" aria-label="${esc(t('prev'))}">${ic('chevron-left')}</button><button type="button" class="icon-btn hover:bg-soft" data-act="cal-m" data-d="1" aria-label="${esc(t('next'))}">${ic('chevron-right')}</button></div></div>
    <div class="grid grid-cols-7 gap-1 text-center text-[12px] font-bold text-muted mb-1">${[1, 2, 3, 4, 5, 6, 0].map((i) => `<span>${EN() ? EN_WD[i] : MN_WDS[i]}</span>`).join('')}</div><div class="grid grid-cols-7 gap-1">${cells}</div></div>
    <div class="lg:col-span-5"><p class="font-extrabold text-[18px]">${fDate(selD, true)}</p><p class="text-[13.5px] text-muted mb-4">${sel.length} ${L(['арга хэмжээ', sel.length === 1 ? 'event' : 'events'])}</p>${sel.length ? `<div class="space-y-3">${sel.map((e) => evRow(e)).join('')}</div>` : `<div class="card p-8 text-center text-muted">${ic('calendar-x', 'w-8 h-8 mx-auto mb-3 opacity-60')}${t('noEvents')}</div>`}</div></div>`;
}
function evPanel() {
  const list = evList();
  if (S.evView === 'cal') return calHTML();
  if (S.evView === 'map') return `<div class="grid grid-cols-1 lg:grid-cols-12 gap-5"><div class="lg:col-span-8 min-w-0"><div id="ev-map" class="rounded-[22px] overflow-hidden border border-line h-[400px] sm:h-[500px]"></div></div><div class="lg:col-span-4 space-y-3 lg:max-h-[500px] overflow-auto thin-scroll p-0.5" id="ev-maplist">${list.length ? list.map((e) => evRow(e, true)).join('') : `<p class="text-muted p-6 text-center">${t('noEventsF')}</p>`}</div></div>`;
  return list.length ? `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">${list.map(evCard).join('')}</div>` : `<div class="card p-10 text-center text-muted">${ic('calendar-x', 'w-8 h-8 mx-auto mb-3 opacity-60')}${t('noEventsF')}</div>`;
}
function evPopup(id) {
  const e = EVENTS.find((x) => x.id === id), d = evDate(e.w), c = ECAT[e.c];
  return `<div class="card shadow-2xl p-4 text-ink"><div class="flex items-start gap-3"><div class="min-w-0 flex-1"><p class="text-[12px] font-bold" style="color:${c.c}">${esc(L(c.t))}</p><p class="font-extrabold leading-snug text-[15px]">${esc(L(e.t))}</p><p class="text-[12.5px] text-muted mt-1">${fDate(d, true)}, ${esc(e.tm)}</p><p class="text-[12.5px] text-muted">${esc(L(e.v))}</p></div><button type="button" class="icon-btn !w-8 !h-8 hover:bg-soft -mr-1 -mt-1" data-act="ev-mapclose" aria-label="${esc(t('close'))}">${ic('x', 'w-4 h-4')}</button></div><button type="button" class="btn btn-sm btn-ink w-full mt-3" data-act="ev-open" data-id="${e.id}">${t('more')}</button></div>`;
}
function afterEvPanel() {
  if (MAPS.ev) { MAPS.ev.destroy(); MAPS.ev = null; }
  if (S.evView === 'map' && $('#ev-map')) {
    MAPS.ev = new MapView($('#ev-map'), { points: () => evList().map((e) => ({ id: e.id, x: e.x, y: e.y, c: ECAT[e.c].c, i: 'calendar-days', tag: e.tm, label: L(e.t) })), sel: S.evSel, onSelect: (id) => selectEv(id, false), popup: evPopup });
  }
}
function selectEv(id, pan) {
  S.evSel = id;
  const l = $('#ev-maplist'); if (l) l.innerHTML = evList().map((e) => evRow(e, true)).join('');
  if (MAPS.ev) MAPS.ev.select(id, pan);
}
function renderEvents() {
  $('#events').innerHTML = `<div class="bg-card border-y border-line"><div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-5"><div><h2 class="h-section">${t('evTitle')}</h2><p class="mt-2 text-muted">${t('evDesc')}</p></div>${tabs('evview', [['list', t('v_list'), 'list'], ['cal', t('v_cal'), 'calendar-days'], ['map', t('v_map'), 'map']], S.evView, { label: t('evTitle'), cls: 'self-start lg:self-auto' })}</div>
    <div class="mt-6 flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0" id="ev-filters">${evFilters()}</div>
    <div id="ev-panel" class="mt-6">${evPanel()}</div></div></div>`;
  afterEvPanel();
}
function evFilters() { return chips('ev-f', [['all', t('f_all')], ['today', t('f_today')], ['weekend', t('f_weekend')], ['free', t('f_free')]].map(([v, l]) => [v, l + '  ' + evList(v).length]), S.evF); }
function setEvView(v) {
  if (v === S.evView) return;
  const order = ['list', 'cal', 'map'], dir = order.indexOf(v) > order.indexOf(S.evView) ? 1 : -1;
  S.evView = v; selectTab('evview', v);
  if (MAPS.ev) { MAPS.ev.destroy(); MAPS.ev = null; }
  swap($('#ev-panel'), evPanel(), dir, afterEvPanel);
}
function setEvF(v) {
  S.evF = v; $('#ev-filters').innerHTML = evFilters();
  if (MAPS.ev) { MAPS.ev.destroy(); MAPS.ev = null; }
  swap($('#ev-panel'), evPanel(), 0, afterEvPanel);
}
function repaintEvents() {
  if (S.evView === 'list') $('#ev-panel').innerHTML = evPanel();
  else if (S.evView === 'cal') $('#ev-panel').innerHTML = calHTML();
  if (S.hub === 'events' && $('#hub-panel')) $('#hub-panel').innerHTML = evTeaser();
}

/* ================= Transparency ================= */
const TR_KIND = {   // баримтын төрөл бүрийн тэмдэг, өнгө
  res: { i: 'scroll-text', c: 'var(--c-blue)' },
  ord: { i: 'stamp', c: '124 77 255' },
  tender: { i: 'gavel', c: 'var(--c-amber)' },
};
function tenderBadge(d) {
  if (d.st === 'open') return `<span class="badge ${d.left <= 3 ? 'b-red' : 'b-blue'}"><span class="live !w-1.5 !h-1.5" style="--dot:currentColor"></span>${d.left ? t('daysLeft', { n: d.left }) : t('closesToday')}</span>`;
  if (d.st === 'eval') return `<span class="badge b-off">${ic('hourglass', 'w-3.5 h-3.5')}${t('tEval')}</span>`;
  return `<span class="badge b-on">${ic('circle-check', 'w-3.5 h-3.5')}${t('tAwarded')}</span>`;
}
/* Хайсан үгийг тодруулна (esc хийсний дараа) */
function trHl(text, q) {
  const e = esc(text); if (!q) return e;
  const re = new RegExp('(' + esc(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  return e.replace(re, '<mark class="bg-ubyellow/45 text-ink rounded-[3px] px-0.5">$1</mark>');
}
function trRow(d, idx, all, q) {
  const k = TR_KIND[S.tr], date = addDays(today(), -d.ago), tender = S.tr === 'tender';
  const fresh = d.ago <= 7 ? `<span class="badge b-red !h-5 !px-1.5 !text-[11px]">${L(['Шинэ', 'New'])}</span>` : '';
  const st = tender ? tenderBadge(d) : `<span class="badge b-on">${ic('circle-check', 'w-3.5 h-3.5')}${t('inForce')}</span>`;
  // тендерийн хугацааны явц: зарласнаас хаагдах хүртэлх хугацааны хэдэн хувь өнгөрснийг
  const pct = d.st === 'open' ? Math.round((d.ago / Math.max(1, d.ago + d.left)) * 100) : 100;
  const barC = d.st === 'open' ? (d.left <= 3 ? 'rgb(var(--c-red))' : 'rgb(var(--c-blue))') : d.st === 'eval' ? 'rgb(var(--c-amber))' : 'rgb(var(--c-green))';
  const bar = tender ? `<span class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2"><span class="inline-flex items-center gap-1.5 text-[14px] font-extrabold tnum">${ic('banknote', 'w-4 h-4 text-muted')}${mln(d.bud)}</span><span class="flex items-center gap-2 flex-1 min-w-[160px] max-w-[300px]"><span class="flex-1 h-1.5 rounded-full bg-line overflow-hidden"><span class="tr-bar block h-full rounded-full" style="--w:${pct}%;background:${barC}"></span></span><span class="text-[12px] text-muted tnum w-9 text-right">${pct}%</span></span></span>` : '';
  return `<li class="tr-row" style="--i:${idx}"><button type="button" class="group w-full text-left px-4 sm:px-6 py-4 grid grid-cols-[auto_minmax(0,1fr)] md:grid-cols-[auto_minmax(0,1fr)_auto] gap-x-4 gap-y-3 items-center hover:bg-soft/70 transition-colors" data-act="doc" data-type="${S.tr}" data-i="${all.indexOf(d)}">
    <span class="tr-ic w-11 h-11 rounded-xl grid place-items-center shrink-0 self-start md:self-center" style="background:rgb(${k.c} / .1);color:rgb(${k.c})">${ic(k.i, 'w-5 h-5')}</span>
    <span class="min-w-0"><span class="flex flex-wrap items-center gap-x-2.5 gap-y-1"><span class="tnum text-[12.5px] font-bold px-2 py-0.5 rounded-md border border-line bg-card">${trHl(d.no, q)}</span>${fresh}<span class="text-[12.5px] text-muted">${fDate(date)} · ${d.ago ? L([`${d.ago} хоногийн өмнө`, `${d.ago} days ago`]) : L(['Өнөөдөр', 'Today'])}</span></span>
      <span class="block mt-1.5 text-[15.5px] font-semibold leading-snug group-hover:text-ubblue transition-colors">${trHl(L(d.t), q)}</span>${bar}</span>
    <span class="col-start-2 md:col-start-auto flex items-center justify-between md:justify-end gap-3">${st}<span class="tr-go w-8 h-8 rounded-full border border-line grid place-items-center text-muted shrink-0">${ic(d.url ? 'arrow-up-right' : 'arrow-right', 'w-4 h-4')}</span></span></button></li>`;
}
function trSummary() {
  if (S.tr !== 'tender') return '';
  const all = DOCS.tender, open = all.filter((d) => d.st === 'open'), soon = open.slice().sort((a, b) => a.left - b.left)[0];
  const tot = all.reduce((a, d) => a + (+d.bud || 0), 0);
  const cell = (icn, v, l) => `<div class="flex items-center gap-3 min-w-0"><span class="hidden sm:grid w-9 h-9 rounded-lg bg-card border border-line place-items-center text-muted shrink-0">${ic(icn, 'w-[18px] h-[18px]')}</span><span class="min-w-0"><b class="block text-[13.5px] sm:text-[15px] tnum leading-tight">${v}</b><span class="block text-[11.5px] sm:text-[12.5px] text-muted leading-snug">${l}</span></span></div>`;
  return `<div class="px-4 sm:px-6 py-3.5 sm:py-4 bg-soft/60 border-b border-line grid grid-cols-3 gap-3 sm:gap-4">${cell('door-open', open.length, t('tOpen'))}${cell('wallet', mln(tot), L(['Нийт төсөв', 'Total budget']))}${cell('alarm-clock', soon ? (soon.left ? t('daysLeft', { n: soon.left }) : t('closesToday')) : '—', L(['Хамгийн ойр хаагдах', 'Closing soonest']))}</div>`;
}
function trRows(quiet) {
  const q = S.trQ.trim(), ql = q.toLowerCase(), all = DOCS[S.tr];
  const list = all.filter((d) => !ql || (d.no + ' ' + d.t[0] + ' ' + d.t[1]).toLowerCase().includes(ql));
  const head = `${trSummary()}<div class="px-4 sm:px-6 py-2.5 text-[12.5px] text-muted border-b border-line flex items-center justify-between"><span>${q ? L([`«${esc(q)}»: ${list.length} илэрц`, `"${esc(q)}": ${list.length} results`]) : L([`${list.length} баримт`, `${list.length} documents`])}</span><span class="hidden sm:inline-flex items-center gap-1.5">${ic('arrow-down-wide-narrow', 'w-3.5 h-3.5')}${L(['Шинэ нь эхэндээ', 'Newest first'])}</span></div>`;
  if (!list.length) return `${head}<div class="p-12 text-center"><span class="w-14 h-14 mx-auto rounded-2xl bg-soft grid place-items-center text-muted">${ic('search-x', 'w-7 h-7')}</span><p class="mt-4 font-semibold">${t('noResults')}</p><p class="mt-1 text-[13.5px] text-muted">${L(['Өөр үг, эсвэл баримтын дугаараар хайгаад үзээрэй.', 'Try another word or a document number.'])}</p></div>`;
  return `${head}<ul class="divide-y divide-line ${quiet ? 'tr-quiet' : ''}">${list.map((d, i) => trRow(d, i, all, q)).join('')}</ul>`;
}
/* Тоог 0-ээс өсгөж харуулна (аравтын оронтой ч болно) */
function trCount(el) {
  const to = +el.dataset.to, dec = +el.dataset.dec || 0, fmt = (v) => (dec ? v.toFixed(dec).replace('.', EN() ? '.' : ',') : num(v));
  if (reduced) { el.textContent = fmt(to); return; }
  const t0 = performance.now(), dur = 1500;
  const step = (tm) => { const p = Math.min(1, (tm - t0) / dur), e = 1 - Math.pow(1 - p, 4); el.textContent = fmt(to * e); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function renderTr() {
  const stats = [
    ['file-check-2', 1248, 0, '', t('trStat1'), 'var(--c-blue)'],
    ['gavel', 37, 0, '', t('trStat2'), 'var(--c-amber)'],
    ['banknote', 412, 0, EN() ? ' bn ₮' : ' тэрбум ₮', t('trStat3'), 'var(--c-green)'],
    ['timer', 3.2, 1, ' ' + t('days'), t('trStat4'), 'var(--c-red)'],
  ];
  const now = ubNow(), tabsDef = [['res', t('tr_res'), 'scroll-text'], ['ord', t('tr_ord'), 'stamp'], ['tender', t('tr_tender'), 'gavel']];
  const sec = $('#transparency');
  sec.innerHTML = `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div><span class="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.12em] text-greenink"><span class="live" style="--dot:rgb(var(--c-green))"></span>${L(['Нээлттэй өгөгдөл', 'Open data'])}</span>
        <h2 class="h-section mt-2">${t('trTitle')}</h2><p class="mt-2 text-muted max-w-[62ch]">${t('trDesc')}</p></div>
      <p class="text-[13px] text-muted inline-flex items-center gap-2 shrink-0">${ic('refresh-cw', 'w-4 h-4')}${L(['Шинэчлэгдсэн: өнөөдөр', 'Updated: today'])} <b class="text-ink tnum">${hhmm(now)}</b></p>
    </div>
    <div class="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">${stats.map(([icn, v, dec, suf, l, c], i) => `<div class="tr-kpi card lift p-5 relative overflow-hidden" style="--i:${i}"><span class="absolute inset-x-0 top-0 h-[3px]" style="background:rgb(${c})"></span><span class="w-10 h-10 rounded-xl grid place-items-center" style="background:rgb(${c} / .1);color:rgb(${c})">${ic(icn, 'w-5 h-5')}</span><p class="mt-4 text-[28px] sm:text-[30px] font-extrabold tnum leading-none tracking-tight"><span data-to="${v}" data-dec="${dec}">0</span><span class="text-[17px] font-bold">${esc(suf)}</span></p><p class="text-[13px] text-muted mt-2 leading-snug">${l}</p></div>`).join('')}</div>
    <div class="mt-6 card overflow-hidden"><div class="px-4 sm:px-6 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-x-6">${tabs('tr', tabsDef, S.tr, { line: 1 })}
      <div class="md:w-80 pb-3 md:pb-0"><div class="relative">${ic('search', 'w-[18px] h-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none')}<input type="search" id="tr-q" data-input="trQ" value="${esc(S.trQ)}" placeholder="${esc(t('docSearch'))}" class="field !h-10 !pl-10 !text-[14px]" aria-label="${esc(t('docSearch'))}" autocomplete="off"/></div></div></div>
    <div id="tr-panel">${trRows()}</div></div></div>`;
  // таб бүрт баримтын тоо
  $$('[data-tabs="tr"]', sec).forEach((b) => b.insertAdjacentHTML('beforeend', `<span class="ml-1 min-w-[22px] h-[20px] px-1.5 rounded-full bg-soft border border-line text-[11.5px] font-bold tnum grid place-items-center">${(DOCS[b.dataset.v] || []).length}</span>`));
  if (sec.classList.contains('tr-in')) $$('[data-to]', sec).forEach((el) => { el.textContent = (+el.dataset.dec ? (+el.dataset.to).toFixed(+el.dataset.dec).replace('.', EN() ? '.' : ',') : num(+el.dataset.to)); });
  else {
    // Хэсгийн дээд хэсэг дэлгэцийн доод 20%-аас дээш орж ирэхэд эхэлнэ. Хэсэг хэдий өндөр (олон баримт) байсан ч ажиллана.
    const go = () => { sec.classList.add('tr-in'); $$('[data-to]', sec).forEach(trCount); };
    if (!('IntersectionObserver' in window)) go();
    else { const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); go(); } }, { rootMargin: '0px 0px -20% 0px' }); io.observe(sec); }
  }
}
function setTr(v) {
  if (v === S.tr) return;
  const order = ['res', 'ord', 'tender'], dir = order.indexOf(v) > order.indexOf(S.tr) ? 1 : -1;
  S.tr = v; selectTab('tr', v); swap($('#tr-panel'), trRows(), dir);
}

/* ================= About ================= */
function renderAbout() {
  const facts = [[t('founded'), '1639'], [t('area'), EN() ? '4,704 km²' : '4 704 км²'], [t('admin'), t('adminV')], [t('elevation'), EN() ? '1,350 m' : '1 350 м']];
  $('#about').innerHTML = `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24"><div class="border-t border-line pt-10 lg:pt-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
    <div class="lg:col-span-5"><h2 class="h-section">${t('aboutTitle')}</h2><p class="mt-3 text-muted leading-relaxed max-w-[52ch]">${t('aboutDesc')}</p>
      <div class="mt-7 grid grid-cols-2 gap-3">${facts.map(([l, v]) => `<div class="card p-4"><p class="text-[13px] text-muted">${l}</p><p class="mt-1 text-[20px] font-extrabold tnum leading-tight">${v}</p></div>`).join('')}</div></div>
    <div class="lg:col-span-7"><h3 class="text-[19px] font-extrabold">${t('leadership')}</h3><ol class="mt-5">${STRUCT.map((s, i) => `<li class="relative flex gap-4 ${i < STRUCT.length - 1 ? 'pb-6' : ''}">${i < STRUCT.length - 1 ? '<span class="absolute left-[21px] top-12 bottom-1 w-px bg-line"></span>' : ''}<span class="relative w-11 h-11 rounded-2xl ${i === 2 ? 'bg-ubred text-white' : 'bg-card border border-line text-ubred'} grid place-items-center shrink-0">${ic(s.i, 'w-5 h-5')}</span><div class="pt-1"><b class="block text-[15.5px] leading-snug">${esc(L(s.t))}</b><span class="block text-[13.5px] text-muted mt-0.5">${esc(L(s.d))}</span></div></li>`).join('')}</ol></div></div>
    <div class="mt-12"><h3 class="text-[19px] font-extrabold">${t('adminHist')}</h3><p class="mt-1 text-[13px] text-muted">${t('adminHistD')}</p><ol class="mt-6 flex overflow-x-auto no-scrollbar snap-x pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">${ADMIN_NAMES.map(([y, mn, en], i) => { const last = i === ADMIN_NAMES.length - 1; return `<li class="snap-start shrink-0 w-[172px] sm:w-[188px] relative pr-5">${last ? '' : '<span class="absolute left-2 right-0 top-[7px] h-px bg-line"></span>'}<span class="relative block w-3.5 h-3.5 rounded-full ${last ? 'bg-ubred' : 'bg-card border-2 border-ubred'}"></span><b class="block mt-3 text-[21px] font-extrabold tnum tracking-tight">${y}</b><span class="block mt-1 text-[13.5px] leading-snug ${last ? 'text-ink font-semibold' : 'text-muted'}">${esc(EN() ? en : mn)}</span></li>`; }).join('')}</ol></div>
    <div class="mt-12 rounded-[18px]" data-card="orgs"><h3 class="text-[19px] font-extrabold">${t('orgs')}</h3><ul class="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">${ORGS.map((o) => { const inner = `<span class="w-10 h-10 rounded-xl bg-soft grid place-items-center text-ubred shrink-0">${ic(o.i || 'building-2', 'w-5 h-5')}</span><span class="text-[14px] font-semibold leading-snug">${esc(L(o.t))}</span>`; return /^https?:\/\//.test(o.url || '') ? `<li><a href="${esc(o.url)}" target="_blank" rel="noopener" class="flex items-center gap-3 p-3 rounded-xl border border-line bg-card hover:border-ink/25 transition-colors">${inner}</a></li>` : `<li class="flex items-center gap-3 p-3 rounded-xl border border-line bg-card">${inner}</li>`; }).join('')}</ul></div></div>`;
}

/* ================= Босоо баннер =================
   Өргөн дэлгэцийн (≥1840px) баруун хоосон зайд, зөвхөн идэвхтэй баннер байх үед харагдана:
   admin-ы эхлэх/дуусах огноо, «Түр нуух», хэрэглэгч хаавал 24 цаг. Гүйлгэхэд дагаж явж (sticky), footer-оос өмнө зогсоно. */
const RAIL = { i: 0, timer: null, shown: false, hover: false };
function railActive() {
  const hide = store.get('railHide', {}), now = Date.now();
  return BANNERS.filter((b) => !b.off && b.t && L(b.t) && (!b.from || dayOffset(b.from) <= 0) && (!b.to || dayOffset(b.to) >= 0) && !(hide[b.id] && now - hide[b.id] < 864e5));
}
function railCard(b, o = {}) {
  const th = RAIL_THEMES[b.theme] || RAIL_THEMES.red, left = b.to ? dayOffset(b.to) : null;
  const act = b.act === 'vote' ? 'data-act="vote"' : b.act === 'report' ? 'data-act="report"'
    : b.act === 'url' && /^https?:\/\//.test(b.href || '') ? `data-act="ext-link" data-href="${esc(b.href)}"` : `data-act="go" ${goAttrs(b.go || { sec: 'hero' })}`;
  return `<article class="rail-slide ${o.on ? 'is-on' : ''}" style="--r1:${th[0]};--r2:${th[1]}" data-id="${esc(b.id || '')}" ${o.on ? '' : 'aria-hidden="true" inert'}>
    <div class="rail-img scene">${Scene(b.img || 'skyline:dawn:21')}</div>
    <span class="rail-mong mong" lang="mn-Mong" aria-hidden="true">${MONG}</span>
    <div class="rail-body">
      ${b.tag && L(b.tag) ? `<span class="rail-tag">${esc(L(b.tag))}</span>` : ''}
      <h3 class="rail-t">${esc(L(b.t))}</h3>
      ${b.d && L(b.d) ? `<p class="rail-d">${esc(L(b.d))}</p>` : ''}
      ${left != null && left <= 30 ? `<p class="rail-left">${ic('hourglass', 'w-3.5 h-3.5')}${left > 0 ? L([`${left} хоног үлдлээ`, `${left} days left`]) : L(['Өнөөдөр дуусна', 'Ends today'])}</p>` : ''}
      <button type="button" class="rail-btn" ${o.preview ? 'tabindex="-1"' : act}>${esc((b.btn && L(b.btn)) || L(['Дэлгэрэнгүй', 'Learn more']))}${ic('arrow-right', 'w-4 h-4')}</button>
    </div></article>`;
}
function renderRail() {
  let el = $('#rail');
  if (!el) { el = document.createElement('aside'); el.id = 'rail'; $('#main').appendChild(el); }
  clearInterval(RAIL.timer);
  const list = railActive();
  if (!list.length) { el.innerHTML = ''; el.hidden = true; return; }
  if (RAIL.i >= list.length) RAIL.i = 0;
  el.hidden = false; el.setAttribute('aria-label', L(['Онцлох', 'Featured']));
  el.innerHTML = `<div class="rail-card ${RAIL.shown ? '' : 'rail-intro'}">
    <button type="button" class="rail-x" data-rail="close" aria-label="${esc(L(['Хаах (24 цаг харагдахгүй)', 'Close (hidden for 24 h)']))}" title="${esc(L(['Хаах', 'Close']))}">${ic('x', 'w-4 h-4')}</button>
    <div class="rail-stack">${list.map((b, k) => railCard(b, { on: k === RAIL.i })).join('')}</div>
    ${list.length > 1 ? `<div class="rail-dots">${list.map((b, k) => `<button type="button" class="rail-dot ${k === RAIL.i ? 'is-on' : ''}" data-rail="${k}" aria-label="${k + 1} / ${list.length}"></button>`).join('')}</div>` : ''}
  </div>`;
  RAIL.shown = true;
  if (!el.dataset.bound) {
    el.dataset.bound = '1';
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-rail]'); if (!b) return;
      if (b.dataset.rail !== 'close') { railGo(+b.dataset.rail); return; }
      const cur = $('.rail-slide.is-on', el), hide = store.get('railHide', {});
      if (cur) { hide[cur.dataset.id] = Date.now(); store.set('railHide', hide); }
      const card = $('.rail-card', el);
      if (reduced || !card) renderRail(); else { card.classList.add('is-closing'); setTimeout(renderRail, 340); }
    });
    el.addEventListener('mouseenter', () => { RAIL.hover = true; });
    el.addEventListener('mouseleave', () => { RAIL.hover = false; });
  }
  if (list.length > 1 && !reduced && !S.a11y) RAIL.timer = setInterval(() => { if (!RAIL.hover && !document.hidden) railGo(RAIL.i + 1); }, 8000);
}
function railGo(i) {
  const slides = $$('#rail .rail-slide'), dots = $$('#rail .rail-dot'), n = slides.length; if (n < 2) return;
  RAIL.i = ((i % n) + n) % n;
  slides.forEach((s, k) => { const on = k === RAIL.i; s.classList.toggle('is-on', on); s.toggleAttribute('inert', !on); if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true'); });
  dots.forEach((d, k) => d.classList.toggle('is-on', k === RAIL.i));
}

/* ================= Footer ================= */
const MONG = '\u1824\u182F\u1820\u182D\u1820\u1828\u182A\u1820\u182D\u1820\u1832\u1824\u1837';
function renderFooter() {
  const link = (it) => `<li><button type="button" class="hover:text-white text-left transition-colors" ${itemAct(it)}>${esc(L(it.t))}</button></li>`;
  $('#footer').innerHTML = `<div class="bg-navy text-white relative overflow-hidden"><div class="meander h-[18px] opacity-40" aria-hidden="true"></div>
    <div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
      <div class="lg:col-span-4 flex gap-7"><div class="mong text-[46px] leading-none text-white/[.16] select-none hidden sm:block" lang="mn-Mong" aria-hidden="true">${MONG}</div><div>
        <div class="flex items-center gap-3">${logoMark('w-11 h-11')}<div><p class="font-extrabold text-[20px] tracking-tight">${t('brand')}</p><p class="text-[13px] text-white/60">${t('slogan')}</p></div></div>
        <p class="mt-7 text-[13px] text-white/60">${t('hotline')}</p><p class="text-[44px] font-extrabold tnum leading-none mt-1 tracking-tight">1200</p>
        <p class="mt-6 text-[13px] text-white/60">${t('emergency')}</p><div class="mt-2 flex gap-2">${[['101', t('fire')], ['102', t('police')], ['103', t('ambulance')]].map(([n, l]) => `<span class="rounded-xl bg-white/[.07] border border-white/10 px-3 py-2"><b class="block text-[18px] tnum leading-none">${n}</b><span class="text-[11.5px] text-white/60">${l}</span></span>`).join('')}</div></div></div>
      <div class="lg:col-span-2"><p class="font-bold">${t('f_services')}</p><ul class="mt-4 space-y-2.5 text-[14px] text-white/70">${(MENU[0] ? MENU[0].items : []).map(link).join('')}</ul></div>
      <div class="lg:col-span-2"><p class="font-bold">${t('f_info')}</p><ul class="mt-4 space-y-2.5 text-[14px] text-white/70">${MENU.slice(1).map((m) => m.items[0]).filter(Boolean).map(link).join('')}</ul></div>
      <div class="lg:col-span-4"><p class="font-bold">${t('digest')}</p><p class="mt-2 text-[14px] text-white/65">${t('digestD')}</p>
        <form class="mt-4 flex gap-2" data-form="digest" novalidate><input type="email" placeholder="${esc(t('email'))}" class="flex-1 min-w-0 h-11 px-4 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/45 focus:outline-none focus:border-white/50" aria-label="${esc(t('email'))}"/><button type="submit" class="btn !h-11 bg-white text-[#0B1D45] hover:bg-white/90">${t('subscribe')}</button></form><p class="mt-2 text-[13px] text-ubyellow min-h-[20px]" data-digest-msg role="status"></p>
        <div class="mt-5 flex gap-2" aria-hidden="true">${['facebook', 'youtube', 'instagram', 'twitter'].map((i) => `<span class="w-10 h-10 rounded-xl bg-white/[.07] border border-white/10 grid place-items-center text-white/75">${ic(i, 'w-[18px] h-[18px]')}</span>`).join('')}</div></div></div>
    <div class="border-t border-white/10"><div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row gap-3 md:items-center justify-between text-[13px] text-white/55"><p>© 2026 ulaanbaatar.mn. ${t('conceptNote')}</p><div class="flex gap-5"><button type="button" data-act="admin" class="hover:text-white transition-colors">${L(['Удирдлагын хэсэг', 'Admin'])}</button><span>${t('privacy')}</span><span>${t('access')}</span><span>${t('openData')}</span></div></div></div></div>`;
}
