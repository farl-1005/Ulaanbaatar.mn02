import type { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { DEV, SITE } from '../config';

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
