import type { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { ADMIN_DEV_URL, ADMIN_OUT, DEV, SITE } from '../config';

/** dist/site/assets/ (app.js, style.css, мэдээний зураг) статик файлаар.
    index.html-ийг шууд өгөхгүй: нүүр болон мэдээний хуудсыг pages/ og: tag-тайгаар бэлддэг. */
export function serveStaticAssets(app: NestExpressApplication) {
  const dir = path.join(SITE, 'assets');
  app.useStaticAssets(dir, {
    prefix: '/assets',
    index: false,
    setHeaders: (res, file) => {
      const newsImage = path.relative(dir, file).startsWith('news' + path.sep);   // мэдээний зураг өөрчлөгддөггүй
      res.setHeader('Cache-Control', DEV ? 'no-store' : newsImage ? 'public, max-age=86400' : 'no-cache');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    },
  });
}

/** /admin: admin/ (Next.js) төсөл.
    - production: `next build`-ийн гаргасан admin/out/ статик файлууд
    - npm run dev: `next dev` (3001 порт) руу дамжуулна (засвар хадгалахад хөтөч өөрөө шинэчлэгдэнэ) */
export function serveAdmin(app: NestExpressApplication) {
  if (DEV) {
    const { createProxyMiddleware } = require('http-proxy-middleware') as typeof import('http-proxy-middleware');
    const proxy = createProxyMiddleware({
      target: ADMIN_DEV_URL, pathFilter: '/admin', ws: true,
      on: {
        error: (_e, _req, res) => {
          if ('writeHead' in res && !res.headersSent) res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Admin-ы хөгжүүлэлтийн сервер (next dev, ' + ADMIN_DEV_URL + ') асаагүй байна. «npm run dev»-ээр асаана уу.');
        },
      },
    });
    app.use(proxy);
    app.getHttpServer().on('upgrade', proxy.upgrade);   // хөтчийн автомат шинэчлэлт (websocket)
    return;
  }
  app.useStaticAssets(ADMIN_OUT, {
    prefix: '/admin',
    setHeaders: (res, file) => {
      const hashed = path.relative(ADMIN_OUT, file).startsWith('_next' + path.sep + 'static' + path.sep);   // нэр нь агуулгаараа өөрчлөгддөг
      res.setHeader('Cache-Control', hashed ? 'public, max-age=31536000, immutable' : 'no-cache');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Robots-Tag', 'noindex');
    },
  });
}
