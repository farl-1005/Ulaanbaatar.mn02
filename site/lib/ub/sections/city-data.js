import { wxDir, wxInfo, wxT } from '../core/header.js';
import { esc } from '../core/helpers.js';
import { HOME } from '../core/home.js';
import { countUp } from '../core/motion.js';
import { EN, L, S, t } from '../core/state.js';
import { EN_WD, MN_WDS, POL, addDays, aqiCat, clock, fDate, hhmm, num, pad, pm25, today, ubNow } from '../core/time.js';
import { AQI_PROFILE, BUDGET_Q, FORECAST, POP, ROADS } from '../data/city-stats.js';
/* ================= City data ================= */
/* AQI 24 цаг: IQAir-ийн бодит хэмжилт (серверийн air_log, цагаар дундажлана; хэмжилтгүй цаг хоосон) эсвэл түлхүүргүй үед жишээ муруй */
export function aqiSeries() {
  if (S.air && S.air.live) {
    const HR = 3600e3, end = Math.floor(Date.now() / HR) * HR;
    return Array.from({ length: 24 }, (_, i) => {
      const st = end - (23 - i) * HR, pts = (S.air.series || []).filter(([ts]) => ts >= st && ts < st + HR).map((x) => x[1]);
      if (i === 23) pts.push(S.aqi);
      return { hr: new Date(st + 8 * HR).getUTCHours(), v: pts.length ? Math.round(pts.reduce((x, y) => x + y, 0) / pts.length) : null };
    });
  }
  const h = ubNow().getHours(), shift = S.aqi - AQI_PROFILE[h];
  return Array.from({ length: 24 }, (_, i) => { const hr = (h - 23 + i + 24) % 24; return { hr, v: Math.max(15, Math.round(AQI_PROFILE[hr] + shift * (i / 23))) }; });
}
export function aqiPaths() {
  const d = aqiSeries(), vals = d.map((x) => x.v).filter((v) => v != null), top = Math.max(200, Math.ceil(Math.max(0, ...vals) / 100) * 100);   // утаатай өдөр шкал өөрөө томорно
  const W = 600, H = 200, X = (i) => (i / 23) * W, Y = (v) => H - (Math.min(v, top) / top) * H;
  const idx = d.map((x, i) => (x.v == null ? -1 : i)).filter((i) => i >= 0);
  let p = '';
  idx.forEach((i, k) => {
    const x1 = X(i), y1 = Y(d[i].v);
    if (!k) { p = `M${x1.toFixed(1)} ${y1.toFixed(1)}`; return; }
    const j = idx[k - 1], x0 = X(j), y0 = Y(d[j].v), cx = (x0 + x1) / 2;
    p += ` C${cx.toFixed(1)} ${y0.toFixed(1)} ${cx.toFixed(1)} ${y1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  });
  const ok = idx.length > 1;
  return { d, p: ok ? p : '', area: ok ? p + ` L${X(idx[idx.length - 1])} ${H} L${X(idx[0])} ${H} Z` : '', Y, top, n: idx.length };
}
/* Эх сурвалжийн тэмдэглэгээ: IQAir (хэмжилт) эсвэл Open-Meteo (CAMS загвар, CC BY 4.0) */
export function airSrcHTML() {
  const a = S.air || {}, om = '<a href="https://open-meteo.com/" target="_blank" rel="noopener" class="underline underline-offset-2 hover:text-ink">Open-Meteo</a> · CAMS';
  if (a.src === 'iqair') return `${L(['Эх сурвалж', 'Source'])}: <a href="https://www.iqair.com/mongolia/ulaanbaatar" target="_blank" rel="noopener" class="underline underline-offset-2 hover:text-ink">IQAir</a>${a.pol || a.seriesSrc === 'openmeteo' ? ' + ' + om : ''}`;
  return `${L(['Эх сурвалж', 'Source'])}: ${om}`;
}
/* AQI 24 цагийн графикийн өгөгдөл (зураас, бүс, шугам, цаг; хулганаар заахад цэг бүрийн утга) */
export function aqiChartData() {
  const { d, p, area, Y, top, n } = aqiPaths(), pc = (v) => (Y(v) / 200) * 100;
  const bands = [[0, 50, '#10A36A'], [50, 100, '#E5A800'], [100, 150, '#F08C1A'], [150, 200, '#D81E34'], [200, 300, '#8F3F97'], [300, 500, '#7E0023']].filter(([a]) => a < top).map(([a, b, c]) => [a, Math.min(b, top), c]);
  const live = S.air && S.air.live;
  return {
    p, area, now: pc(S.aqi),
    bands: bands.map(([a, b, c]) => ({ y: Y(b), h: Y(a) - Y(b), c })),
    marks: [50, 100, 150, 200, 300].filter((v) => v < top).map((v) => ({ v, y: Y(v), top: pc(v) })),
    pts: d.map((x) => { if (x.v == null) return null; const c = aqiCat(x.v); return { hr: pad(x.hr) + ':00', v: x.v, top: pc(x.v), label: t(c.k), c: c.c }; }),
    hours: d.map((x, i) => ({ i, hr: pad(x.hr) + ':00' })).filter((x) => x.i % 4 === 3),
    foot: live ? { note: n < 24 && S.air.seriesSrc === 'iqair' ? L([`IQAir хэмжилт хуримтлагдаж байна: ${n}/24 цаг`, `Collecting IQAir readings: ${n}/24 hours`]) : '', src: airSrcHTML() } : null,
  };
}
/* ================= «Амьд хот»: эргэлддэг цифр (Хотын өгөгдөл) ================= */
/* Эргэлддэг цифр (одометр): цифр бүр 0–9 баганаар, --d-ээр байрлана. fromZero: эхлээд 0, харагдах үед жинхэнэ утга руу эргэлдэнэ.
   site/app/home/CityData.tsx анх зурахдаа ашиглана; дараагийн өөрчлөлтийг features/live-data.js setLive() → rollTo() хийнэ. */
export function rollWrap(v, fromZero) {
  let k = 0;
  return `<span class="sr-only">${esc(String(v))}</span><span class="rd-w" aria-hidden="true">${[...String(v)].map((ch) => (/\d/.test(ch)
    ? `<span class="rd"><span class="rd-s" style="--d:${fromZero ? 0 : ch};--k:${k++}" ${fromZero ? `data-to="${ch}"` : ''}>${'0123456789'.split('').map((n) => `<i>${n}</i>`).join('')}</span></span>`
    : `<span class="rd-c">${/\s/.test(ch) ? '&nbsp;' : esc(ch)}</span>`)).join('')}</span>`;
}
export function rollTo(el, v) {
  const s = String(v), sr = el.querySelector('.sr-only'), cols = el.querySelectorAll('.rd-w > span');
  if (!sr || cols.length !== s.length || [...s].some((ch, i) => /\d/.test(ch) !== cols[i].classList.contains('rd'))) { el.innerHTML = rollWrap(s); return; }
  sr.textContent = s;
  [...s].forEach((ch, i) => { if (/\d/.test(ch)) { const c = cols[i].firstElementChild; c.removeAttribute('data-to'); c.style.setProperty('--d', ch); } });   // харагдахаас өмнө шинэчлэгдсэн бол хуучин утга руу буцахгүй
}
/* «Хотын өгөгдөл» хэсгийг site/app/home/CityData.tsx зурна. Энэ функц түүнд хэрэгтэй өгөгдлийг (сонгосон хэлээр) бэлдэнэ.
   Нүүрэнд: агаарын чанар + цаг агаарын карт; /data хуудсанд: нэмээд түгжрэл, хүн ам, төсөв. Утгыг features/weather.js шинэчилж renderReact() дуудна. */
export function dataData() {
  const c = aqiCat(S.aqi), live = !!(S.air && S.air.live), pol = live && S.air.pol;
  const w = S.wx, wi = wxInfo(w.code, w.day), h = ubNow().getHours(), code = +w.code;
  const days = w.daily ? w.daily.slice(1, 6).map(([d, mx, mn, cd]) => [new Date(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)), mx, mn, wxInfo(cd, 1)]) : FORECAST.map((f, i) => [addDays(today(), i + 1), f[0], f[1], { i: f[2], t: '' }]);
  const out = {
    home: S.route !== 'page', title: t('dataTitle'), desc: t('dataDesc'), liveL: t('live'),
    aqi: {
      v: S.aqi, pm25: pm25(), title: t('aqi'), sub: t('aqi24'), label: t(c.k), color: c.c, advice: t(c.adv), live,
      pm: S.aqi <= 50 ? 8 : S.aqi <= 100 ? 22 : S.aqi <= 150 ? 34 : 48,   // хөвөх тоосонцрын тоо
      pol: pol ? [['PM2.5', pol.pm25], ['PM10', pol.pm10], ['NO₂', pol.no2]].map(([k, v]) => ({ k: k + (POL[S.air.main] === k ? ' •' : ''), v: (v == null ? '—' : Math.round(v)) + ' µg/m³' })) : [],
      mainL: t('mainPol'), main: live ? POL[S.air.main] || S.air.main || '—' : '',
      updL: L(['Шинэчлэгдсэн', 'Updated']), upd: live ? hhmm(new Date(S.air.ts + (480 + new Date().getTimezoneOffset()) * 60000)) : '',
      chart: aqiChartData(),
    },
    weather: {
      title: t('weather'), date: fDate(today(), true), icon: wi.i, temp: wxT(w.temp), text: `${wi.t}, ${t('feels').toLowerCase()} ${wxT(w.feels)}°`,
      dir: wxDir(w.dir), windL: t('wind'), wind: `${Math.round(w.wind)} ${L(['м/с', 'm/s'])}`, humL: t('humidity'), hum: Math.round(w.hum) + '%',
      days: days.map(([dd, mx, mn, inf]) => ({ wd: EN() ? EN_WD[dd.getDay()] : MN_WDS[dd.getDay()], icon: inf.i, title: inf.t, mx: wxT(mx), mn: wxT(mn) })),
      src: w.live ? L(['Эх сурвалж', 'Source']) : '',
      // амьд тэнгэр: 0°-оос доош бол цас, үүлтэй, Улаанбаатарын цагаар үүр/өдөр/үдэш/шөнө (шөнө од)
      sky: { tod: h >= 20 || h < 6 ? 'night' : h < 9 ? 'dawn' : h >= 17 ? 'dusk' : 'day', snow: [71, 73, 75, 77, 85, 86].includes(code), rain: (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95, clouds: code >= 2 },
    },
  };
  if (out.home) return out;
  const tot = POP.reduce((a, p) => a + p[2], 0), max = POP[0][2], others = POP.slice(6).reduce((a, p) => a + p[2], 0);
  const plan = BUDGET_Q.reduce((a, q) => a + q[0], 0), act = BUDGET_Q.reduce((a, q) => a + q[1], 0), bmx = Math.max(...BUDGET_Q.map((q) => q[0]));
  const k = (v) => (EN() ? Math.round(v / 1000) + 'k' : Math.round(v / 1000) + ' мян');
  return Object.assign(out, {
    updated: t('updated'), clock: clock(true),
    traffic: { title: t('congestion'), v: S.traffic, ang: -90 + (S.traffic / 10) * 180, busy: t('busy'), busiest: t('busiest'), roads: ROADS.map(([n, v]) => ({ n: L(n), v, c: v > 8 ? '#D81E34' : '#F08C1A' })) },
    pop: { title: t('population'), note: t('popNote'), tot, totS: num(tot),
      rows: POP.slice(0, 6).map((p) => [EN() ? p[1] : p[0], p[2]]).concat([[L(['Бусад 3 дүүрэг', 'Other 3 districts']), others]]).map(([n, v]) => ({ n, w: (v / max) * 100, k: k(v) })) },
    budget: { title: t('budgetExec'), note: t('budgetNote', { v: EN() ? '₮3.9 trn' : '3.9 их наяд ₮' }), pct: Math.round((act / plan) * 100), planL: t('plan'), actL: t('actual'),
      q: BUDGET_Q.map((q, i) => ({ plan: (q[0] / bmx) * 100, act: (q[1] / bmx) * 100, l: ['I', 'II', 'III', 'IV'][i] })) },
  });
}
HOME.data = dataData;
HOME.roll = rollWrap;
HOME.countUp = countUp;
