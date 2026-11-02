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
/* ---- Admin-аас оруулсан бичлэг: файл (/media/<файл>, server/uploads/), YouTube / Facebook холбоос, үргэлжлэх хугацаа ---- */
export const MEDIA_FILE = /^\/media\/[\w-]+\.(mp4|webm|mp3|m4a|ogg|wav)$/;
/** Зөвшөөрөгдсөн файлын хаяг эсвэл '' */
export const mediaFile = (u) => (MEDIA_FILE.test(String(u || '')) ? String(u) : '');
export const isAudioFile = (u) => /\.(mp3|m4a|ogg|wav)$/.test(String(u || ''));
/** YouTube / Facebook бичлэгийн embed хаяг (бусад холбоост '') */
export function videoEmbed(u, autoplay = true) {
  u = String(u || '');
  const y = u.match(/^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|live\/|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
  if (y) return `https://www.youtube-nocookie.com/embed/${y[1]}${autoplay ? '?autoplay=1' : ''}`;
  if (/^https?:\/\/([\w-]+\.)*(facebook\.com|fb\.watch)\//.test(u)) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&show_text=false&autoplay=${autoplay}&width=1280`;
  return '';
}
/** Холбоосын эх: YouTube, Facebook эсвэл '' */
export const videoHost = (u) => (/youtu\.?be/.test(String(u || '')) ? 'YouTube' : /facebook\.com|fb\.watch/.test(String(u || '')) ? 'Facebook' : '');
/** Үргэлжлэх хугацаа секундээр: admin оруулсан файлаас уншсан тоо, эсвэл хуучин текст «12:34», «1:02:03» */
export function durSec(v) {
  if (typeof v === 'number') return Number.isFinite(v) && v > 0 ? Math.round(v) : 0;
  const m = String(v || '').trim().match(/^(\d+)(?::(\d{1,2}))?(?::(\d{1,2}))?$/);
  return m ? String(v).trim().split(':').reduce((a, b) => a * 60 + +b, 0) : 0;
}
/** Хугацааг «12:34» эсвэл «1:02:03» болгоно (тоо биш хуучин текстийг хэвээр) */
export function durText(v) {
  const s = durSec(v);
  if (!s) return typeof v === 'string' ? v.trim() : '';
  const h = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
  return (h ? h + ':' + pad(mm) : mm) + ':' + pad(ss);
}
/** Фото сурвалжилгын зургийн тоо: оруулсан зургууд, эсвэл хуучин «Зургийн тоо» */
export const photoCount = (m) => (Array.isArray(m.photos) ? m.photos.length : 0) || +m.n || 0;
/** Admin-аас оруулсан бодит агуулгатай эсэх (файл, холбоос, зургууд): тийм бол жинхэнэ тоглуулагчаар нээнэ */
export const mediaOwn = (m) => !m.live && !!(mediaFile(m.file) || /^https?:\/\//.test(m.url || '') || (m.type === 'photo' && Array.isArray(m.photos) && m.photos.length));
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
    const pn = photoCount(m), dur = durText(m.dur), host = !mediaFile(m.file) && videoHost(m.url);
    const badge = m.type === 'live' ? t('m_live') : m.type === 'video' ? t('m_video') : m.type === 'photo' ? (pn ? t('photosN', { n: pn }) : t('m_photo'))
      : m.type === 'poster' ? t('m_poster') : t('m_podcast') + (m.ep ? ' ' + m.ep : '');
    // Бодит (ulaanbaatar.mn) бичлэг: огноо + үзсэн тоо. Admin-ы бичлэг: үргэлжлэх хугацаа (файлаас уншсан) эсвэл холбоосын эх (YouTube ...)
    const meta = m.live ? { date: mediaDate(m), views: num(m.views || 0) } : m.type === 'photo' ? { dots: true }
      : dur ? { dur, durIcon: m.type === 'podcast' ? 'headphones' : 'clock-3' }
      : host ? { dur: host, durIcon: host === 'YouTube' ? 'youtube' : 'facebook' }
      : m.type === 'live' && m.viewers ? { watching: t('watching', { n: num(m.viewers) }) } : { dur: '', durIcon: m.type === 'podcast' ? 'headphones' : 'clock-3' };
    return {
      i, k, j: Math.max(0, k - fromN), type: m.type, feat, tall, badge, meta,
      cls: `mcard ${pg && k >= fromN && fromN ? 'mc-more' : ''} ${feat ? 'mcard-feat' : ''} ${tall ? 'mcard-tall' : ''} ${m.type === 'live' ? 'mcard-live' : ''} group zoom-on ${cls}`,
      scene: Scene(m.img || mediaFallback(m)), liveBg: !!(m.live && !m.img && m.type === 'live'),
      play: m.type === 'video' || m.type === 'live' || m.type === 'podcast' || (m.type !== 'photo' && !!(mediaFile(m.file) || videoEmbed(m.url))),
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
