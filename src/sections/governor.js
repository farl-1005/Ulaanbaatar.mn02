/* ================= Засаг дарга: ажлын хуваарь, мэдээ =================
   Хуваарь (GOV_SCHED) admin «Засаг даргын хуваарь»-аас. 7 хоногийн туузаас өдөр сонгоход тухайн өдрийн ажлууд гарна;
   одоо болж буй ажил «Яг одоо», дараагийнх нь тоолууртай. Хэсэг дэлгэцэнд харагдаж байх үед л 30 секунд тутам шинэчилнэ. */
const GV = { w: 0, d: null, timer: null, sig: '' };
const govIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function govAt(e, hm) { const [y, m, d] = e.date.split('-').map(Number), [h, mi] = String(hm || '09:00').split(':').map(Number); return new Date(y, m - 1, d, h || 0, mi || 0); }
function govState(e, now = ubNow()) {
  const a = govAt(e, e.from), b = e.to && e.to > e.from ? govAt(e, e.to) : new Date(a.getTime() + 36e5);
  if (now >= b) return { k: 'done' };
  if (now >= a) return { k: 'live', p: (now - a) / (b - a), left: Math.max(1, Math.ceil((b - now) / 6e4)) };
  return { k: 'soon', mins: Math.max(1, Math.ceil((a - now) / 6e4)) };
}
function govIn(mins, e) {
  if (mins < 60) return L([`${mins} минутын дараа`, `in ${mins} min`]);
  const h = Math.floor(mins / 60), m = mins % 60;
  if (h < 24 && (!e || dayOffset(e.date) === 0)) return m ? L([`${h} цаг ${m} минутын дараа`, `in ${h} h ${m} min`]) : L([`${h} цагийн дараа`, `in ${h} h`]);
  const n = e ? dayOffset(e.date) : Math.round(h / 24);
  return n === 1 ? L([`Маргааш ${e ? e.from : ''}`, `Tomorrow ${e ? e.from : ''}`]).trim() : L([`${n} хоногийн дараа`, `in ${n} days`]);
}
function govDays(w = GV.w) { const s = addDays(today(), -1 + w * 7); return Array.from({ length: 7 }, (_, i) => addDays(s, i)); }
const govOn = (iso) => GOV_SCHED.filter((e) => e.date === iso);
function govNext(now = ubNow()) { for (const e of GOV_SCHED) { const st = govState(e, now); if (st.k !== 'done') return [e, st]; } return [null, null]; }
function govPick() {
  const isos = govDays().map(govIso);
  if (GV.d && isos.includes(GV.d)) return;
  const td = govIso(today());
  GV.d = GV.w === 0 && govOn(td).length ? td : isos.find((x) => x >= td && govOn(x).length) || isos.find((x) => govOn(x).length) || (GV.w === 0 ? td : isos[0]);
}
function govDayLabel(d) {
  const o = dayOffset(govIso(d)), wd = EN() ? EN_WD[d.getDay()] : MN_WDS[d.getDay()];
  const rel = o === 0 ? L(['Өнөөдөр', 'Today']) : o === -1 ? L(['Өчигдөр', 'Yesterday']) : o === 1 ? L(['Маргааш', 'Tomorrow']) : '';
  return rel ? `<span class="hidden sm:inline">${rel}</span><span class="sm:hidden">${wd}</span>` : wd;
}
function govDaysHTML() {
  const days = govDays(), k = Math.max(0, days.findIndex((d) => govIso(d) === GV.d));
  return `<div class="gov-days" style="--k:${k}"><span class="gov-pill" aria-hidden="true"></span>${days.map((d) => {
    const iso = govIso(d), evs = govOn(iso), o = dayOffset(iso);
    return `<button type="button" class="gov-day ${o === 0 ? 'is-today' : ''} ${o < 0 ? 'is-past' : ''}" data-act="gov-day" data-v="${iso}" aria-pressed="${iso === GV.d}" aria-label="${esc(fDate(d, true))}, ${evs.length} ${L(['ажил', 'items'])}"><span class="gov-wd">${govDayLabel(d)}</span><b class="gov-dn tnum">${d.getDate()}</b><span class="gov-dots">${evs.slice(0, 4).map((e) => `<i style="background:${(GOV_TYPES[e.type] || GOV_TYPES.meeting).c}"></i>`).join('')}</span></button>`;
  }).join('')}</div>`;
}
function govChip(e, st) {
  if (st.k === 'live') return `<span class="gov-st gov-st-live"><i class="live" style="--dot:#fff"></i>${L(['Болж байна', 'Happening now'])}</span>`;
  if (st.k === 'done') return `<span class="gov-st gov-st-done">${ic('check', 'w-3.5 h-3.5')}${L(['Болсон', 'Done'])}</span>`;
  return dayOffset(e.date) === 0 ? `<span class="gov-st gov-st-soon">${ic('clock-3', 'w-3.5 h-3.5')}<span data-gcd="${esc(e.id)}">${govIn(st.mins, e)}</span></span>` : '';
}
function govListHTML() {
  const now = ubNow(), evs = govOn(GV.d), isToday = dayOffset(GV.d) === 0;
  if (!evs.length) return `<li class="gov-empty"><span class="gov-empty-ic">${ic('calendar-x-2', 'w-6 h-6', 1.7)}</span><b class="block mt-3 text-[15.5px]">${L(['Энэ өдөр хуваарьт ажил алга', 'Nothing scheduled for this day'])}</b><span class="block mt-1 text-[13.5px] text-muted">${L(['Өөр өдрийг сонгоно уу.', 'Pick another day.'])}</span></li>`;
  const sts = evs.map((e) => govState(e, now));
  const nowAt = isToday && !sts.some((s) => s.k === 'live') ? sts.findIndex((s) => s.k === 'soon') : -1;
  return evs.map((e, i) => {
    const st = sts[i];
    const line = i === nowAt || (isToday && nowAt === -1 && i === evs.length - 1 && st.k === 'done' && !sts.some((s) => s.k === 'live')) ? `<li class="gov-nowline ${i === nowAt ? '' : 'is-end'}" aria-hidden="true"><span class="tnum">${L(['Одоо', 'Now'])} <b data-gnow>${hhmm(now)}</b></span></li>` : '';
    const row = govRow(e, st, i);
    return i === nowAt ? line + row : row + line;
  }).join('');
}
function govRow(e, st, i) {
  const ty = GOV_TYPES[e.type] || GOV_TYPES.meeting;
  return `<li class="gov-ev is-${st.k}" style="--c:${ty.c};--i:${i}" data-gev="${esc(e.id)}">
      <div class="gov-time tnum"><b>${esc(e.from || '')}</b>${e.to ? `<span>${esc(e.to)}</span>` : ''}</div>
      <div class="gov-node" aria-hidden="true"><i></i></div>
      <div class="gov-body">
        <div class="flex flex-wrap items-center gap-2"><span class="gov-type">${ic(ty.i, 'w-3.5 h-3.5')}${esc(L(ty.t))}</span>${govChip(e, st)}</div>
        <h4 class="gov-t">${esc(L(e.t))}</h4>
        ${e.place && L(e.place) ? `<p class="gov-place">${ic('map-pin', 'w-4 h-4')}<span>${esc(L(e.place))}</span></p>` : ''}
        ${e.d && L(e.d) ? `<p class="gov-d">${esc(L(e.d))}</p>` : ''}
        ${st.k === 'live' ? `<div class="gov-prog"><span><i data-gprog="${esc(e.id)}" style="transform:scaleX(${st.p.toFixed(3)})"></i></span><em class="tnum" data-gleft="${esc(e.id)}">${L([`${st.left} мин үлдсэн`, `${st.left} min left`])}</em></div>` : ''}
      </div>
      ${st.k === 'done' ? '' : `<button type="button" class="gov-ics" data-act="gov-ics" data-id="${esc(e.id)}" title="${esc(L(['Календарт нэмэх', 'Add to calendar']))}" aria-label="${esc(L(['Календарт нэмэх', 'Add to calendar']))}: ${esc(L(e.t))}">${ic('calendar-plus', 'w-[18px] h-[18px]')}<span class="gov-ics-l">${L(['Календарт нэмэх', 'Add to calendar'])}</span></button>`}
    </li>`;
}
function govNextHTML() {
  const [e, st] = govNext();
  if (!e) return `<div class="gov-next is-none"><p class="gov-next-l">${L(['Дараагийн ажил', 'Up next'])}</p><p class="mt-2 text-[15px] font-semibold text-white/80">${L(['Ойрын хуваарь хараахан гараагүй байна', 'No upcoming items yet'])}</p></div>`;
  const ty = GOV_TYPES[e.type] || GOV_TYPES.meeting, live = st.k === 'live';
  return `<button type="button" class="gov-next ${live ? 'is-live' : ''}" style="--c:${ty.c}" data-act="gov-day" data-v="${e.date}" data-id="${esc(e.id)}">
    <span class="flex items-center justify-between gap-3"><span class="gov-next-l">${live ? `<i class="live" style="--dot:#FF6B7D"></i>${L(['Яг одоо', 'Right now'])}` : L(['Дараагийн ажил', 'Up next'])}</span><span class="gov-next-cd tnum" data-gnext>${live ? L([`${st.left} мин үлдсэн`, `${st.left} min left`]) : govIn(st.mins, e)}</span></span>
    <b class="block mt-2.5 text-[17px] leading-snug">${esc(L(e.t))}</b>
    <span class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-white/70"><span class="inline-flex items-center gap-1.5 tnum">${ic('clock-3', 'w-4 h-4')}${dayOffset(e.date) === 0 ? '' : esc(fDate(govAt(e, e.from))) + ', '}${esc(e.from)}${e.to ? '–' + esc(e.to) : ''}</span>${e.place && L(e.place) ? `<span class="inline-flex items-center gap-1.5 min-w-0">${ic('map-pin', 'w-4 h-4')}<span class="truncate">${esc(L(e.place))}</span></span>` : ''}</span>
    ${live ? `<span class="gov-next-bar"><i data-gprog="${esc(e.id)}" style="transform:scaleX(${st.p.toFixed(3)})"></i></span>` : ''}
  </button>`;
}
function govMixHTML() {
  const isos = govDays(0).map(govIso), evs = GOV_SCHED.filter((e) => isos.includes(e.date));
  const cnt = Object.keys(GOV_TYPES).map((k) => [k, evs.filter((e) => (GOV_TYPES[e.type] ? e.type : 'meeting') === k).length]).filter(([, n]) => n);
  return `<div class="gov-mix"><p class="flex items-baseline justify-between gap-3"><span class="text-[12px] font-bold uppercase tracking-[.1em] text-white/55">${L(['Энэ 7 хоногт', 'This week'])}</span><b class="text-[13px] tnum">${evs.length} ${L(['ажил', 'items'])}</b></p>
    <span class="gov-mix-bar">${cnt.map(([k, n], i) => `<i style="flex:${n} 1 0;background:${GOV_TYPES[k].c};--i:${i}"></i>`).join('')}</span>
    <span class="mt-3 flex flex-wrap gap-x-3.5 gap-y-1.5">${cnt.map(([k, n]) => `<span class="inline-flex items-center gap-1.5 text-[12.5px] text-white/75"><i class="w-2 h-2 rounded-full" style="background:${GOV_TYPES[k].c}"></i>${esc(L(GOV_TYPES[k].t))} <b class="text-white tnum">${n}</b></span>`).join('')}</span></div>`;
}
/* Засаг даргатай холбоотой мэдээ (4 баганаар 2 мөр = 8). Хүрэлцэхгүй бол хамгийн сүүлийн мэдээгээр нөхнө. */
function govNews(n = 4) {
  const re = /Засаг дарг|Захирагч|Пүрэвдагва|Governor|Mayor/i, out = GOV.map((id) => NEWS_BY[id]).filter(Boolean);
  NEWS.forEach((x) => { if (out.length < n && !x.zar && !x.draft && !out.includes(x) && re.test(L(x.t) + ' ' + Lf(x.l))) out.push(x); });
  NEWS.slice().sort((a, b) => a.ago - b.ago).forEach((x) => { if (out.length < n && !x.zar && !x.draft && !out.includes(x)) out.push(x); });
  return out.slice(0, n);
}
function govMonth() {
  const days = govDays(), a = days[0], b = days[6];
  return EN() ? `${EN_MON[a.getMonth()]} ${a.getDate()} – ${a.getMonth() === b.getMonth() ? '' : EN_MON[b.getMonth()] + ' '}${b.getDate()}, ${b.getFullYear()}`
    : `${b.getFullYear()} оны ${a.getMonth() + 1}-р сарын ${a.getDate()} – ${a.getMonth() === b.getMonth() ? '' : b.getMonth() + 1 + '-р сарын '}${b.getDate()}`;
}
function renderGov() {
  const sec = $('#gov'); if (!sec) return;
  govPick();
  const news = govNews(8), legend = Object.keys(GOV_TYPES).map((k) => `<span class="inline-flex items-center gap-1.5"><span style="color:${GOV_TYPES[k].c}">${ic(GOV_TYPES[k].i, 'w-3.5 h-3.5')}</span>${esc(L(GOV_TYPES[k].t))}</span>`).join('');
  sec.innerHTML = `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
    <div class="gov-rv flex flex-col md:flex-row md:items-end justify-between gap-4" style="--i:0">
      <div><span class="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.12em] text-ubred">${ic('landmark', 'w-4 h-4')}${t('govSec')}</span>
        <h2 class="h-section mt-2">${t('govSchedT')}</h2><p class="mt-2 text-muted max-w-[62ch]">${t('govSchedD')}</p></div>
    </div>
    <div class="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <aside class="gov-id on-navy gov-rv lg:col-span-4" style="--i:1">
        <span class="gov-aur gov-aur-a" aria-hidden="true"></span><span class="gov-aur gov-aur-b" aria-hidden="true"></span>
        <div class="flex items-center gap-4">
          <div class="gov-medal" aria-hidden="true"><svg viewBox="0 0 120 120" class="gov-ring gov-ring-a"><circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="1.5 5.2" stroke-linecap="round"/></svg><svg viewBox="0 0 120 120" class="gov-ring gov-ring-b"><circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" stroke-width="2.4" stroke-dasharray="64 250" stroke-linecap="round"/></svg><span class="gov-core">${logoMark('w-10 h-10')}</span></div>
          <div class="min-w-0"><h3 class="text-[22px] font-extrabold leading-tight tracking-[-0.01em]">${t('govName')}</h3><p class="text-[13px] text-white/70 leading-snug mt-1">${t('govTitle')}</p></div>
        </div>
        <div id="gov-next-w" class="mt-6">${govNextHTML()}</div>
        ${govMixHTML()}
        <p class="mt-5 flex items-start gap-2.5 text-[13.5px] text-white/80 leading-snug">${ic('users-round', 'w-[18px] h-[18px] mt-px text-white/60')}<span>${t('govReception')}</span></p>
      </aside>
      <div class="gov-cal card gov-rv lg:col-span-8" style="--i:2">
        <div class="flex items-center justify-between gap-3 px-4 sm:px-6 pt-5">
          <div class="min-w-0"><p class="text-[12px] font-bold uppercase tracking-[.1em] text-muted">${L(['Хуваарь', 'Schedule'])}</p><p class="mt-0.5 text-[16px] sm:text-[17px] font-extrabold tnum truncate" id="gov-range">${esc(govMonth())}</p></div>
          <div class="flex items-center gap-1.5 shrink-0"><button type="button" class="gov-navb !w-auto px-3 text-[13px] font-bold" data-act="gov-today" ${GV.w === 0 && GV.d === govIso(today()) ? 'hidden' : ''}>${L(['Өнөөдөр', 'Today'])}</button><button type="button" class="gov-navb" data-act="gov-wk" data-v="-1" aria-label="${esc(L(['Өмнөх 7 хоног', 'Previous week']))}">${ic('chevron-left', 'w-[18px] h-[18px]')}</button><button type="button" class="gov-navb" data-act="gov-wk" data-v="1" aria-label="${esc(L(['Дараагийн 7 хоног', 'Next week']))}">${ic('chevron-right', 'w-[18px] h-[18px]')}</button></div>
        </div>
        <div id="gov-wk" class="px-3 sm:px-6 mt-4">${govDaysHTML()}</div>
        <ol id="gov-list" class="gov-list px-4 sm:px-6 pt-6 pb-6" aria-live="polite">${govListHTML()}</ol>
        <div class="px-4 sm:px-6 py-3.5 border-t border-line flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-muted">${legend}<span class="sm:ml-auto inline-flex items-center gap-1.5">${ic('info', 'w-3.5 h-3.5')}${L(['Хуваарь өөрчлөгдөж болно', 'Subject to change'])}</span></div>
      </div>
    </div>
    ${news.length ? `<div class="gov-rv mt-12" style="--i:3"><div class="flex items-end justify-between gap-4 mb-4"><h3 class="text-[20px] font-extrabold tracking-tight">${t('govNews')}</h3><button type="button" class="text-[14px] font-bold text-ubblue inline-flex items-center gap-1" data-act="go" data-sec="hub" data-hub="news">${t('allNews')}${ic('chevron-right', 'w-4 h-4')}</button></div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">${news.map((n) => newsCard(n)).join('')}</div></div>` : ''}
  </div>`;
  GV.sig = govSig();
  govWatch(sec);
}
/* Төлөв өөрчлөгдсөн эсэхийг харьцуулах түлхүүр: өөрчлөгдвөл жагсаалтыг дахин зурна, үгүй бол зөвхөн тоолуурын текст */
function govSig() { const now = ubNow(), [e, st] = govNext(now); return GV.d + '|' + govOn(GV.d).map((x) => govState(x, now).k).join(',') + '|' + (e ? e.id + st.k : ''); }
function govTick() {
  const sec = $('#gov'); if (!sec || !sec.firstElementChild) return;
  const sig = govSig();
  if (sig !== GV.sig) { GV.sig = sig; const l = $('#gov-list'), n = $('#gov-next-w'); if (l) l.innerHTML = govListHTML(); if (n) n.innerHTML = govNextHTML(); return; }
  const now = ubNow();
  $$('[data-gcd]', sec).forEach((el) => { const e = GOV_SCHED.find((x) => x.id === el.dataset.gcd), st = e && govState(e, now); if (st && st.k === 'soon') el.textContent = govIn(st.mins, e); });
  $$('[data-gprog]', sec).forEach((el) => { const e = GOV_SCHED.find((x) => x.id === el.dataset.gprog), st = e && govState(e, now); if (st && st.k === 'live') el.style.transform = `scaleX(${st.p.toFixed(3)})`; });
  $$('[data-gleft]', sec).forEach((el) => { const e = GOV_SCHED.find((x) => x.id === el.dataset.gleft), st = e && govState(e, now); if (st && st.k === 'live') el.textContent = L([`${st.left} мин үлдсэн`, `${st.left} min left`]); });
  const nb = $('[data-gnext]', sec), [ne, ns] = govNext(now); if (nb && ne) nb.textContent = ns.k === 'live' ? L([`${ns.left} мин үлдсэн`, `${ns.left} min left`]) : govIn(ns.mins, ne);
  $$('[data-gnow]', sec).forEach((el) => { el.textContent = hhmm(now); });
}
function govWatch(sec) {
  if (sec.dataset.io) return; sec.dataset.io = '1';
  const run = (on) => {
    sec.classList.toggle('gov-run', on); clearInterval(GV.timer);
    if (!on) return;
    if (!sec.classList.contains('gov-in')) { sec.classList.add('gov-in'); setTimeout(() => sec.classList.add('gov-done'), 1700); }   // дахин зурахад (хэл солих, CMS) гарч ирэх хөдөлгөөн давтагдахгүй
    govTick(); GV.timer = setInterval(govTick, 30000);
  };
  if (!('IntersectionObserver' in window)) { run(true); return; }
  new IntersectionObserver((es) => run(es[es.length - 1].isIntersecting), { rootMargin: '0px 0px -12% 0px' }).observe(sec);
}
function govSetDay(iso, focusId) {
  if (iso === GV.d && !focusId) return;
  const days = govDays(), k = days.findIndex((d) => govIso(d) === iso);
  if (k < 0) { GV.w += Math.floor((dayOffset(iso) + 1) / 7) - GV.w; GV.d = iso; govSetWeek(0, focusId); return; }
  const dir = iso > GV.d ? 1 : iso < GV.d ? -1 : 0, changed = iso !== GV.d;
  GV.d = iso; GV.sig = govSig();
  const strip = $('#gov .gov-days'), pill = strip && $('.gov-pill', strip);
  if (strip) { strip.style.setProperty('--k', k); $$('.gov-day', strip).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === iso))); }
  if (pill && pill.animate && !reduced && changed) pill.animate([{ scale: '1 1' }, { scale: '1.16 .92', offset: .35 }, { scale: '1 1' }], { duration: 520, easing: 'cubic-bezier(.3,.7,.3,1)' });
  govTodayBtn();
  const list = $('#gov-list');
  const after = (el) => { el.classList.add('gov-fresh'); setTimeout(() => el.classList.remove('gov-fresh'), 900); if (focusId) govFlash(focusId); };
  if (changed) swap(list, govListHTML(), dir, after); else after(list);
}
function govSetWeek(step, focusId) {
  GV.w += step; if (step) GV.d = null; govPick();
  const dir = step > 0 ? 1 : step < 0 ? -1 : 0; GV.sig = govSig();
  const r = $('#gov-range'); if (r) r.textContent = govMonth();
  govTodayBtn();
  swap($('#gov-wk'), govDaysHTML(), dir);
  swap($('#gov-list'), govListHTML(), dir, (el) => { el.classList.add('gov-fresh'); setTimeout(() => el.classList.remove('gov-fresh'), 900); if (focusId) govFlash(focusId); });
}
function govTodayBtn() { const b = $('#gov [data-act="gov-today"]'); if (b) b.hidden = GV.w === 0 && GV.d === govIso(today()); }
function govFlash(id) {
  const row = $(`#gov-list [data-gev="${CSS.escape(id)}"]`); if (!row) return;
  const r = row.getBoundingClientRect(); if (r.top < 80 || r.bottom > innerHeight) row.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
  row.classList.remove('is-flash'); void row.offsetWidth; row.classList.add('is-flash');
}
/* «Календарт нэмэх»: .ics файл (Google, Apple, Outlook календарь нээнэ) */
function govIcs(id) {
  const e = GOV_SCHED.find((x) => x.id === id); if (!e) return;
  const dt = (hm) => e.date.replace(/-/g, '') + 'T' + String(hm).replace(':', '') + '00';
  const tx = (s) => String(s || '').replace(/[\\,;]/g, (m) => '\\' + m).replace(/\r?\n/g, '\\n');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ulaanbaatar.mn//governor//MN', 'BEGIN:VEVENT', `UID:${e.id}-${e.date}@ulaanbaatar.mn`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;TZID=Asia/Ulaanbaatar:${dt(e.from || '09:00')}`, e.to && e.to > (e.from || '') ? `DTEND;TZID=Asia/Ulaanbaatar:${dt(e.to)}` : 'DURATION:PT1H',
    `SUMMARY:${tx(L(e.t))}`, e.place ? `LOCATION:${tx(L(e.place))}` : '', e.d ? `DESCRIPTION:${tx(L(e.d))}` : '', 'END:VEVENT', 'END:VCALENDAR'].filter(Boolean).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' })); a.download = `zasag-darga-${e.date}-${e.id}.ics`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast(L(['Календарийн файл бэлэн боллоо', 'Calendar file ready']), 'calendar-check');
}

