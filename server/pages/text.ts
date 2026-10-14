/* Хуудас бэлдэхэд хэрэгтэй жижиг текстийн функцууд */

export const esc = (s: unknown) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** [монгол, англи] → монгол (сервер дээр монголоор; хэлийг хөтөч дээр сольдог) */
export const mn = (v: unknown) => (Array.isArray(v) ? v[0] || v[1] || '' : String(v || ''));

/** Урт текстийг үгээр нь тасалж «…» нэмнэ */
export const clip = (s: string, n: number) => {
  s = String(s).replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s;
};

/** src/core/time.js-ийн fill: {t+3} → 3 хоногийн дараах огноо */
export const fill = (s: string) => String(s)
  .replace(/\{t([+-]\d+)\}/g, (_, n: string) => { const d = new Date(Date.now() + 8 * 3600e3 + +n * 864e5); return (d.getUTCMonth() + 1) + '-р сарын ' + d.getUTCDate(); })
  .replace(/\{(aqi|tr)\}/g, '');

/** «2026-10-09 18:00» → «2026-10-09T18:00:00+08:00» */
export const isoUB = (d: unknown) => { const m = String(d || '').match(/(\d{4})\D(\d{2})\D(\d{2})\D+(\d{2}):(\d{2})/); return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00+08:00` : null; };

/** ISO огноо → «2026 оны 10-р сарын 9, 18:00» */
export const dateMn = (iso: string) => { const m = iso.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/)!; return `${m[1]} оны ${+m[2]}-р сарын ${+m[3]}, ${m[4]}`; };

export const clone = <T>(x: T): T => JSON.parse(JSON.stringify(x));
