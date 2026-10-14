/* ================= Transparency ================= */
const TR_KIND = {   // баримтын төрөл бүрийн тэмдэг, өнгө
  res: { i: 'scroll-text', c: 'var(--c-blue)' },
  ord: { i: 'stamp', c: '124 77 255' },
  tender: { i: 'gavel', c: 'var(--c-amber)' },
};
/* Ил тод байдлын табтай самбар (Тогтоол / Захирамж / Тендер + хайлт + жагсаалт): нүүр болон бүтэн хуудсанд ижил */
function trPanel(tabsDef) {
  return `<div class="mt-6 card overflow-hidden"><div class="px-4 sm:px-6 border-b border-line flex flex-col md:flex-row md:items-center justify-between gap-x-6">${tabs('tr', tabsDef, S.tr, { line: 1 })}
      <div class="md:w-80 pb-3 md:pb-0"><div class="relative">${ic('search', 'w-[18px] h-[18px] absolute left-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none')}<input type="search" id="tr-q" data-input="trQ" value="${esc(S.trQ)}" placeholder="${esc(t('docSearch'))}" class="field !h-10 !pl-10 !text-[14px]" aria-label="${esc(t('docSearch'))}" autocomplete="off"/></div></div></div>
    <div id="tr-panel">${trRows()}</div></div>`;
}
function trTabCounts(sec) {   // таб бүрт баримтын тоо
  $$('[data-tabs="tr"]', sec).forEach((b) => b.insertAdjacentHTML('beforeend', `<span class="ml-1 min-w-[22px] h-[20px] px-1.5 rounded-full bg-soft border border-line text-[11.5px] font-bold tnum grid place-items-center">${(DOCS[b.dataset.v] || []).length}</span>`));
}
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
  if (onHome()) {   // 4 тоо + бүх төрлөөс хамгийн сүүлийн 4 баримт
    const fmt = (v, dec) => (dec ? v.toFixed(dec).replace('.', EN() ? '.' : ',') : num(v));
    sec.innerHTML = homeWrap(homeHead(t('trTitle'), t('trDesc'), 'data-act="page" data-v="transparency"')
      + `<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">${stats.map(([icn, v, dec, suf, l, c]) => `<div class="card p-5 relative overflow-hidden"><span class="absolute inset-x-0 top-0 h-[3px]" style="background:rgb(${c})"></span><span class="w-10 h-10 rounded-xl grid place-items-center" style="background:rgb(${c} / .1);color:rgb(${c})">${ic(icn, 'w-5 h-5')}</span><p class="mt-4 text-[28px] font-extrabold tnum leading-none tracking-tight">${fmt(v, dec)}<span class="text-[17px] font-bold">${esc(suf)}</span></p><p class="text-[13px] text-muted mt-2 leading-snug">${l}</p></div>`).join('')}</div>`
      + trPanel(tabsDef));
    trTabCounts(sec); trReveal(sec);
    return;
  }
  sec.innerHTML = `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="sec-ttl"><span class="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.12em] text-greenink"><span class="live" style="--dot:rgb(var(--c-green))"></span>${L(['Нээлттэй өгөгдөл', 'Open data'])}</span>
        <h2 class="h-section mt-2">${t('trTitle')}</h2><p class="mt-2 text-muted max-w-[62ch]">${t('trDesc')}</p></div>
      <p class="text-[13px] text-muted inline-flex items-center gap-2 shrink-0">${ic('refresh-cw', 'w-4 h-4')}${L(['Шинэчлэгдсэн: өнөөдөр', 'Updated: today'])} <b class="text-ink tnum">${hhmm(now)}</b></p>
    </div>
    <div class="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">${stats.map(([icn, v, dec, suf, l, c], i) => `<div class="tr-kpi card lift p-5 relative overflow-hidden" style="--i:${i}"><span class="absolute inset-x-0 top-0 h-[3px]" style="background:rgb(${c})"></span><span class="w-10 h-10 rounded-xl grid place-items-center" style="background:rgb(${c} / .1);color:rgb(${c})">${ic(icn, 'w-5 h-5')}</span><p class="mt-4 text-[28px] sm:text-[30px] font-extrabold tnum leading-none tracking-tight"><span data-to="${v}" data-dec="${dec}">0</span><span class="text-[17px] font-bold">${esc(suf)}</span></p><p class="text-[13px] text-muted mt-2 leading-snug">${l}</p></div>`).join('')}</div>
    ${trPanel(tabsDef)}</div>`;
  trTabCounts(sec);
  trReveal(sec);
}
/* Тоо гүйх, мөрүүд дараалан гарах хөдөлгөөн: хэсэг дэлгэцийн доод 20%-аас дээш орж ирэхэд нэг удаа (нүүр, бүтэн хуудас хоёуланд) */
function trReveal(sec) {
  if (sec.classList.contains('tr-in')) { $$('[data-to]', sec).forEach((el) => { el.textContent = (+el.dataset.dec ? (+el.dataset.to).toFixed(+el.dataset.dec).replace('.', EN() ? '.' : ',') : num(+el.dataset.to)); }); return; }
  const go = () => { sec.classList.add('tr-in'); $$('[data-to]', sec).forEach(trCount); };
  if (!('IntersectionObserver' in window)) { go(); return; }
  const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); go(); } }, { rootMargin: '0px 0px -20% 0px' }); io.observe(sec);
}
function setTr(v) {
  if (v === S.tr) return;
  const order = ['res', 'ord', 'tender'], dir = order.indexOf(v) > order.indexOf(S.tr) ? 1 : -1;
  S.tr = v; selectTab('tr', v); swap($('#tr-panel'), trRows(), dir);
  renderPageLinks();
}

