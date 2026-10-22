import { LIVE_MEDIA } from '../live.js';
/* ================= Media ================= */
export const MEDIA = [
  { type: 'live', img: 'civic:navy:31', viewers: 1240, t: ['Нийслэлийн ИТХ-ын ээлжит хуралдаан', 'City Council regular session'], d: ['Хуралдааны танхимаас шууд', 'Live from the council chamber'] },
  { type: 'live', img: 'bridge:day:32', dur: '12:34', t: ['Туул хурдны зам: дроноос харахад', 'Tuul Expressway from a drone'], d: ['2-р хэсгийн ажил 64% хүрлээ', 'Section 2 has reached 64%'] },
  { type: 'photo', img: 'skyline:dusk:33', n: 31, t: ['Намрын Улаанбаатар', 'Ulaanbaatar in autumn'], d: ['Фото сурвалжилга', 'Photo story'] },
  { type: 'podcast', img: 'ger:dusk:34', dur: '38:12', ep: '#24', t: ['«Хотын яриа»: Гэр хорооллыг хэрхэн дахин төлөвлөх вэ?', '"City Talk": how should ger districts be redeveloped?'], d: ['Хот төлөвлөгч, иргэдийн төлөөлөлтэй', 'With a planner and residents'] },
  { type: 'poster', img: 'road:night:35', dur: '3:05', t: ['Ухаалаг гэрлэн дохио хэрхэн ажилладаг вэ', 'How the smart traffic lights work'], d: ['3 минутын тайлбар', 'A three-minute explainer'] },
  { type: 'photo', img: 'school:day:36', n: 18, t: ['Шинэ цэцэрлэгийн нээлт', 'A new kindergarten opens'], d: ['Сүхбаатар дүүрэг', 'Sükhbaatar District'] },
];
/* Бодит медиа: build үед ulaanbaatar.mn-ээс татсан LIVE_MEDIA (server/sources/media.ts). Байвал жишээ медиаг солино.
   «Бүгд» жагсаалтад төрлүүд ээлжилнэ (Live, Фото, Постер, Подкаст, Live ...), тиймээс нүүрний 6-д бүгд орно. */
(function () {
  if (typeof LIVE_MEDIA === 'undefined' || !LIVE_MEDIA.length) return;
  const by = {}; LIVE_MEDIA.forEach((m) => (by[m.type] = by[m.type] || []).push(m));
  const out = [];
  for (let k = 0; out.length < LIVE_MEDIA.length; k++) ['live', 'photo', 'poster', 'podcast'].forEach((ty) => { const x = (by[ty] || [])[k]; if (x) out.push(x); });
  MEDIA.splice(0, MEDIA.length, ...out.map((m) => ({ id: m.id, nid: m.nid, type: m.type, live: 1, t: [m.t, ''], d: ['', ''], date: m.d, views: m.views, img: m.img, video: m.video, photos: m.photos, n: m.photos.length, body: m.body })));
})();
