import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as crypto from 'crypto';
import type { Request } from 'express';
import { cookies, sha256 } from '../common/http';
import { Database } from '../database/database';

const COOKIE = 'ubmn_admin', SESSION_DAYS = 7;

/** Admin нэвтрэлт: нууц үг нь .env-ийн ADMIN_PASSWORD. Нэвтэрсэн token-ийг HttpOnly cookie-д, өгөгдлийн санд зөвхөн hash-ийг нь хадгална. */
@Injectable()
export class AuthService implements OnModuleDestroy {
  private readonly gc = setInterval(() => this.db.sessGc(Date.now()).catch(() => {}), 600e3).unref();   // хугацаа дууссан нэвтрэлтийг цэвэрлэнэ

  constructor(private readonly db: Database) {}

  async isAdmin(req: Request): Promise<boolean> {
    const token = cookies(req)[COOKIE];
    if (!token) return false;
    const s = await this.db.sessGet(sha256(token));
    return !!(s && s.expires > Date.now());
  }

  /** Нууц үг зөв бол шинэ token, буруу бол null */
  async login(password: string): Promise<string | null> {
    const pw = process.env.ADMIN_PASSWORD || '';
    const ok = pw && crypto.timingSafeEqual(Buffer.from(sha256(password || '')), Buffer.from(sha256(pw)));
    if (!ok) return null;
    const token = crypto.randomBytes(32).toString('base64url');
    await this.db.sessAdd(sha256(token), Date.now() + SESSION_DAYS * 864e5);
    return token;
  }

  async logout(req: Request) {
    const token = cookies(req)[COOKIE];
    if (token) await this.db.sessDel(sha256(token));
  }

  sessionCookie(token: string, https: boolean) {
    return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}${https ? '; Secure' : ''}`;
  }

  clearCookie() {
    return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
  }

  onModuleDestroy() {
    clearInterval(this.gc);
  }
}
