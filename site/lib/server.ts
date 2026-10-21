/* Хуудас бэлдэхэд хэрэгтэй өгөгдөл: Nest API-аас (нэг процесс доторх localhost) сервер талд авна. */
import { headers } from 'next/headers';

/** Nest нь асахдаа өөрийн хаягийг (UBMN_INTERNAL_URL) тохируулна: server/site/next-app.ts */
const api = () => process.env.UBMN_INTERNAL_URL || `http://127.0.0.1:${process.env.PORT || 3000}`;

export const SITE_TITLE = 'ulaanbaatar.mn · Нийслэлийн портал (концепц)';
export const SITE_DESC = 'Улаанбаатар хотын нэгдсэн цахим порталын шинэчилсэн концепц: мэдээ, үйлчилгээ, бүтээн байгуулалт, хотын өгөгдөл.';

export interface SiteInfo {
  /** Цэсний тусдаа хуудсууд: хаяг → [гарчиг, тайлбар] */
  pages: Record<string, [string, string]>;
  /** Сайтын ерөнхий share зураг (/og/site.jpg?v=...) */
  siteImage: string;
}
export interface NewsData {
  id: string; title: string;
  /** Хайлтын системд зориулж 110 тэмдэгтээр тасалсан гарчиг */
  headline: string; lead: string; body: string[]; desc: string;
  /** Рубрик, өнгө */
  cat: string; color: string;
  /** ISO огноо, «2026 оны 10-р сарын 9, 18:00» */
  at: string | null; dateText: string; modified: string | null;
  /** Бодит зураг (assets/news/...) эсвэл хоосон */
  photo: string;
  /** Эх сурвалжийн холбоос */
  source: string;
  image: string; siteImage: string; publisher: string;
}

async function get<T>(path: string): Promise<T | null> {
  const r = await fetch(api() + path, { cache: 'no-store' });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return r.json() as Promise<T>;
}

export const siteInfo = async () => (await get<SiteInfo>('/api/pages')) || { pages: {}, siteImage: '/og/site.jpg' };
export const newsData = (id: string) => get<NewsData>('/api/pages/news/' + encodeURIComponent(id));

/** Сайтын хаяг (og:, canonical): SITE_URL → DOMAIN → хүсэлтийн Host */
export async function origin(): Promise<string> {
  const dom = process.env.DOMAIN || '';
  const fixed = process.env.SITE_URL || (/^[\w.-]+\.[a-z]{2,}$/i.test(dom) ? 'https://' + dom : '');
  if (fixed) return fixed.replace(/\/+$/, '');
  const h = await headers(), host = h.get('host') || '';
  const https = process.env.TRUST_PROXY && h.get('x-forwarded-proto') === 'https';
  return (https ? 'https://' : 'http://') + (/^[\w.-]+(:\d+)?$/.test(host) ? host : 'localhost');
}
