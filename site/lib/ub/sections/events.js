import { Scene } from '../art/scene.js';
import { renderReact } from '../core/bridge.js';
import { esc, ic } from '../core/helpers.js';
import { HOME } from '../core/home.js';
import { EN, L, S, t } from '../core/state.js';
import { EN_MON, EN_WD, MN_WDS, dkey, evDate, fDate, fMonth, money, today, weekendKeys } from '../core/time.js';
import { ECAT, EVENTS } from '../data/events.js';
import { MAPS, MapView } from './map-view.js';
/* ================= Events ================= */
export function evSort(a, b) { return (a.d || evDate(a.w)) - (b.d || evDate(b.w)) || a.tm.localeCompare(b.tm); }
export function evList(f) {
  const F = f || S.evF, wk = weekendKeys(), tk = dkey(today());
  return EVENTS.map((e) => Object.assign({}, e, { d: evDate(e.w) })).filter((e) => F === 'all' || (F === 'today' && dkey(e.d) === tk) || (F === 'weekend' && wk.includes(dkey(e.d))) || (F === 'free' && !e.price)).sort(evSort);
}
export function evCard(e) {
  const d = e.d || evDate(e.w), c = ECAT[e.c], saved = S.evSaved.includes(e.id);
  return `<article class="card overflow-hidden flex flex-col relative transition-colors hover:border-ink/25" data-evcard="${e.id}"><button type="button" class="group text-left flex flex-col flex-1 zoom-on" data-act="ev-open" data-id="${e.id}"><div class="scene zoom aspect-[16/9] relative">${Scene(e.img)}<span class="absolute left-3 top-3 w-14 rounded-xl bg-white text-[#0E1630] text-center py-1.5 shadow-lg"><b class="block text-[20px] leading-none tnum">${d.getDate()}</b><span class="block text-[11px] font-bold text-[#56617A] mt-0.5">${EN() ? EN_MON[d.getMonth()] : d.getMonth() + 1 + '-р сар'}</span></span>${!e.price ? `<span class="absolute right-3 top-3 badge bg-ubgreen text-white">${t('free')}</span>` : ''}</div>
    <div class="p-5 flex-1 flex flex-col"><span class="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted"><i class="w-2 h-2 rounded-full" style="background:${c.c}"></i>${esc(L(c.t))}</span><span class="mt-2 text-[17px] font-bold leading-snug group-hover:text-ubred transition-colors">${esc(L(e.t))}</span>
    <span class="mt-3 space-y-1.5 text-[13.5px] text-muted block"><span class="flex items-center gap-2">${ic('clock-3', 'w-4 h-4')}${fDate(d, true)}, ${esc(e.tm)}</span><span class="flex items-center gap-2 min-w-0">${ic('map-pin', 'w-4 h-4')}<span class="truncate">${esc(L(e.v))}</span></span></span>
    <span class="mt-auto pt-4 font-bold text-[14.5px] pr-12">${e.price ? money(e.price) : t('free')}</span></div></button>
    <button type="button" class="absolute right-3 bottom-3 icon-btn ${saved ? 'bg-ubred text-white' : 'bg-soft hover:bg-line'}" data-act="ev-save" data-id="${e.id}" aria-pressed="${saved}" aria-label="${esc(saved ? t('saved') : t('save'))}">${ic(saved ? 'bookmark-check' : 'bookmark', 'w-5 h-5')}</button></article>`;
}
export function evRow(e, mapMode) {
  const d = e.d || evDate(e.w), c = ECAT[e.c], sel = mapMode && S.evSel === e.id;
  return `<button type="button" class="w-full text-left card p-3 flex items-center gap-3 transition-colors ${sel ? '!border-ubblue ring-1 ring-ubblue' : 'hover:bg-soft'}" data-act="${mapMode ? 'ev-mapsel' : 'ev-open'}" data-id="${e.id}"><span class="w-14 shrink-0 rounded-xl bg-soft text-center py-1.5"><b class="block text-[18px] leading-none tnum">${esc(e.tm)}</b><span class="block text-[11px] text-muted mt-1">${EN() ? EN_WD[d.getDay()] : MN_WDS[d.getDay()]}</span></span><span class="min-w-0 flex-1"><span class="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted"><i class="w-2 h-2 rounded-full" style="background:${c.c}"></i>${esc(L(c.t))}</span><b class="block text-[14.5px] leading-snug truncate">${esc(L(e.t))}</b><span class="block text-[12.5px] text-muted truncate">${esc(L(e.v))}</span></span><span class="text-[13px] font-bold shrink-0">${e.price ? money(e.price) : t('free')}</span></button>`;
}
export function keyToDate(k) { const [y, m, d] = k.split('-').map(Number); return new Date(y, m, d); }
/* Хуанли: сарын өдрүүд (тухайн өдрийн арга хэмжээний өнгөт цэгүүдтэй) ба сонгосон өдрийн жагсаалт */
export function calData() {
  const td = today(); if (!S.calYM) S.calYM = [td.getFullYear(), td.getMonth()]; if (!S.calDay) S.calDay = dkey(td);
  const [y, m] = S.calYM, days = new Date(y, m + 1, 0).getDate();
  const byDay = {}; evList().forEach((e) => { const k = dkey(e.d); (byDay[k] = byDay[k] || []).push(e); });
  const sel = byDay[S.calDay] || [];
  return {
    title: fMonth(y, m), prev: t('prev'), next: t('next'), lead: (new Date(y, m, 1).getDay() + 6) % 7,
    wds: [1, 2, 3, 4, 5, 6, 0].map((i) => (EN() ? EN_WD[i] : MN_WDS[i])),
    days: Array.from({ length: days }, (_, j) => {
      const dt = new Date(y, m, j + 1), k = dkey(dt), isT = k === dkey(td), on = S.calDay === k;
      return { k, dn: j + 1, on, label: fDate(dt, true), dots: (byDay[k] || []).slice(0, 3).map((e) => ECAT[e.c].c),
        cls: `cal-d ${dt < td && !on ? 'text-muted/50' : ''} ${isT && !on ? 'ring-1 ring-ubred text-ubred' : ''}` };
    }),
    selTitle: fDate(keyToDate(S.calDay), true), selCount: `${sel.length} ${L(['арга хэмжээ', sel.length === 1 ? 'event' : 'events'])}`,
    rows: sel.map((e) => evRow(e)).join(''), empty: t('noEvents'),
  };
}
export function evPopup(id) {
  const e = EVENTS.find((x) => x.id === id), d = evDate(e.w), c = ECAT[e.c];
  return `<div class="card shadow-2xl p-4 text-ink"><div class="flex items-start gap-3"><div class="min-w-0 flex-1"><p class="text-[12px] font-bold" style="color:${c.c}">${esc(L(c.t))}</p><p class="font-extrabold leading-snug text-[15px]">${esc(L(e.t))}</p><p class="text-[12.5px] text-muted mt-1">${fDate(d, true)}, ${esc(e.tm)}</p><p class="text-[12.5px] text-muted">${esc(L(e.v))}</p></div><button type="button" class="icon-btn !w-8 !h-8 hover:bg-soft -mr-1 -mt-1" data-act="ev-mapclose" aria-label="${esc(t('close'))}">${ic('x', 'w-4 h-4')}</button></div><button type="button" class="btn btn-sm btn-ink w-full mt-3" data-act="ev-open" data-id="${e.id}">${t('more')}</button></div>`;
}
/* Газрын зураг (site/app/home/Events.tsx-ийн #ev-map дотор): үүсгээд устгах функцыг буцаана */
export function evMap(host) {
  if (MAPS.ev) MAPS.ev.destroy();
  const mv = MAPS.ev = new MapView(host, { points: () => evList().map((e) => ({ id: e.id, x: e.x, y: e.y, c: ECAT[e.c].c, i: 'calendar-days', tag: e.tm, label: L(e.t) })), sel: S.evSel, onSelect: (id) => selectEv(id, false), popup: evPopup });
  return () => { mv.destroy(); if (MAPS.ev === mv) MAPS.ev = null; };
}
HOME.evMap = evMap;
export function selectEv(id, pan) {
  S.evSel = id; renderReact();   // жагсаалтын тодруулга
  if (MAPS.ev) MAPS.ev.select(id, pan);
}
export let EV_DIR = 0;   // жагсаалт / хуанли / зураг солигдох чиглэл (Swap)
/* «Арга хэмжээ» хэсгийг site/app/home/Events.tsx зурна (нүүрэнд: ойрын 4; /events хуудсанд: жагсаалт, хуанли, газрын зураг).
   Энэ функц түүнд хэрэгтэй өгөгдлийг (сонгосон хэлээр) бэлдэнэ. Картууд нь evCard() HTML (admin-ы урьдчилан харахтай ижил). */
export function eventsData() {
  const head = { title: t('evTitle'), desc: t('evDesc'), all: t('allEvents') };
  if (S.route !== 'page') {   // ойрын 4 арга хэмжээ
    const list = EVENTS.map((e) => Object.assign({}, e, { d: evDate(e.w) })).sort(evSort).slice(0, 4);
    return Object.assign(head, { home: true, cards: list.map(evCard) });
  }
  const list = evList(), v = S.evView;
  return Object.assign(head, {
    home: false, view: v, dir: EV_DIR, filter: S.evF,
    tabs: [['list', t('v_list'), 'list'], ['cal', t('v_cal'), 'calendar-days'], ['map', t('v_map'), 'map']],
    chips: [['all', t('f_all')], ['today', t('f_today')], ['weekend', t('f_weekend')], ['free', t('f_free')]].map(([f, l]) => [f, l + '  ' + evList(f).length]),
    emptyF: t('noEventsF'),
    list: v === 'list' ? list.map(evCard).join('') : '',
    rows: v === 'map' ? list.map((e) => evRow(e, true)).join('') : '',
    cal: v === 'cal' ? calData() : null,
  });
}
HOME.events = eventsData;
/* Таб (features/wiring.js onTab, src/core/pages.js), шүүлтүүр: төлөвийг сольж React-аар дахин зурна */
export function setEvView(v) {
  if (v === S.evView) return;
  const order = ['list', 'cal', 'map'];
  EV_DIR = order.indexOf(v) > order.indexOf(S.evView) ? 1 : -1;
  S.evView = v; renderReact();
}
export function setEvF(v) { S.evF = v; EV_DIR = 0; renderReact(); }
/* Хадгалсан төлөв өөрчлөгдөхөд (features/documents.js toggleSave) */
export function repaintEvents() {
  renderReact();
}
