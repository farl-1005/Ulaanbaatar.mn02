import { placePill } from './motion.js';
import { skylineSVG, watchSky } from '../art/skyline.js';
import { clock } from './time.js';
import { ICONS, LOGO_SRC } from '../live.js';
import { MENU, dockProgress, megaFeat, pulse } from './header.js';
import { animIcon, fireIcon, reduced } from './helpers.js';
import { HOME } from './home.js';
import { MODAL, TOASTS, closeModal } from './modal.js';
import { openPage, pageOf } from './pages.js';
import { L, S, t } from './state.js';
import { ME } from '../data/my-page.js';
import { PROJECTS } from '../data/projects.js';
/* ================= React гүүр =================
   Сайтын хүрээ (header, цэс, footer — site/app/chrome/) ба нүүрний хэсгүүдийг (site/app/home/) React зурна.
   Тэд сайтын төлөв, текст, икон, өгөгдлийг энэ window.UB-аас уншина.
   Төлөв өөрчлөгдөхөд renderReact() → 'ub:render' → React шууд (синхрон) дахин зурна, тиймээс дараагийн мөрөнд DOM бэлэн байна. */
export const REACT = { v: 0, menu: false };
export function renderReact() { REACT.v++; window.dispatchEvent(new Event('ub:render')); }
export function openMenu() { REACT.menu = true; document.body.style.overflow = 'hidden'; renderReact(); }
export function closeMenu() { if (!REACT.menu) return; REACT.menu = false; if (!MODAL) document.body.style.overflow = ''; renderReact(); }

window.UB = {
  /** Өөрчлөлт бүрт нэмэгдэнэ (React useSyncExternalStore) */
  get v() { return REACT.v; },
  get menuOpen() { return REACT.menu; },
  state: () => ({ lang: S.lang, theme: S.theme, a11y: !!S.a11y, user: !!S.user, intro: !!S.intro, me: { ini: L(ME.ini), n: L(ME.n) }, route: S.route, page: S.page, reduced: reduced }),
  /** Үндсэн цэс (admin-ы засвартай): шошго, хуудас, холбоосууд */
  menu: () => MENU.map((m) => ({
    k: m.k || '', page: pageOf({ sec: m.sec }), label: m.lbl && L(m.lbl) ? L(m.lbl) : m.k ? t(m.k, { n: PROJECTS.length }) : '',
    items: m.items.map((it) => ({ i: it.i, t: L(it.t), d: L(it.d) || '', href: it.href || '', go: it.href ? null : it.go || { sec: 'hero' } })),
  })),
  pulse, megaFeat, clock,
  t, L,
  /** Lucide иконы дотоод SVG (React <svg>-д) */
  icon: (n) => ICONS[n] || '<circle cx="12" cy="12" r="9"/>',
  animIcon, logo: LOGO_SRC, skylineSVG, watchSky,
  /** Цонх (src/core/modal.js MODAL) ба мэдэгдлүүд */
  modal: () => MODAL,
  closeModal: () => closeModal(),
  toasts: () => TOASTS,
  /** Нүүрний хэсгүүд (site/app/home/) */
  home: HOME,
  /** Таб: тодруулгыг идэвхтэй таб руу (src/core/motion.js) */
  placePill,
  fireIcon,
  openPage: (k) => openPage(k),
  closeMenu,
  dockProgress,
};
