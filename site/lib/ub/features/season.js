import { SET } from '../core/cms.js';
import { $, reduced } from '../core/helpers.js';
import { HOME } from '../core/home.js';
import { openModal } from '../core/modal.js';
import { L, S, t } from '../core/state.js';
import { Lf, ago, ubNow } from '../core/time.js';
import { ALERTS } from '../data/alerts.js';
import { GOV } from '../data/news.js';
/* ================= Улирлын эффект (мэдээ унших хуудсанд): навч, цас, дэлбээ, алтан тоосонцор =================
   Хуудасны дэвсгэр дээр, мэдээний картуудын АРД унана (текстийг дардаггүй). Admin → Тохиргоо → «Улирлын эффект». */
export const SEASON_L = { auto: ['Автомат', 'Auto'], spring: ['Хавар', 'Spring'], summer: ['Зун', 'Summer'], autumn: ['Намар', 'Autumn'], winter: ['Өвөл', 'Winter'], off: ['Унтраах', 'Off'] };
export const SEASON_IC = { auto: 'calendar', spring: 'flower-2', summer: 'sun', autumn: 'leaf', winter: 'snowflake', off: 'circle-off' };
export function seasonByDate() { const m = ubNow().getMonth(); return m >= 2 && m <= 4 ? 'spring' : m >= 5 && m <= 7 ? 'summer' : m >= 8 && m <= 10 ? 'autumn' : 'winter'; }
export function seasonNow() { const s = (SET && SET.season) || 'auto'; return s === 'auto' ? seasonByDate() : s; }
export function renderSeason(on) {
  let el = $('#season');
  const s = on && !reduced && !S.a11y ? seasonNow() : 'off';
  if (s === 'off' || !SEASON_L[s]) { if (el) { el.innerHTML = ''; el.dataset.season = 'off'; } return; }
  if (!el) { el = document.createElement('div'); el.id = 'season'; el.setAttribute('aria-hidden', 'true'); document.body.prepend(el); }
  if (el.dataset.season === s && el.childElementCount) return;   // ижил улирал бол хөдөлгөөнийг дахин эхлүүлэхгүй
  el.dataset.season = s; el.className = 'season-' + s;
  // өргөн дэлгэцэнд 75% нь контентын (1140px) хоёр хажуугийн хоосон зайд: картын ард нуугдаж үрэгдэхгүй
  const m = Math.max(0, ((innerWidth - 1140) / 2 / innerWidth) * 100);
  el.innerHTML = seasonFlakes(s, 0, () => (m > 4 && Math.random() < 0.75 ? (Math.random() < 0.5 ? Math.random() * m : 100 - Math.random() * m) : Math.random() * 100).toFixed(1));
}
/* Улирлын тоосонцор (навч, цас, дэлбээ, алтан тоосонцор): #season болон мэдээний жагсаалтын .ssn-fx-д. n = тоо (0 бол анхдагч) */
export function seasonFlakes(s, n, xPos) {
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const leafA = (c, d) => `<svg viewBox="0 0 24 24"><path d="M12 1.5C6.5 6 4.2 10.4 5.2 15c.9 4 3.9 6.4 6.8 7.5 2.9-1.1 5.9-3.5 6.8-7.5 1-4.6-1.3-9-6.8-13.5z" fill="${c}"/><path d="M12 4v18M12 10l-3.2-2.4M12 14l3.4-2.6M12 17.5l-3-2.2" stroke="${d}" stroke-width=".9" stroke-linecap="round" fill="none"/></svg>`;
  const leafB = (c, d) => `<svg viewBox="0 0 24 24"><path d="M12 1.8l1.6 4.4 3.6-2.2-.8 4.6 4.4-.6-2.6 3.6 3 1.6-4.4 1.4.6 2.6-3.8-1.2L12 22l-1.6-5.8-3.8 1.2.6-2.6-4.4-1.4 3-1.6-2.6-3.6 4.4.6-.8-4.6 3.6 2.2z" fill="${c}"/><path d="M12 21.5V7" stroke="${d}" stroke-width=".9" stroke-linecap="round"/></svg>`;
  const autumn = [['#FACC15', '#A16207'], ['#F4B400', '#B07D00'], ['#FBBF24', '#B45309'], ['#EAB308', '#854D0E'], ['#FDE047', '#A16207'], ['#F59E0B', '#B45309'], ['#EA580C', '#9A3412']];   // голдуу шар, цөөн улбар
  const cfg = {   // [тоо, унах(с), найгах далайц(px), найгах(с), хэмжээ(px), эргэх(с), дүрс]
    autumn: [18, [14, 26], [30, 90], [3, 6], [16, 30], [3, 7], () => { const [c, d] = pick(autumn); return Math.random() < 0.55 ? leafA(c, d) : leafB(c, d); }],
    winter: [42, [10, 20], [12, 40], [3, 6], [3, 8], [4, 8], () => '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="currentColor"/></svg>'],   // өнгө: styles/07-effects.css (цайвар горимд цэнхэрдүү, харанхуйд цагаан)
    spring: [16, [16, 28], [40, 100], [3, 7], [10, 18], [3, 6], () => `<svg viewBox="0 0 24 24"><path d="M12 2c3.6 3.4 5 8.2 0 20-5-11.8-3.6-16.6 0-20z" fill="${pick(['#F9A8D4', '#F472B6', '#FBCFE8', '#FDA4AF', '#F9A8D4'])}"/></svg>`],
    summer: [22, [18, 30], [20, 60], [4, 8], [3, 6], [2, 4], () => '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#FFD45C"/></svg>'],
  }[s];
  if (!cfg) return '';
  const r = (a) => (a[0] + Math.random() * (a[1] - a[0])).toFixed(1);
  return Array.from({ length: n || cfg[0] }, () => {
    const t = r(cfg[1]);
    return `<span class="sf" style="--x:${xPos()}%;--t:${t}s;--dl:${(-Math.random() * t).toFixed(1)}s"><span class="sw" style="--sw:${r(cfg[2])}px;--st:${r(cfg[3])}s"><span class="lf" style="--s:${r(cfg[4])}px;--r:${r(cfg[5])}s;--a0:${Math.round(Math.random() * 360)}deg;--a1:${Math.round(Math.random() * 360 + 180)}deg;--ry:${Math.round(Math.random() * 120 + 60)}deg">${cfg[6]()}</span></span></span>`;
  }).join('');
}
/* ---- Мэдээний жагсаалтын улирлын хэсэг: картуудын ард унах тоосонцор + доод талд модтой ландшафт ----
   Хүрээг (.ssn-wrap) site/app/home/Hub.tsx зурна (hubData().season: улирал, тоосонцор харуулах эсэх). Улирал: seasonNow() (admin «Улирлын эффект», анхдагч нь огноогоор).
   Хөдөлгөөн хаасан үед мод хөдлөхгүй, тоосонцор гарахгүй. */
HOME.seasonFlakes = (s) => seasonFlakes(s, { autumn: 22, winter: 40, spring: 20, summer: 22 }[s], () => (Math.random() * 100).toFixed(1));
HOME.seasonTrees = (s) => seasonTrees(s);
/* Тоосонцор хэсгийн бүтэн өндрөөр унахын тулд --fall-ийг өндөртэй нь тааруулна ("Цааш үзэх", ангилал солиход ч) */
export const SSN_RO = 'ResizeObserver' in window ? new ResizeObserver((es) => es.forEach((e) => {
  const h = e.contentRect.height; e.target.style.setProperty('--fall', Math.round(h + 80) + 'px');
  e.target.style.setProperty('--k', Math.max(1, h / 1100).toFixed(2));   // урт жагсаалтад удаан унана (хурд ижил)
})) : null;
/* .ssn-wrap-ийг ажиглаж эхэлнэ; буцаах функц нь ажиглалтыг зогсооно (React useEffect) */
HOME.seasonObserve = (el) => { if (!SSN_RO || !el) return () => {}; SSN_RO.observe(el); return () => SSN_RO.unobserve(el); };
/* Модтой ландшафт (SVG, 2400×160, дэлгэцийн бүтэн өргөнөөр): ар талын жижиг, бүдэг мөр + урд мөр. Нарс (p), навчит мод (d), хус (b). Улирал бүрт нэг удаа зурна. */
export const SSN_TREES = {};
export function seasonTrees(s) {
  if (SSN_TREES[s]) return SSN_TREES[s];
  const P = {
    spring: { hill: '#D6EFC7', ground: '#AEDD92', crown: ['#A3DB7F', '#86C866', '#C6EBA8'], pine: ['#3E7D57', '#2F6747'], dot: ['#F9A8D4', '#FFFFFF', '#FBCFE8'] },
    summer: { hill: '#C3E6B4', ground: '#86C873', crown: ['#4CAF50', '#2E8B45', '#7BC86C'], pine: ['#2F6F4E', '#24583D'], dot: ['#5FA84F', '#4A9440'] },
    autumn: { hill: '#F3E3B5', ground: '#DDBD72', crown: ['#F4B400', '#EA8A0C', '#FBD34D'], pine: ['#D9A21B', '#B7841A'], dot: ['#F4B400', '#EA8A0C', '#C2410C', '#FBD34D'] },
    winter: { hill: '#E3EBF7', ground: '#F5F8FD', crown: null, pine: ['#2F5F4A', '#244B3A'], dot: ['#DCE6F5'] },
  }[s];
  let seed = 11;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }, pick = (a) => a[Math.floor(rnd() * a.length)];
  const f = (n) => Math.round(n * 10) / 10, TR = '#7A5A3C', W = 2400;   // өргөн: 2560px хүртэлх дэлгэцэнд модны орой тасрахгүй
  const gy = (x) => 134 + 5 * Math.sin(x / 140) + 3 * Math.sin(x / 47), hy = (x) => 114 + 7 * Math.sin(x / 190 + 1) + 4 * Math.sin(x / 63);
  const snowy = s === 'winter', c = P.crown;
  const shape = (type) => {
    if (type === 'p') {   // нарс / шинэс (намар шаргална)
      const tiers = [[-62, -40, 11], [-50, -24, 15], [-36, -6, 19]];
      return `<rect x="-2" y="-8" width="4" height="8" fill="${TR}"/><path d="${tiers.map(([t, b, w]) => `M0 ${t}L${-w} ${b}L${w} ${b}Z`).join('')}" fill="${P.pine[0]}"/><path d="${tiers.map(([t, b, w]) => `M0 ${t}L${w} ${b}L0 ${b}Z`).join('')}" fill="${P.pine[1]}"/>`
        + (snowy ? `<path d="${tiers.map(([t, b, w]) => `M0 ${t}L${f(-w * 0.5)} ${f(t + (b - t) * 0.5)}L${f(w * 0.5)} ${f(t + (b - t) * 0.5)}Z`).join('')}" fill="#FFFFFF"/>` : '');
    }
    if (type === 'b') {   // хус: цагаан их бие
      const body = `<path d="M-1.8 0L-1.3 -34L1.3 -34L1.8 0Z" fill="#F4F1EA"/><path d="M-1.6 -8h1.6M.2 -15h1.4M-1.4 -22h1.2M0 -28h1.2" stroke="#3B3B3B" stroke-width="1"/>`;
      if (!c) return body + '<path d="M0 -24Q-7 -32 -9 -42M0 -28Q6 -36 8 -46M0 -32Q-2 -42 -1 -52" stroke="#CFC8B8" stroke-width="1.2" fill="none" stroke-linecap="round"/>';
      return body + `<ellipse cx="0" cy="-44" rx="11" ry="17" fill="${s === 'autumn' ? '#FACC15' : c[0]}"/><ellipse cx="3" cy="-40" rx="7.5" ry="12" fill="${s === 'autumn' ? '#EAB308' : c[1]}" opacity=".85"/>`;
    }
    const trunk = `<path d="M-2.4 0L-1.6 -28L1.6 -28L2.4 0Z" fill="${TR}"/>`;   // навчит мод
    if (!c) return trunk + `<path d="M0 -14L-10 -30M0 -20L9 -38M0 -26L-3 -48M-5 -24L-14 -28M4 -30L13 -33" stroke="${TR}" stroke-width="1.6" stroke-linecap="round" fill="none"/><path d="M-12 -31h4M7 -39h4M-5 -49h4" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>`;
    const dots = s === 'spring' ? Array.from({ length: 6 }, () => `<circle cx="${f(rnd() * 30 - 15)}" cy="${f(-30 - rnd() * 26)}" r="1.7" fill="${pick(P.dot)}"/>`).join('') : '';
    const col = () => (s === 'autumn' ? pick(c.slice(0, 2)) : c[1]);
    return trunk + `<circle cx="-11" cy="-34" r="12" fill="${col()}"/><circle cx="11" cy="-36" r="13" fill="${col()}"/><circle cx="0" cy="-46" r="16" fill="${c[0]}"/><circle cx="-5" cy="-51" r="7" fill="${c[2]}" opacity=".85"/>${dots}`;
  };
  const row = (y, k0, kd, step, cls) => { let out = '', x = 10 + rnd() * 30; while (x < W - 5) { const type = rnd() < 0.36 ? 'p' : rnd() < 0.6 ? 'd' : 'b', k = k0 + rnd() * kd; out += `<g class="ssn-tree${cls}" style="--sd:${f(5 + rnd() * 4)}s;--sdl:-${f(rnd() * 6)}s"><g transform="translate(${f(x)} ${f(y(x))}) scale(${f(k)})">${shape(type)}</g></g>`; x += step[0] + rnd() * step[1]; } return out; };
  const ground = Array.from({ length: s === 'summer' ? 80 : 68 }, () => { const x = rnd() * W, y = gy(x) + 3 + rnd() * 20;
    return s === 'summer' ? `<path d="M${f(x)} ${f(y)}l-2 -5M${f(x)} ${f(y)}l0 -6M${f(x)} ${f(y)}l2 -5" stroke="${pick(P.dot)}" stroke-width="1.2" stroke-linecap="round"/>`
      : s === 'winter' ? `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(6 + rnd() * 10)}" ry="1.4" fill="${P.dot[0]}" opacity=".7"/>`
      : `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${s === 'spring' ? 1.5 : 2.4}" ry="${s === 'spring' ? 1.5 : 1.2}" fill="${pick(P.dot)}" transform="rotate(${Math.round(rnd() * 180)} ${f(x)} ${f(y)})"/>`; }).join('');
  const wave = (yf) => { let d = `M0 160L0 ${f(yf(0))}`; for (let x = 20; x <= W; x += 20) d += `L${x} ${f(yf(x))}`; return `${d}L${W} 160Z`; };
  return (SSN_TREES[s] = `<svg class="ssn-land" viewBox="0 0 ${W} 160" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">`
    + `<path d="${wave(hy)}" fill="${P.hill}"/><g opacity=".55">${row(hy, 0.48, 0.18, [34, 46], ' ssn-far')}</g>`
    + `<path d="${wave(gy)}" fill="${P.ground}"/>${ground}${row(gy, 0.82, 0.5, [62, 74], '')}</svg>`);
}
export function newsProgress() {
  const bar = $('#nprog'), a = $('#nbody'); if (!bar || !a || S.route !== 'news') return;
  const r = a.getBoundingClientRect(), total = r.height - innerHeight * 0.6;
  bar.style.transform = `scaleX(${Math.min(1, Math.max(0, total > 0 ? -r.top / total : 1))})`;
}
/* Засаг даргын мэдээ, яаралтай мэдээллийн цонхыг site/app/modals/Info.tsx зурна (Gov, Alert) */
export function openGov(i) {
  if (!GOV[i]) return;
  openModal({ size: 'md', view: 'Gov', props: { i } });
}
HOME.govModal = (i) => {
  const g = GOV[i]; if (!g) return null;
  return { head: t('govNews'), role: t('govRole'), ago: ago(g.ago), title: L(g.t), lead: L(g.l), letter: t('govLetter') };
};
export function openAlert(id) {
  const a = ALERTS.find((x) => x.id === id); if (!a) return;
  openModal({ size: 'md', view: 'Alert', props: { id } });
}
HOME.alertModal = (id) => {
  const a = ALERTS.find((x) => x.id === id); if (!a) return null;
  return { title: L(a.k), sub: t('urgent'), i: a.i, notify: t('notify'), rows: [[t('affected'), 'map-pin', Lf(a.area)], [t('period'), 'clock-3', Lf(a.when)], [t('advice'), 'lightbulb', Lf(a.adv)]] };
};
