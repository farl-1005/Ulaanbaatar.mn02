/* ================= Сайтын хүрээ: header, dock цэс, гар утасны цэс, доод мөр, footer =================
   Эдгээрийг React бүрэлдэхүүн (site/app/chrome/) зурна. Тэд сайтын төлөв, текст, икон, цэсийг window.UB-аас уншина.
   Төлөв өөрчлөгдөхөд renderChrome() → 'ub:render' → React шууд (синхрон) дахин зурна, тиймээс дараагийн мөрөнд DOM бэлэн байна. */
const CHROME = { v: 0, menu: false };
function renderChrome() { CHROME.v++; window.dispatchEvent(new Event('ub:render')); }
function openMenu() { CHROME.menu = true; document.body.style.overflow = 'hidden'; renderChrome(); }
function closeMenu() { if (!CHROME.menu) return; CHROME.menu = false; if (!MODAL) document.body.style.overflow = ''; renderChrome(); }

window.UB = {
  /** Өөрчлөлт бүрт нэмэгдэнэ (React useSyncExternalStore) */
  get v() { return CHROME.v; },
  get menuOpen() { return CHROME.menu; },
  state: () => ({ lang: S.lang, theme: S.theme, a11y: !!S.a11y, user: !!S.user, intro: !!S.intro, me: { ini: L(ME.ini), n: L(ME.n) } }),
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
  openPage: (k) => openPage(k),
  closeMenu,
  dockProgress,
};
