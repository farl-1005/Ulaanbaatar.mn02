/* Нийтийн сайтын хуудсууд (site/ — Next.js): Nest нэг процесс, нэг порт дотор ажиллуулна.
   Nest-ийн хаягууд (API, admin, зураг, sitemap ...) Nest-д үлдэж, бусад бүх хаяг (/, /news, /news/<id>, /_next ...) Next.js-д очно.
   npm run dev үед Next.js хөгжүүлэлтийн горимоор (site/-ийн файл хадгалахад хөтөч өөрөө шинэчлэгдэнэ). */
import type { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import { DEV, SITE_APP } from '../config';

/** Эдгээрийг Nest хариулна, бусдыг Next.js */
const NEST_PATHS = /^\/(api|assets|admin|uploads|og|__dev)(\/|$)|^\/(sitemap\.xml|robots\.txt|favicon\.svg)$/;

export async function serveSite(app: NestExpressApplication) {
  if (!DEV && !fs.existsSync(path.join(SITE_APP, '.next', 'BUILD_ID'))) {
    console.error('  ✗ Сайтын хуудсууд бүтээгдээгүй байна (site/.next алга). «npm run build» хийнэ үү.');
    return;
  }
  const createNext = require('next');
  const nextApp = (createNext.default || createNext)({ dev: DEV, dir: SITE_APP, quiet: !DEV });
  await nextApp.prepare();
  const handle = nextApp.getRequestHandler();
  app.use((req: any, res: any, next: () => void) => (NEST_PATHS.test(req.path) ? next() : handle(req, res)));
  if (DEV) {   // хөтчийн автомат шинэчлэлт (websocket): /_next/... нь Next.js-ийнх, /admin/... нь admin-ы proxy-д
    const upgrade = nextApp.getUpgradeHandler();
    app.getHttpServer().on('upgrade', (req: { url?: string }, socket: unknown, head: unknown) => { if (req.url?.startsWith('/_next/')) upgrade(req, socket, head); });
  }
}
