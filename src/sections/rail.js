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

