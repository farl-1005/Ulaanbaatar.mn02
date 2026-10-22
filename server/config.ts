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

export const DIST = path.join(ROOT, 'dist');
/** Сервер бүтээдэг файлууд: assets/live.json (бодит өгөгдөл, икон, лого), style.css, мэдээний зураг, favicon.svg */
export const SITE = path.join(DIST, 'site');
/** Нийтийн сайтын хуудсууд (site/ — Next.js төсөл), Nest өөр дотроо ажиллуулна */
export const SITE_APP = path.join(ROOT, 'site');
/** Сайтын логик (ES модулиуд): site/lib/ub/ */
export const UB_LIB = path.join(SITE_APP, 'lib', 'ub');
/** CSS (Tailwind): site/styles/*.css → assets/style.css */
export const STYLES = path.join(SITE_APP, 'styles');
/** Хотын сүлд (лого, favicon, og зураг) */
export const LOGO_FILE = path.join(SITE_APP, 'logo.webp');
/** Admin (admin/ — Next.js төсөл): `next build`-ийн гаргасан статик файлууд, /admin хаягаар */
export const ADMIN_OUT = path.join(ROOT, 'admin', 'out');
/** npm run dev үед admin-ы `next dev` сервер */
export const ADMIN_DEV_URL = process.env.ADMIN_DEV_URL || 'http://localhost:3001';
/** Байнгын өгөгдөл: SQLite, иргэдийн зураг (Docker-т /data volume) */
export const DATA = process.env.DATA_DIR || (PROD && fs.existsSync('/data') ? '/data' : path.join(ROOT, 'data'));
export const UPLOADS = path.join(DATA, 'uploads');
/** Гадны эх сурвалжийн кэш: мэдээ, зураг (production-д байнгын диск дээр, Dockerfile: NEWS_CACHE_DIR) */
export const NEWS_CACHE = process.env.NEWS_CACHE_DIR || path.join(DIST, '.news');
/** Production-д сайтыг (мэдээг) хэдэн минут тутам дахин бүтээх */
export const REFRESH_MIN = Math.max(5, +(process.env.NEWS_REFRESH_MIN || 0) || 15);
