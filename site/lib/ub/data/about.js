import { LIVE_ORGS } from '../live.js';
/* ================= About ================= */
export const STRUCT = [
  { i: 'users-round', t: ['Иргэд', 'Residents'], d: ['Дөрвөн жил тутам төлөөлөгчөө сонгоно', 'Elect representatives every four years'] },
  { i: 'landmark', t: ['Нийслэлийн Иргэдийн Төлөөлөгчдийн Хурал', 'City Council (Citizens\u2019 Representatives Khural)'], d: ['45 төлөөлөгч. Төсөв, журам батлах, хяналт тавих', '45 members. Approves the budget and rules, oversees'] },
  { i: 'building', t: ['Нийслэлийн Засаг дарга, Хотын Захирагч', 'Governor of the Capital City and Mayor'], d: ['Гүйцэтгэх засаглал, өдөр тутмын удирдлага', 'Executive power and day-to-day management'] },
  { i: 'network', t: ['Тамгын газар, 30 гаруй агентлаг', 'City Hall and 30+ agencies'], d: ['Тээвэр, боловсрол, эрүүл мэнд, дэд бүтэц', 'Transport, education, health, utilities'] },
  { i: 'map', t: ['9 дүүрэг, 204 хороо', '9 districts, 204 khoroos'], d: ['Иргэдэд хамгийн ойр засаглал', 'Government closest to residents'] },
];
export const ORGS = [
  { i: 'siren', t: ['Онцгой байдлын газар', 'Emergency Management Agency'] },
  { i: 'bus', t: ['Нийтийн тээврийн газар', 'Public Transport Department'] },
  { i: 'graduation-cap', t: ['Боловсролын газар', 'Education Department'] },
  { i: 'stethoscope', t: ['Эрүүл мэндийн газар', 'Health Department'] },
  { i: 'building-2', t: ['Хот байгуулалтын газар', 'Urban Development Department'] },
  { i: 'wind', t: ['Агаарын чанарын газар', 'Air Quality Department'] },
  { i: 'droplets', t: ['Ус сувгийн удирдах газар', 'Water Supply and Sewerage Authority'] },
  { i: 'flame', t: ['Дулааны сүлжээ', 'District Heating Network'] },
  { i: 'trending-up', t: ['Хөрөнгө оруулалтын газар', 'Investment Department'] },
  { i: 'trees', t: ['Ногоон байгууламжийн газар', 'Parks and Greenery Department'] },
  { i: 'shield', t: ['Цагдаагийн газар', 'City Police'] },
  { i: 'hand-heart', t: ['Нийгмийн халамжийн газар', 'Social Welfare Department'] },
];
/* Бодит харьяа байгууллагууд (build үед ulaanbaatar.mn/government-оос, server/sources/orgs.ts): ангилал, нэр, вэб сайт, лого.
   Эх сурвалж зөвхөн монголоор өгдөг тул ангилал, дүүргийн нэрсийн англи орчуулгыг энд нэмнэ (бусад нь монголоор харагдана). */
const ORG_CAT_EN = { 'Монгол Улсын Нийслэл': 'Capital City', 'Дүүрэг': 'Districts', 'Хэрэгжүүлэгч агентлаг': 'Implementing agencies', 'Харьяа байгууллага': 'Affiliated organisations',
  'ЗАА Харьяа байгууллага': 'Organisations under the Governor', 'Нийслэлийн өмчит төсөвт байгууллагууд': 'City-owned budget entities' };
const DISTRICT_EN = { 'Багануур': 'Baganuur', 'Багахангай': 'Bagakhangai', 'Баянгол': 'Bayangol', 'Баянзүрх': 'Bayanzürkh', 'Налайх': 'Nalaikh', 'Сонгинохайрхан': 'Songinokhairkhan', 'Сүхбаатар': 'Sükhbaatar', 'Хан-Уул': 'Khan-Uul', 'Чингэлтэй': 'Chingeltei' };
const orgEn = (t) => { const m = /^(\S+) дүүрэг$/.exec(String(t).trim()); return m && DISTRICT_EN[m[1]] ? DISTRICT_EN[m[1]] + ' District' : ''; };
export const ORG_CATS = [];
(function () {
  if (typeof LIVE_ORGS === 'undefined' || !LIVE_ORGS.orgs || !LIVE_ORGS.orgs.length) return;
  ORG_CATS.push(...LIVE_ORGS.cats.map((c) => ({ id: c.id, t: [c.t, ORG_CAT_EN[String(c.t).trim()] || ''] })));
  ORGS.splice(0, ORGS.length, ...LIVE_ORGS.orgs.map((o) => ({ id: 'org' + o.id, cat: o.cat, t: [o.t, orgEn(o.t)], url: o.url, logo: o.logo, i: 'building-2' })));
})();

