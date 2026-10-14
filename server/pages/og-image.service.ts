import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as vm from 'vm';
import { CmsService } from '../cms/cms.service';
import { sharp } from '../common/sharp';
import { DIST, SITE, SRC } from '../config';
import type { NewsItem } from './news-feed.service';

export const OG_W = 1200, OG_H = 630;
const OG_DIR = path.join(DIST, '.og');
export const PHOTO_RE = /^assets\/news\/[\w.-]+$/;
const SCENE_RE = /^[a-z]+:[a-z]+:\d+$/;
/** Сайтын ерөнхий зургийг солибол дугаарыг нэмнэ */
const SITE_OG = 'site:v1';

const sha1 = (s: string) => crypto.createHash('sha1').update(s).digest('hex');

/** Зургийн эх: key нь өөрчлөгдвөл зураг дахин үүсч, хаяг нь солигдоно */
export interface OgSource { key: string; load: () => Promise<Buffer> }

/** Share хийхэд харагдах 1200×630 зураг (/og/<id>.jpg): бодит зураг, admin-аас оруулсан зураг эсвэл чимэглэлээс sharp-аар үүсгэж dist/.og/-д кэшлэнэ. */
@Injectable()
export class OgImageService {
  /** src/art/scene.js-ийн Scene(): мэдээний чимэглэлийг (SVG) сервер дээр зурна */
  private scene: ((key: string) => string) | null | undefined;
  private readonly inflight = new Map<string, Promise<string>>();

  constructor(private readonly cms: CmsService) {
    if (!sharp) console.warn('  ⚠ sharp олдсонгүй: og зураг үүсгэхгүй.');
  }

  get available() {
    return !!sharp;
  }

  /** Мэдээний зургийн эх: бодит зураг, admin-аас оруулсан зураг эсвэл чимэглэл. null бол сайтын ерөнхий зураг. */
  async source(n: NewsItem | null): Promise<OgSource | null> {
    const img = (n && n.img) || '';
    if (PHOTO_RE.test(img)) {
      const f = path.join(SITE, img);
      try { const st = fs.statSync(f); return { key: `photo:${img}:${st.mtimeMs}`, load: () => fs.promises.readFile(f) }; } catch { /* зураг алга */ }
    }
    if (img.startsWith('media:')) {
      const m = await this.cms.get('media', img.slice(6));
      const mm = m && /^data:image\/(?:webp|png|jpeg|gif);base64,([A-Za-z0-9+/=]+)$/.exec(m.src || '');
      if (mm) return { key: 'media:' + sha1(mm[1]), load: async () => Buffer.from(mm[1], 'base64') };
    }
    const svg = SCENE_RE.test(img) && this.sceneSvg(img);
    if (svg) return { key: 'scene:' + img, load: async () => svg };
    return null;
  }

  /** Зураг солигдвол хаяг нь солигдож Facebook дахин татна */
  url(id: string, src: OgSource | null) {
    return `/og/${id}.jpg?v=${sha1(src ? src.key : SITE_OG).slice(0, 10)}`;
  }

  /** Бэлэн JPEG файлын зам (анх удаа бол үүсгэнэ) */
  file(src: OgSource | null): Promise<string> {
    const file = path.join(OG_DIR, sha1(src ? src.key : SITE_OG).slice(0, 24) + '.jpg');
    if (fs.existsSync(file)) return Promise.resolve(file);
    if (!this.inflight.has(file)) {
      this.inflight.set(file, (async () => {
        const img = src ? sharp!(await src.load()).resize(OG_W, OG_H, { fit: 'cover' }) : await this.siteBase();
        const buf = await img.flatten({ background: '#0B1D45' }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
        fs.mkdirSync(OG_DIR, { recursive: true });
        fs.writeFileSync(file, buf);
        return file;
      })().finally(() => this.inflight.delete(file)));
    }
    return this.inflight.get(file)!;
  }

  /** Сайтын ерөнхий зураг: хотын чимэглэл + бараан давхарга + лого */
  private async siteBase() {
    const bg = this.sceneSvg('skyline:dusk:24');
    const shade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}"><rect width="${OG_W}" height="${OG_H}" fill="#0B1D45" fill-opacity=".55"/><rect y="${OG_H - 16}" width="${OG_W}" height="16" fill="#D81E34"/></svg>`);
    const logo = await sharp!(path.join(SRC, 'logo.webp')).resize({ height: 360 }).png().toBuffer();
    const base = bg ? sharp!(bg).resize(OG_W, OG_H) : sharp!({ create: { width: OG_W, height: OG_H, channels: 3, background: '#0B1D45' } });
    return sharp!(await base.composite([{ input: shade }, { input: logo, gravity: 'centre' }]).png().toBuffer());
  }

  private sceneSvg(key: string): Buffer | null {
    if (this.scene === undefined) {
      try {
        const code = fs.readFileSync(path.join(SRC, 'art', 'scene.js'), 'utf8') + '\n;Scene';
        // document: хөтчийн лого тохиргооны мөрийг алгасна
        this.scene = vm.runInNewContext(code, { CMS: { data: { media: {} } }, LOGO_SRC: '', document: { documentElement: { style: { setProperty() {} } } } });
      } catch (e) {
        console.warn('  ⚠ scene.js:', (e as Error).message);
        this.scene = null;
      }
    }
    return this.scene ? Buffer.from(this.scene(key).replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}" `)) : null;
  }
}
