import { mapBaseSVG } from '../art/scene.js';
import { esc, ic, reduced } from '../core/helpers.js';
import { t } from '../core/state.js';
/* ================= Map view (schematic, clustered) ================= */
export const MAPS = {};
export class MapView {
  constructor(host, o) {
    this.o = o; this.k = 1; this.tx = 0; this.ty = 0; this.sel = o.sel || null; this.markers = []; this.sig = ''; this.ptrs = new Map();
    host.innerHTML = `<div class="map-vp w-full h-full" tabindex="0" role="application" aria-label="${esc(t('schematic'))}"><svg viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g data-g>${mapBaseSVG()}</g></svg><div class="mk-layer"></div>
      <div class="absolute right-3 top-3 flex flex-col gap-1.5 z-[7]"><button type="button" class="icon-btn card !rounded-xl shadow-md hover:bg-soft" data-z="in" aria-label="${esc(t('zoomIn'))}">${ic('plus')}</button><button type="button" class="icon-btn card !rounded-xl shadow-md hover:bg-soft" data-z="out" aria-label="${esc(t('zoomOut'))}">${ic('minus')}</button><button type="button" class="icon-btn card !rounded-xl shadow-md hover:bg-soft" data-z="reset" aria-label="${esc(t('resetMap'))}">${ic('locate-fixed')}</button></div>
      <div class="map-hint z-[8]"><span class="px-4 py-2 rounded-xl bg-black/60 text-[14px]">${t('zoomHint')}</span></div></div>`;
    this.vp = host.firstElementChild; this.g = this.vp.querySelector('[data-g]'); this.layer = this.vp.querySelector('.mk-layer'); this.hint = this.vp.querySelector('.map-hint');
    this.labels = Array.from(this.g.querySelectorAll('[data-fs]'));
    this.measure(); this.apply(); this.recluster(true); this.bind();
    if ('ResizeObserver' in window) { this.ro = new ResizeObserver(() => { const w = this.W, h = this.H; this.measure(); if (Math.abs(w - this.W) > 1 || Math.abs(h - this.H) > 1) { this.clamp(); this.apply(); this.recluster(true); } }); this.ro.observe(this.vp); }
  }
  destroy() { if (this.ro) this.ro.disconnect(); cancelAnimationFrame(this.raf); }
  measure() { const r = this.vp.getBoundingClientRect(), ow = this.vp.offsetWidth; this.z = ow && r.width ? r.width / ow : 1; this.W = ow || 800; this.H = this.vp.offsetHeight || 500; this.s0 = Math.max(this.W / 1000, this.H / 620); this.ox = (this.W - 1000 * this.s0) / 2; this.oy = (this.H - 620 * this.s0) / 2; }
  toScreen(x, y) { return [this.ox + this.s0 * (this.tx + this.k * x), this.oy + this.s0 * (this.ty + this.k * y)]; }
  toMap(sx, sy) { return [((sx - this.ox) / this.s0 - this.tx) / this.k, ((sy - this.oy) / this.s0 - this.ty) / this.k]; }
  clamp() {
    const w = this.s0 * this.k * 1000, h = this.s0 * this.k * 620;
    let l = this.ox + this.s0 * this.tx; l = w <= this.W ? (this.W - w) / 2 : Math.min(0, Math.max(this.W - w, l)); this.tx = (l - this.ox) / this.s0;
    let tp = this.oy + this.s0 * this.ty; tp = h <= this.H ? (this.H - h) / 2 : Math.min(0, Math.max(this.H - h, tp)); this.ty = (tp - this.oy) / this.s0;
  }
  apply() {
    this.g.setAttribute('transform', `translate(${this.tx.toFixed(2)} ${this.ty.toFixed(2)}) scale(${this.k.toFixed(4)})`);
    for (const l of this.labels) l.setAttribute('font-size', (l.dataset.fs / this.k).toFixed(2));
    for (const m of this.markers) { if (!m.el) continue; const [sx, sy] = this.toScreen(m.x, m.y); m.el.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)`; }
    this.vp.classList.toggle('zoomed', this.k > 1.05);
  }
  zoomTo(k2, sx, sy) { k2 = Math.max(1, Math.min(7, k2)); const [mx, my] = this.toMap(sx, sy); this.k = k2; this.tx = (sx - this.ox) / this.s0 - k2 * mx; this.ty = (sy - this.oy) / this.s0 - k2 * my; this.clamp(); this.apply(); }
  zoomAt(f, sx, sy) { const k2 = Math.max(1, Math.min(7, this.k * f)), [mx, my] = this.toMap(sx, sy); this.animateTo(k2, (sx - this.ox) / this.s0 - k2 * mx, (sy - this.oy) / this.s0 - k2 * my); }
  centerOn(x, y, k) { const k2 = Math.max(this.k, k || 2.4); this.animateTo(k2, (this.W / 2 - this.ox) / this.s0 - k2 * x, (this.H / 2 - this.oy) / this.s0 - k2 * y); }
  animateTo(k2, tx2, ty2) {
    const from = [this.k, this.tx, this.ty]; this.k = k2; this.tx = tx2; this.ty = ty2; this.clamp(); const to = [this.k, this.tx, this.ty]; [this.k, this.tx, this.ty] = from;
    cancelAnimationFrame(this.raf);
    if (reduced) { [this.k, this.tx, this.ty] = to; this.apply(); this.recluster(); return; }
    const t0 = performance.now(), dur = 440;
    const step = (tm) => { const p = Math.min(1, (tm - t0) / dur), e = 1 - Math.pow(1 - p, 3); this.k = from[0] + (to[0] - from[0]) * e; this.tx = from[1] + (to[1] - from[1]) * e; this.ty = from[2] + (to[2] - from[2]) * e; this.apply(); if (p < 1) this.raf = requestAnimationFrame(step); else this.recluster(); };
    this.raf = requestAnimationFrame(step);
  }
  select(id, pan) { this.sel = id; if (id && pan) { const p = this.o.points().find((q) => q.id === id); if (p) { this.centerOn(p.x, p.y, 2.6); return; } } this.recluster(true); }
  showHint() { this.hint.classList.add('show'); clearTimeout(this.ht); this.ht = setTimeout(() => this.hint.classList.remove('show'), 1100); }
  recluster(force) {
    const pts = this.o.points(), R = 46, used = new Set(), groups = [];
    const scr = pts.map((p) => { const [sx, sy] = this.toScreen(p.x, p.y); return { p, sx, sy }; });
    for (const a of scr) {
      if (used.has(a.p.id)) continue; used.add(a.p.id); const g = [a];
      if (this.o.cluster !== false) for (const b of scr) { if (!used.has(b.p.id) && Math.hypot(a.sx - b.sx, a.sy - b.sy) < R) { used.add(b.p.id); g.push(b); } }
      groups.push(g);
    }
    const sig = groups.map((g) => g.map((x) => x.p.id).join('+')).join('|') + '#' + this.sel;
    if (!force && sig === this.sig) return;
    const anim = this.sig !== ''; this.sig = sig; this.markers = [];
    let html = '';
    for (const g of groups) {
      if (g.length > 1) {
        const x = g.reduce((s, q) => s + q.p.x, 0) / g.length, y = g.reduce((s, q) => s + q.p.y, 0) / g.length, v = Math.round(g.reduce((s, q) => s + (q.p.v || 0), 0) / g.length);
        this.markers.push({ x, y }); html += `<div class="mk"><button type="button" class="cluster ${anim ? 'mk-in' : ''}" style="--p:${v}" data-cl="1" data-x="${x}" data-y="${y}" aria-label="${g.length}"><span>${g.length}</span></button></div>`;
      } else {
        const p = g[0].p; this.markers.push({ x: p.x, y: p.y });
        html += `<div class="mk"><button type="button" class="pin ${p.id === this.sel ? 'sel' : ''} ${anim ? 'mk-in' : ''}" style="--c:${p.c}" data-pin="${p.id}" aria-label="${esc(p.label || p.id)}"><span class="pin-head">${ic(p.i || 'map-pin', 'w-4 h-4', 2.2)}</span>${p.tag ? `<span class="pin-tag tnum">${esc(p.tag)}</span>` : ''}</button></div>`;
      }
    }
    const selP = this.sel && pts.find((p) => p.id === this.sel);
    if (selP && this.o.popup) {
      if (this.W < 560) html += `<div class="absolute left-3 right-3 bottom-3 z-[9] pointer-events-auto">${this.o.popup(this.sel)}</div>`;
      else if (groups.some((g) => g.length === 1 && g[0].p.id === this.sel)) { this.markers.push({ x: selP.x, y: selP.y }); html += `<div class="mk z-[9]"><div class="mpop">${this.o.popup(this.sel)}</div></div>`; }
    }
    this.layer.innerHTML = html;
    const els = this.layer.querySelectorAll('.mk'); this.markers.forEach((m, i) => { m.el = els[i]; });
    this.apply();
  }
  bind() {
    const vp = this.vp;
    vp.addEventListener('click', (e) => {
      const z = e.target.closest('[data-z]');
      if (z) { if (z.dataset.z === 'in') this.zoomAt(1.6, this.W / 2, this.H / 2); else if (z.dataset.z === 'out') this.zoomAt(1 / 1.6, this.W / 2, this.H / 2); else this.animateTo(1, 0, 0); return; }
      const cl = e.target.closest('[data-cl]');
      if (cl) { const [sx, sy] = this.toScreen(+cl.dataset.x, +cl.dataset.y); this.zoomAt(2.2, sx, sy); return; }
      const pin = e.target.closest('[data-pin]');
      if (pin && this.o.onSelect) this.o.onSelect(pin.dataset.pin);
    });
    vp.addEventListener('pointerdown', (e) => {
      if (e.button > 0 || e.target.closest('button, .mpop')) return;
      this.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.ptrs.size === 1) this.drag = { x: e.clientX, y: e.clientY, tx: this.tx, ty: this.ty, moved: false };
      else if (this.ptrs.size === 2) { const [a, b] = Array.from(this.ptrs.values()); this.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, k: this.k }; }
      try { vp.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    });
    vp.addEventListener('pointermove', (e) => {
      if (!this.ptrs.has(e.pointerId)) return;
      this.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (this.ptrs.size === 2 && this.pinch) { const [a, b] = Array.from(this.ptrs.values()), r = vp.getBoundingClientRect(); this.zoomTo(this.pinch.k * Math.hypot(a.x - b.x, a.y - b.y) / this.pinch.d, ((a.x + b.x) / 2 - r.left) / this.z, ((a.y + b.y) / 2 - r.top) / this.z); return; }
      if (!this.drag) return;
      const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
      if (!this.drag.moved && Math.hypot(dx, dy) < 5) return;
      this.drag.moved = true; vp.classList.add('dragging');
      this.tx = this.drag.tx + dx / this.z / this.s0; this.ty = this.drag.ty + dy / this.z / this.s0; this.clamp(); this.apply();
    });
    const end = (e) => {
      if (!this.ptrs.has(e.pointerId)) return;
      this.ptrs.delete(e.pointerId);
      if (this.pinch && this.ptrs.size < 2) { this.pinch = null; this.drag = null; this.recluster(); }
      if (this.ptrs.size === 0) {
        const d = this.drag; this.drag = null; vp.classList.remove('dragging');
        if (d && !d.moved && e.type === 'pointerup' && this.o.onPick) { const r = vp.getBoundingClientRect(); const [mx, my] = this.toMap((e.clientX - r.left) / this.z, (e.clientY - r.top) / this.z); this.o.onPick(Math.max(5, Math.min(995, mx)), Math.max(5, Math.min(615, my))); }
      }
    };
    vp.addEventListener('pointerup', end); vp.addEventListener('pointercancel', end);
    vp.addEventListener('wheel', (e) => {
      if (!(e.ctrlKey || e.metaKey)) { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) this.showHint(); return; }
      e.preventDefault(); const r = vp.getBoundingClientRect();
      this.zoomTo(this.k * (e.deltaY < 0 ? 1.12 : 1 / 1.12), (e.clientX - r.left) / this.z, (e.clientY - r.top) / this.z);
      clearTimeout(this.wt); this.wt = setTimeout(() => this.recluster(), 120);
    }, { passive: false });
    vp.addEventListener('dblclick', (e) => { if (e.target.closest('button, .mpop')) return; const r = vp.getBoundingClientRect(); this.zoomAt(1.8, (e.clientX - r.left) / this.z, (e.clientY - r.top) / this.z); });
    vp.addEventListener('keydown', (e) => {
      if (e.target !== vp) return;
      const st = 50 / this.s0;
      if (e.key === '+' || e.key === '=') this.zoomAt(1.5, this.W / 2, this.H / 2);
      else if (e.key === '-') this.zoomAt(1 / 1.5, this.W / 2, this.H / 2);
      else if (e.key.indexOf('Arrow') === 0) { if (e.key === 'ArrowLeft') this.tx += st; if (e.key === 'ArrowRight') this.tx -= st; if (e.key === 'ArrowUp') this.ty += st; if (e.key === 'ArrowDown') this.ty -= st; this.clamp(); this.apply(); }
      else return;
      e.preventDefault();
    });
  }
}

