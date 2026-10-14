/* Сервер асаах: сайт (dist/site) + backend (/api).
     npm start      production (порт: PORT, анхдагч 3000). Асахдаа сайтыг бүтээж, NEWS_REFRESH_MIN минут тутам дахин бүтээнэ.
     npm run dev    хөгжүүлэлт: http://localhost:8080, src/-ийн файл хадгалах бүрд дахин бүтээж хөтчийг refresh хийлгэнэ.
   Reverse proxy (nginx г.м.) ард ажиллуулбал TRUST_PROXY=1. */
import './config';   // .env-ийг бусад бүхнээс өмнө ачаална
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { DEV } from './config';
import { serveStaticAssets } from './site/static-assets';

async function bootstrap() {
  if (!process.env.ADMIN_PASSWORD) console.warn('  ⚠ ADMIN_PASSWORD тохируулаагүй тул admin нэвтрэлт идэвхгүй байна.');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,             // JSON-ыг маршрут бүр өөрийн хязгаартайгаар уншина (common/http.ts readJson)
    logger: ['error', 'warn'],
  });
  app.disable('x-powered-by');
  app.enableShutdownHooks();
  serveStaticAssets(app);

  const port = await listen(app, +(process.env.PORT || 0) || (DEV ? 8080 : 3000));
  console.log(DEV
    ? `\n→ http://localhost:${port}  (хөтөч өөрөө refresh хийгдэнэ, зогсоох: Ctrl + C, гараар дахин асаах: rs + Enter)\n`
    : `→ http://localhost:${port}  (ulaanbaatar.mn + API, мэдээ тогтмол шинэчлэгдэнэ)`);
}

/** dev: nodemon дахин асаах үед хуучин процесс гарах хүртэл хүлээж, порт завгүй хэвээр бол дараагийнхыг оролдоно */
async function listen(app: NestExpressApplication, port: number): Promise<number> {
  for (let tries = 1; ; tries++) {
    try { await app.listen(port); return port; } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'EADDRINUSE' || !DEV) throw e;
      if (tries % 10) { await new Promise((r) => setTimeout(r, 300)); continue; }   // 3 секунд хүлээгээд
      console.warn(`⚠ ${port} порт завгүй байна, ${port + 1}-ийг оролдож байна...`);
      port += 1;
    }
  }
}

bootstrap().catch((e) => {
  console.error('✗ Сервер асаж чадсангүй:', e.message);
  process.exit(1);
});
