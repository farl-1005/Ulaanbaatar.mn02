/* Сервер (server/site/site-builder.ts) 15 минут тутам шинэчилдэг өгөгдөл: /assets/live.json.
   ulaanbaatar.mn-ийн бодит мэдээ, медиа, байгууллага, мега төсөл, ашигласан икон, лого.
   Бусад модуль эдгээрийг ачаалах үед (data/*.js) уншдаг тул loadLive() бусад бүх модулиас ӨМНӨ дуусна (./boot.js). */
export let ICONS = {}, LOGO_SRC = '', LIVE_NEWS = [], LIVE_MEDIA = [], LIVE_ORGS = { cats: [], orgs: [] }, LIVE_MEGA = [], LIVE_IPIU = [];

export async function loadLive() {
  const j = await fetch('/assets/live.json', { cache: 'no-cache' }).then((r) => r.json());
  ({ ICONS, LOGO_SRC, LIVE_NEWS, LIVE_MEDIA, LIVE_ORGS, LIVE_MEGA, LIVE_IPIU } = j);
}
