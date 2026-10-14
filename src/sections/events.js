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
  if (S.evView === 'map') return `<div class="grid grid-cols-1 lg:grid-cols-12 gap-5"><div class="lg:col-span-8 min-w-0"><div id="ev-map" class="rounded-[8px] overflow-hidden border border-line h-[400px] sm:h-[500px]"></div></div><div class="lg:col-span-4 space-y-3 lg:max-h-[500px] overflow-auto thin-scroll p-0.5" id="ev-maplist">${list.length ? list.map((e) => evRow(e, true)).join('') : `<p class="text-muted p-6 text-center">${t('noEventsF')}</p>`}</div></div>`;
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
  if (onHome()) {   // ойрын 4 арга хэмжээ
    const list = EVENTS.map((e) => Object.assign({}, e, { d: evDate(e.w) })).sort(evSort).slice(0, 4);
    $('#events').innerHTML = homeWrap(homeHead(t('evTitle'), t('evDesc'), 'data-act="page" data-v="events"', t('allEvents'))
      + `<div class="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto sm:overflow-visible snap-x no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">${list.map((e) => `<div class="w-[80%] shrink-0 snap-start sm:w-auto">${evCard(e)}</div>`).join('')}</div>`, true);   // утсанд хажуу тийш гүйлгэнэ
    return;
  }
  $('#events').innerHTML = `<div class="bg-card border-y border-line"><div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-5"><div class="sec-ttl"><h2 class="h-section">${t('evTitle')}</h2><p class="mt-2 text-muted">${t('evDesc')}</p></div>${tabs('evview', [['list', t('v_list'), 'list'], ['cal', t('v_cal'), 'calendar-days'], ['map', t('v_map'), 'map']], S.evView, { label: t('evTitle'), cls: 'self-start lg:self-auto' })}</div>
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
  if (!$('#ev-panel')) { if (onHome()) renderEvents(); return; }   // нүүрний товч хувилбар
  if (S.evView === 'list') $('#ev-panel').innerHTML = evPanel();
  else if (S.evView === 'cal') $('#ev-panel').innerHTML = calHTML();
  if (S.hub === 'events' && $('#hub-panel')) $('#hub-panel').innerHTML = evTeaser();
}

