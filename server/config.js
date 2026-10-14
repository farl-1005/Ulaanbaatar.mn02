/* Серверийн тохиргоо: .env файлыг ачаалж, өгөгдлийн хавтсыг тодорхойлно.
   Бусад серверийн модулиас ӨМНӨ ачаалагдах ёстой: db.js нь DATABASE_URL-ийг, live.js нь IQAIR_API_KEY-г ачаалах үедээ уншина. */
const fs = require('fs'), path = require('path'), crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env');
const PROD = process.env.NODE_ENV === 'production';
if (!process.env.ADMIN_PASSWORD && !fs.existsSync(ENV_FILE) && !PROD) {   // production-д нууц үгийг хостингийн тохиргооноос (env) өгнө
  fs.writeFileSync(ENV_FILE, `# Admin-ы нууц үг. Энэ файлыг git-д оруулахгүй (.gitignore).\nADMIN_PASSWORD=${crypto.randomBytes(12).toString('base64url')}\n`, { mode: 0o600 });
  console.log('  🔑 Admin-ы нууц үгийг үүсгэж .env файлд хадгаллаа.');
}
try { process.loadEnvFile(ENV_FILE); } catch (e) { /* .env байхгүй бол орчны хувьсагчийг ашиглана */ }
if (!process.env.ADMIN_PASSWORD) console.warn('  ⚠ ADMIN_PASSWORD тохируулаагүй тул admin нэвтрэлт идэвхгүй байна.');

const DATA = process.env.DATA_DIR || (PROD && fs.existsSync('/data') ? '/data' : path.join(ROOT, 'data'));   // Docker: /data volume
const UPLOADS = path.join(DATA, 'uploads');
fs.mkdirSync(UPLOADS, { recursive: true });

module.exports = { ROOT, PROD, DATA, UPLOADS };
