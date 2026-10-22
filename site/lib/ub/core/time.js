import { EN, L, S } from './state.js';
/* ================= Time (Ulaanbaatar, UTC+8) ================= */
export function ubNow() { const d = new Date(); return new Date(d.getTime() + (480 + d.getTimezoneOffset()) * 60000); }
export function today() { const d = ubNow(); d.setHours(0, 0, 0, 0); return d; }
export function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
export const dkey = (d) => d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
export const MN_WD = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
export const MN_WDS = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'];
export const EN_WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const EN_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const EN_MONF = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function fDate(d, wd) { if (EN()) return (wd ? EN_WD[d.getDay()] + ', ' : '') + EN_MON[d.getMonth()] + ' ' + d.getDate(); return (wd ? MN_WD[d.getDay()] + ', ' : '') + (d.getMonth() + 1) + '-р сарын ' + d.getDate(); }
export function fMonth(y, m) { return EN() ? EN_MONF[m] + ' ' + y : y + ' оны ' + (m + 1) + '-р сар'; }
export const pad = (n) => String(n).padStart(2, '0');
export function hhmm(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
export function clock(sec) { const d = ubNow(); return hhmm(d) + (sec ? ':' + pad(d.getSeconds()) : ''); }
export function ago(min) {
  if (min < 1) return EN() ? 'Just now' : 'Дөнгөж сая';
  if (min < 60) return EN() ? min + ' min ago' : min + ' минутын өмнө';
  if (min < 1440) { const h = Math.floor(min / 60); return EN() ? h + ' h ago' : h + ' цагийн өмнө'; }
  const d = Math.floor(min / 1440); return EN() ? (d === 1 ? 'Yesterday' : d + ' days ago') : (d === 1 ? 'Өчигдөр' : d + ' өдрийн өмнө');
}
export function fill(s) {
  return String(s).replace(/\{t([+-]\d+)\}/g, (_, n) => fDate(addDays(today(), +n)))
    .replace(/\{aqi\}/g, S.aqi).replace(/\{tr\}/g, S.traffic);
}
export function Lf(v) { return fill(L(v)); }
export function num(n) { const s = String(Math.round(n)); return s.replace(/\B(?=(\d{3})+(?!\d))/g, EN() ? ',' : '\u00A0'); }
export function money(n) { return EN() ? '₮' + num(n) : num(n) + '₮'; }
export function bn(n) { return EN() ? '₮' + num(n) + ' bn' : num(n) + ' тэрбум ₮'; }
export function mln(n) { if (n >= 1000) { const v = Math.round(n / 100) / 10; return EN() ? '₮' + v + ' bn' : String(v) + ' тэрбум ₮'; } return EN() ? '₮' + num(n) + ' m' : num(n) + ' сая ₮'; }
export function evDate(w) {
  const n = today(), dow = n.getDay(); let off = 0;
  if (w === 'tomorrow') off = 1;
  else if (w === 'sat') off = dow === 6 ? 0 : dow === 0 ? 6 : 6 - dow;
  else if (w === 'sun') off = dow === 0 ? 0 : 7 - dow;
  else if (w === 'fri') off = dow <= 5 ? 5 - dow : 6;
  else if (typeof w === 'number') off = w;
  return addDays(n, off);
}
export function weekendKeys() { const n = today(), dow = n.getDay(); if (dow === 0) return [dkey(n)]; if (dow === 6) return [dkey(n), dkey(addDays(n, 1))]; return [dkey(addDays(n, 6 - dow)), dkey(addDays(n, 7 - dow))]; }
/* AQI (АНУ-ын EPA) 6 ангилал: өнгө + зөвлөмж */
export function aqiCat(v) { if (v <= 50) return { k: 'aqiGood', c: '#10A36A', adv: 'aqiAdvGood' }; if (v <= 100) return { k: 'aqiMod', c: '#E5A800', adv: 'aqiAdvice' }; if (v <= 150) return { k: 'aqiUsg', c: '#F08C1A', adv: 'aqiAdvUsg' }; if (v <= 200) return { k: 'aqiBad', c: '#D81E34', adv: 'aqiAdvBad' }; if (v <= 300) return { k: 'aqiVBad', c: '#8F3F97', adv: 'aqiAdvVBad' }; return { k: 'aqiHaz', c: '#7E0023', adv: 'aqiAdvHaz' }; }
export const POL = { p2: 'PM2.5', p1: 'PM10', o3: 'O₃', n2: 'NO₂', s2: 'SO₂', co: 'CO' };
/* Шкал дээрх байрлал (0–1): 6 ангилал тэнцүү өргөнтэй */
export function aqiPos(v) { const b = [0, 50, 100, 150, 200, 300, 500]; for (let i = 1; i < b.length; i++) if (v <= b[i]) return (i - 1 + (v - b[i - 1]) / (b[i] - b[i - 1])) / 6; return 1; }
export const pm25 = () => Math.round(S.aqi * 0.36);

