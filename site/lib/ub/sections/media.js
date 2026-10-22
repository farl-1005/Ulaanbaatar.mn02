import { Scene } from '../art/scene.js';
import { renderReact } from '../core/bridge.js';
import { HOME } from '../core/home.js';
import { L, S, parseUB, t } from '../core/state.js';
import { num, pad } from '../core/time.js';
import { MEDIA } from '../data/media.js';
/* ================= Media ================= */
export const MEDIA_F = ['all', 'live', 'photo', 'poster', 'podcast'];
/* Медиа хэсэгт хамгийн ихдээ 6 бичлэг (admin-ы «Дараалал» бага нь эхэнд). Бүгд нэг дор харагдах тор (bento):
   6 бичлэгтэй үед эхнийх нь том (2 мөр), бусад нь баруун талд 2, доор 3. Шүүлтүүрээр цөөрвөл тоонд нь тааруулж байрлана. */
export const MEDIA_MAX = 6;
export const MSPAN = { 4: 'lg:col-span-4', 5: 'lg:col-span-5', 6: 'lg:col-span-6', 7: 'lg:col-span-7', 12: 'lg:col-span-12' };
export const MLAYOUT = { 1: [12], 2: [6, 6], 3: [4, 4, 4], 4: [7, 5, 5, 7], 5: [7, 5, 4, 4, 4], 6: [7, 5, 5, 4, 4, 4] };
/* Бодит медиа: огноо (2026.06.27), нүүр зураггүй Live-д хотын шөнийн чимэглэл */
export function mediaDate(m) { const d = parseUB(m.date || ''); return d ? `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}` : ''; }
export function mediaFallback(m) {   // id-аас тогтвортой: Live бүр өөр дүр зураг (ордон, тайз, хот, гүүр...) шөнийн өнгөөр
  const seed = (+String(m.nid || m.id || '').replace(/\D/g, '').slice(-4) || 7);
  if (m.type === 'live') return ['civic', 'stage', 'skyline', 'bridge', 'sport', 'road'][seed % 6] + ':' + ['navy', 'night', 'dusk'][Math.floor(seed / 6) % 3] + ':' + (seed % 97);
  return (m.type === 'podcast' ? 'ger:dusk:' : 'skyline:dusk:') + (seed % 97);
}
/* /media хуудсанд: «Мэдээ мэдээлэл» хуудастай ижил (цайвар дэвсгэр, хайлт, ангилал, тоо, 3 баганат тор), бүх бичлэг хязгааргүй */
export const mediaPg = () => S.route === 'page' && S.page === 'media';
export function mediaList() {
  const q = mediaPg() ? S.mediaQ.trim().toLowerCase() : '';
  let list = MEDIA.map((m, i) => ({ m, i })).filter(({ m }) => S.media === 'all' || m.type === S.media);
  if (q) list = list.filter(({ m }) => (L(m.t) + ' ' + L(m.d || ['', ''])).toLowerCase().includes(q));
  return mediaPg() ? list : list.slice(0, MEDIA_MAX);
}
export const MEDIA_STEP = 12;
export function mediaCountText() { const n = mediaList().length, q = S.mediaQ.trim(); return q ? L([`«${q}»: ${n} илэрц`, `“${q}”: ${n} results`]) : L([`Нийт ${n} бичлэг`, `${n} items`]); }
export let MEDIA_FROM = 0;   // «Цааш үзэх»-ээр нэмэгдсэн картууд энэ дугаараас эхэлнэ (тэд л гарч ирэх хөдөлгөөнтэй: .mc-more)
/* Медиа хэсгийг (нүүрэнд: бараан тууз, 6 хүртэл бичлэг; /media хуудсанд: хайлт, тоо, «Цааш үзэх») site/app/home/Media.tsx зурна.
   Энэ функц түүнд хэрэгтэй өгөгдлийг (сонгосон хэлээр) бэлдэнэ. */
export function mediaData() {
  const pg = mediaPg(), all = mediaList(), list = pg ? all.slice(0, S.mediaN || MEDIA_STEP) : all, fromN = pg ? MEDIA_FROM : 0;   // хуудсанд 12-оор
  const n = list.length, spans = MLAYOUT[n] || [], firstWide = n % 2 === 1 || n === 6, lastWide = (n - (firstWide ? 1 : 0)) % 2 === 1;
  const cards = list.map(({ m, i }, k) => {
    let feat, tall, cls;
    if (pg) {   // мэдээний хуудас шиг эхнийх нь том; 3 баганат тор сүүлийн мөрөнд ганц карт үлдээхгүйгээр дүүрэхээр: n%3=2 → өргөн, n%3=0 → 2×2
      feat = k === 0 && S.media === 'all' && !S.mediaQ.trim() && n % 3 !== 1; tall = feat && n % 3 === 0;
      cls = feat ? 'sm:col-span-2' + (tall ? ' lg:row-span-2' : '') : '';
    }
    else {
      feat = k === 0 && (n === 6 || n === 1 || n === 5); tall = k === 0 && n === 6;
      cls = [MSPAN[spans[k]], k === 0 && firstWide ? 'sm:col-span-2' : '', tall ? 'sm:row-span-2' : '', k === n - 1 && lastWide && k ? 'sm:col-span-2' : ''].join(' ');
    }
    const badge = m.type === 'live' ? t('m_live') : m.type === 'video' ? t('m_video') : m.type === 'photo' ? (m.n ? t('photosN', { n: m.n }) : t('m_photo'))
      : m.type === 'poster' ? t('m_poster') : t('m_podcast') + (m.ep ? ' ' + m.ep : '');
    // Бодит (ulaanbaatar.mn) бичлэг: огноо + үзсэн тоо. Жишээ бичлэг: өмнөх шиг
    const meta = m.live ? { date: mediaDate(m), views: num(m.views || 0) } : m.type === 'live' ? { watching: t('watching', { n: num(m.viewers || 0) }) }
      : m.type === 'photo' ? { dots: true } : { dur: m.dur || '', durIcon: m.type === 'podcast' ? 'headphones' : 'clock-3' };
    return {
      i, k, j: Math.max(0, k - fromN), type: m.type, feat, tall, badge, meta,
      cls: `mcard ${pg && k >= fromN && fromN ? 'mc-more' : ''} ${feat ? 'mcard-feat' : ''} ${tall ? 'mcard-tall' : ''} ${m.type === 'live' ? 'mcard-live' : ''} group zoom-on ${cls}`,
      scene: Scene(m.img || mediaFallback(m)), liveBg: !!(m.live && !m.img && m.type === 'live'),
      play: m.type === 'video' || m.type === 'live' || m.type === 'podcast',
      desc: m.live ? null : L(m.d), title: L(m.t),
    };
  });
  return {
    pg, filter: S.media, q: S.mediaQ, count: pg ? mediaCountText() : '',
    title: t('mediaTitle'), desc: t('mediaDesc'), search: L(['Медиа хайх', 'Search media']), placeholder: L(['Медиа хайх...', 'Search media...']),
    chips: MEDIA_F.map((v) => [v, v === 'all' ? t('f_all') : t('m_' + v)]),
    cards, empty: n ? null : pg ? t('noResults') : L(['Энэ төрлийн медиа алга', 'Nothing in this category yet']),
    more: pg && all.length > n ? { text: L([`${all.length} бичлэгээс ${n}-г үзлээ`, `Showing ${n} of ${all.length}`]), pct: Math.round((n / all.length) * 100), label: L(['Цааш үзэх', 'Load more']) } : null,
  };
}
HOME.media = mediaData;
/* Шүүлтүүр, хайлт, «Цааш үзэх» (features/wiring.js дуудна): төлөвийг сольж React-аар дахин зурна */
export function setMediaF(v) { S.media = v; S.mediaN = MEDIA_STEP; MEDIA_FROM = 0; renderReact(); }
export function setMediaQ(v) { S.mediaQ = v; S.mediaN = MEDIA_STEP; MEDIA_FROM = 0; renderReact(); }
export function mediaMore() { MEDIA_FROM = S.mediaN; S.mediaN += MEDIA_STEP; renderReact(); }
