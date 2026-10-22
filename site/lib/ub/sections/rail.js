import { Scene } from '../art/scene.js';
import { dayOffset } from '../core/cms.js';
import { goAttrs } from '../core/header.js';
import { esc, ic, store } from '../core/helpers.js';
import { HOME } from '../core/home.js';
import { L } from '../core/state.js';
import { BANNERS, RAIL_THEMES } from '../data/banners.js';
/* ================= Босоо баннер =================
   Өргөн дэлгэцийн (≥1840px) баруун хоосон зайд, зөвхөн идэвхтэй баннер байх үед харагдана:
   admin-ы эхлэх/дуусах огноо, «Түр нуух», хэрэглэгч хаавал 24 цаг. Гүйлгэхэд дагаж явж (sticky), footer-оос өмнө зогсоно. */
export const MONG = '\u1824\u182F\u1820\u182D\u1820\u1828\u182A\u1820\u182D\u1820\u1832\u1824\u1837';   // «Улаанбаатар» монгол бичгээр
export const RAIL = { scenes: {} };   // Scene() зургийн хадгалалт (img → SVG)
export function railActive() {
  const hide = store.get('railHide', {}), now = Date.now();
  return BANNERS.filter((b) => !b.off && b.t && L(b.t) && (!b.from || dayOffset(b.from) <= 0) && (!b.to || dayOffset(b.to) >= 0) && !(hide[b.id] && now - hide[b.id] < 864e5));
}
/* Баннерын карт (admin-ы урьдчилан харахад ч: assets/kit.js railCard). Дотор талыг railInner() бэлдэнэ. */
export function railCard(b, o = {}) {
  const th = RAIL_THEMES[b.theme] || RAIL_THEMES.red;
  return `<article class="rail-slide ${o.on ? 'is-on' : ''}" style="--r1:${th[0]};--r2:${th[1]}" data-id="${esc(b.id || '')}" ${o.on ? '' : 'aria-hidden="true" inert'}>${railInner(b, o)}</article>`;
}
export function railInner(b, o = {}, scene) {
  const left = b.to ? dayOffset(b.to) : null;
  const act = b.act === 'vote' ? 'data-act="vote"' : b.act === 'report' ? 'data-act="report"'
    : b.act === 'url' && /^https?:\/\//.test(b.href || '') ? `data-act="ext-link" data-href="${esc(b.href)}"` : `data-act="go" ${goAttrs(b.go || { sec: 'hero' })}`;
  return `<div class="rail-img scene">${scene || Scene(b.img || 'skyline:dawn:21')}</div>
    <span class="rail-mong mong" lang="mn-Mong" aria-hidden="true">${MONG}</span>
    <div class="rail-body">
      ${b.tag && L(b.tag) ? `<span class="rail-tag">${esc(L(b.tag))}</span>` : ''}
      <h3 class="rail-t">${esc(L(b.t))}</h3>
      ${b.d && L(b.d) ? `<p class="rail-d">${esc(L(b.d))}</p>` : ''}
      ${left != null && left <= 30 ? `<p class="rail-left">${ic('hourglass', 'w-3.5 h-3.5')}${left > 0 ? L([`${left} хоног үлдлээ`, `${left} days left`]) : L(['Өнөөдөр дуусна', 'Ends today'])}</p>` : ''}
      <button type="button" class="rail-btn" ${o.preview ? 'tabindex="-1"' : act}>${esc((b.btn && L(b.btn)) || L(['Дэлгэрэнгүй', 'Learn more']))}${ic('arrow-right', 'w-4 h-4')}</button>
    </div>`;
}
/* Баннерыг site/app/home/Rail.tsx зурна (сэлгэх, цэг, хаах, «орох» хөдөлгөөн). Энэ функц идэвхтэй баннеруудыг сонгосон хэлээр бэлдэнэ.
   Scene() дуудах бүрт шинэ id үүсгэдэг тул зургийг нэг удаа үүсгэж хадгална (React дахин зурахад зураг солигдохгүй). */
export function railData() {
  return {
    label: L(['Онцлох', 'Featured']), close: L(['Хаах (24 цаг харагдахгүй)', 'Close (hidden for 24 h)']), closeT: L(['Хаах', 'Close']),
    slides: railActive().map((b) => {
      const th = RAIL_THEMES[b.theme] || RAIL_THEMES.red, img = b.img || 'skyline:dawn:21';
      if (!RAIL.scenes[img]) RAIL.scenes[img] = Scene(img);
      return { id: b.id || '', r1: th[0], r2: th[1], html: railInner(b, {}, RAIL.scenes[img]) };
    }),
  };
}
HOME.rail = railData;
/* Хэрэглэгч хаасан баннер 24 цаг харагдахгүй */
HOME.railHide = (id) => { const hide = store.get('railHide', {}); hide[id] = Date.now(); store.set('railHide', hide); };
