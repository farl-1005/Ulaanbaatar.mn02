import { HOME } from '../core/home.js';
import { closeModal, openModal, toast } from '../core/modal.js';
import { ALL_SVC, EN, L, S, t } from '../core/state.js';
import { EN_WD, MN_WDS, addDays, fDate, today } from '../core/time.js';
import { SITS } from '../data/services.js';
import { openLogin } from './dan-login.js';
import { addRequest } from './shared.js';
import { toggleStep } from '../sections/life-events.js';
/* ================= Services & booking ================= */
/* Цонхнуудыг site/app/modals/Service.tsx зурна (Service, Booking). Эдгээр функц түүнд хэрэгтэй өгөгдлийг (сонгосон хэлээр) бэлдэнэ. */
export function openService(id) {
  const s = ALL_SVC.find((x) => x.id === id); if (!s) return;
  openModal({ size: 'md', label: L(s.t), view: 'Service', props: { id } });
}
export function svcModal(id) {
  const s = ALL_SVC.find((x) => x.id === id); if (!s) return null;
  const steps = s.m === 'on' ? [['ДАН-аар нэвтэрнэ', 'Sign in with DAN'], ['Мэдээллээ шалгаж баталгаажуулна', 'Check and confirm your details'], ['Хүсэлтээ илгээж, хариугаа Миний буланд авна', 'Send the request and get the answer in My page']]
    : s.m === 'off' ? [['Цагаа онлайнаар захиална', 'Book a time online'], ['Иргэний үнэмлэх, холбогдох баримтаа бүрдүүлнэ', 'Bring your ID and documents'], ['Захиалсан цагтаа очиж үйлчлүүлнэ', 'Visit at your booked time']]
    : [['Системд ДАН-аар нэвтэрнэ', 'Sign in with DAN'], ['Үйлчилгээгээ сонгоно', 'Choose a service'], ['Явцаа системээс хянана', 'Track progress in the system']];
  return {
    id: s.id, i: s.i, m: s.m, title: L(s.t), desc: L(s.d),
    time: [t('svcTime'), s.m === 'off' ? L(['1 өдөр', '1 day']) : L(['5–10 минут', '5–10 min'])], fee: [t('svcFee'), t('svcFree')],
    stepsT: t('svcSteps'), steps: steps.map(L), docsT: t('svcDocs'), docs: L(['Иргэний үнэмлэх эсвэл ДАН баталгаажуулалт', 'Your ID card or a DAN sign-in']),
    btn: s.m === 'sys' ? t('openSys') : s.m === 'on' ? t('applyOnline') : t('book'),
  };
}
HOME.svcModal = svcModal;
export function svcApply(id) {
  const s = ALL_SVC.find((x) => x.id === id);
  const doIt = () => { addRequest('service', s.t); closeModal(); toast(t('requestSent'), 'send'); };
  if (!S.user) openLogin(doIt); else doIt();
}
/* Цаг захиалах: ажлын 5 өдөр (o.wd бол долоо хоногийн тэр өдөр), цагууд. Сонголтыг (өдөр, цаг) Booking цонх өөрөө барина. */
export function bookDays(o) {
  const days = []; let d = today();
  while (days.length < 5) { d = addDays(d, 1); if (o.wd != null ? d.getDay() === o.wd : d.getDay() !== 0 && d.getDay() !== 6) days.push(d); }
  const slots = o.wd != null ? ['14:00', '14:20', '14:40', '15:00', '15:20', '15:40'] : ['09:30', '10:30', '11:30', '14:00', '15:30', '16:30'];
  return { days, slots };
}
export function openBooking(o) {
  const ok = (di, si) => { const { days, slots } = bookDays(o); closeModal(); toast(`${t('booked')}: ${fDate(days[di], true)}, ${slots[si]}`, 'calendar-check'); if (o.onDone) o.onDone(); };
  openModal({ size: 'md', label: t('book'), view: 'Booking', props: { o, ok } });
}
HOME.booking = (o) => {
  const { days, slots } = bookDays(o);
  return {
    title: t('book'), sub: L(o.t), place: L(o.place || ['Сүхбаатар дүүргийн иргэний үйлчилгээний төв', 'Sükhbaatar District service centre']),
    pick: t('pickSlot'), confirm: t('confirmBook'), slots,
    days: days.map((x) => ({ wd: EN() ? EN_WD[x.getDay()] : MN_WDS[x.getDay()], d: x.getDate() })),
    /* дүүрсэн цаг: [өдөр][цаг] */
    taken: days.map((_, a) => slots.map((__, b) => (a * 7 + b * 3) % 5 === 0)),
  };
};
export function stepApply(i) {
  const s = SITS.find((x) => x.id === S.sit), st = s.steps[i];
  if (st.m === 'off') { openBooking({ t: st.t, onDone: () => toggleStep(i, true) }); return; }
  const doIt = () => { addRequest('service', st.t); toggleStep(i, true); toast(t('stepSent'), 'send'); };
  if (!S.user) openLogin(doIt); else doIt();
}
