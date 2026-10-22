'use client';
/* React бүрэлдэхүүнүүд (chrome/: header, цэс, footer; home/: нүүрний хэсгүүд) сайтын төлөв, текст, икон, өгөгдлийг src/core/bridge.js-ийн window.UB-аас уншина.
   assets/app.js ачаалагдахаас өмнө (useUB() === null) юу ч зурахгүй. */
import { useSyncExternalStore, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';

type Pair = [string, string];
export interface MenuItem { i: string; t: string; d: string; href: string; go: Record<string, string> | null }
export interface MenuGroup { k: string; page: string | null; label: string; items: MenuItem[] }
export interface Pulse {
  temp: number; feels: number; wxText: string; wxIcon: string; wind: number; dir: string; hum: number; wxLive: boolean;
  aqi: number; aqiLabel: string; aqiColor: string; aqiAdvice: string; aqiPos: number; airSrc: string;
  traffic: number; roads: [string, number][];
}
export interface NewsCard { id: string; title: string; scene: string; rub: string; rubColor: string; ago: string; views: string }
export interface HeroData {
  main: NewsCard & { lead: string; minRead: string };
  rel: NewsCard[];
  breaking: { id: string; title: string; rub: string; dot: string; hot: boolean; fresh: boolean; isNew: boolean; time: string }[];
  gov: { id: string; title: string; ago: string }[];
  quick: { id: string; i: string; title: string; dot: string; mode: string }[];
}
export interface AboutData {
  facts: [string, string][];
  struct: { i: string; title: string; desc: string }[];
  names: { y: string | number; name: string }[];
  cats: { id: string; title: string; n: number }[];
  orgs: { id: string; cat: string; html: string }[];
}
export interface UB {
  v: number;
  menuOpen: boolean;
  state(): { lang: 'mn' | 'en'; theme: 'light' | 'dark'; a11y: boolean; user: boolean; intro: boolean; me: { ini: string; n: string }; route: 'home' | 'page' | 'news' | 'my' | '404'; page: string | null; reduced: boolean };
  menu(): MenuGroup[];
  pulse(): Pulse;
  megaFeat(i: number): string;
  clock(sec?: boolean): string;
  t(k: string, vars?: Record<string, string | number>): string;
  L(v: string | Pair): string;
  icon(n: string): string;
  animIcon(n: string, c?: string): string;
  logo: string;
  skylineSVG(pid: string): string;
  watchSky(el: Element): void;
  /** Нүүрний хэсгүүдийн өгөгдөл, туслах функц (src/sections/*.js-д HOME.<нэр> = ...) */
  home: { hero(): HeroData | null; about(): AboutData } & Record<string, (...a: any[]) => any>;
  placePill(list: HTMLElement, animate: boolean): void;
  /** Нээлттэй цонх (src/core/modal.js MODAL) */
  modal(): unknown;
  closeModal(): void;
  toasts(): { id: number; msg: string; icon: string; out: boolean }[];
  fireIcon(): string;
  openPage(k: string): void;
  closeMenu(): void;
  dockProgress(): void;
}
declare global { interface Window { UB?: UB } }

/* 'ub:render' ирэхэд шууд (flushSync) зурна: хуучин код дараагийн мөрөнд шинэ DOM-ыг (жишээ нь .nav-btn) ашигладаг */
const subscribe = (cb: () => void) => {
  const h = () => flushSync(cb);
  window.addEventListener('ub:render', h);
  return () => window.removeEventListener('ub:render', h);
};
export function useUB(): UB | null {
  const v = useSyncExternalStore(subscribe, () => window.UB?.v ?? -1, () => -1);
  return v < 0 ? null : window.UB!;
}

/** Lucide икон (src/core/helpers.js ic(n, c, sw)-тэй ижил тэмдэглэгээ; sw = зураасны зузаан) */
export function Icon({ ub, n, c = 'w-5 h-5', sw = 1.9 }: { ub: UB; n: string; c?: string; sw?: number }) {
  return <svg className={`${c} shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: ub.icon(n) }} />;
}

/** Хөдөлгөөнт сүлд (styles/06-header-dock.css .logo-em) */
export function Emblem({ ub, c }: { ub: UB; c: string }) {
  return <span className={`logo-em ${c}`} aria-hidden="true"><img src={ub.logo} className="w-full h-full object-contain" alt="" decoding="async" draggable={false} /></span>;
}
export function LogoMark({ ub, c }: { ub: UB; c: string }) {
  return <img src={ub.logo} className={`${c} shrink-0 object-contain`} alt="" aria-hidden="true" decoding="async" draggable={false} />;
}

/** Хуучин код (features/live-data.js setLive, features/weather.js) 5 секунд тутам шинэчилдэг утга: React зөвхөн утга өөрчлөгдөхөд дарж бичнэ */
export function Live({ k, v }: { k: string; v: string | number }) {
  return <span data-live={k} dangerouslySetInnerHTML={{ __html: String(v) }} />;
}

/** Цэсийн холбоос: сайтын хэсэг (data-act="go") эсвэл гадаад хаяг. Дарахыг features/wiring.js барина. */
export function itemAct(it: MenuItem): Record<string, string> {
  if (it.href) return { 'data-act': 'ext-link', 'data-href': it.href };
  return Object.assign({ 'data-act': 'go' }, ...Object.entries(it.go || { sec: 'hero' }).map(([k, v]) => ({ ['data-' + k]: String(v) })));
}

/** HTML мөрөнд оруулах текст */
export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export const cssVars = (o: Record<string, string | number>) => o as CSSProperties;
