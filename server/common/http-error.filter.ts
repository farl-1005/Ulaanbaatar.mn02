import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiError } from './http';

/** Бүх алдааг нэг дор хариулна:
    - /api/..., /uploads/...  → JSON { error: '<код>' } (хөтчийн код энэ кодыг уншдаг)
    - бусад (og зураг, sitemap ...) → энгийн текст. Сайтын хуудсуудын 404-ийг site/ (Next.js) өөрөө зурна. */
@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(e: unknown, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest<Request>(), res = host.switchToHttp().getResponse<Response>();
    const status = e instanceof HttpException ? e.getStatus() : 500;
    if (!(e instanceof HttpException)) console.error('Сервер алдаа:', e);
    if (res.headersSent) { res.end(); return; }

    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      const error = e instanceof ApiError ? e.code : status === 404 ? 'not_found' : status >= 500 ? 'server_error' : 'bad_request';
      res.status(status).set('Cache-Control', 'no-store').json({ error });
      return;
    }
    res.status(status).set({ 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' }).send(status === 404 ? 'Not found' : 'Server error');
  }
}
