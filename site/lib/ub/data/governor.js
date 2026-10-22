import { addDays, today } from '../core/time.js';
/* ================= Засаг даргын ажлын хуваарь (sections/governor.js govData → site/app/home/Gov.tsx, admin «Засаг даргын хуваарь») =================
   Жишээ хуваарь: өнөөдрөөс хамааран огноо нь тооцогдоно. Admin-аас бодит хуваариар солино. */
export const GOV_TYPES = {
  meeting: { c: '#145095', i: 'handshake', t: ['Уулзалт', 'Meeting'] },
  session: { c: '#7C4DFF', i: 'landmark', t: ['Хуралдаан', 'Session'] },
  visit: { c: '#0EA068', i: 'map-pinned', t: ['Ажлын айлчлал', 'Site visit'] },
  reception: { c: '#D81E34', i: 'users-round', t: ['Иргэдийн хүлээн авалт', 'Citizen reception'] },
  event: { c: '#E58A00', i: 'sparkles', t: ['Арга хэмжээ', 'Event'] },
};
export const isoOff = (n) => { const d = addDays(today(), n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const GOV_SCHED = [
  { id: 'g1', date: isoOff(-1), from: '16:00', to: '17:30', type: 'event', t: ['«Залуу Улаанбаатар» залуучуудын форум', '"Young Ulaanbaatar" youth forum'], place: ['Төв цэнгэлдэх хүрээлэн', 'Central Stadium'], d: ['Залуучуудын санал санаачилгыг сонсож, хотын хөгжлийн бодлогод тусгах.', 'Listening to young people\u2019s ideas for city policy.'] },
  { id: 'g2', date: isoOff(0), from: '09:00', to: '10:30', type: 'session', t: ['Засаг даргын шуурхай зөвлөгөөн', 'Weekly operational meeting'], place: ['Нийслэлийн Засаг даргын Тамгын газар, 3 давхар', 'City Hall, 3rd floor'], d: ['Өвөлжилтийн бэлтгэл, нийтийн тээвэр, гэр хорооллын дахин төлөвлөлтийн явц.', 'Winter readiness, public transport and ger-district redevelopment.'] },
  { id: 'g3', date: isoOff(0), from: '14:00', to: '16:00', type: 'reception', t: ['Иргэдийн хүлээн авалт', 'Citizen reception'], place: ['Иргэний танхим', 'Civic Hall'], d: ['Иргэд санал, хүсэлтээ Засаг даргад биечлэн уламжилна.', 'Residents bring their requests to the Governor in person.'] },
  { id: 'g4', date: isoOff(1), from: '10:00', to: '11:00', type: 'meeting', t: ['Сөүл хотын төлөөлөгчидтэй уулзалт', 'Meeting with a Seoul city delegation'], place: ['Төрийн ордон, Хүлээн авалтын танхим', 'Government Palace, reception hall'], d: ['Ухаалаг хот, нийтийн тээврийн чиглэлээр хамтран ажиллах.', 'Cooperation on smart city and public transport.'] },
  { id: 'g5', date: isoOff(1), from: '15:00', to: '16:30', type: 'visit', t: ['Туул хурдны замын ажлын явцтай танилцах', 'Site visit: Tuul Expressway'], place: ['Хан-Уул дүүрэг, 2-р хэсэг', 'Khan-Uul District, section 2'], d: ['Гүйцэтгэл 64% хүрсэн 2-р хэсгийн ажлыг газар дээр нь шалгах.', 'Checking section 2, now 64% complete.'] },
  { id: 'g6', date: isoOff(2), from: '11:00', to: '13:00', type: 'session', t: ['Нийслэлийн ИТХ-ын ээлжит хуралдаан', 'City Council regular session'], place: ['НИТХ-ын хуралдааны танхим', 'City Council chamber'], d: ['2027 оны төсвийн хүрээний мэдэгдлийг хэлэлцэнэ.', 'Discussing the 2027 budget framework.'] },
  { id: 'g7', date: isoOff(3), from: '10:00', to: '12:00', type: 'meeting', t: ['Баянзүрх дүүргийн иргэдтэй уулзалт', 'Town hall with Bayanzürkh residents'], place: ['Баянзүрх дүүргийн соёлын төв', 'Bayanzürkh cultural centre'], d: ['Дулаан, ус хангамж, авто замын асуудлаар иргэдийн санал сонсох.', 'Hearing residents on heating, water and roads.'] },
  { id: 'g8', date: isoOff(4), from: '09:30', to: '11:00', type: 'visit', t: ['Өвөлжилтийн бэлтгэлийг шалгах', 'Winter readiness inspection'], place: ['Дулааны III цахилгаан станц', 'Thermal Power Plant No. 3'], d: ['Түлш, нөөц, засварын ажлын бэлэн байдлыг шалгах.', 'Checking fuel, reserves and repairs.'] },
];
