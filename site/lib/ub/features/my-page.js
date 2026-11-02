import { renderReact } from '../core/bridge.js';
import { HOME } from '../core/home.js';
import { EN, L, S, t } from '../core/state.js';
import { Lf, addDays, ago, fDate, money, num, today } from '../core/time.js';
import { EVENTS } from '../data/events.js';
import { KHOROO, ME, PAYMENTS, RCAT } from '../data/my-page.js';
import { endOfMonth } from './shared.js';
import { evRow } from '../sections/events.js';
/* ================= My page =================
   «Миний булан» (#view-my) хуудсыг site/app/views/MyView.tsx зурна. Энэ функц түүнд хэрэгтэй өгөгдлийг (текст нь сонгосон хэлээр) бэлдэнэ.
   Таб (tab my → setMyTab), төлөх (pay), шинэ хүсэлт (report), мэдэгдлийн холбоосуудыг features/wiring.js барина. */
export let MY_DIR = 0;
export function myData() {
  if (S.route !== 'my' || !S.user) return null;
  const open = S.requests.filter((r) => r.st < 3).length, due = PAYMENTS.filter((p) => !p.paid && !S.paid.includes(p.id)).length;
  const d = {
    tab: S.myTab, dir: MY_DIR, home: t('home'),
    ini: L(ME.ini), hello: t('hello', { n: L(ME.n) }), addr: L(ME.addr), reg: ME.reg,
    stats: [[open, t('myStats1')], [2, t('myStats2')], [due, t('myStats3')]],
    tabs: [['over', t('my_over'), 'layout-dashboard'], ['req', t('my_req'), 'list-checks'], ['kh', t('my_kh'), 'house']],
  };
  if (S.myTab === 'req') {
    d.req = {
      title: t('my_req'), add: t('newReq'), empty: t('noReq'),
      list: S.requests.map((r) => {
        const c = RCAT[r.cat] || RCAT.other;
        return { id: r.id, i: c.i, title: r.ttl ? L(r.ttl) : L(c.t), place: Lf(r.place), date: r.ago ? fDate(addDays(today(), -r.ago)) : t('todayRange'),
          st: r.st, stLabel: t('s' + r.st), steps: [0, 1, 2, 3].map((i) => t('s' + i)), note: `${Lf(r.note)} ${t('reqAgency')}: ${L(r.ag)}.` };
      }),
    };
  } else if (S.myTab === 'kh') {
    d.kh = {
      addr: L(ME.addr), govLbl: t('khGov'), gov: L(KHOROO.gov), resLbl: t('residents'), res: num(KHOROO.res), hhLbl: t('households'), hh: num(KHOROO.hh), hoursLbl: t('hours'), hours: L(KHOROO.hours),
      nearLbl: t('nearby'), near: KHOROO.near.map(([n, i, dd]) => ({ n: L(n), i, d: EN() ? dd.replace('м', 'm') : dd })),
      noticesLbl: t('khNotices'), notices: KHOROO.notices.map((n) => Lf(n)),
    };
  } else {
    /* мэдэгдэл: [икон, текст, хэдэн минутын өмнө, товчны data-* атрибут] */
    const notes = [['wind', ['Өнөө орой 20:00 цагаас агаарын чанар муудах төлөвтэй.', 'Air quality is expected to worsen after 20:00 tonight.'], 12, { 'data-act': 'go', 'data-sec': 'data', 'data-hl': 'aqi' }], ['list-checks', ['UB-2026-48127 дугаартай хүсэлт тань «Явцад байна» төлөвт шилжлээ.', 'Request UB-2026-48127 is now in progress.'], 95, { 'data-act': 'tab', 'data-tabs': 'my', 'data-v': 'req' }], ['megaphone', KHOROO.notices[0], 300, { 'data-act': 'tab', 'data-tabs': 'my', 'data-v': 'kh' }], ['vote', ['Хорооны хөгжлийн сангийн санал асуулга нээгдлээ.', 'The khoroo development fund poll is open.'], 1500, { 'data-act': 'vote' }]];
    d.over = {
      notifsLbl: t('notifs'), notes: notes.map(([i, tx, a, act]) => ({ i, text: Lf(tx), ago: ago(a), act })),
      payLbl: t('payments'), payBtn: t('pay'),
      pays: PAYMENTS.map((p) => { const paid = !!(p.paid || S.paid.includes(p.id)); return { id: p.id, title: L(p.t), paid, status: paid ? t('paid') : t('due', { d: fDate(endOfMonth()) }), amt: money(p.amt) }; }),
      savedLbl: t('savedItems'), noSaved: t('noSaved'),
      saved: EVENTS.filter((e) => S.evSaved.includes(e.id)).map((e) => evRow(e)),   // evRow: sections/events.js (HTML)
    };
  }
  return d;
}
HOME.my = myData;
/* router.js, features/shared.js addRequest, wiring (pay) дууддаг */
export function renderMy() { renderReact(); }
export function setMyTab(v) {
  if (v === S.myTab) return;
  const order = ['over', 'req', 'kh'];
  MY_DIR = order.indexOf(v) > order.indexOf(S.myTab) ? 1 : -1;
  S.myTab = v; renderReact();
}
