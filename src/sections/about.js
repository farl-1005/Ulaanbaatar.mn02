/* ================= About ================= */
/* Харьяа байгууллага: admin-аас лого оруулсан бол лого (цагаан дэвсгэр дээр), үгүй бол тэмдэг */
function orgMark(o, cls = 'w-11 h-11') {
  const src = mediaSrc(o.logo) || (/^(assets\/news\/org-[\w-]+\.webp|https:\/\/ulaanbaatar\.mn\/files\/[^"'<>\s]+)$/.test(o.logo || '') ? o.logo : '');
  return src ? `<span class="org-logo org-logo-fit"><img src="${src}" alt="" loading="lazy" decoding="async"></span>` : `<span class="${cls} rounded-xl bg-soft grid place-items-center text-ubred shrink-0">${ic(o.i || 'building-2', 'w-5 h-5')}</span>`;
}
function orgTile(o) {
  const inner = `${orgMark(o)}<span class="text-[14px] font-semibold leading-snug line-clamp-2">${esc(L(o.t))}</span>`;
  return /^https?:\/\//.test(o.url || '') ? `<a href="${esc(o.url)}" target="_blank" rel="noopener" class="org-tile group">${inner}${ic('arrow-up-right', 'org-go w-4 h-4')}</a>` : `<div class="org-tile">${inner}</div>`;
}
function renderAbout() {
  const facts = [[t('founded'), '1639'], [t('area'), EN() ? '4,704 km²' : '4 704 км²'], [t('admin'), t('adminV')], [t('elevation'), EN() ? '1,350 m' : '1 350 м']];
  $('#about').innerHTML = `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24"><div class="border-t border-line pt-10 lg:pt-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
    <div class="lg:col-span-5"><h2 class="h-section">${t('aboutTitle')}</h2><p class="mt-3 text-muted leading-relaxed max-w-[52ch]">${t('aboutDesc')}</p>
      <div class="mt-7 grid grid-cols-2 gap-3">${facts.map(([l, v]) => `<div class="card p-4"><p class="text-[13px] text-muted">${l}</p><p class="mt-1 text-[20px] font-extrabold tnum leading-tight">${v}</p></div>`).join('')}</div></div>
    <div class="lg:col-span-7 rounded-[8px]" data-card="leadership"><h3 class="text-[19px] font-extrabold">${t('leadership')}</h3><ol class="mt-5">${STRUCT.map((s, i) => `<li class="relative flex gap-4 ${i < STRUCT.length - 1 ? 'pb-6' : ''}">${i < STRUCT.length - 1 ? '<span class="absolute left-[21px] top-12 bottom-1 w-px bg-line"></span>' : ''}<span class="relative w-11 h-11 rounded-2xl ${i === 2 ? 'bg-ubred text-white' : 'bg-card border border-line text-ubred'} grid place-items-center shrink-0">${ic(s.i, 'w-5 h-5')}</span><div class="pt-1"><b class="block text-[15.5px] leading-snug">${esc(L(s.t))}</b><span class="block text-[13.5px] text-muted mt-0.5">${esc(L(s.d))}</span></div></li>`).join('')}</ol></div></div>
    <div class="mt-12 rounded-[8px]" data-card="adminhist"><h3 class="text-[19px] font-extrabold">${t('adminHist')}</h3><p class="mt-1 text-[13px] text-muted">${t('adminHistD')}</p><ol class="mt-6 flex overflow-x-auto no-scrollbar snap-x pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">${ADMIN_NAMES.map(([y, mn, en], i) => { const last = i === ADMIN_NAMES.length - 1; return `<li class="snap-start shrink-0 w-[172px] sm:w-[188px] relative pr-5">${last ? '' : '<span class="absolute left-2 right-0 top-[7px] h-px bg-line"></span>'}<span class="relative block w-3.5 h-3.5 rounded-full ${last ? 'bg-ubred' : 'bg-card border-2 border-ubred'}"></span><b class="block mt-3 text-[21px] font-extrabold tnum tracking-tight">${y}</b><span class="block mt-1 text-[13.5px] leading-snug ${last ? 'text-ink font-semibold' : 'text-muted'}">${esc(EN() ? en : mn)}</span></li>`; }).join('')}</ol></div>
    <div class="mt-12 rounded-[8px]" data-card="orgs"><div class="flex flex-wrap items-end justify-between gap-3"><h3 class="text-[19px] font-extrabold">${t('orgs')}</h3>${ORG_CATS.length ? `<a href="https://ulaanbaatar.mn/government" target="_blank" rel="noopener" class="text-[13px] text-muted hover:text-ink inline-flex items-center gap-1">${L(['Эх сурвалж: ulaanbaatar.mn', 'Source: ulaanbaatar.mn'])}${ic('arrow-up-right', 'w-3.5 h-3.5')}</a>` : ''}</div>
      ${ORG_CATS.length ? `<div class="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 lg:mx-0 lg:px-0" id="org-chips">${chips('org-cat', [['all', `${t('f_all')} · ${ORGS.length}`]].concat(ORG_CATS.map((c) => [c.id, `${L(c.t)} · ${ORGS.filter((o) => o.cat === c.id).length}`])), S.orgCat)}</div>` : ''}
      <div id="org-grid" class="mt-5">${orgGrid()}</div></div></div>`;
}
/* Харьяа байгууллагууд: ангиллаар шүүнэ; «Бүгд» үед эхний 12-ыг харуулж «Бүгдийг үзэх»-ээр дэлгэнэ */
function orgGrid() {
  const list = S.orgCat === 'all' ? ORGS : ORGS.filter((o) => o.cat === S.orgCat), cut = S.orgCat === 'all' && !S.orgAll && list.length > 12;
  return `<ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">${(cut ? list.slice(0, 12) : list).map((o, k) => `<li class="org-li" style="--i:${k % 12}">${orgTile(o)}</li>`).join('')}</ul>
    ${cut ? `<div class="mt-4 text-center"><button type="button" class="btn btn-ghost" data-act="org-all">${L(['Бүгдийг үзэх', 'Show all'])} (${list.length})${ic('chevron-down', 'w-[18px] h-[18px]')}</button></div>` : ''}`;
}
function setOrgCat(v) {
  S.orgCat = v; S.orgAll = false;
  $$('[data-act="org-cat"]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === v)));
  const g = $('#org-grid'); if (g) swap(g, orgGrid(), 0);
}

