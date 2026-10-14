/* ================= Modal / toast ================= */
let MODAL = null;
const SIZES = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl', media: 'sheet-media', search: 'sm:max-w-2xl max-sm:h-full max-sm:max-h-none' };
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

