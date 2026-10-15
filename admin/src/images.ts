/* Зураг оруулах: хөтөч дээр жижигрүүлж WebP (data URL) болгоод «media» бүлэгт хадгална. Бичлэгт 'media:<id>' гэж холбоно. */
import { cms } from './cms';

async function readImage(file: File) {
  const url = URL.createObjectURL(file), img = new Image();
  img.src = url;
  try { await img.decode(); } finally { URL.revokeObjectURL(url); }
  return img;
}

async function store(src: string, file: File, extra: Record<string, unknown> = {}) {
  const id = 'm' + Date.now().toString(36);
  await cms.write('media', id, { id, src, name: String(file.name || '').slice(0, 80), ...extra, updatedAt: new Date().toISOString(), by: 'admin' });
  return 'media:' + id;
}

/** Мэдээ, арга хэмжээний зураг: өргөнийг 1280px хүртэл, ~230KB-аас бага болтол чанарыг бууруулна. Хэт том бол null. */
export async function uploadPhoto(file: File): Promise<string | null> {
  const img = await readImage(file);
  let w = Math.min(1280, img.naturalWidth), h = Math.round(img.naturalHeight * (w / img.naturalWidth)), q = 0.82, src = '';
  for (let tries = 0; tries < 6; tries++) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d')!.drawImage(img, 0, 0, w, h);
    src = c.toDataURL('image/webp', q);
    if (src.length < 230000) break;
    q -= 0.1;
    if (q < 0.5) { w = Math.round(w * 0.75); h = Math.round(h * 0.75); q = 0.75; }
  }
  if (src.length >= 250000) return null;
  return store(src, file, { w, h });
}

/** Байгууллагын лого: ил тод байдлыг хадгалж, ил тод эсвэл цагаан хоосон захыг тайрч, урт талыг 320px болгоно. Хэт том бол null. */
export async function uploadLogo(file: File): Promise<string | null> {
  const img = await readImage(file);
  const nw = img.naturalWidth || 512, nh = img.naturalHeight || 512, r0 = Math.min(1, 800 / Math.max(nw, nh));
  const work = document.createElement('canvas');
  work.width = Math.max(1, Math.round(nw * r0)); work.height = Math.max(1, Math.round(nh * r0));
  const wx = work.getContext('2d', { willReadFrequently: true })!;
  wx.drawImage(img, 0, 0, work.width, work.height);
  // Лого жижиг харагдахаас сэргийлж хоосон захыг олно
  const px = wx.getImageData(0, 0, work.width, work.height).data;
  let x0 = work.width, y0 = work.height, x1 = -1, y1 = -1;
  for (let y = 0; y < work.height; y++) for (let x = 0; x < work.width; x++) {
    const i = (y * work.width + x) * 4;
    if (px[i + 3] > 12 && !(px[i] > 246 && px[i + 1] > 246 && px[i + 2] > 246)) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 < 0) { x0 = 0; y0 = 0; x1 = work.width - 1; y1 = work.height - 1; }
  const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.04), sx = Math.max(0, x0 - pad), sy = Math.max(0, y0 - pad);
  const sw = Math.min(work.width, x1 + pad + 1) - sx, sh = Math.min(work.height, y1 + pad + 1) - sy;
  let side = 320, src = '';
  for (let tries = 0; tries < 4; tries++) {
    const r = Math.min(1, side / Math.max(sw, sh)), w = Math.max(1, Math.round(sw * r)), h = Math.max(1, Math.round(sh * r));
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d')!.drawImage(work, sx, sy, sw, sh, 0, 0, w, h);
    src = c.toDataURL('image/webp', 0.92);
    if (src.indexOf('data:image/webp') !== 0) src = c.toDataURL('image/png');
    if (src.length < 160000) break;
    side = Math.round(side * 0.75);
  }
  if (src.length >= 200000) return null;
  return store(src, file);
}
