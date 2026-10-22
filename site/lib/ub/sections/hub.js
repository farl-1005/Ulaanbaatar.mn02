import { Scene } from '../art/scene.js';
import { renderReact } from '../core/bridge.js';
import { setActiveNav } from '../core/header.js';
import { esc, ic, reduced } from '../core/helpers.js';
import { HOME } from '../core/home.js';
import { ALL_SVC, L, NEWS_BY, S, t } from '../core/state.js';
import { Lf, ago, evDate, num } from '../core/time.js';
import { EVENTS } from '../data/events.js';
import { FEATURED_ID, HERO_ID, NEWS, RUB } from '../data/news.js';
import { SEASON_L, seasonNow } from '../features/season.js';
import { currentSec } from '../features/shared.js';
import { evCard, evSort } from './events.js';
import { rubTag } from './hero.js';
/* ================= Hub: news / services / events ================= */
export const HUBS = ['news', 'services', 'events'];
export const NEWS_CATS = ['all', 'biz', 'city', 'transport', 'edu', 'env', 'util', 'health', 'zar'];
/* Мэдээний төрөл (ulaanbaatar.mn-ийнхтэй ижил, server/sources/news.ts). nt-гүй мэдээ = цаг үеийн мэдээ. */
export const NEWS_NT = { time: ['Цаг үеийн мэдээ', 'Current news'], place: ['Харьяа газрын мэдээ', 'Agency news'], review: ['Хэвлэлийн тойм', 'Press review'] };
export const ntOf = (n) => (NEWS_NT[n.nt] ? n.nt : 'time');
/* Хаб (нүүрний мэдээ / үйлчилгээ / арга хэмжээ таб; /news хуудасны бүх мэдээ; /services хуудас) site/app/home/Hub.tsx зурна.
   Энэ функц түүнд хэрэгтэй өгөгдлийг (текст нь сонгосон хэлээр) бэлдэнэ. */
export const NEWS_STEP = 12;
export function hubData() {
  const pg = S.route === 'page' ? S.page : null;
  const card = (n) => { const r = RUB[n.cat] || RUB.city; return { id: n.id, zar: !!n.zar, title: L(n.t), lead: Lf(n.l), scene: n.zar ? '' : Scene(n.img), rub: L(r.t), rubColor: r.c, ago: ago(n.ago), views: num(n.views) }; };
  const s = seasonNow();
  const d = {
    hub: S.hub, page: pg === 'news' || pg === 'services' ? pg : null, zarLabel: L(RUB.zar.t),
    season: SEASON_L[s] && s !== 'off' ? { s, fx: !reduced && !S.a11y } : null,   // улирлын мод, тоосонцор (features/season.js)
    cats: NEWS_CATS.map((c) => [c, c === 'all' ? t('f_all') : L(RUB[c].t), c === 'all' ? '' : RUB[c].c]), newsCat: S.newsCat,
    svcTab: S.svcTab, svcQ: S.svcQ, newsSort: S.newsSort, newsQ: S.newsQ,
  };
  if (d.page === 'news') {   // /news: хайлт, ангилал, эрэмбэ, «Цааш үзэх»
    const q = S.newsQ.trim().toLowerCase();
    let list = NEWS.filter((n) => !n.draft);
    if (S.newsType !== 'all') list = list.filter((n) => ntOf(n) === S.newsType);
    if (S.newsCat !== 'all') list = list.filter((n) => n.cat === S.newsCat || (S.newsCat === 'city' && n.cat === 'plan') || (S.newsCat === 'zar' && n.zar));
    if (q) list = list.filter((n) => (L(n.t) + ' ' + Lf(n.l)).toLowerCase().includes(q));
    list = list.slice().sort(S.newsSort === 'top' ? (a, b) => (b.views || 0) - (a.views || 0) : (a, b) => a.ago - b.ago);
    const feat = !q && S.newsCat === 'all' && S.newsSort === 'new', shown = list.slice(0, S.newsN - (feat ? 1 : 0));   // өргөн карт 2 зай эзэлдэг тул тор тэгш дүүрнэ
    d.all = {
      key: S.newsCat + '|' + S.newsSort + '|' + S.newsType, q, feat, cards: shown.map(card), more: list.length > shown.length,
      type: S.newsType !== 'all' ? L(NEWS_NT[S.newsType]) : '',
      summary: q ? L([`«${S.newsQ.trim()}»: ${list.length} илэрц`, `“${S.newsQ.trim()}”: ${list.length} results`]) : L([`Нийт ${num(list.length)} мэдээ`, `${num(list.length)} stories`]),
      count: L([`${num(list.length)} мэдээнээс ${num(shown.length)}-г үзлээ`, `Showing ${num(shown.length)} of ${num(list.length)}`]),
      pct: list.length ? Math.round((shown.length / list.length) * 100) : 0,
    };
    return d;
  }
  if (d.page === 'services' || S.hub === 'services') {
    const q = S.svcQ.trim().toLowerCase();
    const list = q ? ALL_SVC.filter((x) => (x.t[0] + ' ' + x.t[1] + ' ' + x.d[0] + ' ' + x.d[1]).toLowerCase().includes(q)) : ALL_SVC.filter((x) => x.g === S.svcTab);
    d.svc = list.map((x) => ({ id: x.id, i: x.i, title: L(x.t), desc: L(x.d), m: x.m }));
  } else if (S.hub === 'news') {   // нүүрэнд 2 мөр: онцлох (2 багана) + 4, ангиллаар шүүхэд 6
    let list = NEWS.filter((n) => n.id !== HERO_ID);
    if (S.newsCat !== 'all') list = list.filter((n) => n.cat === S.newsCat || (S.newsCat === 'city' && n.cat === 'plan'));
    list = list.slice().sort((a, b) => a.ago - b.ago);
    if (S.newsCat === 'all') list = [NEWS_BY[FEATURED_ID]].filter(Boolean).concat(list.filter((n) => n.id !== FEATURED_ID)).slice(0, 5);
    else list = list.slice(0, 6);
    d.news = list.map(card);
    d.newsTotal = num(NEWS.filter((n) => !n.draft).length);
  } else {   // ойрын 4 арга хэмжээ (evCard: sections/events.js)
    d.events = EVENTS.map((e) => Object.assign({}, e, { d: evDate(e.w) })).sort(evSort).slice(0, 4).map(evCard);
  }
  return d;
}
HOME.hub = hubData;
/* Мэдээний карт (admin-ы урьдчилан харах, Засаг даргын хэсэг ашиглана; сайтын хаб React-аар ижил тэмдэглэгээг зурна) */
export function newsCard(n, feat) {
  const meta = `<span class="mt-auto pt-4 flex items-center gap-4 text-[12.5px] text-muted">${ago(n.ago)}<span class="inline-flex items-center gap-1 tnum">${ic('eye', 'w-4 h-4')}${num(n.views)}</span></span>`;
  const hov = 'group-hover:text-ubred transition-colors';
  if (n.zar) return `<button type="button" class="group lift card text-left p-5 flex flex-col relative overflow-hidden" data-act="news" data-id="${n.id}"><span class="absolute inset-x-0 top-0 h-1 bg-ubyellow"></span><span class="flex items-center gap-2.5 text-[12.5px] font-semibold text-muted"><span class="w-8 h-8 rounded-lg bg-ubyellow/25 text-amberink grid place-items-center">${ic('megaphone', 'w-[18px] h-[18px]')}</span>${esc(L(RUB.zar.t))}</span><span class="mt-3 text-[17px] font-bold leading-snug ${hov}">${esc(L(n.t))}</span><span class="mt-2 text-[14px] text-muted leading-relaxed line-clamp-3">${esc(Lf(n.l))}</span>${meta}</button>`;
  if (feat) return `<button type="button" class="group lift card text-left overflow-hidden sm:col-span-2 grid grid-cols-1 sm:grid-cols-2" data-act="news" data-id="${n.id}"><div class="scene zoom aspect-[16/10] sm:aspect-auto sm:h-full min-h-[220px]">${Scene(n.img)}</div><div class="p-6 flex flex-col">${rubTag(n)}<span class="mt-3 text-[24px] font-extrabold leading-[1.14] tracking-[-0.022em] ${hov}">${esc(L(n.t))}</span><span class="mt-3 text-[15px] text-muted leading-relaxed line-clamp-4">${esc(Lf(n.l))}</span>${meta}</div></button>`;
  return `<button type="button" class="group lift card text-left overflow-hidden flex flex-col" data-act="news" data-id="${n.id}"><div class="scene zoom aspect-[16/10]">${Scene(n.img)}</div><div class="p-5 flex flex-col flex-1">${rubTag(n)}<span class="mt-2.5 text-[17px] font-bold leading-snug line-clamp-3 ${hov}">${esc(L(n.t))}</span>${meta}</div></button>`;
}

export function modeBadge(m) {
  if (m === 'sys') return `<span class="badge b-blue">${ic('external-link', 'w-3.5 h-3.5')}${t('system')}</span>`;
  return m === 'on' ? `<span class="badge b-on">${ic('wifi', 'w-3.5 h-3.5')}${t('online')}</span>` : `<span class="badge b-off">${ic('footprints', 'w-3.5 h-3.5')}${t('inperson')}</span>`;
}
export function svcTile(s) {
  return `<button type="button" class="lift lift-blue card p-4 sm:p-5 text-left flex flex-col gap-3 h-full" data-act="svc" data-id="${s.id}"><span class="w-11 h-11 rounded-xl bg-ubblue/10 text-ubblue grid place-items-center">${ic(s.i, 'w-[22px] h-[22px]')}</span><span class="font-bold text-[15.5px] leading-snug">${esc(L(s.t))}</span><span class="text-[13.5px] text-muted leading-snug line-clamp-2">${esc(L(s.d))}</span><span class="mt-auto pt-1">${modeBadge(s.m)}</span></button>`;
}
/* Таб, ангилал солих: төлөвийг сольж React-аар дахин зурна (features/wiring.js, core/pages.js дуудна) */
export function setHub(v) {
  if (v === S.hub) return;
  S.hub = v; renderReact();
  setActiveNav(currentSec);
}
export function setNewsSort(v) {
  if (v === S.newsSort) return;
  S.newsSort = v; S.newsN = NEWS_STEP; renderReact();
}
export function setSvcTab(v) {
  S.svcTab = v; S.svcQ = ''; renderReact();   // хуудасны холбоосын идэвхтэй мөрийг ч (renderPageLinks) шинэчилнэ
}
export function setNewsCat(v) {
  S.newsCat = v; S.newsN = NEWS_STEP; renderReact();
}
