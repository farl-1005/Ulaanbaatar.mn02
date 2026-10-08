/* Production сервер: `npm run build`-ийн гаргасан dist/site-ийг үйлчилж, /api-г server/api.js-ээр хариулна.
   Ажиллуулах: npm run build && npm start   (порт: PORT орчны хувьсагч, анхдагч 3000)
   Reverse proxy (nginx г.м.) ард ажиллуулбал TRUST_PROXY=1 гэж тохируулна. */
const http = require('http'), fs = require('fs'), path = require('path');
const api = require('./api');

const SITE = path.join(__dirname, '..', 'dist', 'site');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.json': 'application/json' };
if (!fs.existsSync(path.join(SITE, 'index.html'))) { console.error('✗ dist/site олдсонгүй. Эхлээд "npm run build" ажиллуулна уу.'); process.exit(1); }

const server = http.createServer((req, res) => {
  let p; try { p = decodeURIComponent(req.url.split('?')[0]); } catch (e) { res.writeHead(400); res.end(); return; }
  if (api.handles(p)) { api.handle(req, res); return; }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(SITE, p);
  if (!f.startsWith(SITE + path.sep)) { res.writeHead(403); res.end(); return; }
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Not found'); return; }
    const hashed = p.startsWith('/assets/news/');
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': hashed ? 'public, max-age=86400' : 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});
const port = +process.env.PORT || 3000;
server.listen(port, () => console.log(`→ http://localhost:${port}  (ulaanbaatar.mn + API)`));
