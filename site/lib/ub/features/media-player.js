import { Scene } from '../art/scene.js';
import { PRETTY } from '../core/header.js';
import { HOME } from '../core/home.js';
import { openModal, toast } from '../core/modal.js';
import { EN, L, parseUB, t } from '../core/state.js';
import { EN_MON, fDate, hhmm, num } from '../core/time.js';
import { MEDIA } from '../data/media.js';
import { NEWS_SRC } from '../data/news.js';
import { resetMS } from './shared.js';
import { mediaDate, mediaFallback } from '../sections/media.js';
/* ================= Media player ================= */
/* ---- Бодит медиа (ulaanbaatar.mn): Live = Facebook/YouTube видео (дарахад л ачаална), Фото = цомог, Постер = том зураг + текст, Подкаст ---- */
/* Цомгийн эх зураг 2–5 МБ: сервертэй үед /api/img жижигрүүлж (WebP) өгнө, сервергүй бол эх хаяг */
export const mediaImg = (u, w) => (PRETTY && /^https:\/\/ulaanbaatar\.mn\/files\//.test(u) ? `/api/img?w=${w}&u=${encodeURIComponent(u)}` : u);
export function videoEmbed(u) {
  const y = String(u).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([\w-]{6,})/);
  if (y) return `https://www.youtube-nocookie.com/embed/${y[1]}?autoplay=1`;
  if (/facebook\.com|fb\.watch/.test(u)) return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u)}&show_text=false&autoplay=true&width=1280`;
  return '';
}
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
  if (!m.live) {   // жишээ бичлэг: тоглуулагч (Live / постер), цомог, подкаст
    const photoKey = (k) => (k === 0 ? m.img : `mix:mix:${(i + 1) * 97 + k * 13}`);
    return {
      i, live: false, type: m.type, title: L(m.t), desc: L(m.d), dur: m.dur || '', durS: m.dur ? m.dur.split(':').reduce((a, b) => a * 60 + +b, 0) : 0,
      viewers: m.viewers || 0, ep: m.ep || '', en: EN(), scene: Scene(m.img),
      photos: m.type === 'photo' ? Array.from({ length: m.n || 0 }, (_, k) => Scene(photoKey(k))) : [],
      bars: m.type === 'podcast' ? Array.from({ length: 56 }, (_, k) => 25 + Math.round(Math.abs(Math.sin(k * 1.7 + i) * 55 + Math.sin(k * 0.45) * 20))) : [],
      tx: Object.assign(tx, { liveFor: t('liveFor'), photoCredit: t('photoCredit'), podcast: t('m_podcast') }),
    };
  }
  const ty = MV_TYPE[m.type] || MV_TYPE.poster, photos = m.photos || [], cover = m.img || mediaFallback(m), yt = /youtu/.test(m.video || ''), src = NEWS_SRC + m.nid;
  const rel = MEDIA.map((r, k) => [r, k]).filter(([r]) => r.live && r.type === m.type && r.id !== m.id).slice(0, 4);
  return {
    i, live: true, type: m.type, color: ty.c, icon: ty.i, chip: t(ty.k), title: L(m.t), date: mvDate(m), views: `${num(m.views || 0)} ${L(['үзсэн', 'views'])}`,
    photosN: m.type === 'photo' && photos.length ? `${photos.length} ${L(['зураг', 'photos'])}` : '',
    body: m.body || [], empty: m.type === 'live' ? L(['Шууд дамжуулалтын бичлэг. Тоглуулах товчийг дарж үзнэ үү.', 'A recorded live stream. Press play to watch.']) : L(['Тайлбар оруулаагүй байна.', 'No description.']),
    img: m.img || '', cover: Scene(cover), amb: /^(assets|https)/.test(cover) ? cover : '',
    photos: photos.map((u) => ({ big: mediaImg(u, 1280), th: mediaImg(u, 240) })),
    embed: (m.video && videoEmbed(m.video)) || '', video: m.video || '', capIcon: yt ? 'youtube' : 'facebook', cap: `${yt ? 'YouTube' : 'Facebook'} ${L(['бичлэг', 'video'])} · ${mediaDate(m)}`,
    src, primary: m.type === 'live' && m.video ? { href: m.video, icon: 'play', label: yt ? L(['YouTube дээр үзэх', 'Watch on YouTube']) : L(['Facebook дээр үзэх', 'Watch on Facebook']) }
      : { href: src, icon: m.type === 'podcast' ? 'headphones' : 'external-link', label: m.type === 'podcast' ? L(['ulaanbaatar.mn дээр сонсох', 'Listen on ulaanbaatar.mn']) : L(['ulaanbaatar.mn дээр үзэх', 'View on ulaanbaatar.mn']) },
    rel: rel.map(([r, k]) => ({ i: k, scene: Scene(r.img || mediaFallback(r)), title: L(r.t), meta: `${mediaDate(r)} · ${num(r.views || 0)}` })),
    relHead: `${L(['Бусад', 'More'])} ${t(ty.k).toLowerCase()}`,
    tx: Object.assign(tx, {
      fs: L(['Бүтэн дэлгэцээр', 'Fullscreen']), zoomIn: L(['Томруулах', 'Zoom in']), zoomOut: L(['Жижигрүүлэх', 'Zoom out']),
      hintIn: L(['Дарж томруулна', 'Click to zoom in']), hintOut: L(['Дарж жижигрүүлнэ', 'Click to zoom out']), copy: L(['Холбоос хуулах', 'Copy link']), podCap: L(['«Нийслэл» подкаст', '"Niislel" podcast']),
    }),
  };
}
HOME.mediaView = mediaViewData;
/* «Холбоос хуулах» (MediaPlayer.tsx дуудна) */
HOME.mediaCopy = async (i) => { const m = MEDIA[i]; if (!m) return; const u = NEWS_SRC + m.nid; try { await navigator.clipboard.writeText(u); toast(t('copied'), 'link'); } catch (e) { toast(u, 'link'); } };
export function openMedia(i) {
  const m = MEDIA[i]; if (!m) return;
  if (!m.live && /^https?:\/\//.test(m.url || '')) { window.open(m.url, '_blank', 'noopener'); return; }   // admin-аас оруулсан бодит бичлэг
  resetMS({});   // үзэгчийн үйлдлүүд (тоглуулах, зураг солих, сум товч ...) React-д
  openModal({ size: m.live ? 'media' : 'xl', label: L(m.t), view: 'MediaPlayer', props: { i } });
}
