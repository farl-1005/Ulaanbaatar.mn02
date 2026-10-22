import { $, $$, esc, ic, reduced } from './helpers.js';
import { num } from './time.js';
/* ================= Motion helpers ================= */
export const swapIds = new WeakMap();
export async function swap(el, html, dir, after) {
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
export function tabs(name, items, active, opts = {}) {
  const kind = opts.line ? 'uline' : 'seg';
  return `<div class="${kind} ${opts.lg ? 'seg-lg' : ''} ${opts.cls || ''}" role="tablist" data-tablist="${name}" aria-label="${esc(opts.label || '')}"><span class="${opts.line ? 'uline-bar' : 'seg-pill'}" data-pill></span>${items.map(([v, label, icn]) => `<button type="button" class="${opts.line ? 'uline-btn' : 'seg-btn'}" role="tab" data-act="tab" data-tabs="${name}" data-v="${v}" aria-selected="${v === active}" tabindex="${v === active ? 0 : -1}">${icn ? ic(icn, 'w-[18px] h-[18px]') : ''}<span>${esc(label)}</span></button>`).join('')}</div>`;
}
export function placePill(list, animate) {
  if (!list) return;
  const pill = list.querySelector('[data-pill]'), btn = list.querySelector('[aria-selected="true"]');
  if (!pill || !btn) return;
  if (!animate) list.classList.remove('ready');
  pill.style.width = btn.offsetWidth + 'px';
  pill.style.transform = `translateX(${btn.offsetLeft}px)`;
  if (!animate) requestAnimationFrame(() => requestAnimationFrame(() => list.classList.add('ready')));
}
export function initTabs(root = document) { $$('[data-tablist]', root).forEach((l) => placePill(l, false)); }
export function selectTab(name, v) {
  const list = $(`[data-tablist="${name}"]`); if (!list) return;
  $$('[data-tabs]', list).forEach((b) => { const on = b.dataset.v === v; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
  placePill(list, true);
  const btn = list.querySelector('[aria-selected="true"]');
  if (btn && list.scrollWidth > list.clientWidth + 2) list.scrollTo({ left: btn.offsetLeft - list.clientWidth / 2 + btn.offsetWidth / 2, behavior: reduced ? 'auto' : 'smooth' });
}
export function chips(act, items, active, dark) {
  return items.map(([v, label, dot]) => `<button type="button" class="chip ${dark ? 'chip-dark' : ''}" data-act="${act}" data-v="${v}" aria-pressed="${v === active}">${dot ? `<i class="w-2 h-2 rounded-full" style="background:${dot}"></i>` : ''}${esc(label)}</button>`).join('');
}
export function observeOnce(el, fn, threshold = .25) {
  if (!el) return;
  if (!('IntersectionObserver' in window)) { fn(el); return; }
  const io = new IntersectionObserver((es) => { es.forEach((e) => { if (e.isIntersecting) { io.disconnect(); fn(el); } }); }, { threshold });
  io.observe(el);
}
export function countUp(el, to, dur = 1400) {
  if (!el) return;
  if (reduced) { el.textContent = num(to); return; }
  const t0 = performance.now();
  const step = (tm) => { const p = Math.min(1, (tm - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.textContent = num(to * e); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
export function ring(p, size, stroke, color, extra = '') {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - p / 100);
  return `<svg viewBox="0 0 ${size} ${size}" class="-rotate-90 ${extra}" style="width:${size}px;height:${size}px" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgb(var(--c-line))" stroke-width="${stroke}"/><circle class="ring-fg" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}"/></svg>`;
}

