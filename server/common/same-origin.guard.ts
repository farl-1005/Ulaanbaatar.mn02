import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { ApiError } from './http';

/** Өөр сайтаас ирсэн бичих хүсэлтийг хаана (CSRF): Origin толгой нь манай Host-той таарах ёстой. Бүх маршрутад үйлчилнэ. */
@Injectable()
export class SameOriginGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();
    if (req.method === 'GET' || req.method === 'HEAD' || !req.headers.origin) return true;
    let ok = false;
    try { ok = new URL(req.headers.origin).host === req.headers.host; } catch { /* буруу origin */ }
    if (!ok) throw new ApiError(403, 'bad_origin');
    return true;
  }
}
