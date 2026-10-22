import { Scene } from '../art/scene.js';
import { store } from '../core/helpers.js';
import { HOME } from '../core/home.js';
import { openModal, toast } from '../core/modal.js';
import { L, S, t } from '../core/state.js';
import { addDays, evDate, fDate, mln, money, today } from '../core/time.js';
import { ECAT, EVDESC, EVENTS } from '../data/events.js';
import { DOCS } from '../data/transparency.js';
import { renderMy } from './my-page.js';
import { repaintEvents } from '../sections/events.js';
import { trState } from '../sections/transparency.js';
/* ================= Documents, tenders, events ================= */
/* Цонхнуудыг site/app/modals/Docs.tsx зурна (Doc, Tender, Event). Эдгээр функц түүнд хэрэгтэй өгөгдлийг (сонгосон хэлээр) бэлдэнэ. */
export function openDoc(type, i) {
  const d = DOCS[type][i]; if (!d) return;
  if (/^https?:\/\//.test(d.url || '')) { window.open(d.url, '_blank', 'noopener'); return; }   // admin-аас оруулсан баримтын холбоос
  if (type === 'tender') { openModal({ size: 'md', label: L(d.t), view: 'Tender', props: { i } }); return; }
  openModal({ size: 'lg', label: d.no, view: 'Doc', props: { type, i } });
}
/* Тогтоол (res) / захирамж: цаасан баримтын загвар */
HOME.docModal = (type, i) => {
  const d = DOCS[type][i]; if (!d) return null;
  const res = type === 'res', date = fDate(addDays(today(), -d.ago));
  return {
    no: d.no, date, icon: res ? 'scroll-text' : 'stamp', title: L(d.t), place: L(['Улаанбаатар хот', 'Ulaanbaatar']), note: t('docNote'),
    hdr: res ? L(['НИЙСЛЭЛИЙН ИРГЭДИЙН ТӨЛӨӨЛӨГЧДИЙН ХУРЛЫН ТОГТООЛ', 'RESOLUTION OF THE CITY COUNCIL']) : L(['НИЙСЛЭЛИЙН ЗАСАГ ДАРГЫН ЗАХИРАМЖ', 'ORDER OF THE GOVERNOR OF THE CAPITAL CITY']),
    sign: res ? L(['ХУРЛЫН ДАРГА', 'CHAIR OF THE COUNCIL']) : L(['ЗАСАГ ДАРГА', 'GOVERNOR']),
    clauses: [
      [res ? 'Нийслэлийн хөгжлийн бодлого, иргэдийн саналыг үндэслэн ТОГТООХ нь:' : 'Нийслэлийн хөгжлийн бодлого, иргэдийн саналыг үндэслэн ЗАХИРАМЖЛАХ нь:', res ? 'Based on the city development policy and residents’ input, IT IS RESOLVED:' : 'Based on the city development policy and residents’ input, IT IS ORDERED:'],
      ['1. Энэхүү шийдвэрийн хэрэгжилтийг хангаж ажиллахыг холбогдох газар, агентлагуудад даалгасугай.', '1. The relevant departments and agencies shall implement this decision.'],
      ['2. Хэрэгжилтийн явцыг улирал бүр иргэдэд нээлттэй мэдээлэхийг Тамгын газарт үүрэг болгосугай.', '2. City Hall shall report progress to residents every quarter.'],
      ['3. Энэхүү шийдвэрийг нийтэлсэн өдрөөс эхлэн дагаж мөрдсүгэй.', '3. This decision takes effect on the day of publication.'],
    ].map(L),
  };
};
/* Тендер: төсөв, төлөв (trState: sections/transparency.js), шатны он дараалал */
HOME.tenderModal = (i) => {
  const d = DOCS.tender[i]; if (!d) return null;
  const date = addDays(today(), -d.ago);
  return {
    title: L(d.t), no: d.no, budgetL: t('budget'), budget: mln(d.bud), statusL: L(['Төлөв', 'Status']), badge: trState(d),
    cur: d.st === 'open' ? 1 : d.st === 'eval' ? 2 : 3,
    steps: [[t('tl_pub'), fDate(date)], [t('tl_bids'), fDate(addDays(today(), d.st === 'open' ? d.left : -Math.max(1, d.ago - 21)))], [t('tl_eval'), ''], [t('tl_contract'), '']],
    bid: d.st === 'open' ? t('bidBtn') : '',
  };
};
export function openEvent(id) {
  const e = EVENTS.find((x) => x.id === id); if (!e) return;
  openModal({ size: 'md', label: L(e.t), view: 'EventView', props: { id } });
}
HOME.eventModal = (id) => {
  const e = EVENTS.find((x) => x.id === id); if (!e) return null;
  const c = ECAT[e.c], saved = S.evSaved.includes(id);
  return {
    id, scene: Scene(e.img), cat: L(c.t), color: c.c, title: L(e.t),
    when: `${fDate(evDate(e.w), true)}, ${e.tm}`, venue: L(e.v), price: e.price ? money(e.price) : t('free'),
    desc: L(e.desc && (e.desc[0] || e.desc[1]) ? e.desc : (EVDESC[e.c] || ['', ''])),
    saved, saveL: saved ? t('saved') : t('save'), map: t('showOnMap'),
  };
};
export function toggleSave(id) {
  const has = S.evSaved.includes(id);
  S.evSaved = has ? S.evSaved.filter((x) => x !== id) : S.evSaved.concat(id); store.set('evSaved', S.evSaved);
  toast(has ? t('unsavedT') : t('savedT'), has ? 'bookmark' : 'bookmark-check');
  repaintEvents(); if (S.route === 'my') renderMy();   // repaintEvents → renderReact(): нээлттэй Event цонх ч дахин зурагдана
}
