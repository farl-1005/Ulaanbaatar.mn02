import { Scene } from '../art/scene.js';
import { mediaSrc } from '../core/cms.js';
import { PRETTY } from '../core/header.js';
import { HOME } from '../core/home.js';
import { openModal, toast } from '../core/modal.js';
import { EN, L, parseUB, t } from '../core/state.js';
import { EN_MON, fDate, hhmm, num } from '../core/time.js';
import { MEDIA } from '../data/media.js';
import { NEWS_SRC } from '../data/news.js';
import { resetMS } from './shared.js';
import { durSec, durText, isAudioFile, mediaDate, mediaFallback, mediaFile, mediaOwn, photoCount, videoEmbed, videoHost } from '../sections/media.js';
export { videoEmbed };
/* ================= Media player ================= */
/* ---- Бодит медиа (ulaanbaatar.mn): Live = Facebook/YouTube видео (дарахад л ачаална), Фото = цомог, Постер = том зураг + текст, Подкаст ----
   Admin-аас оруулсан бичлэг (файл, YouTube/Facebook холбоос, фото цомог) мөн энэ үзэгчээр: файлыг <video> / <audio>-оор тоглуулна. */
/* Цомгийн эх зураг 2–5 МБ: сервертэй үед /api/img жижигрүүлж (WebP) өгнө, сервергүй бол эх хаяг */
export const mediaImg = (u, w) => (PRETTY && /^https:\/\/ulaanbaatar\.mn\/files\//.test(u) ? `/api/img?w=${w}&u=${encodeURIComponent(u)}` : u);
/* Цомгийн зураг: admin-аас оруулсан ('media:<id>' → data URL) эсвэл ulaanbaatar.mn-ийнх */
const photoSrc = (u, w) => (String(u || '').indexOf('media:') === 0 ? mediaSrc(u) : mediaImg(u, w));
/* Нүүр зургийн бодит хаяг (кодоор зурдаг чимэглэл бол '') */
const coverUrl = (k) => mediaSrc(k) || (/^(assets|https)/.test(k || '') ? k : '');
/* Admin-ы бичлэгийн холбоос (http/https) */
const ownLink = (m) => (!m.live && /^https?:\/\//.test(m.url || '') ? m.url : '');
/* ---- Медиа үзэгч (ulaanbaatar.mn): зүүн талд бараан «тайз», баруун талд мэдээлэл + «Бусад ...». Төрөл бүр өөрийн өнгөтэй ---- */
export const MV_TYPE = {
  live: { c: '#E5253B', i: 'radio', k: 'm_live' }, photo: { c: '#145095', i: 'images', k: 'm_photo' },
  poster: { c: '#F2A516', i: 'image', k: 'm_poster' }, podcast: { c: '#8B5CFF', i: 'headphones', k: 'm_podcast' },
};
export function mvDate(m) {
  const d = parseUB(m.date || ''); if (!d) return '';
  return EN() ? `${EN_MON[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} · ${hhmm(d)}` : `${d.getFullYear()} оны ${fDate(d)} · ${hhmm(d)}`;
}
/* Медиа үзэгчийг site/app/modals/MediaPlayer.tsx зурна: бодит бичлэг (m.live) — тайз + мэдээлэл + «Бусад ...», жишээ бичлэг — тоглуулагч / цомог / подкаст.
   Үзэгчийн дотоод төлөв (зураг, тоглуулж буй эсэх, томруулалт, цаг) React-д. Энэ функц i-р бичлэгийн өгөгдлийг (сонгосон хэлээр) бэлдэнэ. */
export function mediaViewData(i) {
  const m = MEDIA[i]; if (!m) return null;
  const tx = { close: t('close'), play: t('play'), pause: t('pause'), prev: t('prev'), next: t('next'), live: t('m_live') };
  const own = mediaOwn(m);
  if (!m.live && !own) {   // жишээ бичлэг (файл, холбоосгүй): тоглуулагч (Live / постер), цомог, подкаст
    const photoKey = (k) => (k === 0 ? m.img : `mix:mix:${(i + 1) * 97 + k * 13}`);
    return {
      i, live: false, type: m.type, title: L(m.t), desc: L(m.d), dur: durText(m.dur), durS: durSec(m.dur),
      viewers: m.viewers || 0, ep: m.ep || '', en: EN(), scene: Scene(m.img),
      photos: m.type === 'photo' ? Array.from({ length: photoCount(m) }, (_, k) => Scene(photoKey(k))) : [],
      bars: m.type === 'podcast' ? Array.from({ length: 56 }, (_, k) => 25 + Math.round(Math.abs(Math.sin(k * 1.7 + i) * 55 + Math.sin(k * 0.45) * 20))) : [],
      tx: Object.assign(tx, { liveFor: t('liveFor'), photoCredit: t('photoCredit'), podcast: t('m_podcast') }),
    };
  }
  // Бодит (ulaanbaatar.mn) эсвэл admin-аас оруулсан бичлэг (own): тайз + мэдээлэл + «Бусад ...»
  const ty = MV_TYPE[m.type] || MV_TYPE.poster, cover = m.img || mediaFallback(m), src = m.live ? NEWS_SRC + m.nid : '';
  const photos = (Array.isArray(m.photos) ? m.photos : []).map((u) => ({ big: photoSrc(u, 1280), th: photoSrc(u, 240) })).filter((p) => p.big);
  const file = mediaFile(m.file), audio = isAudioFile(file), link = m.live ? m.video || '' : ownLink(m);
  const embed = videoEmbed(link), host = videoHost(link) || 'Facebook', dur = durText(m.dur);
  /* Тайз: фото цомог, видео (файл / YouTube / Facebook; ulaanbaatar.mn-ийн Live үргэлж), аудио файл, подкаст (чимэглэл), постер */
  const stage = m.type === 'photo' && photos.length ? 'photo' : (file && !audio) || (!file && embed) || (m.live && m.type === 'live') ? 'video'
    : file ? 'audio' : m.type === 'podcast' ? 'podcast' : 'poster';
  const rel = MEDIA.map((r, k) => [r, k]).filter(([r, k]) => k !== i && r.type === m.type && (r.live || mediaOwn(r))).slice(0, 4);
  const relMeta = (r) => (r.live ? `${mediaDate(r)} · ${num(r.views || 0)}`
    : [durText(r.dur), r.type === 'photo' && photoCount(r) ? `${photoCount(r)} ${L(['зураг', 'photos'])}` : '', mediaFile(r.file) ? '' : videoHost(r.url)].filter(Boolean).join(' · '));
  const body = (m.body || []).length ? m.body : [L(m.d || ['', ''])].filter(Boolean);
  return {
    i, live: true, own, stage, type: m.type, color: ty.c, icon: ty.i, chip: t(ty.k), title: L(m.t),
    date: m.live ? mvDate(m) : '', views: m.live ? `${num(m.views || 0)} ${L(['үзсэн', 'views'])}` : '', dur: stage === 'photo' ? '' : dur,
    photosN: m.type === 'photo' && photos.length ? `${photos.length} ${L(['зураг', 'photos'])}` : '',
    body, empty: m.live && m.type === 'live' ? L(['Шууд дамжуулалтын бичлэг. Тоглуулах товчийг дарж үзнэ үү.', 'A recorded live stream. Press play to watch.'])
      : stage === 'video' ? L(['Тоглуулах товчийг дарж үзнэ үү.', 'Press play to watch.']) : stage === 'audio' ? L(['Тоглуулах товчийг дарж сонсоно уу.', 'Press play to listen.']) : L(['Тайлбар оруулаагүй байна.', 'No description.']),
    img: coverUrl(m.img), cover: Scene(cover), amb: coverUrl(cover),
    photos, file, embed, video: link,
    capIcon: file ? (audio ? 'headphones' : 'film') : host === 'YouTube' ? 'youtube' : 'facebook',
    cap: file ? [L(['Бичлэг', 'Recording']), dur].filter(Boolean).join(' · ') : `${host} ${L(['бичлэг', 'video'])}${m.live ? ' · ' + mediaDate(m) : ''}`,
    src, primary: m.live ? (m.type === 'live' && m.video ? { href: m.video, icon: 'play', label: L([`${host} дээр үзэх`, `Watch on ${host}`]) }
      : { href: src, icon: m.type === 'podcast' ? 'headphones' : 'external-link', label: m.type === 'podcast' ? L(['ulaanbaatar.mn дээр сонсох', 'Listen on ulaanbaatar.mn']) : L(['ulaanbaatar.mn дээр үзэх', 'View on ulaanbaatar.mn']) })
      : link ? { href: link, icon: 'external-link', label: embed ? L([`${host} дээр үзэх`, `Watch on ${host}`]) : L(['Холбоосоор үзэх', 'Open the link']) }
      : file && audio ? { href: file, icon: 'download', label: L(['Татаж авах', 'Download']), download: true } : null,
    rel: rel.map(([r, k]) => ({ i: k, scene: Scene(r.img || mediaFallback(r)), title: L(r.t), meta: relMeta(r) })),
    relHead: `${L(['Бусад', 'More'])} ${t(ty.k).toLowerCase()}`,
    tx: Object.assign(tx, {
      fs: L(['Бүтэн дэлгэцээр', 'Fullscreen']), zoomIn: L(['Томруулах', 'Zoom in']), zoomOut: L(['Жижигрүүлэх', 'Zoom out']),
      hintIn: L(['Дарж томруулна', 'Click to zoom in']), hintOut: L(['Дарж жижигрүүлнэ', 'Click to zoom out']), copy: L(['Холбоос хуулах', 'Copy link']), podCap: L(['«Нийслэл» подкаст', '"Niislel" podcast']),
    }),
  };
}
HOME.mediaView = mediaViewData;
/* «Холбоос хуулах» (MediaPlayer.tsx дуудна) */
HOME.mediaCopy = async (i) => {
  const m = MEDIA[i]; if (!m) return;
  const file = mediaFile(m.file), u = m.live ? NEWS_SRC + m.nid : ownLink(m) || location.origin + (file || '/media');
  try { await navigator.clipboard.writeText(u); toast(t('copied'), 'link'); } catch (e) { toast(u, 'link'); }
};
export function openMedia(i) {
  const m = MEDIA[i]; if (!m) return;
  // Admin-ы бичлэг: үзэгчид тоглуулах зүйлгүй (файлгүй, YouTube/Facebook биш холбоос) бол холбоосыг шинэ цонхонд
  const link = ownLink(m);
  if (link && !mediaFile(m.file) && !videoEmbed(link) && !(m.type === 'photo' && (m.photos || []).length)) { window.open(link, '_blank', 'noopener'); return; }
  resetMS({});   // үзэгчийн үйлдлүүд (тоглуулах, зураг солих, сум товч ...) React-д
  openModal({ size: m.live || mediaOwn(m) ? 'media' : 'xl', label: L(m.t), view: 'MediaPlayer', props: { i } });
}
