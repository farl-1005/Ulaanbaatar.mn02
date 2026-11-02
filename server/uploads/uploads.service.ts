import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import type { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { ApiError } from '../common/http';
import { MEDIA_FILES } from '../config';

/** Өргөтгөл → Content-Type (/media/<файл>-ыг үйлчлэхэд). MOV (QuickTime) нь MP4-тэй ижил бүтэцтэй тул .mp4 болгож хадгална. */
export const MEDIA_TYPES: Record<string, string> = { mp4: 'video/mp4', webm: 'video/webm', mp3: 'audio/mpeg', m4a: 'audio/mp4', ogg: 'audio/ogg', wav: 'audio/wav' };
/** Хадгалсан файлын нэр: <огноо>-<санамсаргүй 16 тэмдэгт>.<өргөтгөл> (жишээ 20261102-Xk3...Qa.mp4) */
export const MEDIA_FILE_RE = /^\d{8}-[A-Za-z0-9_-]{16}\.(mp4|webm|mp3|m4a|ogg|wav)$/;
export const VIDEO_MAX = 500 * 1024 * 1024, AUDIO_MAX = 100 * 1024 * 1024;
const isVideo = (ext: string) => ext === 'mp4' || ext === 'webm';
/** Хөтчийн илгээсэн Content-Type: зөвхөн видео, аудио. Жинхэнэ төрлийг файлын эхний байтаар (sniff) тогтооно. */
const DECLARED = /^(video\/(mp4|webm|quicktime|x-m4v)|audio\/(mpeg|mp3|mp4|x-m4a|m4a|aac|ogg|wav|x-wav|wave|vnd\.wave|webm)|application\/octet-stream)$/;
/** MP4 (ISO BMFF) бүтэцтэй боловч зураг (HEIC, AVIF ...) */
const IMAGE_BRANDS = /^(hei[cmsx]|hev[cmsx]|mif1|msf1|avi[fs]|crx )/;
const HEAD = 64;

/** Файлын эхний байтуудаас өргөтгөлийг тогтооно. Хөтөч тоглуулж чадахгүй эсвэл видео/аудио биш бол null. */
export function sniff(b: Buffer): string | null {
  if (b.length < 12) return null;
  const s = (a: number, z: number) => b.toString('latin1', a, z);
  if (s(4, 8) === 'ftyp') {   // MP4, MOV, M4A
    const brand = s(8, 12);
    if (IMAGE_BRANDS.test(brand)) return null;
    return /^M4[AB] /.test(brand) ? 'm4a' : 'mp4';
  }
  if (b.readUInt32BE(0) === 0x1a45dfa3) return b.subarray(0, HEAD).includes('webm') ? 'webm' : null;   // EBML: зөвхөн WebM (Matroska биш)
  if (s(0, 4) === 'OggS') return 'ogg';
  if (s(0, 4) === 'RIFF' && s(8, 12) === 'WAVE') return 'wav';
  if (s(0, 3) === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0 && (b[1] & 0x06) !== 0)) return 'mp3';   // ID3 эсвэл MPEG audio frame (ADTS AAC биш)
  return null;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Admin-аас оруулсан видео, аудио: data/media/-д (Docker-т /data/media) хадгалж, /media/<файл> хаягаар нийтэд үйлчилнэ. */
@Injectable()
export class UploadsService {
  constructor() {
    fs.mkdirSync(MEDIA_FILES, { recursive: true });
  }

  /** Хүсэлтийн биеийг (файл өөрөө) диск рүү урсгаж бичнэ: эхлээд түр файлд (.<нэр>.part), бүрэн ирвэл нэрийг нь солино.
      Төрөл буруу, хэмжээ хэтэрсэн, холболт тасарсан бол түр файлыг устгана. */
  async save(req: Request, res: Response): Promise<{ url: string; size: number; type: 'video' | 'audio' }> {
    const declared = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
    if (!DECLARED.test(declared)) throw new ApiError(415, 'bad_type');
    if (+(req.headers['content-length'] || 0) > VIDEO_MAX) { res.setHeader('Connection', 'close'); throw new ApiError(413, 'too_large'); }
    const d = new Date(), name = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${crypto.randomBytes(12).toString('base64url')}`;
    const tmp = path.join(MEDIA_FILES, `.${name}.part`);
    let got: { ext: string; size: number };
    try { got = await this.receive(req, tmp, declared.startsWith('audio/')); } catch (e) {
      res.setHeader('Connection', 'close');   // хүсэлтийн үлдсэн биеийг уншихгүй: хариугаа өгөөд холболтыг хаана
      throw e;
    }
    const file = `${name}.${got.ext}`;
    await fs.promises.rename(tmp, path.join(MEDIA_FILES, file));
    return { url: '/media/' + file, size: got.size, type: isVideo(got.ext) ? 'video' : 'audio' };
  }

  /** audio: хөтөч аудио гэж илгээсэн (.m4a): MP4 бүтэцтэй бол .m4a болгож (audio/mp4) хадгална */
  private receive(req: Request, tmp: string, audio: boolean): Promise<{ ext: string; size: number }> {
    return new Promise((resolve, reject) => {
      const out = fs.createWriteStream(tmp, { flags: 'wx', mode: 0o644 });
      let ext = '', size = 0, head: Buffer[] = [], headLen = 0, failed = false;
      const fail = (e: ApiError) => {
        if (failed) return;
        failed = true;
        req.pause();
        out.destroy();
        fs.rm(tmp, { force: true }, () => {});
        reject(e);
      };
      const write = (c: Buffer) => { if (!out.write(c)) req.pause(); };
      const start = () => {   // эхний байтуудаар төрлийг тогтоогоод бичиж эхэлнэ
        const b = Buffer.concat(head);
        head = [];
        ext = sniff(b) || '';
        if (ext === 'mp4' && audio) ext = 'm4a';
        if (!ext) fail(new ApiError(415, 'bad_type'));
        else write(b);
      };
      req.on('data', (c: Buffer) => {
        if (failed) return;
        size += c.length;
        if (size > (ext && !isVideo(ext) ? AUDIO_MAX : VIDEO_MAX)) { fail(new ApiError(413, 'too_large')); return; }
        if (ext) { write(c); return; }
        head.push(c);
        headLen += c.length;
        if (headLen >= HEAD) start();
      });
      req.on('end', () => {
        if (failed) return;
        if (!ext) { if (!size) { fail(new ApiError(400, 'empty')); return; } start(); if (failed) return; }
        out.end();
      });
      req.on('error', () => fail(new ApiError(400, 'aborted')));
      req.on('close', () => { if (!req.complete) fail(new ApiError(400, 'aborted')); });
      out.on('drain', () => { if (!failed) req.resume(); });
      out.on('error', () => fail(new ApiError(500, 'write_failed')));
      out.on('close', () => { if (!failed) resolve({ ext, size }); });   // файл бүрэн хаагдсаны дараа нэрийг солино
    });
  }

  /** /media/<файл>-ын бүтэн зам (нэр буруу эсвэл файл байхгүй бол null) */
  filePath(file: string): string | null {
    if (!MEDIA_FILE_RE.test(file)) return null;
    const f = path.join(MEDIA_FILES, file);
    return fs.existsSync(f) ? f : null;
  }
}
