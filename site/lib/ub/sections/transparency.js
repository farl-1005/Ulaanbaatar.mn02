import { renderReact } from '../core/bridge.js';
import { esc, reduced } from '../core/helpers.js';
import { HOME } from '../core/home.js';
import { renderPageLinks } from '../core/pages.js';
import { EN, L, S, t } from '../core/state.js';
import { addDays, fDate, hhmm, mln, num, today, ubNow } from '../core/time.js';
import { DOCS } from '../data/transparency.js';
/* ================= Transparency ================= */
export const TR_KIND = {   // баримтын төрөл бүрийн тэмдэг, өнгө
  res: { i: 'scroll-text', c: 'var(--c-blue)' },
  ord: { i: 'stamp', c: '124 77 255' },
  tender: { i: 'gavel', c: 'var(--c-amber)' },
};
/* Хайсан үгийг тодруулна (esc хийсний дараа) */
export function trHl(text, q) {
  const e = esc(text); if (!q) return e;
  const re = new RegExp('(' + esc(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  return e.replace(re, '<mark class="bg-ubyellow/45 text-ink rounded-[3px] px-0.5">$1</mark>');
}
/* Тендерийн төлөв: нээлттэй (хэдэн хоног үлдсэн), үнэлгээ, шалгарсан (тендерийн цонх: features/documents.js HOME.tenderModal) */
export function trState(d) {
  if (d.st === 'open') return { cls: d.left <= 3 ? 'b-red' : 'b-blue', live: true, text: d.left ? t('daysLeft', { n: d.left }) : t('closesToday') };
  if (d.st === 'eval') return { cls: 'b-off', i: 'hourglass', text: t('tEval') };
  return { cls: 'b-on', i: 'circle-check', text: t('tAwarded') };
}
/* «Ил тод байдал» хэсгийг site/app/home/Transparency.tsx зурна. Энэ функц түүнд хэрэгтэй өгөгдлийг (сонгосон хэлээр) бэлдэнэ.
   Нүүрэнд: 4 тоо + самбар; /transparency хуудсанд: тоо 0-ээс өснө. Таб (S.tr) setTr(), хайлт (S.trQ) features/wiring.js 'input' → renderReact(). */
export function trData() {
  const fmt = (v, dec) => (dec ? v.toFixed(dec).replace('.', EN() ? '.' : ',') : num(v));
  const stats = [
    ['file-check-2', 1248, 0, '', t('trStat1'), 'var(--c-blue)'],
    ['gavel', 37, 0, '', t('trStat2'), 'var(--c-amber)'],
    ['banknote', 412, 0, EN() ? ' bn ₮' : ' тэрбум ₮', t('trStat3'), 'var(--c-green)'],
    ['timer', 3.2, 1, ' ' + t('days'), t('trStat4'), 'var(--c-red)'],
  ].map(([i, v, dec, suf, l, c]) => ({ i, v, dec, text: fmt(v, dec), suf, l, c }));
  const tender = S.tr === 'tender', k = TR_KIND[S.tr], all = DOCS[S.tr] || [];
  const q = S.trQ.trim(), ql = q.toLowerCase();
  const list = all.filter((d) => !ql || (d.no + ' ' + d.t[0] + ' ' + d.t[1]).toLowerCase().includes(ql));
  let sum = null;
  if (tender) {
    const open = all.filter((d) => d.st === 'open'), soon = open.slice().sort((a, b) => a.left - b.left)[0];
    sum = [['door-open', String(open.length), t('tOpen')], ['wallet', mln(all.reduce((a, d) => a + (+d.bud || 0), 0)), L(['Нийт төсөв', 'Total budget'])],
      ['alarm-clock', soon ? (soon.left ? t('daysLeft', { n: soon.left }) : t('closesToday')) : '—', L(['Хамгийн ойр хаагдах', 'Closing soonest'])]];
  }
  return {
    home: S.route !== 'page', title: t('trTitle'), desc: t('trDesc'), stats,
    openData: L(['Нээлттэй өгөгдөл', 'Open data']), updated: L(['Шинэчлэгдсэн: өнөөдөр', 'Updated: today']), time: hhmm(ubNow()),
    tabs: [['res', t('tr_res'), 'scroll-text'], ['ord', t('tr_ord'), 'stamp'], ['tender', t('tr_tender'), 'gavel']].map(([v, l, i]) => ({ v, l, i, n: (DOCS[v] || []).length })),
    tr: S.tr, q: S.trQ, search: t('docSearch'), kind: k, tender, sum,
    count: q ? L([`«${q}»: ${list.length} илэрц`, `"${q}": ${list.length} results`]) : L([`${list.length} баримт`, `${list.length} documents`]),
    newest: L(['Шинэ нь эхэндээ', 'Newest first']),
    empty: [t('noResults'), L(['Өөр үг, эсвэл баримтын дугаараар хайгаад үзээрэй.', 'Try another word or a document number.'])],
    rows: list.map((d) => {
      const pct = d.st === 'open' ? Math.round((d.ago / Math.max(1, d.ago + d.left)) * 100) : 100;   // тендерийн хугацааны явц: зарласнаас хаагдах хүртэлх хугацааны хэдэн хувь өнгөрсөн
      return {
        i: all.indexOf(d), no: trHl(d.no, q), title: trHl(L(d.t), q), fresh: d.ago <= 7 ? L(['Шинэ', 'New']) : '',
        date: `${fDate(addDays(today(), -d.ago))} · ${d.ago ? L([`${d.ago} хоногийн өмнө`, `${d.ago} days ago`]) : L(['Өнөөдөр', 'Today'])}`,
        st: tender ? trState(d) : { cls: 'b-on', i: 'circle-check', text: t('inForce') }, ext: !!d.url,
        bar: tender ? { bud: mln(d.bud), pct, c: d.st === 'open' ? (d.left <= 3 ? 'rgb(var(--c-red))' : 'rgb(var(--c-blue))') : d.st === 'eval' ? 'rgb(var(--c-amber))' : 'rgb(var(--c-green))' } : null,
      };
    }),
  };
}
HOME.tr = trData;
/* Тоог 0-ээс өсгөж харуулна (аравтын оронтой ч болно): /transparency хуудсанд хэсэг харагдах үед */
export function trCount(el) {
  const to = +el.dataset.to, dec = +el.dataset.dec || 0, fmt = (v) => (dec ? v.toFixed(dec).replace('.', EN() ? '.' : ',') : num(v));
  if (reduced) { el.textContent = fmt(to); return; }
  const t0 = performance.now(), dur = 1500;
  const step = (tm) => { const p = Math.min(1, (tm - t0) / dur), e = 1 - Math.pow(1 - p, 4); el.textContent = fmt(to * e); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
HOME.trCount = trCount;
export function setTr(v) {
  if (v === S.tr) return;
  S.tr = v; renderReact();
  renderPageLinks();
}
