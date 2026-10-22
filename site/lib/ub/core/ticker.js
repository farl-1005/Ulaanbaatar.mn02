import { SET } from './cms.js';
import { reduced } from './helpers.js';
import { HOME } from './home.js';
import { L, S, t } from './state.js';
import { Lf } from './time.js';
import { ALERTS } from '../data/alerts.js';
/* ================= Ticker ================= */
/* Яаралтай мэдээллийн капсулыг site/app/chrome/Ticker.tsx зурна (#ticker дотор): мэдээлэл нэг нэгээр дээш гулсан солигдож,
   доод зураас дараагийнх хүртэлх хугацааг харуулна. Хулганаар заах / фокуслах / «түр зогсоох» үед зогсоно (идэвхтэй мэдээ, түр зогсоох төлвийг Ticker.tsx барина).
   Хөдөлгөөн багасгах ба a11y горимд автоматаар солигдохгүй. Хаах: features/wiring.js 'ticker-close' (S.tickerOn = false → renderReact()). */
export function tickerData() {
  if (!S.tickerOn || SET.tickerOn === false || !ALERTS.length) return null;
  const n = ALERTS.length;
  return {
    auto: n > 1 && !reduced && !S.a11y, urgent: t('urgent'), role: L(['ээлжилсэн мэдээлэл', 'carousel']),
    prev: L(['Өмнөх', 'Previous']), next: L(['Дараах', 'Next']), pause: L(['Түр зогсоох', 'Pause']), dismiss: t('dismiss'),
    items: ALERTS.map((a) => ({ id: a.id, i: a.i, k: L(a.k), t: Lf(a.t) })),
  };
}
HOME.ticker = tickerData;
