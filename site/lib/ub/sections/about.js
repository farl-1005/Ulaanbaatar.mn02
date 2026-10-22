import { mediaSrc } from '../core/cms.js';
import { esc, ic } from '../core/helpers.js';
import { HOME } from '../core/home.js';
import { EN, L, t } from '../core/state.js';
import { ORGS, ORG_CATS, STRUCT } from '../data/about.js';
import { ADMIN_NAMES } from '../data/news.js';
/* ================= About ================= */
/* Харьяа байгууллага: admin-аас лого оруулсан бол лого (цагаан дэвсгэр дээр), үгүй бол тэмдэг */
export function orgMark(o, cls = 'w-11 h-11') {
  const src = mediaSrc(o.logo) || (/^(assets\/news\/org-[\w-]+\.webp|https:\/\/ulaanbaatar\.mn\/files\/[^"'<>\s]+)$/.test(o.logo || '') ? o.logo : '');
  return src ? `<span class="org-logo org-logo-fit"><img src="${src}" alt="" loading="lazy" decoding="async"></span>` : `<span class="${cls} rounded-xl bg-soft grid place-items-center text-ubred shrink-0">${ic(o.i || 'building-2', 'w-5 h-5')}</span>`;
}
export function orgTile(o) {
  const inner = `${orgMark(o)}<span class="text-[14px] font-semibold leading-snug line-clamp-2">${esc(L(o.t))}</span>`;
  return /^https?:\/\//.test(o.url || '') ? `<a href="${esc(o.url)}" target="_blank" rel="noopener" class="org-tile group">${inner}${ic('arrow-up-right', 'org-go w-4 h-4')}</a>` : `<div class="org-tile">${inner}</div>`;
}
/* «Хотын тухай» хэсгийг site/app/home/About.tsx зурна. Энэ функц түүнд хэрэгтэй өгөгдлийг (сонгосон хэлээр) бэлдэнэ. */
export function aboutData() {
  return {
    facts: [[t('founded'), '1639'], [t('area'), EN() ? '4,704 km²' : '4 704 км²'], [t('admin'), t('adminV')], [t('elevation'), EN() ? '1,350 m' : '1 350 м']],
    struct: STRUCT.map((x) => ({ i: x.i, title: L(x.t), desc: L(x.d) })),
    names: ADMIN_NAMES.map(([y, mn, en]) => ({ y, name: EN() ? en : mn })),
    cats: ORG_CATS.map((c) => ({ id: c.id, title: L(c.t), n: ORGS.filter((o) => o.cat === c.id).length })),
    orgs: ORGS.map((o) => ({ id: o.id, cat: o.cat, html: orgTile(o) })),
  };
}
HOME.about = aboutData;
