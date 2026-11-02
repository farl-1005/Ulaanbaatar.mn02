import { $ } from '../core/helpers.js';
import { HOME } from '../core/home.js';
import { openModal } from '../core/modal.js';
import { L, S, parseUB, t } from '../core/state.js';
import { Lf, ago, fDate, hhmm } from '../core/time.js';
import { ALERTS } from '../data/alerts.js';
import { GOV } from '../data/news.js';
/* ================= Мэдээ уншилтын явц, Засаг даргын мэдээ, яаралтай мэдээллийн цонх ================= */
/** Мэдээ унших хуудасны дээд талын уншилтын явцын зураас (#nprog, #nbody: site/app/views/NewsView.tsx) */
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
/** Анхааруулгын хугацаа: admin-д эхлэх, дуусах огноо (from, to) эсвэл хуучин текст (when) */
export function alertPeriod(a) {
  const f = parseUB(a.from), to = parseUB(a.to), fmt = (d) => fDate(d) + ', ' + hhmm(d);
  if (f && to) return fmt(f) + ' – ' + fmt(to);
  if (f) return L(['Эхлэх: ', 'From ']) + fmt(f);
  if (to) return L(['Дуусах: ', 'Until ']) + fmt(to);
  return Lf(a.when);
}
HOME.alertModal = (id) => {
  const a = ALERTS.find((x) => x.id === id); if (!a) return null;
  return { title: L(a.k), sub: t('urgent'), i: a.i, notify: t('notify'), rows: [[t('affected'), 'map-pin', Lf(a.area)], [t('period'), 'clock-3', alertPeriod(a)], [t('advice'), 'lightbulb', Lf(a.adv)]].filter((r) => r[2]) };   // хоосон мөрийг харуулахгүй
};
