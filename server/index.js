/* Production сервер: dist/site-ийг үйлчилж, /api-г server/api.js-ээр хариулна.
   - Асахдаа сайтыг бүтээнэ (dist/site байхгүй бол хүлээлгэнэ), дараа нь NEWS_REFRESH_MIN минут тутам
     ulaanbaatar.mn-ээс мэдээг шинэчилж дахин бүтээнэ.
   Ажиллуулах: npm start   (порт: PORT, анхдагч 3000)
   Reverse proxy (nginx, Railway, Render г.м.) ард ажиллуулбал TRUST_PROXY=1. */
const http = require('http'), fs = require('fs'), path = require('path');
const api = require('./api');
const pages = require('./pages');   // нүүр ба /news/<id> хуудас, og зураг, sitemap
const { build } = require('../build');

const SITE = path.join(__dirname, '..', 'dist', 'site');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.json': 'application/json' };
const REFRESH_MIN = Math.max(5, +process.env.NEWS_REFRESH_MIN || 15);

const server = http.createServer((req, res) => {
  let p; try { p = decodeURIComponent(req.url.split('?')[0]); } catch (e) { res.writeHead(400); res.end(); return; }
  if (api.handles(p)) { api.handle(req, res); return; }
  if (pages.handles(p)) { pages.handle(req, res, p); return; }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(SITE, p);
  if (!f.startsWith(SITE + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(f, (err, data) => {
    if (err) {
      const building = !fs.existsSync(path.join(SITE, 'index.html'));
      if (!building && !path.extname(p)) { pages.notFound(req, res); return; }   // өргөтгөлгүй хаяг: апп-ын 404 хуудас
      res.writeHead(building ? 503 : 404, { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '5' });
      res.end(building ? 'Сайтыг бүтээж байна... хэдэн секундын дараа дахин ачаална уу.' : 'Not found'); return;
    }
    const cached = p.startsWith('/assets/news/');
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': cached ? 'public, max-age=86400' : 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});

let busy = false;
async function rebuild() {
  if (busy) return; busy = true;
  const err = await build();
  if (err) console.error('✗ Бүтээх үед алдаа: ' + err + (fs.existsSync(path.join(SITE, 'index.html')) ? ' (өмнөх хувилбарыг үйлчилсээр байна)' : ''));
  busy = false;
}

const port = +process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`→ http://localhost:${port}  (ulaanbaatar.mn + API, мэдээ ${REFRESH_MIN} мин тутам шинэчлэгдэнэ)`);
  rebuild();
  setInterval(rebuild, REFRESH_MIN * 60e3).unref();
});
