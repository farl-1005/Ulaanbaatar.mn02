import { renderReact } from '../core/bridge.js';
import { dayOffset } from '../core/cms.js';
import { $, esc, ic, reduced } from '../core/helpers.js';
import { HOME } from '../core/home.js';
import { toast } from '../core/modal.js';
import { EN, L, NEWS_BY, t } from '../core/state.js';
import { EN_MON, EN_WD, Lf, MN_WDS, addDays, fDate, hhmm, pad, today, ubNow } from '../core/time.js';
import { GOV_SCHED, GOV_TYPES } from '../data/governor.js';
import { GOV, NEWS } from '../data/news.js';
import { newsCard } from './hub.js';
/* ================= Засаг дарга: ажлын хуваарь, мэдээ =================
   Хуваарь (GOV_SCHED) admin «Засаг даргын хуваарь»-аас. 7 хоногийн туузаас өдөр сонгоход тухайн өдрийн ажлууд гарна;
   одоо болж буй ажил «Яг одоо», дараагийнх нь тоолууртай. Хэсгийг site/app/home/Gov.tsx зурна (govData). */
export const GV = { w: 0, d: null, dir: 0, n: 0 };   // w: 7 хоногийн шилжилт, d: сонгосон өдөр, dir/n: Gov.tsx-ийн хөдөлгөөн
export const govIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export function govAt(e, hm) { const [y, m, d] = e.date.split('-').map(Number), [h, mi] = String(hm || '09:00').split(':').map(Number); return new Date(y, m - 1, d, h || 0, mi || 0); }
export function govState(e, now = ubNow()) {
  const a = govAt(e, e.from), b = e.to && e.to > e.from ? govAt(e, e.to) : new Date(a.getTime() + 36e5);
  if (now >= b) return { k: 'done' };
  if (now >= a) return { k: 'live', p: (now - a) / (b - a), left: Math.max(1, Math.ceil((b - now) / 6e4)) };
  return { k: 'soon', mins: Math.max(1, Math.ceil((a - now) / 6e4)) };
}
export function govIn(mins, e) {
  if (mins < 60) return L([`${mins} минутын дараа`, `in ${mins} min`]);
  const h = Math.floor(mins / 60), m = mins % 60;
  if (h < 24 && (!e || dayOffset(e.date) === 0)) return m ? L([`${h} цаг ${m} минутын дараа`, `in ${h} h ${m} min`]) : L([`${h} цагийн дараа`, `in ${h} h`]);
  const n = e ? dayOffset(e.date) : Math.round(h / 24);
  return n === 1 ? L([`Маргааш ${e ? e.from : ''}`, `Tomorrow ${e ? e.from : ''}`]).trim() : L([`${n} хоногийн дараа`, `in ${n} days`]);
}
export function govDays(w = GV.w) { const s = addDays(today(), -1 + w * 7); return Array.from({ length: 7 }, (_, i) => addDays(s, i)); }
export const govOn = (iso) => GOV_SCHED.filter((e) => e.date === iso);
export function govNext(now = ubNow()) { for (const e of GOV_SCHED) { const st = govState(e, now); if (st.k !== 'done') return [e, st]; } return [null, null]; }
export function govPick() {
  const isos = govDays().map(govIso);
  if (GV.d && isos.includes(GV.d)) return;
  const td = govIso(today());
  GV.d = GV.w === 0 && govOn(td).length ? td : isos.find((x) => x >= td && govOn(x).length) || isos.find((x) => govOn(x).length) || (GV.w === 0 ? td : isos[0]);
}
export function govChip(e, st) {
  if (st.k === 'live') return `<span class="gov-st gov-st-live"><i class="live" style="--dot:#fff"></i>${L(['Болж байна', 'Happening now'])}</span>`;
  if (st.k === 'done') return `<span class="gov-st gov-st-done">${ic('check', 'w-3.5 h-3.5')}${L(['Болсон', 'Done'])}</span>`;
  return dayOffset(e.date) === 0 ? `<span class="gov-st gov-st-soon">${ic('clock-3', 'w-3.5 h-3.5')}<span data-gcd="${esc(e.id)}">${govIn(st.mins, e)}</span></span>` : '';
}
/* Сонгосон өдрийн ажлууд (govRow: admin-ы урьдчилан харахтай ижил HTML) ба «Одоо» шугам */
export function govRows(now) {
  const evs = govOn(GV.d), isToday = dayOffset(GV.d) === 0;
  const sts = evs.map((e) => govState(e, now));
  const nowAt = isToday && !sts.some((s) => s.k === 'live') ? sts.findIndex((s) => s.k === 'soon') : -1;
  return evs.map((e, i) => {
    const st = sts[i];
    const line = i === nowAt || (isToday && nowAt === -1 && i === evs.length - 1 && st.k === 'done' && !sts.some((s) => s.k === 'live')) ? `<li class="gov-nowline ${i === nowAt ? '' : 'is-end'}" aria-hidden="true"><span class="tnum">${L(['Одоо', 'Now'])} <b>${hhmm(now)}</b></span></li>` : '';
    const row = govRow(e, st, i);
    return i === nowAt ? line + row : row + line;
  }).join('');
}
export function govRow(e, st, i) {
  const ty = GOV_TYPES[e.type] || GOV_TYPES.meeting;
  return `<li class="gov-ev is-${st.k}" style="--c:${ty.c};--i:${i}" data-gev="${esc(e.id)}">
      <div class="gov-time tnum"><b>${esc(e.from || '')}</b>${e.to ? `<span>${esc(e.to)}</span>` : ''}</div>
      <div class="gov-node" aria-hidden="true"><i></i></div>
      <div class="gov-body">
        <div class="flex flex-wrap items-center gap-2"><span class="gov-type">${ic(ty.i, 'w-3.5 h-3.5')}${esc(L(ty.t))}</span>${govChip(e, st)}</div>
        <h4 class="gov-t">${esc(L(e.t))}</h4>
        ${e.place && L(e.place) ? `<p class="gov-place">${ic('map-pin', 'w-4 h-4')}<span>${esc(L(e.place))}</span></p>` : ''}
        ${e.d && L(e.d) ? `<p class="gov-d">${esc(L(e.d))}</p>` : ''}
        ${st.k === 'live' ? `<div class="gov-prog"><span><i data-gprog="${esc(e.id)}" style="transform:scaleX(${st.p.toFixed(3)})"></i></span><em class="tnum" data-gleft="${esc(e.id)}">${L([`${st.left} мин үлдсэн`, `${st.left} min left`])}</em></div>` : ''}
      </div>
      ${st.k === 'done' ? '' : `<button type="button" class="gov-ics" data-act="gov-ics" data-id="${esc(e.id)}" title="${esc(L(['Календарт нэмэх', 'Add to calendar']))}" aria-label="${esc(L(['Календарт нэмэх', 'Add to calendar']))}: ${esc(L(e.t))}">${ic('calendar-plus', 'w-[18px] h-[18px]')}<span class="gov-ics-l">${L(['Календарт нэмэх', 'Add to calendar'])}</span></button>`}
    </li>`;
}
/* Засаг даргатай холбоотой мэдээ (4 баганаар 2 мөр = 8). Хүрэлцэхгүй бол хамгийн сүүлийн мэдээгээр нөхнө. */
export function govNews(n = 4) {
  const re = /Засаг дарг|Захирагч|Пүрэвдагва|Governor|Mayor/i, out = GOV.map((id) => NEWS_BY[id]).filter(Boolean);
  NEWS.forEach((x) => { if (out.length < n && !x.zar && !x.draft && !out.includes(x) && re.test(L(x.t) + ' ' + Lf(x.l))) out.push(x); });
  NEWS.slice().sort((a, b) => a.ago - b.ago).forEach((x) => { if (out.length < n && !x.zar && !x.draft && !out.includes(x)) out.push(x); });
  return out.slice(0, n);
}
export function govMonth() {
  const days = govDays(), a = days[0], b = days[6];
  return EN() ? `${EN_MON[a.getMonth()]} ${a.getDate()} – ${a.getMonth() === b.getMonth() ? '' : EN_MON[b.getMonth()] + ' '}${b.getDate()}, ${b.getFullYear()}`
    : `${b.getFullYear()} оны ${a.getMonth() + 1}-р сарын ${a.getDate()} – ${a.getMonth() === b.getMonth() ? '' : b.getMonth() + 1 + '-р сарын '}${b.getDate()}`;
}
/* Хэсгийг site/app/home/Gov.tsx зурна (нүүр болон «Хотын тухай» хуудсанд ижил). Энэ функц түүнд хэрэгтэй өгөгдлийг (сонгосон хэлээр) бэлдэнэ.
   Тоолуур (… минутын дараа, үлдсэн хугацаа): Gov.tsx хэсэг дэлгэцэнд харагдаж байх үед 30 секунд тутам дахин дуудаж зурна. */
export function govData() {
  govPick();
  const now = ubNow(), td = govIso(today()), days = govDays(), [ne, ns] = govNext(now);
  const ty = (e) => GOV_TYPES[e.type] || GOV_TYPES.meeting, left = (st) => L([`${st.left} мин үлдсэн`, `${st.left} min left`]);
  const wk = govDays(0).map(govIso), wevs = GOV_SCHED.filter((e) => wk.includes(e.date));
  const evs = govOn(GV.d);
  return {
    sec: t('govSec'), title: t('govSchedT'), desc: t('govSchedD'), name: t('govName'), role: t('govTitle'), reception: t('govReception'),
    upNext: L(['Дараагийн ажил', 'Up next']), rightNow: L(['Яг одоо', 'Right now']), none: L(['Ойрын хуваарь хараахан гараагүй байна', 'No upcoming items yet']),
    next: ne ? {
      id: ne.id, date: ne.date, c: ty(ne).c, live: ns.k === 'live', p: ns.k === 'live' ? ns.p.toFixed(3) : '', title: L(ne.t),
      cd: ns.k === 'live' ? left(ns) : govIn(ns.mins, ne),
      when: (dayOffset(ne.date) === 0 ? '' : fDate(govAt(ne, ne.from)) + ', ') + ne.from + (ne.to ? '–' + ne.to : ''),
      place: ne.place ? L(ne.place) : '',
    } : null,
    mix: {
      label: L(['Энэ 7 хоногт', 'This week']), total: `${wevs.length} ${L(['ажил', 'items'])}`,
      items: Object.keys(GOV_TYPES).map((k) => ({ k, c: GOV_TYPES[k].c, t: L(GOV_TYPES[k].t), n: wevs.filter((e) => (GOV_TYPES[e.type] ? e.type : 'meeting') === k).length })).filter((x) => x.n),
    },
    sched: L(['Хуваарь', 'Schedule']), range: govMonth(), todayL: L(['Өнөөдөр', 'Today']), atToday: GV.w === 0 && GV.d === td,
    prevL: L(['Өмнөх 7 хоног', 'Previous week']), nextL: L(['Дараагийн 7 хоног', 'Next week']),
    k: Math.max(0, days.findIndex((d) => govIso(d) === GV.d)),
    days: days.map((d) => {
      const iso = govIso(d), ev = govOn(iso), o = dayOffset(iso);
      return {
        iso, today: o === 0, past: o < 0, on: iso === GV.d, dn: d.getDate(), aria: `${fDate(d, true)}, ${ev.length} ${L(['ажил', 'items'])}`,
        wd: EN() ? EN_WD[d.getDay()] : MN_WDS[d.getDay()], rel: o === 0 ? L(['Өнөөдөр', 'Today']) : o === -1 ? L(['Өчигдөр', 'Yesterday']) : o === 1 ? L(['Маргааш', 'Tomorrow']) : '',
        dots: ev.slice(0, 4).map((e) => ty(e).c),
      };
    }),
    rows: evs.length ? govRows(now) : '',
    empty: { ic: ic('calendar-x-2', 'w-6 h-6', 1.7), t: L(['Энэ өдөр хуваарьт ажил алга', 'Nothing scheduled for this day']), d: L(['Өөр өдрийг сонгоно уу.', 'Pick another day.']) },
    legend: Object.keys(GOV_TYPES).map((k) => ({ k, c: GOV_TYPES[k].c, i: GOV_TYPES[k].i, t: L(GOV_TYPES[k].t) })),
    change: L(['Хуваарь өөрчлөгдөж болно', 'Subject to change']),
    newsT: t('govNews'), allNews: t('allNews'), news: govNews(8).map((n) => newsCard(n)),
    /* Swap түлхүүрүүд: долоо хоног, өдөр солигдоход гулсана; n өөрчлөгдөхөд жагсаалт «gov-fresh» хөдөлгөөнтэй орно */
    wk: String(GV.w), key: GV.w + '|' + GV.d, dir: GV.dir, n: GV.n,
  };
}
HOME.gov = govData;
/* Өдөр сонгох (7 хоногийн тууз, «Дараагийн ажил» карт: focusId бол тэр ажлыг тодруулна) */
export function govSetDay(iso, focusId) {
  if (iso === GV.d && !focusId) return;
  if (!govDays().some((d) => govIso(d) === iso)) { GV.w = Math.floor((dayOffset(iso) + 1) / 7); GV.d = iso; govSetWeek(0, focusId); return; }
  const changed = iso !== GV.d;
  GV.dir = iso > GV.d ? 1 : iso < GV.d ? -1 : 0; GV.d = iso; GV.n++;
  renderReact();
  const pill = $('#gov .gov-pill');
  if (pill && pill.animate && !reduced && changed) pill.animate([{ scale: '1 1' }, { scale: '1.16 .92', offset: .35 }, { scale: '1 1' }], { duration: 520, easing: 'cubic-bezier(.3,.7,.3,1)' });
  if (focusId) govFlash(focusId);
}
export function govSetWeek(step, focusId) {
  GV.w += step; if (step) GV.d = null; govPick();
  GV.dir = step > 0 ? 1 : step < 0 ? -1 : 0; GV.n++;
  renderReact();
  if (focusId) govFlash(focusId);
}
export function govFlash(id) {
  const row = $(`#gov-list [data-gev="${CSS.escape(id)}"]`); if (!row) return;
  const r = row.getBoundingClientRect(); if (r.top < 80 || r.bottom > innerHeight) row.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' });
  row.classList.remove('is-flash'); void row.offsetWidth; row.classList.add('is-flash');
}
/* «Календарт нэмэх»: .ics файл (Google, Apple, Outlook календарь нээнэ) */
export function govIcs(id) {
  const e = GOV_SCHED.find((x) => x.id === id); if (!e) return;
  const dt = (hm) => e.date.replace(/-/g, '') + 'T' + String(hm).replace(':', '') + '00';
  const tx = (s) => String(s || '').replace(/[\\,;]/g, (m) => '\\' + m).replace(/\r?\n/g, '\\n');
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ulaanbaatar.mn//governor//MN', 'BEGIN:VEVENT', `UID:${e.id}-${e.date}@ulaanbaatar.mn`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;TZID=Asia/Ulaanbaatar:${dt(e.from || '09:00')}`, e.to && e.to > (e.from || '') ? `DTEND;TZID=Asia/Ulaanbaatar:${dt(e.to)}` : 'DURATION:PT1H',
    `SUMMARY:${tx(L(e.t))}`, e.place ? `LOCATION:${tx(L(e.place))}` : '', e.d ? `DESCRIPTION:${tx(L(e.d))}` : '', 'END:VEVENT', 'END:VCALENDAR'].filter(Boolean).join('\r\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' })); a.download = `zasag-darga-${e.date}-${e.id}.ics`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast(L(['Календарийн файл бэлэн боллоо', 'Calendar file ready']), 'calendar-check');
}

