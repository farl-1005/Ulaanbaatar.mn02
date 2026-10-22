/* Сайтын (эсвэл admin-ы) логикийг асаана: эхлээд бодит өгөгдлийг (/assets/live.json) татаж, дараа нь модулиудыг.
   Модулиуд ачаалах үедээ өгөгдлөө бэлддэг (live.js, data/*.js) тул динамик import заавал татсаны дараа. */
async function loadLive() {
  if (window.__ubLive) return;   // npm run dev: модуль дахин ачаалагдахад өмнөх өгөгдлөө ашиглана
  const r = await fetch('/assets/live.json', { cache: 'no-cache' });
  if (!r.ok) throw new Error('/assets/live.json ' + r.status + ' (сервер сайтыг бүтээж дуусаагүй байж магадгүй)');
  window.__ubLive = await r.json();
}

let started = null;
/** Нийтийн сайт: бүх модуль, эцэст нь init() сайтыг асаана (window.UB → React) */
export function bootSite() { return (started = started || loadLive().then(() => import('./main.js'))); }
/** Admin: урьдчилан харах карт, анхны агуулга (window.UBKit) */
export function bootKit() { return (started = started || loadLive().then(() => import('./kit.js'))); }
