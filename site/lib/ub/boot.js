/* Сайтын (эсвэл admin-ы) логикийг асаана: эхлээд бодит өгөгдлийг (live.json) ачаалж, дараа нь модулиудыг.
   Модулиуд ачаалах үедээ өгөгдлөө бэлддэг (data/*.js) тул динамик import заавал loadLive()-ийн дараа. */
import { loadLive } from './live.js';

let started = null;
/** Нийтийн сайт: бүх модуль, эцэст нь features/init.js сайтыг асаана (window.UB → React) */
export function bootSite() { return (started = started || loadLive().then(() => import('./main.js'))); }
/** Admin: урьдчилан харах карт, анхны агуулга (window.UBKit) */
export function bootKit() { return (started = started || loadLive().then(() => import('./kit.js'))); }
