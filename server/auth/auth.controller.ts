import { Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiError, clientIp, isHttps, readJson } from '../common/http';
import { RateLimiter } from '../common/rate-limiter';
import { AuthService } from './auth.service';

@Controller('api')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly limiter: RateLimiter) {}

  /** POST /api/login { password } */
  @Post('login')
  @HttpCode(200)
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (this.limiter.limited('login:' + clientIp(req), 10, 15 * 60e3)) throw new ApiError(429, 'too_many_attempts');
    const b = await readJson<{ password?: string }>(req, 4096);
    const token = await this.auth.login(String(b.password || ''));
    if (!token) throw new ApiError(401, 'wrong_password');
    res.setHeader('Set-Cookie', this.auth.sessionCookie(token, isHttps(req)));
    return { ok: true };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(req);
    res.setHeader('Set-Cookie', this.auth.clearCookie());
    return { ok: true };
  }
}
