import { Injectable } from '@nestjs/common';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { ApiError, sha256 } from '../common/http';
import { RateLimiter } from '../common/rate-limiter';
import { sharp } from '../common/sharp';
import { IMG_DIR } from '../sources/shared';

const GALLERY_DIR = path.join(IMG_DIR, 'g');
const ALLOWED = /^https:\/\/ulaanbaatar\.mn\/files\/[\w/.%()-]+\.(jpe?g|png|webp|gif)$/i;
export const IMAGE_WIDTHS = [240, 1280];

/** Медиа зураг: ulaanbaatar.mn-ийн эх зургийг (2–5 МБ) жижигрүүлж WebP болгон диск дээр кэшлэнэ.
    240: дөрвөлжин жижиг зураг, 1280: томруулж үзэх. sharp байхгүй эсвэл алдаа гарвал эх зураг руу шилжүүлнэ. */
@Injectable()
export class ImageService {
  private readonly busy = new Map<string, Promise<void>>();

  constructor(private readonly limiter: RateLimiter) {}

  async serve(res: Response, url: string, width: number, ip: string) {
    if (!ALLOWED.test(url) || !IMAGE_WIDTHS.includes(width)) throw new ApiError(400, 'bad_image');
    if (!sharp) { res.redirect(302, url); return; }
    const file = path.join(GALLERY_DIR, sha256(url).slice(0, 32) + '-' + width + '.webp');
    if (!fs.existsSync(file)) {
      if (this.limiter.limited('img:' + ip, 240, 60e3)) throw new ApiError(429, 'too_many_requests');
      if (!this.busy.has(file)) this.busy.set(file, this.resize(url, width, file).finally(() => this.busy.delete(file)));
      try { await this.busy.get(file); } catch { res.redirect(302, url); return; }   // алдаа гарвал эх зураг
    }
    res.sendFile(file, { dotfiles: 'allow', headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=2592000, immutable', 'X-Content-Type-Options': 'nosniff' } });
  }

  private async resize(url: string, width: number, file: string) {
    const r = await fetch(url, { signal: AbortSignal.timeout(60000) });
    if (!r.ok || +(r.headers.get('content-length') || 0) > 25e6) throw new Error('HTTP ' + r.status);
    fs.mkdirSync(GALLERY_DIR, { recursive: true });
    const small = width === 240;
    await sharp!(Buffer.from(await r.arrayBuffer()), { limitInputPixels: 1e8 }).rotate()
      .resize({ width, height: small ? 240 : undefined, fit: small ? 'cover' : 'inside', withoutEnlargement: true })
      .webp({ quality: small ? 60 : 78 }).toFile(file + '.tmp');
    fs.renameSync(file + '.tmp', file);
  }
}
