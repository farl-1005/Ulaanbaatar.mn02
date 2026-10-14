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
  if (onHome()) {
    $('#situations').innerHTML = homeWrap(homeHead(t('sitTitle'), t('sitDesc'), 'data-act="go" data-sec="situations"')
      + `<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">${SITS.map((s) => `<button type="button" class="lift card p-4 text-left flex flex-col gap-3 h-full" data-act="go" data-sec="situations" data-sit="${esc(s.id)}"><span class="w-11 h-11 rounded-xl bg-ubred/10 text-ubred grid place-items-center">${ic(s.i, 'w-[22px] h-[22px]')}</span><b class="text-[15px] leading-snug">${esc(L(s.t))}</b><span class="mt-auto text-[12.5px] text-muted">${t('stepsOnline', { n: s.steps.length, o: s.steps.filter((x) => x.m === 'on').length })}</span></button>`).join('')}</div>`, true);
    return;
  }
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
  S.sit = id; if (!$('#sit-list')) return;   // нүүрний товч хувилбарт жагсаалт байхгүй
  $('#sit-list').innerHTML = sitList();
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
  const cols = ['#D81E34', '#145095', '#FFC524', '#10A36A'];
  for (let k = 0; k < 40; k++) { const c = document.createElement('i'); c.className = 'confetti'; c.style.left = 8 + Math.random() * 84 + '%'; c.style.background = cols[k % 4]; c.style.setProperty('--dx', Math.random() * 180 - 90 + 'px'); c.style.setProperty('--rot', Math.random() * 720 - 360 + 'deg'); c.style.animationDelay = Math.random() * 0.3 + 's'; host.appendChild(c); setTimeout(() => c.remove(), 2200); }
}

