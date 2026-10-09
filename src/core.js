/* ================= Helpers ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k, d) { try { const v = localStorage.getItem('ubmn:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('ubmn:' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
};
function ic(n, c = 'w-5 h-5', sw = 1.9) {
  const b = ICONS[n];
  if (!b) console.warn('missing icon', n);
  return `<svg class="${c} shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${b || '<circle cx="12" cy="12" r="9"/>'}</svg>`;
}

/* Хөдөлгөөнт тэмдэг (өөрийн SVG + CSS хөдөлгөөн, input.css-ийн .ai-*). name: 'siren' | 'vote' */
function animIcon(name, c = 'w-6 h-6') {
  const a = `class="ai ai-${name} ${c} shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"`;
  if (name === 'siren') return `<svg ${a}>
    <g class="ai-ray ai-ray-a"><path d="M3 12.5H1.8"/><path d="m5.3 6.3-.9-.9"/></g>
    <g class="ai-ray ai-ray-b"><path d="M21 12.5h1.2"/><path d="m18.7 6.3.9-.9"/></g>
    <path class="ai-ray ai-ray-c" d="M12 2.6V1.4"/>
    <path d="M7 18v-6a5 5 0 1 1 10 0v6"/>
    <circle class="ai-lamp" cx="12" cy="13" r="2.1" fill="currentColor" stroke="none"/>
    <path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z"/></svg>`;
  if (name === 'vote') { const id = 'aic' + (++animIcon.n); return `<svg ${a}>
    <defs><clipPath id="${id}"><rect x="0" y="-6" width="24" height="18"/></clipPath></defs>
    <g clip-path="url(#${id})"><g class="ai-ballot"><rect x="9" y="3" width="6" height="10" rx="1"/><path class="ai-check" d="m10.4 7.9 1.2 1.2 2.1-2.3"/></g></g>
    <g class="ai-box"><path d="M3.5 12h5M15.5 12h5"/><path d="M3.5 12v7.5A1.5 1.5 0 0 0 5 21h14a1.5 1.5 0 0 0 1.5-1.5V12"/><path d="M8.5 16.5h7"/></g></svg>`; }
  return ic(name, c);
}
animIcon.n = 0;
/* Хөдөлгөөнт гал («Шуурхай мэдээ»): 3 давхар дөл тус бүр өөр хэмнэлээр найгана, ард нь гэрэлтэлт, дээш хөөрөх оч. input.css .fire-* */
function fireIcon(cls = 'w-[22px] h-[28px]') {
  const n = ++animIcon.n, g = (id, a, b) => `<linearGradient id="${id}${n}" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  return `<svg class="fire ${cls} shrink-0" viewBox="0 0 24 30" aria-hidden="true" focusable="false"><defs>
    <radialGradient id="fg${n}" cx="50%" cy="62%" r="52%"><stop offset="0" stop-color="#FFB020" stop-opacity=".6"/><stop offset=".55" stop-color="#FF6A13" stop-opacity=".22"/><stop offset="1" stop-color="#FF5A1F" stop-opacity="0"/></radialGradient>
    ${g('fo', '#FF7A1A', '#E3262E')}${g('fm', '#FFB224', '#FF6A13')}${g('fi', '#FFF6D2', '#FFD45C')}</defs>
    <g class="fire-ign"><ellipse class="fire-glow" cx="12" cy="20" rx="12" ry="10" fill="url(#fg${n})"/><g class="fire-body">
      <path class="fire-o" fill="url(#fo${n})" d="M12.3 1.2C12.8 5 15.9 7.2 17.8 10.2C19.4 12.7 20.2 15.3 20.2 18.2C20.2 24.1 16.6 28.5 12 28.5C7.4 28.5 3.8 24.6 3.8 19C3.8 15.7 5.2 13.1 7.1 11.1C7.3 13.3 8.2 14.7 9.5 15.5C9 10.6 10 5.9 12.3 1.2Z"/>
      <path class="fire-m" fill="url(#fm${n})" d="M12.4 9.2C13 12 15.4 13.9 16.4 16.4C17 17.8 17.2 19 17.2 20.4C17.2 24.3 14.9 26.9 12 26.9C9.1 26.9 6.8 24.6 6.8 21.3C6.8 19.2 7.7 17.6 8.9 16.4C9.1 17.8 9.7 18.7 10.6 19.2C10.3 15.8 10.9 12.4 12.4 9.2Z"/>
      <path class="fire-i" fill="url(#fi${n})" d="M12.3 15.6C12.8 17.5 14.6 18.9 14.6 21.9C14.6 24.1 13.4 25.5 12 25.5C10.6 25.5 9.4 24.3 9.4 22.4C9.4 20.8 10.3 19.8 11 18.9C11.2 19.9 11.6 20.4 12 20.6C11.8 19 11.9 17.2 12.3 15.6Z"/>
    </g></g>
    <circle class="fire-ember e1" cx="8.5" cy="16" r=".95" fill="#FFC524"/><circle class="fire-ember e2" cx="15.5" cy="14" r=".8" fill="#FF8A1F"/><circle class="fire-ember e3" cx="12" cy="10.5" r=".65" fill="#FFE37A"/></svg>`;
}

/* ================= State ================= */
const S = {
  lang: store.get('lang', 'mn') === 'en' ? 'en' : 'mn',
  theme: store.get('theme', 'light') === 'dark' ? 'dark' : 'light',
  a11y: !!store.get('a11y', false),
  user: store.get('user', null),
  route: 'home',
  hub: 'news', newsCat: 'all', svcTab: 'citizen', svcQ: '',
  sit: 'birth', sitDone: store.get('sitDone', { birth: [0] }),
  media: 'all',
  projSt: 'all', projSel: null,
  evF: 'all', evView: 'list', calYM: null, calDay: null, evSel: null, evSaved: store.get('evSaved', []),
  tr: 'res', trQ: '',
  myTab: 'over',
  requests: store.get('requests', null) || REQ_DEFAULT.map((r) => Object.assign({}, r)),
  paid: store.get('paid', []),
  vote: store.get('vote', null),
  breaking: [], incoming: 0,
  aqi: 87, temp: -4, traffic: 6, buses: 1024, riders: 0,
  tickerOn: true,
  chat: [], chatOpen: false,
};
const NEWS_BY = {}; NEWS.concat(INCOMING).forEach((n) => { NEWS_BY[n.id] = n; });
const parseUB = (s) => { const m = String(s).match(/(\d{4})\D(\d{2})\D(\d{2})\D+(\d{2}):(\d{2})/); return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) : null; };
NEWS.forEach((n) => { if (n.d) { n.ts = parseUB(n.d); n.ago = Math.max(1, Math.round((ubNow() - n.ts) / 60000)); } });
const ALL_SVC = [].concat(SERVICES.citizen.map((s) => Object.assign({ g: 'citizen' }, s)), SERVICES.business.map((s) => Object.assign({ g: 'business' }, s)), SERVICES.esys.map((s) => Object.assign({ g: 'esys' }, s)));

/* ================= i18n ================= */
const EN = () => S.lang === 'en';
function L(v) { return Array.isArray(v) ? (EN() ? (v[1] || v[0]) : (v[0] || v[1])) : v; }
function t(k, vars) { const v = I[k]; let s = v ? (EN() ? (v[1] || v[0]) : (v[0] || v[1])) : k; if (vars) for (const x in vars) s = s.split('{' + x + '}').join(vars[x]); return s; }

/* ================= Time (Ulaanbaatar, UTC+8) ================= */
function ubNow() { const d = new Date(); return new Date(d.getTime() + (480 + d.getTimezoneOffset()) * 60000); }
function today() { const d = ubNow(); d.setHours(0, 0, 0, 0); return d; }
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
const dkey = (d) => d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
const MN_WD = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
const MN_WDS = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'];
const EN_WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EN_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EN_MONF = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function fDate(d, wd) { if (EN()) return (wd ? EN_WD[d.getDay()] + ', ' : '') + EN_MON[d.getMonth()] + ' ' + d.getDate(); return (wd ? MN_WD[d.getDay()] + ', ' : '') + (d.getMonth() + 1) + '-р сарын ' + d.getDate(); }
function fMonth(y, m) { return EN() ? EN_MONF[m] + ' ' + y : y + ' оны ' + (m + 1) + '-р сар'; }
const pad = (n) => String(n).padStart(2, '0');
function hhmm(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
function clock(sec) { const d = ubNow(); return hhmm(d) + (sec ? ':' + pad(d.getSeconds()) : ''); }
function ago(min) {
  if (min < 1) return EN() ? 'Just now' : 'Дөнгөж сая';
  if (min < 60) return EN() ? min + ' min ago' : min + ' минутын өмнө';
  if (min < 1440) { const h = Math.floor(min / 60); return EN() ? h + ' h ago' : h + ' цагийн өмнө'; }
  const d = Math.floor(min / 1440); return EN() ? (d === 1 ? 'Yesterday' : d + ' days ago') : (d === 1 ? 'Өчигдөр' : d + ' өдрийн өмнө');
}
function fill(s) {
  return String(s).replace(/\{t([+-]\d+)\}/g, (_, n) => fDate(addDays(today(), +n)))
    .replace(/\{aqi\}/g, S.aqi).replace(/\{tr\}/g, S.traffic);
}
function Lf(v) { return fill(L(v)); }
function num(n) { const s = String(Math.round(n)); return s.replace(/\B(?=(\d{3})+(?!\d))/g, EN() ? ',' : '\u00A0'); }
function money(n) { return EN() ? '₮' + num(n) : num(n) + '₮'; }
function bn(n) { return EN() ? '₮' + num(n) + ' bn' : num(n) + ' тэрбум ₮'; }
function mln(n) { if (n >= 1000) { const v = Math.round(n / 100) / 10; return EN() ? '₮' + v + ' bn' : String(v) + ' тэрбум ₮'; } return EN() ? '₮' + num(n) + ' m' : num(n) + ' сая ₮'; }
function evDate(w) {
  const n = today(), dow = n.getDay(); let off = 0;
  if (w === 'tomorrow') off = 1;
  else if (w === 'sat') off = dow === 6 ? 0 : dow === 0 ? 6 : 6 - dow;
  else if (w === 'sun') off = dow === 0 ? 0 : 7 - dow;
  else if (w === 'fri') off = dow <= 5 ? 5 - dow : 6;
  else if (typeof w === 'number') off = w;
  return addDays(n, off);
}
function weekendKeys() { const n = today(), dow = n.getDay(); if (dow === 0) return [dkey(n)]; if (dow === 6) return [dkey(n), dkey(addDays(n, 1))]; return [dkey(addDays(n, 6 - dow)), dkey(addDays(n, 7 - dow))]; }
function aqiCat(v) { if (v <= 50) return { k: 'aqiGood', c: '#10A36A' }; if (v <= 100) return { k: 'aqiMod', c: '#E5A800' }; if (v <= 150) return { k: 'aqiUsg', c: '#F08C1A' }; return { k: 'aqiBad', c: '#D81E34' }; }
const pm25 = () => Math.round(S.aqi * 0.36);

/* ================= Motion helpers ================= */
const swapIds = new WeakMap();
async function swap(el, html, dir, after) {
  if (!el) return;
  const id = (swapIds.get(el) || 0) + 1; swapIds.set(el, id);
  if (reduced || !el.animate) { el.innerHTML = html; if (after) after(el); return; }
  const dx = dir ? dir * 18 : 0, dy = dir ? 0 : 8;
  const h0 = el.offsetHeight;
  el.style.height = h0 + 'px'; el.style.overflow = 'hidden';
  try { await el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translate(${-dx}px, ${-dy / 2}px)` }], { duration: 140, easing: 'ease-in', fill: 'forwards' }).finished; } catch (e) { /* interrupted */ }
  if (swapIds.get(el) !== id) return;
  el.getAnimations().forEach((a) => a.cancel());
  el.innerHTML = html; if (after) after(el);
  el.style.height = 'auto'; const h1 = el.offsetHeight; el.style.height = h0 + 'px';
  const a1 = el.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 340, easing: 'cubic-bezier(.2,.8,.2,1)' });
  el.animate([{ opacity: 0, transform: `translate(${dx * 1.4}px, ${dy}px)` }, { opacity: 1, transform: 'none' }], { duration: 340, easing: 'cubic-bezier(.2,.8,.2,1)' });
  el.style.height = h1 + 'px';
  try { await a1.finished; } catch (e) { /* interrupted */ }
  if (swapIds.get(el) === id) { el.style.height = ''; el.style.overflow = ''; }
}
function tabs(name, items, active, opts = {}) {
  const kind = opts.line ? 'uline' : 'seg';
  return `<div class="${kind} ${opts.lg ? 'seg-lg' : ''} ${opts.cls || ''}" role="tablist" data-tablist="${name}" aria-label="${esc(opts.label || '')}"><span class="${opts.line ? 'uline-bar' : 'seg-pill'}" data-pill></span>${items.map(([v, label, icn]) => `<button type="button" class="${opts.line ? 'uline-btn' : 'seg-btn'}" role="tab" data-act="tab" data-tabs="${name}" data-v="${v}" aria-selected="${v === active}" tabindex="${v === active ? 0 : -1}">${icn ? ic(icn, 'w-[18px] h-[18px]') : ''}<span>${esc(label)}</span></button>`).join('')}</div>`;
}
function placePill(list, animate) {
  if (!list) return;
  const pill = list.querySelector('[data-pill]'), btn = list.querySelector('[aria-selected="true"]');
  if (!pill || !btn) return;
  if (!animate) list.classList.remove('ready');
  pill.style.width = btn.offsetWidth + 'px';
  pill.style.transform = `translateX(${btn.offsetLeft}px)`;
  if (!animate) requestAnimationFrame(() => requestAnimationFrame(() => list.classList.add('ready')));
}
function initTabs(root = document) { $$('[data-tablist]', root).forEach((l) => placePill(l, false)); }
function selectTab(name, v) {
  const list = $(`[data-tablist="${name}"]`); if (!list) return;
  $$('[data-tabs]', list).forEach((b) => { const on = b.dataset.v === v; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
  placePill(list, true);
  const btn = list.querySelector('[aria-selected="true"]');
  if (btn && list.scrollWidth > list.clientWidth + 2) list.scrollTo({ left: btn.offsetLeft - list.clientWidth / 2 + btn.offsetWidth / 2, behavior: reduced ? 'auto' : 'smooth' });
}
function chips(act, items, active, dark) {
  return items.map(([v, label, dot]) => `<button type="button" class="chip ${dark ? 'chip-dark' : ''}" data-act="${act}" data-v="${v}" aria-pressed="${v === active}">${dot ? `<i class="w-2 h-2 rounded-full" style="background:${dot}"></i>` : ''}${esc(label)}</button>`).join('');
}
function observeOnce(el, fn, threshold = .25) {
  if (!el) return;
  if (!('IntersectionObserver' in window)) { fn(el); return; }
  const io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) { io.disconnect(); fn(el); } }); }, { threshold });
  io.observe(el);
}
function countUp(el, to, dur = 1400) {
  if (!el) return;
  if (reduced) { el.textContent = num(to); return; }
  const t0 = performance.now();
  const step = (tm) => { const p = Math.min(1, (tm - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = num(to * e); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function ring(p, size, stroke, color, extra = '') {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - p / 100);
  return `<svg viewBox="0 0 ${size} ${size}" class="-rotate-90 ${extra}" style="width:${size}px;height:${size}px" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgb(var(--c-line))" stroke-width="${stroke}"/><circle class="ring-fg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}"/></svg>`;
}

/* ================= Modal / toast ================= */
let MODAL = null;
const SIZES = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl', search: 'sm:max-w-2xl max-sm:h-full max-sm:max-h-none' };
function openModal(o) {
  closeModal(true);
  const wrap = document.createElement('div');
  wrap.className = 'ovl' + (o.top ? ' ovl-top' : '');
  wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true');
  if (o.label) wrap.setAttribute('aria-label', o.label);
  wrap.innerHTML = `<div class="sheet ${SIZES[o.size || 'lg']}" data-sheet></div>`;
  $('#modal-root').appendChild(wrap);
  MODAL = { el: wrap, sheet: wrap.firstElementChild, render: o.render, after: o.after, onClose: o.onClose, prev: document.activeElement };
  paintModal();
  document.body.style.overflow = 'hidden';
  wrap.addEventListener('mousedown', (e) => { if (e.target === wrap) closeModal(); });
  requestAnimationFrame(() => { wrap.classList.add('open'); const f = wrap.querySelector('[data-autofocus]') || wrap.querySelector('button, input, textarea, [tabindex]'); if (f) try { f.focus({ preventScroll: true }); } catch (e) { /* ignore */ } });
}
function paintModal(keepScroll) {
  if (!MODAL) return;
  const st = MODAL.sheet.scrollTop;
  MODAL.sheet.innerHTML = MODAL.render();
  if (keepScroll) MODAL.sheet.scrollTop = st;
  initTabs(MODAL.sheet);
  if (MODAL.after) MODAL.after(MODAL.sheet);
}
function closeModal(immediate) {
  if (!MODAL) return;
  const m = MODAL; MODAL = null;
  if (m.onClose) m.onClose();
  document.body.style.overflow = '';
  if (immediate || reduced) m.el.remove(); else { m.el.classList.remove('open'); setTimeout(() => m.el.remove(), 320); }
  if (m.prev && m.prev.focus && document.contains(m.prev)) try { m.prev.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
}
function modalHead(title, sub, icon, tone) {
  return `<div class="sticky top-0 z-10 flex items-start gap-3 px-5 sm:px-7 pt-5 pb-4 bg-card/95 backdrop-blur border-b border-line">
    ${icon ? `<span class="w-11 h-11 rounded-2xl grid place-items-center ${tone || 'bg-soft text-ink'}">${ic(icon, 'w-[22px] h-[22px]')}</span>` : ''}
    <div class="flex-1 min-w-0 pt-0.5"><h2 class="text-[20px] font-extrabold tracking-tight leading-tight">${esc(title)}</h2>${sub ? `<p class="text-[13.5px] text-muted mt-0.5">${sub}</p>` : ''}</div>
    <button type="button" class="icon-btn hover:bg-soft -mr-2" data-act="modal-close" aria-label="${esc(t('close'))}">${ic('x')}</button></div>`;
}
function toast(msg, icon = 'circle-check') {
  const el = document.createElement('div');
  el.className = 'toast'; el.setAttribute('role', 'status');
  el.innerHTML = `${ic(icon, 'w-5 h-5 text-ubgreen')}<span>${esc(msg)}</span>`;
  $('#toast-root').appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 260); }, 2700);
}

/* ================= Navigation model ================= */
const MENU = [
  { k: 'nav_services', sec: 'situations', items: [
    { i: 'route', t: ['Амьдралын нөхцөл', 'Life events'], d: ['Хүүхэд төрөх, гэрлэх, бизнес эхлүүлэх үед хэрэгтэй бүх алхам', 'Every step for a new baby, marriage or a new business'], go: { sec: 'situations' } },
    { i: 'user-round', t: ['Иргэн', 'Residents'], d: ['Лавлагаа, тэтгэмж, төлбөр, бүртгэл', 'Certificates, benefits, payments, registration'], go: { sec: 'hub', hub: 'services', svc: 'citizen' } },
    { i: 'briefcase', t: ['Аж ахуйн нэгж', 'Businesses'], d: ['Зөвшөөрөл, тендер, газар эзэмшил', 'Permits, tenders, land use'], go: { sec: 'hub', hub: 'services', svc: 'business' } },
    { i: 'monitor-smartphone', t: ['Цахим системүүд', 'E-services'], d: ['Хотын бүх цахим үйлчилгээ нэг дор', 'All city e-services in one place'], go: { sec: 'hub', hub: 'services', svc: 'esys' } } ] },
  { k: 'nav_news', sec: 'hub', items: [
    { i: 'newspaper', t: ['Бүх мэдээ', 'All news'], d: ['Хотын захиргаа, дүүрэг, байгууллагын мэдээ', 'From City Hall, districts and agencies'], go: { sec: 'hub', hub: 'news', cat: 'all' } },
    { i: 'megaphone', t: ['Зар', 'Notices'], d: ['Хуваарь, хаалт, ажлын байр, мэдэгдэл', 'Schedules, closures, jobs, announcements'], go: { sec: 'hub', hub: 'news', cat: 'zar' } },
    { i: 'calendar-days', t: ['Арга хэмжээ', 'Events'], d: ['Хотод болох соёл, спорт, иргэний арга хэмжээ', 'Culture, sport and civic events'], go: { sec: 'events' } },
    { i: 'clapperboard', t: ['Медиа', 'Media'], d: ['Видео, шууд дамжуулалт, фото, подкаст', 'Video, live streams, photos, podcasts'], go: { sec: 'media' } } ] },
  { k: 'nav_build', sec: 'projects', items: [
    { i: 'hard-hat', t: ['24 мега төсөл', '24 flagship projects'], d: ['Төсөл бүрийн гүйцэтгэл, төсөв, хугацаа', 'Progress, budget and timeline for each'], go: { sec: 'projects' } },
    { i: 'map-pinned', t: ['Газрын зураг', 'Map'], d: ['Бүх төслийг газрын зураг дээр', 'Every project on the map'], go: { sec: 'projects', focus: 'map' } } ] },
  { k: 'nav_data', sec: 'data', items: [
    { i: 'activity', t: ['Бодит цагийн самбар', 'Live dashboard'], d: ['Агаар, түгжрэл, цаг агаар, нийтийн тээвэр', 'Air, traffic, weather and transit'], go: { sec: 'data' } },
    { i: 'chart-column', t: ['Статистик', 'Statistics'], d: ['Хүн ам, төсөв, нийгмийн үзүүлэлт', 'Population, budget, social indicators'], go: { sec: 'data', hl: 'pop' } } ] },
  { k: 'nav_open', sec: 'transparency', items: [
    { i: 'scroll-text', t: ['Тогтоол', 'Resolutions'], d: ['Нийслэлийн ИТХ-ын тогтоолууд', 'City Council resolutions'], go: { sec: 'transparency', tr: 'res' } },
    { i: 'stamp', t: ['Захирамж, шийдвэр', 'Orders and decisions'], d: ['Засаг даргын захирамж, шийдвэрүүд', "The Governor's orders"], go: { sec: 'transparency', tr: 'ord' } },
    { i: 'gavel', t: ['Тендер', 'Tenders'], d: ['Нээлттэй тендер, гэрээ, үр дүн', 'Open tenders, contracts, results'], go: { sec: 'transparency', tr: 'tender' } } ] },
  { k: 'nav_about', sec: 'about', items: [
    { i: 'landmark', t: ['Удирдлага', 'Leadership'], d: ['Хотын удирдлагын бүтэц', 'How the city is governed'], go: { sec: 'about' } },
    { i: 'network', t: ['Харьяа байгууллагууд', 'City agencies'], d: ['Нийслэлийн агентлаг, газрууд', 'Agencies and departments'], go: { sec: 'about', hl: 'orgs' } } ] },
];
function goAttrs(go) { return Object.entries(go).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' '); }
/* Цэсийн холбоос: сайтын хэсэг (go) эсвэл гадаад хаяг (href). Admin-ы «Үндсэн цэс»-ээс засагдана. */
function itemAct(it) { return it.href ? `data-act="ext-link" data-href="${esc(it.href)}"` : `data-act="go" ${goAttrs(it.go || { sec: 'hero' })}`; }
function menuLabel(m) { return m.lbl && L(m.lbl) ? esc(L(m.lbl)) : m.k ? t(m.k) : ''; }

/* ================= Header ================= */
function langToggle(dark) {
  return `<div class="flex items-center rounded-xl p-0.5 ${dark ? 'bg-white/10' : 'bg-soft border border-line'}" role="group" aria-label="Language">${['mn', 'en'].map((l) => `<button type="button" data-act="lang" data-v="${l}" aria-pressed="${S.lang === l}" class="h-8 px-2.5 rounded-[10px] text-[12.5px] font-bold transition-colors ${S.lang === l ? (dark ? 'bg-white text-navy' : 'bg-ink text-card') : (dark ? 'text-white/70 hover:text-white' : 'text-muted hover:text-ink')}">${l === 'mn' ? 'МН' : 'EN'}</button>`).join('')}</div>`;
}
function themeBtn(dark) {
  const d = S.theme === 'dark', lbl = esc(d ? t('themeLight') : t('themeDark'));
  return `<button type="button" data-act="theme" class="icon-btn ${dark ? 'hover:bg-white/10' : '!rounded-lg border border-line hover:bg-soft'}" aria-label="${lbl}" title="${lbl}">${ic(d ? 'sun' : 'moon', 'w-[19px] h-[19px]')}</button>`;
}
/* Горим солих: шинэ горим дарсан цэгээс (origin) тойрог хэлбэрээр тэлж бүх дэлгэцийг бүрхэнэ (View Transitions API). */
function applyTheme(animate, extra, origin) {
  const root = document.documentElement;
  const run = () => { root.setAttribute('data-theme', S.theme); const m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', S.theme === 'dark' ? '#060E22' : '#0B1D45'); if (extra) extra(); };
  if (animate && !reduced && document.startViewTransition) {
    try {
      const x = origin ? origin.x : innerWidth - 48, y = origin ? origin.y : 48;
      const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));   // хамгийн алс булан хүртэлх зай
      root.classList.add('theme-vt');
      const vt = document.startViewTransition(run);
      vt.ready.then(() => root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 820, easing: 'cubic-bezier(.33, 1, .68, 1)', pseudoElement: '::view-transition-new(root)' },
      )).catch(() => {});
      vt.finished.finally(() => root.classList.remove('theme-vt'));
      return;
    } catch (e) { root.classList.remove('theme-vt'); }
  }
  run();
}
function a11yBtn() {
  const lbl = esc(t('a11yMode'));
  return `<button type="button" data-act="a11y" aria-pressed="${!!S.a11y}" class="icon-btn !rounded-lg border transition-colors ${S.a11y ? 'bg-ink text-card border-transparent' : 'border-line hover:bg-soft'}" aria-label="${lbl}" title="${lbl}">${ic('eye', 'w-[19px] h-[19px]')}</button>`;
}
function applyA11y() { document.documentElement.classList.toggle('a11y', !!S.a11y); }
/* Мэдээний хаяг: сервер (server/pages.js) /news/<id> хуудсыг үйлчилдэг бол тэр хаягийг, үгүй бол (нэг файлт хувилбар, статик хостинг) #news/<id> */
const PRETTY = !!document.querySelector('meta[name="ubmn-routes"]');
const newsHref = (id) => (PRETTY ? '/news/' + encodeURIComponent(id) : '#news/' + id);
const newsUrl = (n) => (PRETTY ? location.origin + newsHref(n.id) : NEWS_SRC + n.id.slice(1));   // share хийх хаяг
function urlNewsId() {
  const m = PRETTY && location.pathname.match(/^\/news\/([^/]+)\/?$/);
  if (m) { try { return decodeURIComponent(m[1]); } catch (e) { return null; } }
  const h = decodeURIComponent((location.hash || '').slice(1));
  return h.startsWith('news/') ? h.slice(5) : null;
}
function setHash(sec) {
  try {
    const h = sec && sec !== 'hero' ? '#' + sec : '';
    if (PRETTY) { if (location.pathname !== '/' || location.hash !== h) history.replaceState(null, '', '/' + h); }
    else if (location.hash !== h) history.replaceState(null, '', h || location.pathname + location.search);
  } catch (e) { /* ignore */ }
}
function pulseSegs(mobile) {
  const cat = aqiCat(S.aqi);
  const segCls = mobile ? 'h-11 px-3.5 rounded-xl bg-white/[.07] border border-white/10 whitespace-nowrap' : 'h-full px-3 xl:px-4 hover:bg-white/10 whitespace-nowrap';
  const bar = Array.from({ length: 10 }, (_, i) => `<i class="w-[3px] h-3 rounded-full ${i < S.traffic ? 'bg-ubamber' : 'bg-white/20'}"></i>`).join('');
  const segs = [
    { hl: 'weather', html: `${ic('cloud-sun', 'w-[22px] h-[22px] text-white/90')}<span class="text-left leading-tight"><b class="block tnum text-[15px]" data-live="temp">${S.temp}°C</b><span class="block lg:hidden xl:block text-[11.5px] text-white/60">${t('cloudy')}</span></span>`,
      pop: `<p class="text-[13px] text-muted">${t('weather')}</p><p class="text-[26px] font-extrabold tnum mt-1">${S.temp}°C <span class="text-[14px] font-semibold text-muted">${t('feels')} ${S.temp - 5}°</span></p><div class="grid grid-cols-2 gap-2 mt-3 text-[13px]"><span class="text-muted">${t('wind')}</span><b>4 м/с, ${t('windDir')}</b><span class="text-muted">${t('humidity')}</span><b>58%</b></div>` },
    { hl: 'aqi', html: `<span class="live" style="--dot:${cat.c}"></span><span class="text-left leading-tight"><b class="block tnum text-[15px]">AQI <span data-live="aqi">${S.aqi}</span></b><span class="block lg:hidden xl:block text-[11.5px] text-white/60">${t(cat.k)}</span></span>`,
      pop: `<p class="text-[13px] text-muted">${t('aqi')}</p><p class="text-[26px] font-extrabold tnum mt-1"><span data-live="aqi">${S.aqi}</span> <span class="text-[14px] font-semibold" style="color:${cat.c}">${t(cat.k)}</span></p><div class="mt-3 h-2 rounded-full relative" style="background:linear-gradient(90deg,#10A36A 0 25%,#E5A800 25% 50%,#F08C1A 50% 75%,#D81E34 75%)"><i class="absolute -top-1 w-1.5 h-4 rounded bg-ink" style="left:calc(${Math.min(98, S.aqi / 2)}% - 3px)"></i></div><p class="text-[13px] text-muted mt-3 leading-snug">${t('aqiAdvice')}</p>` },
    { hl: 'traffic', html: `${ic('car-front', 'w-[22px] h-[22px] text-white/90')}<span class="text-left leading-tight"><b class="block tnum text-[15px]">${S.traffic}/10</b><span class="flex items-center gap-[2px] mt-1">${bar}</span></span>`,
      pop: `<p class="text-[13px] text-muted">${t('congestion')}</p><p class="text-[26px] font-extrabold tnum mt-1">${S.traffic}/10 <span class="text-[14px] font-semibold text-amberink">${t('busy')}</span></p><ul class="mt-3 space-y-2 text-[13px]">${ROADS.map(([n, v]) => `<li class="flex justify-between gap-3"><span>${esc(L(n))}</span><b class="tnum">${v}</b></li>`).join('')}</ul>` },
  ];
  const shs = [`${ic('cloud-sun', 'w-4 h-4 text-white/85')}<b class="tnum">${S.temp}°C</b><span class="text-white/60">${t('cloudy')}</span>`, `<span class="live" style="--dot:${cat.c}"></span><b class="tnum">AQI <span data-live="aqi">${S.aqi}</span></b><span class="text-white/60">${t(cat.k)}</span>`, `${ic('car-front', 'w-4 h-4 text-white/85')}<span class="text-white/60">${t('traffic')}</span><b class="tnum">${S.traffic}/10</b><span class="flex items-center gap-[2px]">${bar}</span>`];
  if (mobile === 'strip') return `<div class="flex items-center -ml-3">${segs.map((s, i) => `${i ? '<span class="w-px h-4 bg-white/15 mx-1"></span>' : ''}<div class="pulse-seg"><button type="button" class="h-[38px] px-3 flex items-center gap-2 text-[12.5px] rounded-md hover:bg-white/10 transition-colors whitespace-nowrap" data-act="go" data-sec="data" data-hl="${s.hl}">${shs[i]}</button><div class="pop"><div class="card p-4 text-ink shadow-2xl">${s.pop}<button type="button" class="mt-3 text-[13px] font-bold text-ubblue inline-flex items-center gap-1" data-act="go" data-sec="data" data-hl="${s.hl}">${t('more')}${ic('chevron-right', 'w-4 h-4')}</button></div></div></div>`).join('')}</div>`;
  if (mobile) return `<div class="flex gap-2 overflow-x-auto no-scrollbar px-4 py-2.5">${segs.map((s) => `<button type="button" class="${segCls} flex items-center gap-2.5 shrink-0" data-act="go" data-sec="data" data-hl="${s.hl}">${s.html}</button>`).join('')}<span class="shrink-0 h-11 px-3 flex items-center gap-2 text-[12.5px] text-white/60 tnum">${ic('clock-3', 'w-4 h-4')}<span data-live="clock">${clock()}</span></span></div>`;
  return `<div class="flex items-stretch h-12 rounded-2xl border border-white/15 bg-white/[.05]">${segs.map((s, i) => `${i ? '<span class="w-px bg-white/15 my-2.5"></span>' : ''}<div class="pulse-seg"><button type="button" class="${segCls} flex items-center gap-2.5 ${i === 0 ? 'rounded-l-2xl' : ''} ${i === 2 ? 'rounded-r-2xl' : ''} transition-colors" data-act="go" data-sec="data" data-hl="${s.hl}">${s.html}</button><div class="pop"><div class="card p-4 text-ink shadow-2xl">${s.pop}<button type="button" class="mt-3 text-[13px] font-bold text-ubblue inline-flex items-center gap-1" data-act="go" data-sec="data" data-hl="${s.hl}">${t('more')}${ic('chevron-right', 'w-4 h-4')}</button></div></div></div>`).join('')}</div>`;
}
function userBtn() {
  if (!S.user) return `<button type="button" data-act="login" class="h-10 px-4 rounded-lg btn-navy font-bold text-[14px] inline-flex items-center gap-2">${ic('fingerprint', 'w-[18px] h-[18px]')}${t('login')}</button>`;
  return `<div class="relative" data-userwrap><button type="button" data-act="user-menu" aria-expanded="false" class="h-10 pl-1 pr-2.5 rounded-lg border border-line hover:bg-soft inline-flex items-center gap-2 transition-colors"><span class="w-8 h-8 rounded-md bg-ubred text-white grid place-items-center text-[12.5px] font-extrabold">${esc(L(ME.ini))}</span><span class="hidden xl:inline text-[14px] font-semibold">${esc(L(ME.n))}</span>${ic('chevron-down', 'w-4 h-4 opacity-60')}</button>
  <div class="absolute right-0 top-[calc(100%+8px)] w-56 card shadow-2xl p-1.5 text-ink hidden z-[61]" data-usermenu><button type="button" data-act="my" class="w-full flex items-center gap-2.5 px-3 h-10 rounded-lg hover:bg-soft text-[14px] font-semibold">${ic('layout-dashboard', 'w-[18px] h-[18px]')}${t('myCorner')}</button><button type="button" data-act="logout" class="w-full flex items-center gap-2.5 px-3 h-10 rounded-lg hover:bg-soft text-[14px] font-semibold text-ubred">${ic('log-out', 'w-[18px] h-[18px]')}${t('logout')}</button></div></div>`;
}
function renderHeader() {
  const band = $('#hdr-band');
  if (!band.dataset.built) {
    band.innerHTML = `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8 h-[62px] lg:h-[84px] flex items-center gap-3 lg:gap-6"><div id="hb-left" class="shrink-0 min-w-0"></div><div id="hb-sky" class="hidden lg:block flex-1 min-w-[120px] self-stretch relative sky-mask" aria-hidden="true"></div><div id="hb-right" class="flex items-center gap-1.5 sm:gap-2 ml-auto lg:ml-0 shrink-0"></div></div>`;
    band.dataset.built = '1';
    $('#hb-sky').innerHTML = skylineSVG('skd'); watchSky($('#hb-sky'));
  }
  const hl = $('#hb-left');
  if (!hl.dataset.built) {   // нэг удаа бүтээнэ: дараагийн renderHeader (хэл, горим солих) орох хөдөлгөөнийг таслахгүй
    hl.dataset.built = '1';
    hl.innerHTML = `<button type="button" data-act="home" class="logo-btn ${S.intro ? 'logo-intro' : ''} flex items-center gap-3 text-left">${logoEmblem('w-10 h-10 lg:w-[52px] lg:h-[52px]')}<span class="leading-tight min-w-0"><span class="logo-word block font-extrabold text-[19px] lg:text-[24px] tracking-[-0.025em]" data-brand></span><span class="logo-slogan hidden sm:block text-[12px] lg:text-[13px] font-semibold text-ubblue leading-[1.25] max-w-[160px] lg:max-w-none lg:whitespace-nowrap" data-slogan></span></span></button>`;
    if (S.intro) setTimeout(() => { const lb = $('.logo-btn', hl); if (lb) lb.classList.remove('logo-intro'); }, 2400);
  }
  $('.logo-btn', hl).setAttribute('aria-label', t('homeAria')); $('[data-brand]', hl).textContent = t('brand'); $('[data-slogan]', hl).textContent = t('slogan');
  const other = S.lang === 'mn' ? 'en' : 'mn';
  $('#hb-right').innerHTML = `<button type="button" data-act="search" class="w-10 h-10 rounded-lg btn-navy grid place-items-center" aria-label="${esc(t('search'))}" title="${esc(t('search'))} (Ctrl K)">${ic('search', 'w-[18px] h-[18px]')}</button>
    <div class="hidden sm:flex h-10 px-3 rounded-lg border border-line items-center gap-2.5 text-[13px] font-bold" role="group" aria-label="Language">${['mn', 'en'].map((l, i) => `${i ? '<span class="w-px h-4 bg-line"></span>' : ''}<button type="button" data-act="lang" data-v="${l}" aria-pressed="${S.lang === l}" class="transition-colors ${S.lang === l ? 'text-ink' : 'text-muted hover:text-ink'}">${l === 'mn' ? 'МН' : 'EN'}</button>`).join('')}</div>
    <button type="button" class="sm:hidden h-10 min-w-[40px] px-2 rounded-lg border border-line text-[13px] font-bold" data-act="lang" data-v="${other}" aria-label="${other === 'en' ? 'English' : 'Монгол'}">${other === 'en' ? 'EN' : 'МН'}</button>
    <span class="hidden md:inline-flex">${a11yBtn()}</span><span class="hidden md:inline-flex">${themeBtn(false)}</span>
    <span class="hidden md:block">${userBtn()}</span>
    <button type="button" data-act="menu" class="lg:hidden w-10 h-10 rounded-lg border border-line grid place-items-center hover:bg-soft" aria-label="${esc(t('menu'))}">${ic('menu')}</button>`;
  $('#topstrip').innerHTML = `<div class="hidden lg:block"><div class="max-w-site mx-auto px-8 h-[38px] flex items-center justify-between gap-6">${pulseSegs('strip')}<div class="flex items-center gap-5 text-[12.5px] text-white/70 whitespace-nowrap">${CMS.canEdit ? `<button type="button" data-act="admin" class="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors">${ic('pencil-line', 'w-3.5 h-3.5')}${L(['Сайтыг засах', 'Edit site'])}</button>` : ''}<span class="inline-flex items-center gap-1.5 tnum">${ic('clock-3', 'w-3.5 h-3.5')}<span data-live="clock">${clock()}</span></span><span class="inline-flex items-center gap-1.5">${ic('phone', 'w-3.5 h-3.5')}${t('hotlineShort')} <b class="text-white tnum">1200</b></span></div></div></div><div class="lg:hidden">${pulseSegs(true)}</div>`;
  /* Цэс: хөвөгч «dock» капсул. Шингэн тодруулга, гэрэлтэх хүрээ, доод ирмэгт уншилтын явцыг харуулах алхан хээ (setupNav). */
  const navBtn = (m, i) => `<li class="flex"><button type="button" class="nav-btn" data-menu="${i}" data-sec="${esc(m.sec)}" aria-expanded="false" aria-haspopup="true"><span>${menuLabel(m)}</span>${ic('chevron-down', 'nav-chev w-3.5 h-3.5')}</button></li>`;
  const ctaBtn = (act, cls, icon, label) => `<button type="button" class="cta-pill ${cls}" data-act="${act}" aria-label="${esc(label)}" title="${esc(label)}"><span class="cta-pill-ic">${animIcon(icon, 'w-[18px] h-[18px]')}</span><span class="cta-pill-t">${label}</span></button>`;
  $('#hdr-nav').innerHTML = `<div class="max-w-site mx-auto px-4 sm:px-6 lg:px-8"><nav class="dock" id="navbar" aria-label="Main"><span class="dock-glass" aria-hidden="true"><i></i></span><div class="dock-in">
    <button type="button" data-act="home" class="mini-logo shrink-0" tabindex="-1" aria-hidden="true">${logoEmblem('w-[34px] h-[34px]')}</button>
    <ul class="dock-items" id="nav-items"><li class="nav-pill" id="nav-pill" aria-hidden="true"></li>${MENU.map(navBtn).join('')}</ul>
    <div class="ml-auto flex items-center gap-2 pl-3 shrink-0">
      <button type="button" data-act="search" class="dock-search" aria-label="${esc(t('search'))}" title="${esc(t('search'))} (Ctrl K)">${ic('search', 'w-[18px] h-[18px]')}</button>
      <span class="dock-div" aria-hidden="true"></span>
      ${ctaBtn('report', 'cta-red', 'siren', t('cta_report'))}${ctaBtn('vote', 'cta-blue', 'vote', t('cta_vote'))}
    </div>
    <div class="mega" id="mega" role="region"><span class="mega-caret" aria-hidden="true"></span><div class="mega-card"><div class="mega-body"></div></div></div>
  </div><span class="dock-orn" aria-hidden="true"><i></i><i class="dock-orn-fill"></i></span></nav></div>`;
  setupNav();
}
function megaHTML(i) {
  const m = MENU[i];
  const feat = ([
    () => { const s = SITS[0]; if (!s) return ''; return `<p class="text-[13px] text-muted">${t('s_sits')}</p><p class="mt-1 text-[17px] font-extrabold">${esc(L(s.t))}</p><p class="mt-1 text-[13.5px] text-muted">${t('stepsOnline', { n: s.steps.length, o: s.steps.filter((x) => x.m === 'on').length })}</p><button type="button" class="btn btn-sm btn-ink mt-4" data-act="go" data-sec="situations" data-sit="${esc(s.id)}">${t('sitPromoB')}</button>`; },
    () => { const n = NEWS_BY[HERO_ID]; if (!n) return ''; return `<div class="scene rounded-xl aspect-[16/9]">${Scene(n.img)}</div><p class="mt-3 text-[14.5px] font-bold leading-snug line-clamp-3">${esc(L(n.t))}</p><button type="button" class="mt-2 text-[13px] font-bold text-ubblue" data-act="news" data-id="${HERO_ID}">${t('read')}</button>`; },
    () => { const p = PROJECTS[0]; if (!p || !PCAT[p.c]) return ''; return `<div class="flex items-center gap-4">${ring(p.p, 64, 7, PCAT[p.c].c)}<div><p class="text-[13px] text-muted">${esc(L(PCAT[p.c].t))}</p><p class="font-extrabold leading-snug">${esc(L(p.n))}</p><p class="text-[22px] font-extrabold tnum">${p.p}%</p></div></div><button type="button" class="btn btn-sm btn-ink mt-4" data-act="go" data-sec="projects" data-pid="p1">${t('showOnMap')}</button>`; },
    () => { const c = aqiCat(S.aqi); return `<p class="text-[13px] text-muted">${t('aqi')}</p><p class="text-[40px] leading-none font-extrabold tnum mt-1"><span data-live="aqi">${S.aqi}</span></p><p class="font-semibold mt-1" style="color:${c.c}">${t(c.k)}</p><p class="text-[13px] text-muted mt-2">${t('updated')} <span class="tnum" data-live="clock">${clock()}</span></p>`; },
    () => `<p class="text-[13px] text-muted">${t('trStat2')}</p><p class="text-[40px] leading-none font-extrabold tnum mt-1">37</p><p class="text-[13.5px] text-muted mt-2">${t('trStat1')}: <b class="text-ink tnum">1 248</b></p>`,
    () => `<p class="text-[13px] text-muted">${t('founded')}</p><p class="text-[40px] leading-none font-extrabold tnum mt-1">1639</p><p class="text-[13.5px] text-muted mt-2">${t('adminV')}</p>`,
  ][i] || (() => ''))();
  return `<div class="p-4 xl:p-5 grid grid-cols-12 gap-4 xl:gap-5">
    <div class="col-span-8 grid grid-cols-2 gap-1 content-start">${m.items.map((it, k) => `<button type="button" class="mega-item" style="--i:${k}" ${itemAct(it)}><span class="mega-ic">${ic(it.i)}</span><span class="min-w-0 flex-1"><b class="block text-[15px] leading-snug">${esc(L(it.t))}</b><span class="block text-[13px] text-muted leading-snug mt-0.5">${esc(L(it.d))}</span></span><span class="mega-go">${ic(it.href ? 'arrow-up-right' : 'arrow-right', 'w-4 h-4')}</span></button>`).join('')}</div>
    <div class="col-span-4 mega-feat" style="--i:${m.items.length}">${feat}</div></div>`;
}
let megaTimer = null, megaOpen = -1, hoverOpen = false;
const NAV_EASE = 'cubic-bezier(.22, 1, .36, 1)';
function setupNav() {
  const nav = $('#navbar'); if (!nav) return;
  const mega = $('#mega'), card = $('.mega-card', mega), body = $('.mega-body', mega), caret = $('.mega-caret', mega), pill = $('#nav-pill');
  let pillOn = false;
  /* Шингэн тодруулга: шинэ зүйл рүү шилжихдээ эхлээд хоёуланг нь хамрах хүртэл сунаж, дараа нь хумигдана */
  const pillTo = (btn) => {
    if (!btn) { pill.style.opacity = '0'; pillOn = false; return; }
    const x = btn.parentElement.offsetLeft, w = btn.offsetWidth;
    const cs = getComputedStyle(pill), x0 = new DOMMatrixReadOnly(cs.transform === 'none' ? undefined : cs.transform).m41, w0 = parseFloat(cs.width) || w;
    pill.getAnimations().forEach((a) => a.cancel());
    pill.style.width = w + 'px'; pill.style.transform = `translateX(${x}px)`;
    if (pillOn && !reduced && Math.abs(x0 - x) > 1) {
      const l = Math.min(x0, x), r = Math.max(x0 + w0, x + w);
      // 1) 200мс: хоёуланг нь бүрхтэл сунана  2) 280мс: шинэ байрлалдаа зөөлөн хумигдана
      pill.animate([
        { transform: `translateX(${x0}px)`, width: w0 + 'px', easing: 'cubic-bezier(.45, 0, .25, 1)' },
        { transform: `translateX(${l}px)`, width: r - l + 'px', offset: 0.42, easing: NAV_EASE },
        { transform: `translateX(${x}px)`, width: w + 'px' },
      ], { duration: 480 });
    }
    pill.style.opacity = '1'; pillOn = true;
  };
  const placeCaret = (btn) => { const r = btn.getBoundingClientRect(), m = mega.getBoundingClientRect(); caret.style.transform = `translateX(${Math.round(r.left + r.width / 2 - m.left - 7)}px) rotate(45deg)`; };
  const open = (i, byHover) => {
    clearTimeout(megaTimer);
    if (megaOpen === i) { if (!byHover) hoverOpen = false; return; }
    const prev = megaOpen, btn = $(`.nav-btn[data-menu="${i}"]`, nav);
    hoverOpen = !!byHover; megaOpen = i;
    if (prev < 0) {
      body.innerHTML = megaHTML(i);
      caret.style.transition = 'none'; placeCaret(btn); void caret.offsetWidth; caret.style.transition = '';
      mega.classList.add('open');
    } else {   // нээлттэй үед өөр цэс рүү: өндөр нь зөөлөн өөрчлөгдөж, агуулга чиглэлээрээ гулсана
      const h0 = card.offsetHeight; body.innerHTML = megaHTML(i); const h1 = card.offsetHeight;
      if (!reduced) {
        const dir = i > prev ? 1 : -1;
        card.animate([{ height: h0 + 'px' }, { height: h1 + 'px' }], { duration: 380, easing: NAV_EASE });
        body.animate([{ opacity: 0, transform: `translateX(${dir * 26}px)` }, { opacity: 1, transform: 'none' }], { duration: 380, easing: NAV_EASE });
      }
      placeCaret(btn);
    }
    $$('.nav-btn', nav).forEach((b) => b.setAttribute('aria-expanded', String(+b.dataset.menu === i)));
    pillTo(btn);
  };
  const close = () => { megaOpen = -1; mega.classList.remove('open'); $$('.nav-btn', nav).forEach((b) => b.setAttribute('aria-expanded', 'false')); pillTo(null); };
  nav._close = close; nav._moveInd = () => { if (megaOpen < 0) pillTo(null); };
  nav.addEventListener('mouseover', (e) => { const b = e.target.closest('.nav-btn'); if (b) open(+b.dataset.menu, true); else if (e.target.closest('#mega')) clearTimeout(megaTimer); });
  nav.addEventListener('mouseleave', () => { megaTimer = setTimeout(close, 160); });
  nav.addEventListener('click', (e) => { const b = e.target.closest('.nav-btn'); if (b) { const i = +b.dataset.menu; if (megaOpen === i && !hoverOpen) close(); else open(i, false); } else if (e.target.closest('[data-act="go"], [data-act="ext-link"]')) close(); });
  nav.addEventListener('focusout', (e) => { if (!nav.contains(e.relatedTarget)) close(); });
  /* Курсорын байрлалд хүрээ гэрэлтэнэ (.dock::before) */
  nav.addEventListener('pointermove', (e) => { const r = nav.getBoundingClientRect(); nav.style.setProperty('--mx', Math.round(e.clientX - r.left) + 'px'); nav.style.setProperty('--my', Math.round(e.clientY - r.top) + 'px'); });
  megaOpen = -1; dockProgress();
}
/* Алхан хээ хуудсыг гүйлгэх тусам өнгөөр дүүрнэ (нүүр хуудсанд) */
let dockRaf = 0;
function dockProgress() {
  const n = $('#navbar'); if (!n) return;
  const h = document.documentElement.scrollHeight - innerHeight, w = n.offsetWidth;
  n.style.setProperty('--prog', S.route === 'home' && h > 0 ? Math.min(1, Math.max(0, scrollY / h)).toFixed(4) : '0');
  n.style.setProperty('--gx', Math.round((scrollY * 0.45) % (w + 480) - 240) + 'px');   // шилэн дээгүүр гулсах туяа: гүйлгэх тусам зүүнээс баруун тийш
  // Adaptive glass: цэсийн доорх хэсэг бараан бол шил бараан, бичиг цагаан болно
  let dark = false;
  if (n.classList.contains('stuck')) { const r = n.getBoundingClientRect(); dark = isDarkBg(document.elementFromPoint(r.left + r.width / 2, r.bottom + 8)); }
  n.classList.toggle('on-dark', dark);
}
function isDarkBg(el) {   // хамгийн ойрын тунгалаг бус дэвсгэрийн гэрэлтэлт
  for (; el && el !== document.documentElement; el = el.parentElement) {
    const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
    if (m && (m.length < 4 || +m[3] > 0.5)) return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 < 0.42;
  }
  return false;
}
window.addEventListener('scroll', () => { if (!dockRaf) dockRaf = requestAnimationFrame(() => { dockRaf = 0; dockProgress(); }); }, { passive: true });
function setActiveNav(sec) {
  const map = { hero: 1, hub: S.hub === 'services' ? 0 : 1, situations: 0, media: 1, projects: 2, data: 3, events: 1, transparency: 4, about: 5 };
  const idx = map[sec];
  $$('.nav-btn').forEach((b) => b.classList.toggle('is-active', +b.dataset.menu === idx && sec !== 'hero'));
  const nav = $('#navbar'); if (nav && megaOpen < 0 && nav._moveInd) nav._moveInd($('.nav-btn.is-active', nav));
  const bb = { hero: 'home', hub: S.hub === 'services' ? 'services' : 'news', situations: 'services', media: 'news', events: 'news' }[sec] || 'home';
  $$('.bb-item').forEach((b) => b.setAttribute('aria-current', String(S.route === 'my' ? b.dataset.bb === 'my' : b.dataset.bb === bb)));
}

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
    <div class="grid grid-cols-1 gap-2"><button type="button" class="cta-pill cta-red !h-12 justify-center" data-act="report"><span class="cta-pill-ic">${animIcon('siren', 'w-5 h-5')}</span>${t('cta_report')}</button><button type="button" class="cta-pill cta-blue !h-12 justify-center" data-act="vote"><span class="cta-pill-ic">${animIcon('vote', 'w-5 h-5')}</span>${t('cta_vote')}</button></div>${CMS.canEdit ? `<button type="button" class="btn btn-ghost w-full" data-act="admin">${ic('pencil-line', 'w-[18px] h-[18px]')}${L(['Сайтыг засах', 'Edit site'])}</button>` : ''}
    <div class="divide-y divide-line border-y border-line">${MENU.map((m, i) => `<div><button type="button" class="w-full h-14 flex items-center justify-between font-bold text-[16px]" data-act="acc" data-i="${i}" aria-expanded="false">${menuLabel(m)}${ic('chevron-down', 'w-5 h-5 transition-transform')}</button><div class="hidden pb-3 space-y-1" data-acc="${i}">${m.items.map((it) => `<button type="button" class="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-soft text-left" ${itemAct(it)}><span class="w-9 h-9 rounded-lg bg-soft grid place-items-center text-ubred">${ic(it.i, 'w-[18px] h-[18px]')}</span><span class="text-[14.5px] font-semibold">${esc(L(it.t))}</span></button>`).join('')}</div></div>`).join('')}</div>
    <div class="flex items-center justify-between gap-2"><div class="flex items-center gap-2">${langToggle(false)}${themeBtn(false)}${a11yBtn()}</div>${S.user ? `<button type="button" class="btn btn-sm btn-ghost" data-act="my">${t('myCorner')}</button>` : `<button type="button" class="btn btn-sm btn-ink" data-act="login">${ic('fingerprint', 'w-4 h-4')}${t('login')}</button>`}</div></div></div>`;
  document.body.appendChild(wrap);
  document.body.style.overflow = 'hidden';
  wrap.addEventListener('mousedown', (e) => { if (e.target === wrap) closeMenu(); });
  requestAnimationFrame(() => wrap.classList.add('open'));
}
function closeMenu() { const m = $('#mmenu'); if (!m) return; m.classList.remove('open'); if (!MODAL) document.body.style.overflow = ''; setTimeout(() => m.remove(), 380); }

/* ================= Search (command palette) ================= */
let SQ = { q: '', idx: 0, items: [], scope: 'all' };
const SQ_SCOPES = [['all', ['Бүгд', 'All'], 'search'], ['svc', ['Үйлчилгээ', 'Services'], 'layout-grid'], ['sit', ['Амьдралын нөхцөл', 'Life events'], 'route'], ['news', ['Мэдээ', 'News'], 'newspaper'], ['proj', ['Төсөл', 'Projects'], 'hard-hat'], ['ev', ['Арга хэмжээ', 'Events'], 'calendar-days']];
const SQ_TYPE = { act: ['bg-ubred/10 text-ubred', ['Шуурхай үйлдэл', 'Quick actions']], svc: ['bg-ubblue/10 text-ubblue', ['Үйлчилгээ', 'Services']], sit: ['bg-ubred/10 text-ubred', ['Амьдралын нөхцөл', 'Life events']], news: ['bg-ubamber/15 text-amberink', ['Мэдээ', 'News']], proj: ['bg-ubgreen/15 text-greenink', ['Төсөл', 'Projects']], ev: ['bg-soft text-ink', ['Арга хэмжээ', 'Events']] };
const SQ_ACTS = [['report', ['Эрсдэл мэдээлэх', 'Report a hazard'], 'siren', 'эрсдэл мэдээлэх нүх эвдрэл гэрэлтүүлэг хог гоожсон аюул report hazard pothole'], ['vote', ['Санал өгөх', 'Have your say'], 'vote', 'санал асуулга хүсэлт vote poll suggestion'], ['my', ['Миний булан', 'My page'], 'circle-user-round', 'миний булан хүсэлт төлбөр хороо my page requests payments'], ['chat', ['AI туслахаас асуух', 'Ask the AI assistant'], 'sparkles', 'ai туслах асуух чат chat assistant help'], ['data', ['Агаарын чанар, түгжрэл', 'Air quality and traffic'], 'activity', 'агаар aqi утаа түгжрэл цаг агаар air traffic weather']];
const SQ_POP = [['Хүүхдийн мөнгө', 'Child benefit'], ['Халуун ус', 'Hot water'], ['Тендер', 'Tender'], ['Цэцэрлэг', 'Kindergarten'], ['Дүүжин зам', 'Cable car']];
function searchIndex() {
  const out = [];
  SQ_ACTS.forEach(([id, tt, i, kw]) => out.push({ type: 'act', id, t: tt, m: kw, sub: L(['Шуурхай үйлдэл', 'Quick action']), i }));
  ALL_SVC.forEach((s) => out.push({ type: 'svc', id: s.id, t: s.t, m: s.d[0] + ' ' + s.d[1], sub: L(s.d), i: s.i }));
  SITS.forEach((s) => out.push({ type: 'sit', id: s.id, t: s.t, m: s.steps.map((x) => x.t[0] + ' ' + x.t[1]).join(' '), sub: t('stepsN', { n: s.steps.length }), i: s.i }));
  NEWS.forEach((n) => out.push({ type: 'news', id: n.id, t: n.t, m: fill(n.l[0]) + ' ' + (n.l[1] || ''), sub: `${L((RUB[n.cat] || RUB.city).t)}${n.ts ? ', ' + fDate(n.ts) : ''}`, i: n.zar ? 'megaphone' : 'newspaper' }));
  PROJECTS.forEach((p) => out.push({ type: 'proj', id: p.id, t: p.n, m: PCAT[p.c].t[0] + ' ' + PCAT[p.c].t[1], sub: `${L(PCAT[p.c].t)}, ${p.p}%`, i: PCAT[p.c].i }));
  EVENTS.forEach((e) => out.push({ type: 'ev', id: e.id, t: e.t, m: e.v[0] + ' ' + e.v[1], sub: `${fDate(evDate(e.w), true)}, ${L(e.v)}`, i: 'calendar-days' }));
  return out;
}
function searchResults(q) {
  const words = q.trim().toLowerCase().split(/\s+/).filter(Boolean); if (!words.length) return [];
  const order = ['act', 'svc', 'sit', 'news', 'proj', 'ev'];
  return searchIndex().map((x) => {
    const title = (x.t[0] + ' ' + x.t[1]).toLowerCase(), hay = title + ' ' + String(x.m).toLowerCase();
    if (!words.every((w) => hay.includes(w))) return null;
    const lt = L(x.t).toLowerCase(); x.score = (lt.startsWith(words[0]) ? 3 : 0) + (words.every((w) => title.includes(w)) ? 2 : 0); return x;
  }).filter(Boolean).sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type) || b.score - a.score);
}
function sqHl(text, q) {
  const s = String(text), low = s.toLowerCase(), marks = [];
  q.trim().toLowerCase().split(/\s+/).filter(Boolean).forEach((w) => { let i = low.indexOf(w); while (i >= 0) { marks.push([i, i + w.length]); i = low.indexOf(w, i + w.length); } });
  if (!marks.length) return esc(s);
  marks.sort((a, b) => a[0] - b[0]); const mm = [];
  marks.forEach((m) => { const last = mm[mm.length - 1]; if (last && m[0] <= last[1]) last[1] = Math.max(last[1], m[1]); else mm.push(m.slice()); });
  let out = '', pos = 0; mm.forEach(([a, b]) => { out += esc(s.slice(pos, a)) + `<mark class="sq-mark">${esc(s.slice(a, b))}</mark>`; pos = b; });
  return out + esc(s.slice(pos));
}
const sqRecent = () => store.get('recentQ', []);
function sqAddRecent(q) { q = String(q || '').trim(); if (q.length < 2) return; store.set('recentQ', [q].concat(sqRecent().filter((x) => x !== q)).slice(0, 5)); }
function sqScopes() {
  const all = SQ.q.trim() ? searchResults(SQ.q) : [], cnt = {}; all.forEach((x) => { cnt[x.type] = (cnt[x.type] || 0) + 1; });
  return SQ_SCOPES.map(([v, l, i]) => { const n = v === 'all' ? all.length : cnt[v] || 0; return `<button type="button" class="chip !h-8 !px-3 !text-[13px] shrink-0" data-act="sq-scope" data-v="${v}" aria-pressed="${SQ.scope === v}">${ic(i, 'w-4 h-4')}${esc(L(l))}${SQ.q.trim() ? `<span class="tnum opacity-60">${n}</span>` : ''}</button>`; }).join('');
}
const sqHead = (txt) => `<p class="px-2 pt-3 pb-2 text-[12.5px] font-bold text-muted">${txt}</p>`;
function searchBody() {
  const q = SQ.q.trim();
  if (!q) {
    SQ.items = [];
    const rec = sqRecent(), top = ['c2', 'c3', 'c4', 'c8'].map((id) => ALL_SVC.find((s) => s.id === id)).filter(Boolean);
    return `${rec.length ? `${sqHead(L(['Сүүлийн хайлт', 'Recent']))}<div class="flex flex-wrap gap-2 px-2">${rec.map((r) => `<span class="chip !h-8 !pl-3 !pr-1 !text-[13px]"><button type="button" class="inline-flex items-center gap-1.5" data-act="sq" data-v="${esc(r)}">${ic('history', 'w-4 h-4 text-muted')}${esc(r)}</button><button type="button" class="w-6 h-6 grid place-items-center rounded-full hover:bg-soft text-muted" data-act="sq-recent-del" data-v="${esc(r)}" aria-label="${esc(L(['Устгах', 'Remove']))}">${ic('x', 'w-3.5 h-3.5')}</button></span>`).join('')}</div>` : ''}
      ${sqHead(L(['Түгээмэл үйлчилгээ', 'Popular services']))}<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 px-2">${top.map((s) => `<button type="button" class="flex items-center gap-3 p-3 rounded-xl border border-line text-left hover:bg-soft hover:border-ink/20 transition-colors" data-act="sgo" data-type="svc" data-id="${s.id}"><span class="w-9 h-9 rounded-lg bg-ubblue/10 text-ubblue grid place-items-center shrink-0">${ic(s.i, 'w-[18px] h-[18px]')}</span><span class="min-w-0"><b class="block text-[14px] truncate">${esc(L(s.t))}</b><span class="block text-[12.5px] text-muted truncate">${s.m === 'off' ? t('inperson') : s.m === 'sys' ? t('system') : t('online')}</span></span></button>`).join('')}</div>
      ${sqHead(L(['Түгээмэл хайлт', 'Popular searches']))}<div class="flex flex-wrap gap-2 px-2">${SQ_POP.map((p) => `<button type="button" class="chip !h-8 !text-[13px]" data-act="sq" data-v="${esc(L(p))}">${ic('trending-up', 'w-4 h-4 text-muted')}${esc(L(p))}</button>`).join('')}</div>
      ${sqHead(L(['Шуурхай үйлдэл', 'Quick actions']))}<div class="grid grid-cols-2 gap-2 px-2 pb-2">${SQ_ACTS.slice(0, 4).map(([v, l, i], k) => `<button type="button" class="flex items-center gap-2.5 min-h-[44px] py-2 px-3 rounded-xl text-[13.5px] font-semibold text-left transition-colors ${k === 0 ? 'bg-ubred/10 text-ubred hover:bg-ubred/15' : k === 1 ? 'bg-ubblue/10 text-ubblue hover:bg-ubblue/15' : 'bg-soft hover:bg-line'}" data-act="sgo" data-type="act" data-id="${v}">${ic(i, 'w-[18px] h-[18px]')}<span class="leading-tight">${esc(L(l))}</span></button>`).join('')}</div>`;
  }
  const all = searchResults(q), list = (SQ.scope === 'all' ? all : all.filter((x) => x.type === SQ.scope)).slice(0, 24);
  SQ.items = list; if (SQ.idx >= list.length) SQ.idx = 0;
  if (!list.length) {
    return `<div class="py-10 px-4 text-center sq-in"><span class="w-14 h-14 mx-auto rounded-2xl bg-soft grid place-items-center text-muted">${ic('search-x', 'w-7 h-7')}</span><p class="mt-4 font-bold text-[16px]">${L([`«${esc(q)}» гэсэн хайлтаар илэрц олдсонгүй`, `No results for "${esc(q)}"`])}</p><p class="mt-1 text-[14px] text-muted">${all.length && SQ.scope !== 'all' ? L(['Бусад ангилалд илэрц байна, «Бүгд»-ийг сонгоно уу.', 'There are matches in other categories; choose "All".']) : L(['Өөр үгээр хайх эсвэл AI туслахаас асууж болно.', 'Try other words, or ask the AI assistant.'])}</p><button type="button" class="btn btn-ink mt-5" data-act="sq-ai">${ic('sparkles', 'w-[18px] h-[18px]')}${L(['AI туслахаас асуух', 'Ask the AI assistant'])}</button></div>`;
  }
  let g = '', html = '';
  list.forEach((x, k) => {
    if (x.type !== g) { g = x.type; html += sqHead(`${esc(L(SQ_TYPE[g][1]))} <span class="tnum font-semibold">${all.filter((y) => y.type === g).length}</span>`); }
    html += `<button type="button" class="sq-row sq-in" style="animation-delay:${Math.min(k * 14, 160)}ms" data-act="sgo" data-type="${x.type}" data-id="${esc(x.id)}" data-k="${k}" aria-selected="${k === SQ.idx}"><span class="w-10 h-10 rounded-xl grid place-items-center shrink-0 ${SQ_TYPE[x.type][0]}">${ic(x.i, 'w-5 h-5')}</span><span class="min-w-0 flex-1"><b class="block text-[15px] leading-snug truncate">${sqHl(L(x.t), q)}</b><span class="block text-[13px] text-muted truncate">${sqHl(x.sub, q)}</span></span><span class="sq-enter hidden sm:inline-flex items-center gap-1 text-[12px] text-muted">${L(['Нээх', 'Open'])}<span class="sq-kbd">↵</span></span></button>`;
  });
  return html;
}
function sqRender() { const sc = $('#sscope'), rs = $('#sres'), cl = $('#sq-clear'); if (sc) sc.innerHTML = sqScopes(); if (rs) { rs.innerHTML = searchBody(); rs.scrollTop = 0; } if (cl) cl.classList.toggle('hidden', !SQ.q); }
function sqMark() { $$('#sres [data-k]').forEach((b) => b.setAttribute('aria-selected', String(+b.dataset.k === SQ.idx))); const cur = $(`#sres [data-k="${SQ.idx}"]`); if (cur) cur.scrollIntoView({ block: 'nearest' }); }
function sqMove(d) { const n = SQ.items.length; if (!n) return; SQ.idx = (SQ.idx + d + n) % n; sqMark(); }
function openSearch(q = '') {
  closeMenu();
  SQ = { q, idx: 0, items: [], scope: 'all' };
  openModal({ size: 'search', top: true, label: t('search'), render: () => `<div class="sticky top-0 z-10 bg-card">
      <div class="flex items-center gap-3 px-4 sm:px-5 h-16 border-b border-line">${ic('search', 'w-[22px] h-[22px] text-ubblue')}<input data-autofocus id="sq" type="search" value="${esc(SQ.q)}" placeholder="${esc(t('searchPh'))}" class="sq-input flex-1 min-w-0 h-full bg-transparent text-[17px] sm:text-[18px] font-semibold placeholder:text-muted/70 placeholder:font-medium" autocomplete="off" spellcheck="false" aria-label="${esc(t('search'))}"/>
        <button type="button" id="sq-clear" class="${SQ.q ? '' : 'hidden'} w-8 h-8 grid place-items-center rounded-full bg-soft hover:bg-line text-muted" data-act="sq-clear" aria-label="${esc(L(['Арилгах', 'Clear']))}">${ic('x', 'w-4 h-4')}</button>
        <button type="button" class="sm:hidden text-[15px] font-semibold text-ubblue px-1" data-act="modal-close">${L(['Болих', 'Cancel'])}</button><span class="hidden sm:inline-flex"><button type="button" class="sq-kbd !h-7 !px-2" data-act="modal-close" aria-label="${esc(t('close'))}">Esc</button></span></div>
      <div id="sscope" class="flex gap-1.5 overflow-x-auto no-scrollbar px-4 sm:px-5 py-2.5 border-b border-line">${sqScopes()}</div></div>
    <div id="sres" class="p-2 sm:p-3 sm:max-h-[min(520px,58vh)] overflow-auto thin-scroll">${searchBody()}</div>
    <div class="hidden sm:flex items-center gap-5 px-5 py-2.5 border-t border-line text-[12px] text-muted"><span class="inline-flex items-center gap-1.5"><span class="sq-kbd">↑</span><span class="sq-kbd">↓</span>${L(['сонгох', 'move'])}</span><span class="inline-flex items-center gap-1.5"><span class="sq-kbd">↵</span>${L(['нээх', 'open'])}</span><span class="inline-flex items-center gap-1.5"><span class="sq-kbd">Esc</span>${L(['хаах', 'close'])}</span><span class="ml-auto inline-flex items-center gap-1.5">${L(['Хаанаас ч', 'Anywhere'])}<span class="sq-kbd">Ctrl</span><span class="sq-kbd">K</span></span></div>`,
    after: (sh) => {
      const inp = $('#sq', sh);
      inp.addEventListener('input', () => { SQ.q = inp.value; SQ.idx = 0; sqRender(); });
      $('#sres', sh).addEventListener('mousemove', (e) => { const r = e.target.closest('[data-k]'); if (r && +r.dataset.k !== SQ.idx) { SQ.idx = +r.dataset.k; $$('#sres [data-k]').forEach((b) => b.setAttribute('aria-selected', String(b === r))); } });
      setTimeout(() => { try { inp.focus(); } catch (e) { /* ignore */ } }, 60);
    } });
}
function sqAct(v) {
  if (v === 'report') openReport(); else if (v === 'vote') openVote(); else if (v === 'my') setRoute('my');
  else if (v === 'chat') toggleChat(true); else go({ sec: 'data', hl: 'aqi' });
}
function searchGo(type, id) {
  sqAddRecent(SQ.q);
  closeModal(true);
  if (type === 'act') sqAct(id);
  else if (type === 'svc') { const s = ALL_SVC.find((x) => x.id === id); if (!s) return; go({ sec: 'hub', hub: 'services', svc: s.g }); setTimeout(() => openService(id), 450); }
  else if (type === 'sit') go({ sec: 'situations', sit: id });
  else if (type === 'news') openNews(id);
  else if (type === 'proj') go({ sec: 'projects', pid: id });
  else if (type === 'ev') go({ sec: 'events', ev: id });
}

/* ================= Routing & scroll ================= */
function setRoute(r) {
  if (r === 'my' && !S.user) { openLogin(() => setRoute('my')); return; }
  const was = S.route; S.route = r;
  document.body.classList.toggle('admin-mode', r === 'admin');
  $('#view-home').hidden = r !== 'home'; $('#view-my').hidden = r !== 'my'; $('#view-admin').hidden = r !== 'admin'; $('#view-news').hidden = r !== 'news';
  if (was === 'news' && r !== 'news') document.title = siteTitle();
  if (r === 'my') { renderMy(); window.scrollTo(0, 0); setHash('my'); }
  else if (r === 'admin') { renderAdmin(); window.scrollTo(0, 0); setHash(admHash()); }
  else if (r === 'news') { renderNewsPage(); window.scrollTo(0, 0); }
  else {
    if (PRETTY && location.pathname !== '/') { try { history.pushState(null, '', '/'); } catch (e) { /* ignore */ } }   // /news/<id>-ээс нүүр рүү: "Буцах" дарахад мэдээ рүүгээ буцна
    else if (/^#(my|admin|news\/)/.test(location.hash)) setHash('');
    if (was === 'admin') renderAll(); else initTabs($('#view-home'));
    if (was === 'news' && S.homeY != null) window.scrollTo(0, S.homeY);   // мэдээнээс буцахад нүүрний байрлалаа сэргээнэ
  }
  if (r !== 'news') renderSeason(false);   // улирлын эффект зөвхөн мэдээ унших хуудсанд (if/else гинжийн ГАДНА)
  setActiveNav(r === 'my' ? 'my' : r === 'news' ? 'hub' : 'hero');
}
function headerOffset() { const nav = $('#hdr-nav'), band = $('#hdr-band'); const h = innerWidth >= 1024 ? (nav ? nav.offsetHeight : 60) : (band ? band.offsetHeight : 56); return h + 14; }
function scrollToSec(id) {
  const el = document.getElementById(id); if (!el) return;
  const y = id === 'hero' ? 0 : el.getBoundingClientRect().top + window.scrollY - headerOffset();
  window.scrollTo({ top: Math.max(0, y), behavior: reduced ? 'auto' : 'smooth' });
}
function go(o) {
  closeMenu();
  if (MODAL) closeModal(true);
  const nav = $('#navbar'); if (nav && nav._close) nav._close();
  if (S.route !== 'home') setRoute('home');
  if (o.hub && o.hub !== S.hub) { if (o.svc) S.svcTab = o.svc; if (o.cat) S.newsCat = o.cat; setHub(o.hub); }
  else { if (o.svc && o.svc !== S.svcTab) setSvcTab(o.svc); if (o.cat && o.cat !== S.newsCat) setNewsCat(o.cat); }
  if (o.sit && o.sit !== S.sit) setSit(o.sit);
  if (o.tr && o.tr !== S.tr) setTr(o.tr);
  scrollToSec(o.sec || 'hero'); setHash(o.sec || 'hero');
  if (o.pid) setTimeout(() => selectProject(o.pid, true), 520);
  if (o.ev) setTimeout(() => { if (S.evView !== 'list') setEvView('list'); setTimeout(() => flashEl($(`[data-evcard="${o.ev}"]`)), 420); }, 520);
  if (o.hl) setTimeout(() => flashEl($(`[data-card="${o.hl}"]`)), 680);
  if (o.focus === 'map') setTimeout(() => { const m = $('#proj-map .map-vp'); if (m) m.focus({ preventScroll: true }); }, 650);
}
function flashEl(el) { if (!el) return; el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); }
