/* ================= Bottom bar & mobile menu ================= */
function renderBottomBar() {
  const it = (bb, icon, label, act) => `<button type="button" class="bb-item" data-bb="${bb}" ${act} aria-current="false">${ic(icon, 'w-[22px] h-[22px]')}<span>${esc(label)}</span></button>`;
  $('#bbar').innerHTML = `<nav class="bbar lg:hidden" aria-label="Mobile"><div class="grid grid-cols-5 h-[64px] max-w-lg mx-auto">
    ${it('home', 'house', t('bb_home'), 'data-act="go" data-sec="hero"')}
    ${it('services', 'layout-grid', t('bb_services'), 'data-act="go" data-sec="hub" data-hub="services"')}
    <button type="button" class="bb-item !text-ink" data-act="report" aria-label="${esc(t('cta_report'))}"><span class="-mt-7 w-[54px] h-[54px] rounded-full bg-ubred text-white grid place-items-center shadow-[0_12px_24px_-10px_rgb(var(--c-red))] ring-4 ring-page">${animIcon('siren', 'w-6 h-6')}</span><span>${t('bb_report')}</span></button>
    ${it('news', 'newspaper', t('bb_news'), 'data-act="go" data-sec="hub" data-hub="news"')}
    ${it('my', 'circle-user-round', t('bb_my'), 'data-act="my"')}
  </div></nav>`;
}
function openMenu() {
  const wrap = document.createElement('div');
  wrap.className = 'ovl'; wrap.id = 'mmenu'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true');
  wrap.innerHTML = `<div class="drawer"><div class="flex items-center justify-between px-5 h-16 border-b border-line"><span class="flex items-center gap-3">${logoMark('w-9 h-9')}<b class="text-[17px]">${t('brand')}</b></span><button type="button" class="icon-btn hover:bg-soft" data-act="menu-close" aria-label="${esc(t('close'))}">${ic('x')}</button></div>
    <div class="p-5 space-y-5"><button type="button" data-act="search" class="w-full h-12 rounded-xl border border-line bg-soft flex items-center gap-3 px-4 text-muted">${ic('search')}${t('searchPh')}</button>
    <div class="grid grid-cols-1 gap-2"><button type="button" class="cta-pill cta-red !h-12 justify-center" data-act="report"><span class="cta-pill-ic">${animIcon('siren', 'w-5 h-5')}</span>${t('cta_report')}</button><button type="button" class="cta-pill cta-blue !h-12 justify-center" data-act="vote"><span class="cta-pill-ic">${animIcon('vote', 'w-5 h-5')}</span>${t('cta_vote')}</button></div>${CMS.canEdit ? `<a class="btn btn-ghost w-full" href="/admin/">${ic('pencil-line', 'w-[18px] h-[18px]')}${L(['Сайтыг засах', 'Edit site'])}</a>` : ''}
    <div class="divide-y divide-line border-y border-line">${MENU.map((m, i) => `<div><button type="button" class="w-full h-14 flex items-center justify-between font-bold text-[16px]" data-act="acc" data-i="${i}" aria-expanded="false">${menuLabel(m)}${ic('chevron-down', 'w-5 h-5 transition-transform')}</button><div class="hidden pb-3 space-y-1" data-acc="${i}">${pageOf({ sec: m.sec }) ? `<button type="button" class="w-full flex items-center justify-between gap-3 p-2.5 rounded-xl bg-soft font-bold text-[14.5px] text-left" data-act="page" data-v="${pageOf({ sec: m.sec })}">${L(['Бүгдийг үзэх', 'See all'])}${ic('arrow-right', 'w-[18px] h-[18px] text-ubred')}</button>` : ''}${m.items.map((it) => `<button type="button" class="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-soft text-left" ${itemAct(it)}><span class="w-9 h-9 rounded-lg bg-soft grid place-items-center text-ubred">${ic(it.i, 'w-[18px] h-[18px]')}</span><span class="text-[14.5px] font-semibold">${esc(L(it.t))}</span></button>`).join('')}</div></div>`).join('')}</div>
    <div class="flex items-center justify-between gap-2"><div class="flex items-center gap-2">${langToggle(false)}${themeBtn(false)}${a11yBtn()}</div>${S.user ? `<button type="button" class="btn btn-sm btn-ghost" data-act="my">${t('myCorner')}</button>` : `<button type="button" class="btn btn-sm btn-ink" data-act="login">${ic('fingerprint', 'w-4 h-4')}${t('login')}</button>`}</div></div></div>`;
  document.body.appendChild(wrap);
  document.body.style.overflow = 'hidden';
  wrap.addEventListener('mousedown', (e) => { if (e.target === wrap) closeMenu(); });
  requestAnimationFrame(() => wrap.classList.add('open'));
}
function closeMenu() { const m = $('#mmenu'); if (!m) return; m.classList.remove('open'); if (!MODAL) document.body.style.overflow = ''; setTimeout(() => m.remove(), 380); }

