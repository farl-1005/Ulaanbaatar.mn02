/* ================= Ticker ================= */
/* Яаралтай мэдээллийн капсул: мэдээлэл нэг нэгээр дээш гулсан солигдож, доод зураас дараагийнх хүртэлх хугацааг харуулна.
   Хулганаар заах / фокуслах / «түр зогсоох» үед зогсоно. Хөдөлгөөн багасгах ба a11y горимд автоматаар солигдохгүй. */
const TK = { i: 0, paused: false };
function renderTicker() {
  const el = $('#ticker');
  if (!S.tickerOn || SET.tickerOn === false || !ALERTS.length) { el.innerHTML = ''; return; }
  const n = ALERTS.length, auto = n > 1 && !reduced && !S.a11y;
  if (TK.i >= n) TK.i = 0;
  const items = ALERTS.map((a, k) => `<button type="button" data-act="alert" data-id="${a.id}" class="tk-item ${k === TK.i ? 'is-on' : ''}" ${k === TK.i ? '' : 'tabindex="-1" aria-hidden="true"'}><span class="tk-ic">${ic(a.i, 'w-4 h-4')}</span><b class="shrink-0">${esc(L(a.k))}</b><span class="tk-txt">${esc(Lf(a.t))}</span><span class="tk-more">${ic('arrow-up-right', 'w-3.5 h-3.5')}</span></button>`).join('');
  const b = (k, icon, label, cls = 'grid') => `<button type="button" class="tk-b ${cls}" data-tk="${k}" aria-label="${esc(label)}" title="${esc(label)}">${ic(icon, 'w-4 h-4')}</button>`;
  el.innerHTML = `<div class="max-w-site mx-auto px-3 sm:px-6 lg:px-8 pt-2.5"><div class="tk ${TK.paused ? 'is-paused' : ''}" role="region" aria-roledescription="${esc(L(['ээлжилсэн мэдээлэл', 'carousel']))}" aria-label="${esc(t('urgent'))}">
    <div class="tk-tag"><span class="tk-stripes" aria-hidden="true"></span>${animIcon('siren', 'w-[18px] h-[18px] relative')}<span class="relative hidden sm:inline">${t('urgent')}</span></div>
    <div class="tk-stage" aria-live="off">${items}</div>
    <div class="tk-ctl">${n > 1 ? `${b('prev', 'chevron-left', L(['Өмнөх', 'Previous']), 'hidden sm:grid')}<span class="tk-count" data-tk-count>${TK.i + 1}<i>/</i>${n}</span>${b('next', 'chevron-right', L(['Дараах', 'Next']))}${auto ? `<button type="button" class="tk-b hidden sm:grid" data-tk="pause" aria-pressed="${TK.paused}" aria-label="${esc(L(['Түр зогсоох', 'Pause']))}" title="${esc(L(['Түр зогсоох', 'Pause']))}">${ic(TK.paused ? 'play' : 'pause', 'w-3.5 h-3.5')}</button>` : ''}<span class="tk-sep" aria-hidden="true"></span>` : ''}<button type="button" data-act="ticker-close" class="tk-b grid" aria-label="${esc(t('dismiss'))}" title="${esc(t('dismiss'))}">${ic('x', 'w-4 h-4')}</button></div>
    ${auto ? '<span class="tk-prog" aria-hidden="true"><i></i></span>' : ''}</div></div>`;
  if (!el.dataset.bound) {
    el.dataset.bound = '1';
    el.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tk]'); if (!btn) return;
      const k = btn.dataset.tk;
      if (k === 'next') tkGo(1); else if (k === 'prev') tkGo(-1);
      else if (k === 'pause') { TK.paused = !TK.paused; $('#ticker .tk').classList.toggle('is-paused', TK.paused); btn.setAttribute('aria-pressed', String(TK.paused)); btn.innerHTML = ic(TK.paused ? 'play' : 'pause', 'w-3.5 h-3.5'); }
    });
    el.addEventListener('animationend', (e) => { if (e.target.parentElement && e.target.parentElement.classList.contains('tk-prog') && !reduced && !S.a11y) tkGo(1); });
  }
}
function tkGo(d) {
  const its = $$('#ticker .tk-item'), n = its.length; if (n < 2) return;
  const cur = its[TK.i]; TK.i = (TK.i + d + n) % n; const nx = its[TK.i];
  cur.classList.remove('is-on'); cur.classList.add(d > 0 ? 'is-out' : 'is-out-down'); cur.setAttribute('aria-hidden', 'true'); cur.tabIndex = -1;
  nx.classList.remove('is-out', 'is-out-down');
  nx.style.transition = 'none'; nx.style.transform = `translateY(${d > 0 ? 100 : -100}%)`; void nx.offsetWidth;   // гарах чиглэлээс нь эхлүүлнэ
  nx.style.transition = ''; nx.style.transform = ''; nx.classList.add('is-on'); nx.removeAttribute('aria-hidden'); nx.removeAttribute('tabindex');
  setTimeout(() => { cur.style.transition = 'none'; cur.classList.remove('is-out', 'is-out-down'); void cur.offsetWidth; cur.style.transition = ''; }, 650);
  const c = $('#ticker [data-tk-count]'); if (c) c.innerHTML = `${TK.i + 1}<i>/</i>${n}`;
  const bar = $('#ticker .tk-prog i'); if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
}

