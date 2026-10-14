import { Injectable, OnModuleDestroy } from '@nestjs/common';
import type { Request, Response } from 'express';

/** Шууд мэдэгдэл (Server-Sent Events): admin хадгалах эсвэл маягт ирэх бүрд нээлттэй бүх хөтөч дахин ачаалахгүйгээр шинэчлэгдэнэ. */
@Injectable()
export class EventsService implements OnModuleDestroy {
  private readonly clients = new Set<Response>();
  private readonly ping = setInterval(() => { for (const res of this.clients) res.write(': ping\n\n'); }, 25000).unref();

  subscribe(req: Request, res: Response) {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
    res.write('event: hello\ndata: 0\n\n');
    this.clients.add(res);
    req.on('close', () => this.clients.delete(res));
  }

  /** cms: admin засвар хадгалагдсан, submission: шинэ маягт эсвэл төлөв өөрчлөгдсөн */
  broadcast(ev: 'cms' | 'submission') {
    for (const res of this.clients) res.write(`event: ${ev}\ndata: ${Date.now()}\n\n`);
  }

  onModuleDestroy() {
    clearInterval(this.ping);
  }
}
