import { renderReact } from '../core/bridge.js';
import { $, reduced, store } from '../core/helpers.js';
import { HOME } from '../core/home.js';
import { L, S, t } from '../core/state.js';
import { SITS } from '../data/services.js';
/* ================= Life events ================= */
/* «Амьдралын нөхцөл» хэсгийг site/app/home/Situations.tsx зурна (нүүрэнд товч сүлжээ, /services хуудсанд жагсаалт + алхмууд).
   Төлөв: S.sit (сонгосон нөхцөл), S.sitDone (хийсэн алхмууд, хөтчид хадгална). SIT: сүүлийн өөрчлөлтийн хөдөлгөөнд хэрэгтэй мэдээлэл. */
export const SIT = { dir: 0, pop: null };
export function sitsData() {
  const d = S.sitDone[S.sit] || [];
  return {
    sit: S.sit, dir: SIT.dir, pop: SIT.pop,
    list: SITS.map((s) => ({
      id: s.id, i: s.i, title: L(s.t), done: (S.sitDone[s.id] || []).length, n: s.steps.length,
      sub: t('stepsOnline', { n: s.steps.length, o: s.steps.filter((x) => x.m === 'on').length }),
    })),
    steps: (SITS.find((x) => x.id === S.sit) || { steps: [] }).steps.map((x, i) => ({ title: L(x.t), desc: L(x.d), time: L(x.tm), m: x.m, done: d.includes(i) })),
  };
}
HOME.sits = sitsData;
/* Алхмын төлөв өөрчлөгдсөний дараа дахин зурна (popIdx: шинээр хийгдсэн алхмын тэмдэг «check-pop» хөдөлгөөнтэй).
   Явцын зураас өмнөх өргөнөөсөө шинэ өргөн рүү Situations.tsx-д өөрөө гулсана. */
export function paintSit(prev, popIdx) {
  SIT.pop = popIdx != null ? popIdx : null;
  renderReact();
}
export function setSit(id) {
  if (!SITS.find((s) => s.id === id)) return;
  const order = SITS.map((s) => s.id);
  SIT.dir = order.indexOf(id) >= order.indexOf(S.sit) ? 1 : -1; SIT.pop = null;
  S.sit = id; renderReact();
}
export function toggleStep(i, forceDone) {
  const prev = (S.sitDone[S.sit] || []).slice(), was = prev.includes(i);
  let d = prev.slice();
  if (forceDone) { if (!was) d.push(i); } else d = was ? d.filter((x) => x !== i) : d.concat(i);
  S.sitDone[S.sit] = d; store.set('sitDone', S.sitDone);
  paintSit(prev, d.includes(i) && !was ? i : null);
  const n = SITS.find((s) => s.id === S.sit).steps.length;
  if (d.length === n && prev.length < n) confetti($('#sit-card'));
}
export function confetti(host) {
  if (!host || reduced) return;
  const cols = ['#D81E34', '#145095', '#FFC524', '#10A36A'];
  for (let k = 0; k < 40; k++) { const c = document.createElement('i'); c.className = 'confetti'; c.style.left = 8 + Math.random() * 84 + '%'; c.style.background = cols[k % 4]; c.style.setProperty('--dx', Math.random() * 180 - 90 + 'px'); c.style.setProperty('--rot', Math.random() * 720 - 360 + 'deg'); c.style.animationDelay = Math.random() * 0.3 + 's'; host.appendChild(c); setTimeout(() => c.remove(), 2200); }
}
