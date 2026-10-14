/* ================= Дээш буцах товч =================
   Доош гүйлгэхэд AI туслахын товчны дээр гарч ирнэ. Тойрог нь хуудсыг хэр уншсаныг харуулна;
   дарахад сум «хөөрч», хуудас зөөлөн дээш гулсана (хэрэглэгч хулгана/хуруугаар оролцвол шууд зогсоно). */
const TT = { el: null, raf: 0, run: null };
function toTopHTML() {
  const arrow = (c) => `<svg class="ta ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>`;
  return `<svg class="totop-ring" viewBox="0 0 56 56" aria-hidden="true"><defs><linearGradient id="ttg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF5A6E"/><stop offset="1" stop-color="#FFB547"/></linearGradient></defs><rect class="totop-track" x="1.3" y="1.3" width="53.4" height="53.4" rx="7"/><path class="totop-bar" d="M28 1.3H47.7A7 7 0 0 1 54.7 8.3V47.7A7 7 0 0 1 47.7 54.7H8.3A7 7 0 0 1 1.3 47.7V8.3A7 7 0 0 1 8.3 1.3Z" pathLength="100"/></svg>
    <span class="totop-arrows">${arrow('ta-1')}${arrow('ta-2')}</span>
    <span class="totop-tip" aria-hidden="true"><b>${L(['Дээш буцах', 'Back to top'])}</b><em class="tnum" data-ttpct>0%</em></span>`;
}
function paintToTop() { if (!TT.el) return; TT.el.innerHTML = toTopHTML(); TT.el.setAttribute('aria-label', L(['Хуудасны эхэнд очих', 'Back to top'])); toTopUpd(); }
function toTopUpd() {
  TT.raf = 0; const el = TT.el; if (!el) return;
  const h = document.documentElement.scrollHeight - innerHeight, p = h > 0 ? Math.min(1, Math.max(0, scrollY / h)) : 0;
  const on = scrollY > innerHeight * 0.9;
  if (el.classList.contains('is-on') !== on) { el.classList.toggle('is-on', on); el.tabIndex = on ? 0 : -1; el.setAttribute('aria-hidden', String(!on)); }
  el.style.setProperty('--off', (100 - p * 100).toFixed(2));
  const pc = $('[data-ttpct]', el); if (pc) pc.textContent = Math.round(p * 100) + '%';
}
function toTopGo(ev) {
  const el = TT.el, kb = ev && ev.detail === 0;
  if (TT.run) TT.run.abort();
  const done = () => { if (kb) $('#main').focus({ preventScroll: true }); setTimeout(() => el.classList.remove('is-launch'), 700); };
  el.classList.remove('is-launch'); void el.offsetWidth; el.classList.add('is-launch');
  if (reduced || S.a11y) { window.scrollTo(0, 0); done(); return; }
  // Өөрийн easing-тэй гүйлгэлт: зай их бол арай удаан (0.5–1.1 сек), эхлэл ба төгсгөл зөөлөн
  const ac = new AbortController(); TT.run = ac;
  ['wheel', 'touchstart', 'keydown'].forEach((n) => addEventListener(n, () => ac.abort(), { passive: true, signal: ac.signal }));
  const y0 = scrollY, dur = Math.min(1100, 500 + y0 * 0.08), t0 = performance.now();
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const step = (now) => {
    if (ac.signal.aborted) { el.classList.remove('is-launch'); return; }
    const k = Math.min(1, (now - t0) / dur); window.scrollTo(0, Math.round(y0 * (1 - ease(k))));
    if (k < 1) requestAnimationFrame(step); else { ac.abort(); TT.run = null; done(); }
  };
  setTimeout(() => requestAnimationFrame(step), 120);   // сум эхлээд бага зэрэг суугаад хөөрнө
}
function setupToTop() {
  const el = document.createElement('button'); el.type = 'button'; el.id = 'totop'; el.className = 'totop'; el.tabIndex = -1; el.setAttribute('aria-hidden', 'true');
  $('#chat').after(el); TT.el = el; paintToTop();
  el.addEventListener('click', toTopGo);
  const q = () => { if (!TT.raf) TT.raf = requestAnimationFrame(toTopUpd); };
  addEventListener('scroll', q, { passive: true }); addEventListener('resize', q, { passive: true });
}
