/* Сайтын хэрэгсэл: сайтын өөрийн модулиуд (site/lib/ub/, kit.js → window.UBKit).
   Урьдчилан харах картыг сайттай яг адил зурах, анхны агуулга (site/lib/ub/data/), ангилал, текст, икон, газрын зураг.
   Render функц бүр HTML мөр буцаана (<Html html={...} />). */

import { bootKit } from '../../site/lib/ub/boot.js';

/** [монгол, англи] */
export type Bi = [string, string];
export type Lang = 'mn' | 'en';
/** Admin-ы засвар: { бүлэг: { id: бичлэг } } */
export type CmsData = Record<string, Record<string, any>>;

interface Tax { t: Bi; c: string; i?: string }
export interface KitState {
  RUB: Record<string, Tax>; ECAT: Record<string, Tax>; PCAT: Record<string, Tax>;
  NEWS_NT: Record<string, Bi>; GOV_TYPES: Record<string, Tax>; RAIL_THEMES: Record<string, string[]>; RAIL_THEME_L: Record<string, Bi>;
  ORG_CATS: { id: string; t: Bi }[]; RCAT: Record<string, { t: Bi; i: string }>; TOPICS: [string, string, string][];
  SITS: any[]; PROJECTS: any[]; ALL_SVC: any[]; QUICK: string[]; GOV: string[]; HERO_ID: string; FEATURED_ID: string;
  SET: Record<string, any>; CHAT_CHIPS: Bi[]; SQ_POP: Bi[]; I: Record<string, Bi>; EVDESC: Record<string, Bi>; MEDIA_MAX: number;
  SEASON_L: Record<string, Bi>; SEASON_IC: Record<string, string>; season: string;
}
export interface MapViewInstance { destroy(): void; recluster(keep?: boolean): void }

export interface Kit {
  apply(data: CmsData): void;
  setLang(l: Lang): void;
  lang(): Lang;
  applyTheme(): void;
  cols: string[];
  defaults: Record<string, any[]> & { settings: Record<string, any>; texts: Record<string, Bi> };
  state(): KitState;
  newsCard(n: any, feat?: boolean): string;
  evCard(e: any): string;
  svcTile(s: any): string;
  pctRing(p: number, size: number, stroke: number, color: string, fs: number): string;
  projBadge(p: any, size: number, stroke: number, fs: number): string;
  orgMark(o: any, cls?: string): string;
  orgTile(o: any): string;
  govRow(e: any, st: unknown, i: number): string;
  govState(e: any): unknown;
  railCard(b: any, o?: Record<string, unknown>): string;
  logoMark(cls?: string): string;
  Scene(key: string): string;
  ic(name: string, cls?: string, sw?: number): string;
  MapView: new (host: HTMLElement, o: { cluster: boolean; points: () => any[]; onPick: (x: number, y: number) => void }) => MapViewInstance;
  inDistrict(x: number, y: number): { n: Bi };
  L(v: unknown): string;
  t(k: string, vars?: Record<string, unknown>): string;
  esc(s: unknown): string;
  num(n: number): string;
  bn(n: number): string;
  ago(min: number): string;
  pad(n: number): string;
  fDate(d: Date, wd?: boolean): string;
  hhmm(d: Date): string;
  parseUB(s: unknown): Date | null;
  ubNow(): Date;
  today(): Date;
  addDays(d: Date, n: number): Date;
  dayOffset(ds: unknown): number;
  evDate(w: number): Date;
  mediaSrc(key: unknown): string;
  linesOf(pairs: Bi[]): string;
  EN(): boolean;
  EN_MON: string[];
}

declare global {
  interface Window { UBKit?: Kit }
}

let loaded: Kit | null = null;

/** Ачаалсан kit (App нь kit ачаалагдсаны дараа л бусад хэсгийг зурна) */
export function kit(): Kit {
  if (!loaded) throw new Error('kit.js ачаалагдаагүй');
  return loaded;
}

/** Сайтын модулиудыг ачаална (эхлээд /assets/live.json — сервер бүтээгээгүй бол алдаа өгнө) */
export async function loadKit(): Promise<Kit> {
  if (!window.UBKit) await bootKit();
  if (!window.UBKit) throw new Error('UBKit алга');
  return (loaded = window.UBKit);
}

/** [монгол, англи] → одоогийн хэлээр */
export const L = (v: unknown) => kit().L(v);
export const st = () => kit().state();
