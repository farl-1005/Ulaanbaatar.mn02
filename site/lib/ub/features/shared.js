import { esc, ic, store } from '../core/helpers.js';
import { S, t } from '../core/state.js';
import { today } from '../core/time.js';
import { ME } from '../data/my-page.js';
import { renderMy } from './my-page.js';
/* ================= Shared ================= */
/* Нээлттэй цонхны үйлдлүүд (wiring.js дууддаг). Солихдоо resetMS({...}) */
export const MS = {};
export function resetMS(o) { Object.keys(MS).forEach((k) => { delete MS[k]; }); Object.assign(MS, o); }
export let currentSec = 'hero';
export function setCurrentSec(v) { currentSec = v; }
export const RAGENCY = { pothole: ['Нийслэлийн Авто замын газар', 'City Roads Department'], light: ['Гэрэлтүүлгийн алба', 'Street Lighting Office'], waste: ['Дүүргийн Тохижилтын алба', 'District Services Office'], water: ['Ус сувгийн удирдах газар', 'Water Supply and Sewerage Authority'], building: ['Онцгой байдлын газар', 'Emergency Management Agency'], other: ['Нийслэлийн Засаг даргын Тамгын газар', 'City Hall'], service: ['Иргэний үйлчилгээний төв', 'City service centre'] };
export const NOTE_NEW = ['Хүлээн авлаа. 30 минутын дотор хариуцах байгууллагад шилжинэ.', 'Received. It will be routed within 30 minutes.'];
export function debounce(fn, ms) { let tm; return (...a) => { clearTimeout(tm); tm = setTimeout(() => fn(...a), ms); }; }
export function endOfMonth() { const d = today(); return new Date(d.getFullYear(), d.getMonth() + 1, 0); }
export const newReqId = () => 'UB-2026-' + (48400 + Math.floor(Math.random() * 500));
export function addRequest(cat, ttl, place) {
  const id = newReqId();
  S.requests.unshift({ id, cat, st: 0, ago: 0, ttl, place: place || ME.addr, ag: RAGENCY[cat] || RAGENCY.other, note: NOTE_NEW });
  store.set('requests', S.requests);
  if (S.route === 'my') renderMy();
  return id;
}
export const closeBtnImg = () => `<button type="button" class="absolute right-3 top-3 icon-btn bg-black/45 text-white hover:bg-black/60 backdrop-blur" data-act="modal-close" aria-label="${esc(t('close'))}">${ic('x')}</button>`;

