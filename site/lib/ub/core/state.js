import { store } from './helpers.js';
import { ubNow } from './time.js';
import { I } from '../data/i18n.js';
import { REQ_DEFAULT } from '../data/my-page.js';
import { INCOMING, NEWS } from '../data/news.js';
import { SERVICES } from '../data/services.js';
/* ================= State ================= */
export const S = {
  lang: store.get('lang', 'mn') === 'en' ? 'en' : 'mn',
  theme: store.get('theme', 'light') === 'dark' ? 'dark' : 'light',
  a11y: !!store.get('a11y', false),
  user: store.get('user', null),
  route: 'home',
  hub: 'news', newsCat: 'all', newsType: 'all', svcTab: 'citizen', svcQ: '',
  page: null, newsQ: '', newsSort: 'new', newsN: 12, mediaQ: '', mediaN: 12,
  sit: 'birth', sitDone: store.get('sitDone', { birth: [0] }),
  media: 'all',
  projSt: 'all', projSel: null,
  evF: 'all', evView: 'list', calYM: null, calDay: null, evSel: null, evSaved: store.get('evSaved', []),
  tr: 'res', trQ: '',
  myTab: 'over',
  requests: store.get('requests', null) || REQ_DEFAULT.map((r) => Object.assign({}, r)),
  paid: store.get('paid', []),
  vote: store.get('vote', null),
  breaking: [], incoming: 0,
  aqi: 87, temp: -4, traffic: 6,
  air: null,   // IQAir-аас ирэхэд { live, ts, main, series } (features/weather.js loadAir)
  wx: { temp: -4, feels: -9, hum: 58, wind: 4, dir: 315, code: 3, day: 1, daily: null, live: 0 },   // Open-Meteo-оос ирэхэд солигдоно (features/weather.js loadWeather)
  tickerOn: true,
  chat: [], chatOpen: false,
};
export const NEWS_BY = {}; NEWS.concat(INCOMING).forEach((n) => { NEWS_BY[n.id] = n; });
export const parseUB = (s) => { const m = String(s).match(/(\d{4})\D(\d{2})\D(\d{2})\D+(\d{2}):(\d{2})/); return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]) : null; };
NEWS.forEach((n) => { if (n.d) { n.ts = parseUB(n.d); n.ago = Math.max(1, Math.round((ubNow() - n.ts) / 60000)); } });
export const ALL_SVC = [].concat(SERVICES.citizen.map((s) => Object.assign({ g: 'citizen' }, s)), SERVICES.business.map((s) => Object.assign({ g: 'business' }, s)), SERVICES.esys.map((s) => Object.assign({ g: 'esys' }, s)));

/* ================= i18n ================= */
export const EN = () => S.lang === 'en';
export function L(v) { return Array.isArray(v) ? (EN() ? (v[1] || v[0]) : (v[0] || v[1])) : v; }
export function t(k, vars) { const v = I[k]; let s = v ? (EN() ? (v[1] || v[0]) : (v[0] || v[1])) : k; if (vars) for (const x in vars) s = s.split('{' + x + '}').join(vars[x]); return s; }

