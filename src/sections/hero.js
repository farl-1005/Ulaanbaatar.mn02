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
      <button type="button" class="block w-full text-left zoom-on" data-act="news" data-id="${m.id}" aria-label="${esc(L(m.t))}"><div class="scene zoom hero-img aspect-[16/9] rounded-[8px]">${Scene(m.img)}<span class="absolute left-4 top-4 inline-flex items-center gap-2 h-8 px-3 rounded-full bg-white/90 text-[#0B1D45] text-[13px] font-bold"><i class="w-2 h-2 rounded-full" style="background:${rub.c}"></i>${esc(L(rub.t))}</span></div></button>
      <div class="hero-fade" style="--d:.5s">
        <div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted"><span class="inline-flex items-center gap-1.5">${ic('clock-3', 'w-4 h-4')}${ago(m.ago)}</span><span class="inline-flex items-center gap-1.5">${ic('book-open', 'w-4 h-4')}${t('minRead', { n: m.mins || Math.max(1, Math.ceil((String((m.l || [''])[0]).length + (m.b || []).reduce((a, p) => a + String(p[0] || '').length, 0)) / 900)) })}</span><span class="inline-flex items-center gap-1.5 tnum">${ic('eye', 'w-4 h-4')}${num(m.views)}</span></div>
        <h1 class="mt-3 text-[27px] sm:text-[34px] xl:text-[40px] leading-[1.08] font-extrabold tracking-[-0.028em]"><button type="button" class="text-left hover:text-ubred transition-colors" data-act="news" data-id="${m.id}">${esc(L(m.t))}</button></h1>
        <p class="mt-4 text-[16.5px] leading-relaxed text-muted max-w-[62ch]">${esc(Lf(m.l))}</p>
        <div class="mt-6 flex flex-wrap gap-3"><button type="button" class="btn btn-ink" data-act="news" data-id="${m.id}">${ic('book-open', 'w-[18px] h-[18px]')}${t('read')}</button><button type="button" class="btn btn-ghost" data-act="vote" data-tab="idea">${ic('message-square-plus', 'w-[18px] h-[18px]')}${t('cta_vote')}</button></div>
      </div>
      <div class="hero-fade mt-8 pt-6 border-t border-line grid grid-cols-1 sm:grid-cols-3 gap-4" style="--d:.7s">${rel.map((r) => `<button type="button" class="group lift card text-left overflow-hidden flex sm:flex-col zoom-on" data-act="news" data-id="${r.id}"><div class="scene zoom w-28 sm:w-full shrink-0 aspect-[4/3] sm:aspect-[16/10]">${Scene(r.img)}</div><div class="p-3 sm:p-4 flex flex-col flex-1 min-w-0">${rubTag(r)}<span class="mt-1.5 text-[14.5px] font-bold leading-snug line-clamp-3 group-hover:text-ubred transition-colors">${esc(L(r.t))}</span><span class="mt-auto pt-3 flex items-center gap-3 text-[12px] text-muted">${ago(r.ago)}<span class="inline-flex items-center gap-1 tnum">${ic('eye', 'w-3.5 h-3.5')}${num(r.views || 0)}</span></span></div></button>`).join('')}</div>
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
  <div class="panel !rounded-[8px] overflow-hidden"><div class="grid grid-flow-col auto-cols-[minmax(152px,1fr)] overflow-x-auto no-scrollbar snap-x">${items.map((s) => { const [dc, ml] = mode(s.m); return `<button type="button" class="group snap-start relative flex flex-col items-start gap-3 p-4 sm:p-5 min-h-[150px] text-left border-r border-line last:border-r-0 hover:bg-soft transition-colors" data-act="svc" data-id="${s.id}"><span class="w-11 h-11 rounded-[8px] grid place-items-center bg-ubred/10 text-ubred transition-all duration-300 group-hover:bg-ubred group-hover:text-white group-hover:-rotate-6">${ic(s.i, 'w-[22px] h-[22px]')}</span><span class="font-bold text-[14.5px] leading-snug pr-3">${esc(L(s.t))}</span><span class="mt-auto inline-flex items-center gap-1.5 text-[12.5px] text-muted"><i class="w-1.5 h-1.5 rounded-full ${dc}"></i>${ml}</span>${ic('arrow-up-right', 'w-4 h-4 absolute right-3.5 top-4 text-muted opacity-0 -translate-x-1 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0')}</button>`; }).join('')}</div></div></div>`;
}

