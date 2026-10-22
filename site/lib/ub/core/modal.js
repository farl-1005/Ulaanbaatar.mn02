import { REACT, renderReact } from './bridge.js';
import { reduced } from './helpers.js';
/* ================= Modal / toast ================= */
export let MODAL = null;
/* Цонхыг site/app/ui/Modal.tsx (React) зурна: бүрхүүл, гулсах хөдөлгөөн, гадна дарж хаах, фокус.
   Агуулга: o.view = React цонхны нэр (site/app/modals/index.tsx MODALS), o.props = түүний утгууд. */
export const SIZES = { sm: 'sm:max-w-md', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl', media: 'sheet-media', search: 'sm:max-w-2xl max-sm:h-full max-sm:max-h-none' };
export let MODAL_N = 0;
export function openModal(o) {
  closeModal(true);
  MODAL = { id: ++MODAL_N, cls: SIZES[o.size || 'lg'], top: !!o.top, label: o.label || '', view: o.view, props: o.props || {}, onClose: o.onClose, prev: document.activeElement, sheet: null };
  document.body.style.overflow = 'hidden';
  renderReact();
}
/* Нээлттэй цонхыг шинэ төлөвөөр дахин зурна (keepScroll: гүйлгэсэн байрлалаа хадгална) */
export function paintModal(keepScroll) {
  if (!MODAL) return;
  const sh = MODAL.sheet, st = sh ? sh.scrollTop : 0;
  renderReact();
  if (sh && keepScroll) sh.scrollTop = st;
}
export function closeModal(immediate) {
  if (!MODAL) return;
  const m = MODAL; MODAL = null;
  m.immediate = !!(immediate || reduced);   // React хаах хөдөлгөөнгүйгээр шууд арилгана
  if (m.onClose) m.onClose();
  if (!REACT.menu) document.body.style.overflow = '';
  renderReact();
  if (m.prev && m.prev.focus && document.contains(m.prev)) try { m.prev.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
}
/* Богино мэдэгдэл (доод талд): site/app/ui/Toaster.tsx зурна */
export const TOASTS = [];
export let TOAST_N = 0;
export function toast(msg, icon = 'circle-check') {
  const tt = { id: ++TOAST_N, msg, icon, out: false };
  TOASTS.push(tt); renderReact();
  setTimeout(() => { tt.out = true; renderReact(); setTimeout(() => { TOASTS.splice(TOASTS.indexOf(tt), 1); renderReact(); }, 260); }, 2700);
}
