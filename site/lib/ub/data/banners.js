import { addDays, today } from '../core/time.js';
/* ================= Босоо баннер: өргөн дэлгэцийн баруун хоосон зайд (sections/rail.js renderRail, admin «Босоо баннер») ================= */
export const RAIL_THEMES = { red: ['#D81E34', '#7A0D20'], navy: ['#1A3576', '#070F26'], blue: ['#145095', '#0A2E57'], green: ['#0EA068', '#04573A'], gold: ['#E9A213', '#8F5200'] };
export const RAIL_THEME_L = { red: ['Улаан', 'Red'], navy: ['Хар хөх', 'Navy'], blue: ['Цэнхэр', 'Blue'], green: ['Ногоон', 'Green'], gold: ['Алтан', 'Gold'] };
export const BANNERS = [
  { id: 'b1', ord: 10, theme: 'red', img: 'skyline:dawn:21', tag: ['2026 он', '2026'], t: ['Бизнес эрхлэгчдийг дэмжих жил', 'Year of Supporting Entrepreneurs'],
    d: ['Бизнесээ эхлүүлэх алхмууд, хөнгөлөлт, зөвлөгөө нэг дор.', 'Steps to start a business, incentives and advice in one place.'], btn: ['Алхмуудыг үзэх', 'See the steps'], act: 'go', go: { sec: 'situations', sit: 'business' }, from: '', to: '' },
  { id: 'b2', ord: 20, theme: 'navy', img: 'park:green:57', tag: ['Санал асуулга', 'Poll'], t: ['Таны хороонд юу хэрэгтэй вэ?', 'What does your khoroo need?'],
    d: ['2027 оны хорооны хөгжлийн сангийн санал асуулга нээлттэй байна.', 'The 2027 khoroo development fund poll is open.'], btn: ['Санал өгөх', 'Have your say'], act: 'vote', from: '',
    to: (() => { const d = addDays(today(), 23); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })() },
];

