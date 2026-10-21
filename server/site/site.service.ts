import { Injectable, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { DEV, REFRESH_MIN, ROOT, SITE, SRC } from '../config';
import { buildSite } from './site-builder';

/** Сайтыг бүтээх ажлыг удирдана:
    - production: сервер асахад, дараа нь REFRESH_MIN минут тутам (ulaanbaatar.mn-ийн шинэ мэдээ орно)
    - npm run dev: src/-ийн файл хадгалах бүрд дахин бүтээж, нээлттэй хөтчийг refresh хийлгэнэ */
@Injectable()
export class SiteService implements OnApplicationBootstrap, OnModuleDestroy {
  private building: Promise<void> | null = null;
  private again = false;
  private buildId = '0';
  private lastError = '';
  private readonly devClients = new Set<Response>();
  private timer?: NodeJS.Timeout;
  private watchers: fs.FSWatcher[] = [];

  onApplicationBootstrap() {
    void this.rebuild();
    if (DEV) this.watchSources();
    else this.timer = setInterval(() => void this.rebuild(), REFRESH_MIN * 60e3).unref();
  }

  onModuleDestroy() {
    clearInterval(this.timer);
    this.watchers.forEach((w) => w.close());
  }

  /** Сайт (assets/app.js) нэг ч удаа бүтээгдсэн эсэх */
  get ready() {
    return fs.existsSync(path.join(SITE, 'assets', 'app.js'));
  }

  /** Дахин бүтээнэ. Бүтээж байх үед дахин дуудвал (dev) дууссаны дараа нэг удаа давтана. */
  rebuild(): Promise<void> {
    if (this.building) { this.again = DEV; return this.building; }
    this.building = (async () => {
      do {
        this.again = false;
        this.report(await buildSite());
      } while (this.again);
    })().finally(() => { this.building = null; });
    return this.building;
  }

  /** GET /__dev (dev горимд): бүтээлт бүрийн дараа хөтөч рүү мэдэгдэнэ (site/app/layout.tsx-ийн скрипт сонсоно) */
  subscribe(req: Request, res: Response) {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
    res.write(`event: hello\ndata: ${this.buildId}\n\n`);
    if (this.lastError) res.write(`event: fail\ndata: ${this.lastError.replace(/\n/g, ' ')}\n\n`);
    this.devClients.add(res);
    req.on('close', () => this.devClients.delete(res));
  }

  private report(err: string | null) {
    if (err) {
      this.lastError = err;
      if (DEV) console.error('✗ ' + err + '\n  Алдааг засаад хадгалахад автоматаар дахин бүтээнэ.');
      else console.error('✗ Бүтээх үед алдаа: ' + err + (this.ready ? ' (өмнөх хувилбарыг үйлчилсээр байна)' : ''));
      this.send('fail', err);
    } else {
      this.lastError = '';
      this.buildId = String(Date.now());
      this.send('built', this.buildId);
    }
  }

  private send(ev: string, data: string) {
    for (const res of this.devClients) res.write(`event: ${ev}\ndata: ${data.replace(/\n/g, ' ')}\n\n`);
  }

  /** src/, admin-ы эх код (CSS-ийн класс, икон) болон tailwind.config.js-ийг харж, өөрчлөгдвөл дахин бүтээнэ (хадгалах үед олон event ирдэг тул 200мс хүлээнэ) */
  private watchSources() {
    let wait: NodeJS.Timeout | undefined;
    const changed = () => { clearTimeout(wait); wait = setTimeout(() => void this.rebuild(), 200); };
    const dirs = [SRC, path.join(ROOT, 'admin', 'src'), path.join(ROOT, 'admin', 'app')].filter((d) => fs.existsSync(d));
    this.watchers.push(...dirs.map((d) => fs.watch(d, { recursive: true }, changed)), fs.watch(path.join(ROOT, 'tailwind.config.js'), changed));
  }
}
