/* Тохиргоо: .env файлыг ачаалж, хавтсуудын замыг нэг дор тодорхойлно.
   main.ts, cli.ts үүнийг хамгийн эхэнд импортлоно: өгөгдлийн сан (DATABASE_URL), гадны API-ийн түлхүүрүүд process.env-ээс уншигдана. */
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/** Төслийн үндсэн хавтас (хөрвүүлсэн dist/server/config.js-ээс хоёр шат дээш) */
export const ROOT = path.resolve(__dirname, '..', '..');
const PROD = process.env.NODE_ENV === 'production';
/** npm run dev: src/-ийн өөрчлөлтийг харж дахин бүтээнэ, нээлттэй хөтчийг өөрөө refresh хийлгэнэ */
export const DEV = process.argv.includes('--dev');

const ENV_FILE = path.join(ROOT, '.env');
if (!process.env.ADMIN_PASSWORD && !fs.existsSync(ENV_FILE) && !PROD) {   // production-д нууц үгийг хостингийн тохиргооноос (env) өгнө
  fs.writeFileSync(ENV_FILE, `# Admin-ы нууц үг. Энэ файлыг git-д оруулахгүй (.gitignore).\nADMIN_PASSWORD=${crypto.randomBytes(12).toString('base64url')}\n`, { mode: 0o600 });
  console.log('  🔑 Admin-ы нууц үгийг үүсгэж .env файлд хадгаллаа.');
}
try { process.loadEnvFile(ENV_FILE); } catch { /* .env байхгүй бол орчны хувьсагчийг ашиглана */ }

/** Хөтчийн код */
export const SRC = path.join(ROOT, 'src');
export const DIST = path.join(ROOT, 'dist');
/** Бүтээсэн сайт: index.html, assets/app.js, assets/style.css */
export const SITE = path.join(DIST, 'site');
/** Байнгын өгөгдөл: SQLite, иргэдийн зураг (Docker-т /data volume) */
export const DATA = process.env.DATA_DIR || (PROD && fs.existsSync('/data') ? '/data' : path.join(ROOT, 'data'));
export const UPLOADS = path.join(DATA, 'uploads');
/** Гадны эх сурвалжийн кэш: мэдээ, зураг (production-д байнгын диск дээр, Dockerfile: NEWS_CACHE_DIR) */
export const NEWS_CACHE = process.env.NEWS_CACHE_DIR || path.join(DIST, '.news');
/** Production-д сайтыг (мэдээг) хэдэн минут тутам дахин бүтээх */
export const REFRESH_MIN = Math.max(5, +(process.env.NEWS_REFRESH_MIN || 0) || 15);
