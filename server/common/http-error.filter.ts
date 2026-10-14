import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as path from 'path';
import { PagesService } from '../pages/pages.service';
import { ApiError } from './http';

/** Бүх алдааг нэг дор хариулна:
    - /api/..., /uploads/...  → JSON { error: '<код>' } (хөтчийн код энэ кодыг уншдаг)
    - бусад хаяг             → олдохгүй бол апп-ын 404 хуудас, GET биш хүсэлтэд 405 */
@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  constructor(private readonly pages: PagesService) {}

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
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.status(405).end(); return; }
    if (status === 404 && !path.extname(req.path)) { this.pages.sendNotFound(req, res); return; }   // өргөтгөлгүй хаяг: апп-ын 404 хуудас
    this.pages.send(res, status, 'text/plain; charset=utf-8', status === 404 ? 'Not found' : 'Server error');
  }
}
