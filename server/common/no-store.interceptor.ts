import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';

/** /api/... хариуг анхдагчаар кэшлэхгүй (Cache-Control: no-store). Цаг агаар г.м. маршрут өөрөө сольж болно. */
@Injectable()
export class NoStoreInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler) {
    const req = ctx.switchToHttp().getRequest<Request>(), res = ctx.switchToHttp().getResponse<Response>();
    if (req.path.startsWith('/api/') && !res.getHeader('Cache-Control')) res.setHeader('Cache-Control', 'no-store');
    return next.handle();
  }
}
