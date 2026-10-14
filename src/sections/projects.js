/* ================= Projects ================= */
const pStatus = (p) => (p.p >= 100 ? 'done' : p.p < 20 ? 'planned' : 'progress');
/* Бодит мега төсөл (ulaanbaatar.mn): ангиллаар шүүнэ; жишээ төсөл: төлвөөр */
const projLive = () => PROJECTS.some((p) => p.live);
function projFiltered() { return PROJECTS.filter((p) => S.projSt === 'all' || (PCAT[S.projSt] ? p.c === S.projSt : pStatus(p) === S.projSt)); }
function pctRing(p, size, stroke, color, fs) { return `<span class="relative grid place-items-center shrink-0">${ring(p, size, stroke, color)}<b class="absolute tnum" style="font-size:${fs}px">${p}%</b></span>`; }
/* Гүйцэтгэл мэдэгдэж байвал цагираг, үгүй бол ангиллын тэмдэг */
function projBadge(p, size, stroke, fs) { const c = PCAT[p.c] || PCAT.transport; return p.p != null ? pctRing(p.p, size, stroke, c.c, fs) : `<span class="grid place-items-center shrink-0 rounded-full" style="width:${size}px;height:${size}px;background:${c.c}14;color:${c.c};box-shadow:inset 0 0 0 ${stroke / 2}px ${c.c}33">${ic(c.i, size > 50 ? 'w-6 h-6' : 'w-5 h-5')}</span>`; }
const mpDate = (d) => { const m = String(d || '').match(/(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[1]}.${m[2]}.${m[3]}` : ''; };
const mpImg = (u, w) => (u ? (typeof mediaImg === 'function' ? mediaImg(u, w) : u) : '');
/* ipiu.mn: үе шатны шошго, төсөв (сая $), хугацаа */
const mpStage = (p) => (p.stage && MEGA_STAGE[p.stage] ? `<span class="mp-stage" style="--sc:${MEGA_STAGE[p.stage][2]}">${esc(L(MEGA_STAGE[p.stage]))}</span>` : '');
const mpUsd = (v) => (v == null ? '' : v >= 1000 ? L([`${(v / 1000).toFixed(2).replace(/\.?0+$/, '').replace('.', ',')} тэрбум $`, `$${(v / 1000).toFixed(2).replace(/\.?0+$/, '')} bn`]) : L([`${String(+v.toFixed(1)).replace('.', ',')} сая $`, `$${+v.toFixed(1)} m`]));
const mpYears = (p) => (p.from && p.due ? `${p.from}–${p.due}` : p.due ? String(p.due) : '');
function projList() {
  const list = projFiltered();
  if (!list.length) return `<li class="p-6 text-center text-muted">${t('noResults')}</li>`;
  return list.map((p) => { const c = PCAT[p.c], z = inDistrict(p.x, p.y), sel = p.id === S.projSel;
    const sub = p.live ? [p.stage && MEGA_STAGE[p.stage] ? L(MEGA_STAGE[p.stage]) : L(c.t), mpYears(p), p.ups && p.ups.length ? `${p.ups.length} ${L(['мэдээ', 'updates'])}` : ''].filter(Boolean).map(esc).join(' · ') : `${esc(L(z.n))}, ${esc(L(c.t))}`;
    return `<li><button type="button" class="w-full text-left p-2.5 rounded-xl flex items-center gap-3 transition-colors ${sel ? 'bg-soft ring-1 ring-line' : 'hover:bg-soft'}" data-act="proj" data-id="${p.id}" aria-pressed="${sel}">${projBadge(p, 44, 4.5, 11)}<span class="min-w-0 flex-1"><b class="block text-[14.5px] leading-snug truncate">${esc(L(p.n))}</b><span class="block text-[12.5px] text-muted truncate">${sub}</span></span>${ic('chevron-right', 'w-4 h-4 text-muted')}</button></li>`; }).join('');
}
function projPopup(id) {
  const p = PROJECTS.find((x) => x.id === id), c = PCAT[p.c], z = inDistrict(p.x, p.y), st = pStatus(p);
  if (p.live) {   // бодит төсөл: гүйцэтгэл (мэдээнд бичигдсэн бол), сүүлийн мэдээ, «Дэлгэрэнгүй»
    const u = (p.ups || [])[0];
    return `<div class="card shadow-2xl p-4 text-ink"><div class="flex items-start gap-3">${projBadge(p, 56, 6, 13)}<div class="min-w-0 flex-1"><p class="text-[12px] font-bold" style="color:${c.c}">${esc(L(c.t))}</p><p class="font-extrabold leading-snug text-[15px]">${esc(L(p.n))}</p><p class="text-[12.5px] text-muted mt-0.5">${(p.ups || []).length} ${L(['мэдээ', 'updates'])}${u ? ' · ' + L(['сүүлд', 'latest']) + ' ' + mpDate(u.d) : ''}</p>${p.ipOwn ? `<p class="mt-1.5 flex flex-wrap items-center gap-1.5">${mpStage(p)}${p.budUsd != null ? `<span class="text-[12px] font-semibold tnum">${esc(mpUsd(p.budUsd))}</span>` : ''}${mpYears(p) ? `<span class="text-[12px] text-muted tnum">· ${mpYears(p)}</span>` : ''}</p>` : ''}</div><button type="button" class="icon-btn !w-8 !h-8 hover:bg-soft -mr-1 -mt-1" data-act="proj-close" aria-label="${esc(t('close'))}">${ic('x', 'w-4 h-4')}</button></div>
      ${u ? `<button type="button" class="mt-3 w-full flex gap-3 items-center text-left rounded-lg bg-soft p-2 hover:bg-line/60 transition-colors" data-act="proj-open" data-id="${p.id}">${u.img ? `<img src="${esc(mpImg(u.img, 240))}" alt="" loading="lazy" class="w-16 h-12 rounded-md object-cover shrink-0">` : ''}<span class="text-[12.5px] font-semibold leading-snug line-clamp-2">${esc(u.t)}</span></button>` : ''}
      <button type="button" class="btn btn-sm btn-ink w-full mt-3" data-act="proj-open" data-id="${p.id}">${L(['Дэлгэрэнгүй', 'Details'])}${ic('arrow-right', 'w-4 h-4')}</button></div>`;
  }
  return `<div class="card shadow-2xl p-4 text-ink"><div class="flex items-start gap-3">${pctRing(p.p, 56, 6, c.c, 13)}<div class="min-w-0 flex-1"><p class="text-[12px] font-bold" style="color:${c.c}">${esc(L(c.t))}</p><p class="font-extrabold leading-snug text-[15px]">${esc(L(p.n))}</p><p class="text-[12.5px] text-muted mt-0.5">${esc(L(z.n))} ${L(['дүүрэг', 'District'])}</p></div><button type="button" class="icon-btn !w-8 !h-8 hover:bg-soft -mr-1 -mt-1" data-act="proj-close" aria-label="${esc(t('close'))}">${ic('x', 'w-4 h-4')}</button></div>
    <div class="mt-3 grid grid-cols-3 gap-2 text-[12px]"><div class="rounded-lg bg-soft p-2"><p class="text-muted">${t('budget')}</p><b class="tnum text-[12.5px]">${bn(p.bud)}</b></div><div class="rounded-lg bg-soft p-2"><p class="text-muted">${t('dueYear')}</p><b class="tnum text-[12.5px]">${esc(p.due)}</b></div><div class="rounded-lg bg-soft p-2"><p class="text-muted">${L(['Төлөв', 'Status'])}</p><b class="text-[12.5px]">${t(st === 'done' ? 'st_done' : st === 'planned' ? 'st_planned' : 'st_progress')}</b></div></div></div>`;
}
function renderProjects() {
  const known = PROJECTS.filter((p) => p.p != null), avg = known.length ? Math.round(known.reduce((a, p) => a + p.p, 0) / known.length) : 0, done = known.filter((p) => p.p >= 100).length;
  const live = projLive(), nUps = PROJECTS.reduce((a, p) => a + (p.ups || []).length, 0), lastUp = PROJECTS.reduce((m, p) => (p.ups && p.ups[0] && p.ups[0].d > m ? p.ups[0].d : m), '');
  const stat = (v, l) => `<div><p class="text-[30px] font-extrabold tnum leading-none tracking-tight">${v}</p><p class="text-[13px] text-muted mt-1.5">${l}</p></div>`;
  $('#projects').innerHTML = `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
    <div class="pg-dup flex flex-col lg:flex-row lg:items-end justify-between gap-6"><div class="sec-ttl"><h2 class="h-section">${t('projTitle')}</h2><p class="mt-2 text-muted max-w-[62ch]">${t('projDesc')}</p></div>
    <div class="flex flex-wrap gap-x-9 gap-y-3">${stat(PROJECTS.length, L(['мега төсөл', 'flagship projects']))}${live ? (PROJECTS.some((p) => p.budUsd != null) ? stat(mpUsd(PROJECTS.reduce((a, p) => a + (p.ipOwn && p.budUsd ? p.budUsd : 0), 0)), L(['нийт төсөв (ipiu.mn)', 'total budget (ipiu.mn)'])) : '') + stat(nUps, L(['явцын мэдээ', 'progress updates'])) : stat(avg + '%', t('avgProgress')) + stat(done, L(['ашиглалтад орсон', 'completed']))}</div></div>
    ${live && S.route === 'page' && S.page === 'projects' ? `<div class="mt-8 flex flex-wrap items-end justify-between gap-3"><h3 class="text-[20px] font-extrabold tracking-tight">${L(['Төслүүд', 'Projects'])}</h3><span class="text-[13px] text-muted" id="mpc-count">${projFiltered().length} ${L(['төсөл', 'projects'])}</span></div>
      <div class="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">${chips('proj-st', [['all', `${t('f_all')} · ${PROJECTS.length}`]].concat(Object.keys(PCAT).filter((k) => PROJECTS.some((p) => p.c === k)).map((k) => [k, `${L(PCAT[k].t)} · ${PROJECTS.filter((p) => p.c === k).length}`, PCAT[k].c])), S.projSt)}</div>
      <div id="mp-cards" class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">${projCards()}</div>
      <div class="mt-12 flex flex-wrap items-end justify-between gap-3"><h3 class="text-[20px] font-extrabold tracking-tight">${L(['Газрын зураг дээр', 'On the map'])}</h3></div>` : ''}
    <div class="${live && S.route === 'page' && S.page === 'projects' ? 'mt-4' : 'mt-8'} grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div class="lg:col-span-8 relative min-w-0"><div id="proj-map" class="rounded-[8px] overflow-hidden border border-line h-[440px] sm:h-[520px] lg:h-[600px]"></div>
        <div class="absolute left-3 top-3 card !rounded-xl px-3 py-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px] font-semibold max-w-[calc(100%-80px)] shadow-lg pointer-events-none z-[7]">${Object.values(PCAT).map((c) => `<span class="inline-flex items-center gap-1.5"><i class="w-2.5 h-2.5 rounded-full" style="background:${c.c}"></i>${esc(L(c.t))}</span>`).join('')}</div></div>
      <div class="lg:col-span-4 min-w-0 card flex flex-col lg:h-[600px] min-h-0 overflow-hidden"><div class="p-3 border-b border-line flex gap-2 overflow-x-auto no-scrollbar" id="proj-chips">${chips('proj-st', live ? [['all', `${t('f_all')} · ${PROJECTS.length}`]].concat(Object.keys(PCAT).filter((k) => PROJECTS.some((p) => p.c === k)).map((k) => [k, `${L(PCAT[k].t)} · ${PROJECTS.filter((p) => p.c === k).length}`, PCAT[k].c])) : [['all', t('f_all')], ['progress', t('st_progress')], ['done', t('st_done')], ['planned', t('st_planned')]], S.projSt)}</div><ul id="proj-list" class="relative flex-1 overflow-auto thin-scroll p-2 max-h-[420px] lg:max-h-none">${projList()}</ul></div>
    </div></div>`;
  if (MAPS.proj) MAPS.proj.destroy();
  MAPS.proj = new MapView($('#proj-map'), { points: () => projFiltered().map((p) => ({ id: p.id, x: p.x, y: p.y, c: PCAT[p.c].c, i: PCAT[p.c].i, tag: p.p != null ? p.p + '%' : '', v: p.p || 0, label: L(p.n) })), sel: S.projSel, onSelect: (id) => selectProject(id, false), popup: projPopup });
}
/* «24 мега төсөл» хуудасны карт: мэдээний карттай ижил хэлбэр (сүүлийн зураг, ангилал, нэр, сүүлийн мэдээ, гүйцэтгэл) */
function projCards() {
  const list = projFiltered();
  if (!list.length) return `<p class="sm:col-span-2 lg:col-span-4 card p-10 text-center text-muted">${t('noResults')}</p>`;
  return list.map((p, k) => {
    const c = PCAT[p.c] || PCAT.transport, u = (p.ups || [])[0], img = (p.ups || []).find((x) => x.img);
    return `<button type="button" class="mpc group lift card text-left overflow-hidden flex flex-col zoom-on" style="--i:${Math.min(k, 12)}" data-act="proj-open" data-id="${p.id}">
      <div class="scene zoom aspect-[16/10] relative">${p.ipOwn && p.ipiu.img ? `<img src="${esc(p.ipiu.img)}" alt="" loading="lazy" decoding="async">` : img ? `<img src="${esc(mpImg(img.img, 1280))}" alt="" loading="lazy" decoding="async">` : Scene('build:day:' + (p.x % 97))}
        ${p.p != null ? `<span class="mpc-pct tnum" style="--mc:${c.c}">${p.p}%</span>` : ''}</div>
      <div class="p-5 flex flex-col flex-1"><span class="flex flex-wrap items-center gap-x-3 gap-y-1.5"><span class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted"><i class="w-2 h-2 rounded-full" style="background:${c.c}"></i>${esc(L(c.t))}</span>${mpStage(p)}</span>
        <span class="mt-2.5 text-[17px] font-bold leading-snug group-hover:text-ubred transition-colors">${esc(L(p.n))}</span>
        ${p.ipOwn && L(p.ipiu.tagline) ? `<span class="mt-2 text-[13.5px] text-muted leading-snug line-clamp-2">${esc(L(p.ipiu.tagline))}</span>` : u ? `<span class="mt-2 text-[13.5px] text-muted leading-snug line-clamp-2">${esc(u.t)}</span>` : ''}
        ${p.p != null && p.ipOwn ? `<span class="mpc-bar" style="--mc:${c.c}"><i style="width:${Math.min(100, p.p)}%"></i></span>` : ''}
        <span class="mt-auto pt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted">${p.budUsd != null ? `<span class="inline-flex items-center gap-1 tnum font-semibold text-ink">${ic('banknote', 'w-4 h-4 text-muted')}${esc(mpUsd(p.budUsd))}</span>` : ''}${mpYears(p) ? `<span class="inline-flex items-center gap-1 tnum">${ic('calendar-range', 'w-4 h-4')}${mpYears(p)}</span>` : u ? `<span class="inline-flex items-center gap-1 tnum">${ic('calendar', 'w-4 h-4')}${mpDate(u.d)}</span>` : ''}<span class="inline-flex items-center gap-1 tnum">${ic('newspaper', 'w-4 h-4')}${(p.ups || []).length}</span></span></div></button>`;
  }).join('');
}
/* ipiu.mn-ийн албан ёсны мэдээлэл: тоон үзүүлэлт, ажлын хэсгийн явц, үзүүлэлт, он дараалал */
function mpOfficial(p, ip, c) {
  const own = p.ipOwn, src = `https://www.ipiu.mn/projects/?slug=${encodeURIComponent(ip.slug)}`;
  const kpi = own ? [[L(['Нийт гүйцэтгэл', 'Overall progress']), ip.prog != null ? ip.prog + '%' : '—'], [L(['Төсөв', 'Budget']), ip.budUsd != null ? mpUsd(ip.budUsd) : '—'], [L(['Хугацаа', 'Timeline']), mpYears(p) || '—'], [L(['Үе шат', 'Stage']), p.stage && MEGA_STAGE[p.stage] ? L(MEGA_STAGE[p.stage]) : '—']] : [];
  return `<div class="mp-off">
    <div class="flex flex-wrap items-center justify-between gap-2"><p class="mp-h">${own ? L(['Албан ёсны мэдээлэл', 'Official data']) : L(['Холбогдох төсөл', 'Related project']) + ': ' + esc(L(ip.short))}</p><a href="${esc(src)}" target="_blank" rel="noopener" class="text-[12.5px] font-semibold text-muted hover:text-ink inline-flex items-center gap-1">ipiu.mn${ic('arrow-up-right', 'w-3.5 h-3.5')}</a></div>
    ${L(ip.desc) ? `<p class="mt-2 text-[14.5px] leading-relaxed text-ink/80">${esc(L(ip.desc))}</p>` : ''}
    ${kpi.length ? `<div class="mp-kpis">${kpi.map(([l, v], i) => `<div style="--i:${i}"><span>${esc(l)}</span><b class="tnum">${esc(v)}</b></div>`).join('')}</div>` : ''}
    ${own && ip.prog != null ? `<span class="mp-bar"><i style="width:${Math.min(100, ip.prog)}%"></i></span>` : ''}
    ${ip.parts.length ? `<div class="mp-parts">${ip.parts.map((x) => `<div><span class="flex justify-between gap-3 text-[13px]"><span class="text-muted">${esc(L(x.l))}</span><b class="tnum">${+x.v.toFixed(1)}%</b></span><span class="mp-pbar"><i style="width:${Math.min(100, x.v)}%"></i></span></div>`).join('')}</div>` : ''}
    ${ip.metrics.length ? `<dl class="mp-metrics">${ip.metrics.map((m) => `<div><dt>${esc(L(m.l))}</dt><dd>${esc(m.v)}</dd></div>`).join('')}</dl>` : ''}
    ${ip.timeline.length ? `<p class="mp-h mt-6">${L(['Он дараалал', 'Timeline'])}</p><ol class="mp-tl">${ip.timeline.map((x) => `<li><span class="mp-tl-d tnum">${esc(x.d)}</span><b>${esc(L(x.t))}</b>${L(x.n) ? `<p>${esc(L(x.n))}</p>` : ''}</li>`).join('')}</ol>` : ''}
  </div>`;
}
/* Мега төслийн дэлгэрэнгүй: ulaanbaatar.mn-ийн явцын мэдээ бүгд (огноо, зураг, товч текст), гүйцэтгэл эх өгүүлбэртэйгээ */
function openProject(id) {
  const p = PROJECTS.find((x) => x.id === id); if (!p) return;
  const c = PCAT[p.c] || PCAT.transport, ups = p.ups || [], ip = p.ipiu, heroNews = ups.find((u) => u.img), hero = p.ipOwn && ip.img ? { img: ip.img, cdn: 1 } : heroNews;
  let open = ups.length ? ups[0].id : null;
  const item = (u, k) => `<li class="mp-u ${u.id === open ? 'is-open' : ''}" style="--i:${Math.min(k, 10)}">
      <button type="button" class="mp-u-h" data-act="mp-up" data-id="${esc(u.id)}" aria-expanded="${u.id === open}">
        <span class="mp-dot" aria-hidden="true"></span>${u.img ? `<img src="${esc(mpImg(u.img, 240))}" alt="" loading="lazy" class="mp-u-th">` : ''}
        <span class="min-w-0 flex-1"><span class="block text-[12px] text-muted tnum">${mpDate(u.d)}</span><b class="block mt-0.5 text-[14.5px] leading-snug">${esc(u.t)}</b></span>${ic('chevron-down', 'mp-chev w-4 h-4 text-muted shrink-0')}</button>
      ${u.id === open ? `<div class="mp-u-b">${u.img ? `<img src="${esc(mpImg(u.img, 1280))}" alt="${esc(u.t)}" loading="lazy" class="mp-u-img">` : ''}${(u.b || []).map((x) => `<p>${esc(x)}</p>`).join('')}
        <a href="https://ulaanbaatar.mn/mega-project/${encodeURIComponent(u.id)}" target="_blank" rel="noopener" class="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-ubblue hover:underline">${L(['ulaanbaatar.mn дээр бүтнээр унших', 'Read in full on ulaanbaatar.mn'])}${ic('arrow-up-right', 'w-4 h-4')}</a></div>` : ''}</li>`;
  const render = () => `<div class="mp" style="--mc:${c.c}">
    <div class="mp-hero">${hero ? `<img src="${esc(hero.cdn ? hero.img : mpImg(hero.img, 1280))}" alt="" class="mp-hero-img">` : `<div class="scene !absolute inset-0">${Scene('build:day:' + (p.x % 97))}</div>`}<span class="mp-hero-shade"></span>
      <button type="button" class="mp-x" data-act="modal-close" aria-label="${esc(t('close'))}">${ic('x', 'w-5 h-5')}</button>
      <div class="mp-hero-in"><span class="mp-chip">${ic(c.i, 'w-4 h-4')}${esc(L(c.t))}</span><h2 class="mp-t">${esc(L(p.n))}</h2>
        <p class="mp-meta">${p.ipOwn && mpYears(p) ? `<span>${ic('calendar-range', 'w-4 h-4')}${mpYears(p)}</span>` : ''}<span>${ic('newspaper', 'w-4 h-4')}${ups.length} ${L(['явцын мэдээ', 'progress updates'])}</span>${ups[0] ? `<span>${ic('calendar', 'w-4 h-4')}${L(['Сүүлд', 'Latest'])}: ${mpDate(ups[0].d)}</span>` : ''}</p></div></div>
    ${ip ? mpOfficial(p, ip, c) : p.pct ? `<div class="mp-pct"><div class="flex items-center justify-between gap-3"><b class="text-[14px]">${L(['Гүйцэтгэл (сүүлийн мэдээгээр)', 'Progress (latest report)'])}</b><b class="text-[22px] tnum" style="color:${c.c}">${p.pct.v}%</b></div>
      <span class="mp-bar"><i style="width:${p.pct.v}%"></i></span><p class="mt-2 text-[13px] text-muted leading-snug">«${esc(p.pct.src)}» · ${mpDate(p.pct.d)}</p></div>` : ''}
    <div class="mp-list-w"><p class="mp-h">${L(['Явцын мэдээ', 'Progress updates'])}</p><ol class="mp-list">${ups.map(item).join('')}</ol>
      <p class="mt-4 text-[12.5px] text-muted">${L(['Эх сурвалж', 'Source'])}: <a href="https://ulaanbaatar.mn/mega-project" target="_blank" rel="noopener" class="underline underline-offset-2 hover:text-ink">ulaanbaatar.mn/mega-project</a></p></div></div>`;
  openModal({ size: 'lg', label: L(p.n), render });
  MS = { mpUp: (uid) => { open = open === uid ? null : uid; paintModal(true); const el = MODAL && $(`.mp-u.is-open`, MODAL.sheet); if (el) el.scrollIntoView({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' }); } };
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
  const cards = $('#mp-cards'); if (cards) { swap(cards, projCards(), 0); const n = $('#mpc-count'); if (n) n.textContent = `${projFiltered().length} ${L(['төсөл', 'projects'])}`; }
  if (MAPS.proj) { MAPS.proj.sel = S.projSel; MAPS.proj.recluster(true); }
}

