/* Сервер (server/site/site-builder.ts) 15 минут тутам шинэчилдэг өгөгдөл: /assets/live.json.
   ulaanbaatar.mn-ийн бодит мэдээ, медиа, байгууллага, мега төсөл, ашигласан икон, лого.
   ./boot.js файлыг эхлээд татаж window.__ubLive-д хийнэ, дараа нь л энэ модуль (бусад модулийн хамт) ачаалагдаж утгаа авна.
   Утгуудыг дахин оноодоггүй (const): production build (Turbopack) export-ын дахин оноолтыг бусад модульд дамжуулдаггүй. */
const j = (typeof window !== 'undefined' && window.__ubLive) || {};
export const ICONS = j.ICONS || {}, LOGO_SRC = j.LOGO_SRC || '', LIVE_NEWS = j.LIVE_NEWS || [], LIVE_MEDIA = j.LIVE_MEDIA || [],
  LIVE_ORGS = j.LIVE_ORGS || { cats: [], orgs: [] }, LIVE_MEGA = j.LIVE_MEGA || [], LIVE_IPIU = j.LIVE_IPIU || [];
