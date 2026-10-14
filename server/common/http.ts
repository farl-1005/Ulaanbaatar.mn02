/* HTTP-ийн жижиг туслахууд: API-ийн алдаа, JSON бие унших, cookie, хэрэглэгчийн IP, HTTPS эсэх. */
import { HttpException } from '@nestjs/common';
import * as crypto from 'crypto';
import type { Request } from 'express';

/** API-ийн алдаа: { error: '<код>' } гэж хариулна (хөтчийн код энэ кодыг уншдаг) */
export class ApiError extends HttpException {
  constructor(status: number, readonly code: string) {
    super({ error: code }, status);
  }
}

/** Удирдах тэмдэгтийг хасаж, урт хязгаарлана */
export const clean = (v: unknown, max: number) => String(v == null ? '' : v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max);

export const sha256 = (s: string) => crypto.createHash('sha256').update(String(s)).digest('hex');

/** Хүсэлтийн JSON биеийг уншина. Nest-ийн body parser унтраалттай: маршрут бүр өөрийн хэмжээний хязгаартай. */
export function readJson<T = any>(req: Request, limit: number): Promise<T> {
  return new Promise((resolve, reject) => {
    if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) { reject(new ApiError(415, 'json_required')); return; }
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => { size += c.length; if (size > limit) { reject(new ApiError(413, 'too_large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); } catch { reject(new ApiError(400, 'bad_json')); } });
    req.on('error', () => reject(new ApiError(400, 'bad_request')));
  });
}

export function cookies(req: Request): Record<string, string> {
  const out: Record<string, string> = {};
  String(req.headers.cookie || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

/** Хэрэглэгчийн IP. Reverse proxy-ийн ард (TRUST_PROXY=1) X-Forwarded-For-оос уншина. */
export const clientIp = (req: Request) =>
  (process.env.TRUST_PROXY ? String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() : '') || req.socket.remoteAddress || '?';

export const isHttps = (req: Request) =>
  !!((req.socket as { encrypted?: boolean }).encrypted || (process.env.TRUST_PROXY && req.headers['x-forwarded-proto'] === 'https'));
