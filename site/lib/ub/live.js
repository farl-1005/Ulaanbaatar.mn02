/* Сервер (server/site/site-builder.ts) 15 минут тутам шинэчилдэг өгөгдөл: /assets/live.json.
   ulaanbaatar.mn-ийн бодит мэдээ, медиа, байгууллага, мега төсөл, ашигласан икон, лого.
   Бусад модуль эдгээрийг ачаалах үед (data/*.js) уншдаг тул loadLive() бусад бүх модулиас ӨМНӨ дуусна (./boot.js).
   Ачаалсан өгөгдлийг window-д бас хадгална: npm run dev үед Next.js энэ модулийг дахин ажиллуулбал (код засахад) иконууд алга болохгүй. */
const saved = (typeof window !== 'undefined' && window.__ubLive) || {};
export let ICONS = saved.ICONS || {}, LOGO_SRC = saved.LOGO_SRC || '', LIVE_NEWS = saved.LIVE_NEWS || [], LIVE_MEDIA = saved.LIVE_MEDIA || [],
  LIVE_ORGS = saved.LIVE_ORGS || { cats: [], orgs: [] }, LIVE_MEGA = saved.LIVE_MEGA || [], LIVE_IPIU = saved.LIVE_IPIU || [];

export async function loadLive() {
  const j = await fetch('/assets/live.json', { cache: 'no-cache' }).then((r) => {
    if (!r.ok) throw new Error('/assets/live.json ' + r.status + ' (сервер сайтыг бүтээж дуусаагүй байж магадгүй)');
    return r.json();
  });
  window.__ubLive = j;
  ({ ICONS, LOGO_SRC, LIVE_NEWS, LIVE_MEDIA, LIVE_ORGS, LIVE_MEGA, LIVE_IPIU } = j);
}
