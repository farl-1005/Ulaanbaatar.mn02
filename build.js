/* Бүтээх скрипт
   npm run build  → dist/ulaanbaatar-mn.html (нэг файл) ба dist/site/ (index.html + assets)
   npm run dev    → nodemon src/-ийг харж, өөрчлөлт бүрд энэ скриптийг "--serve" горимоор дахин ажиллуулна:
                    сервер http://localhost:8080 дээр асаж, бүтээгээд, нээлттэй хөтчийг автоматаар refresh хийнэ. */
const fs = require('fs'), path = require('path'), http = require('http'), vm = require('vm');
const { execSync } = require('child_process');
const [major] = process.versions.node.split('.').map(Number);
if (major < 20) console.warn(`⚠ Node.js ${process.versions.node} хуучин байна. https://nodejs.org-оос LTS (20+) хувилбарыг суулгана уу.`);
let lucide;
try { lucide = require('lucide'); require.resolve('tailwindcss/package.json'); }
catch (e) { console.error('✗ Шаардлагатай сангууд суугаагүй байна. Энэ хавтсан дотроо эхлээд "npm install" гэж ажиллуулна уу.\n  Одоогийн хавтас: ' + process.cwd()); process.exit(1); }

const ROOT = __dirname, SRC = path.join(ROOT, 'src'), DIST = path.join(ROOT, 'dist'), SITE = path.join(DIST, 'site');
const FILES = ['data.js', 'data2.js', 'scene.js', 'core.js', 'sections.js', 'skyline.js', 'cms.js', 'admin.js', 'features.js'];
const { getLiveNews, IMG_DIR } = require('./news');
const pascal = (n) => n.split('-').filter(Boolean).map((s) => s[0].toUpperCase() + s.slice(1)).join('');

/** Бүтээнэ. Амжилттай бол null, алдаатай бол алдааны текст буцаана. */
async function build() {
  const t0 = Date.now();
  const live = await getLiveNews();
  console.log('  📰 ' + live.note);
  const js = FILES.map((f) => `/* ---- ${f} ---- */\n` + fs.readFileSync(path.join(SRC, f), 'utf8')).join('\n');
  const html = fs.readFileSync(path.join(SRC, 'template.html'), 'utf8');
  const ICONS = {}, missing = [];
  for (const m of js.matchAll(/['"`]([a-z][a-z0-9-]{0,40})['"`]/g)) { const node = lucide.icons[pascal(m[1])]; if (node && !ICONS[m[1]]) ICONS[m[1]] = node[2].map(([tag, a]) => `<${tag} ${Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join(''); }
  for (const m of js.matchAll(/\bic\(\s*'([a-z0-9-]+)'/g)) if (!ICONS[m[1]]) missing.push(m[1]);
  if (missing.length) return 'Lucide-д байхгүй икон: ' + [...new Set(missing)].join(', ') + ' (https://lucide.dev/icons)';
  const LOGO = 'data:image/webp;base64,' + fs.readFileSync(path.join(SRC, 'logo.webp')).toString('base64');   // src/logo.webp-г солиход лого солигдоно
  // Бодит мэдээ: dist/site нь жижигрүүлсэн зургийг (assets/news/*.webp), нэг файлт хувилбар нь эх зургийг ашиглана.
  const liveFor = (local) => JSON.stringify(live.items.map(({ imgFile, imgSrc, ...n }) => Object.assign(n, { img: imgFile ? (local ? 'assets/news/' + imgFile : imgSrc) : undefined })));
  const mk = (local) => `(()=>{'use strict';\nconst ICONS=${JSON.stringify(ICONS)};\nconst LOGO_SRC=${JSON.stringify(LOGO)};\nconst LIVE_NEWS=${liveFor(local)};\n${js}\n})();`;
  const bundle = mk(true), bundleOne = mk(false);
  try { new vm.Script(bundle, { filename: 'app.js' }); } catch (e) { return 'JavaScript алдаа: ' + e.message; }
  // Мэдээ бүрийн хуудас, sitemap (server/pages.js): data.js-ийг ажиллуулж хөтөч дээрхтэй ижил NEWS жагсаалтыг авна.
  let idx;
  try { idx = vm.runInNewContext(`const LIVE_NEWS=${liveFor(true)};\n${fs.readFileSync(path.join(SRC, 'data.js'), 'utf8')}\n;({ NEWS, RUB, NEWS_SRC })`, {}, { filename: 'data.js' }); }
  catch (e) { return 'data.js алдаа: ' + e.message; }
  const newsIndex = {
    src: idx.NEWS_SRC,
    rub: Object.fromEntries(Object.entries(idx.RUB).map(([k, r]) => [k, { t: r.t, c: r.c }])),
    news: idx.NEWS.map(({ id, t, l, b, d, img, cat, live, zar }) => ({ id, t, l, b, d, img, cat, live, zar })),
  };
  fs.mkdirSync(path.join(SITE, 'assets', 'news'), { recursive: true });
  for (const n of live.items) if (n.imgFile) fs.copyFileSync(path.join(IMG_DIR, n.imgFile), path.join(SITE, 'assets', 'news', n.imgFile));
  fs.mkdirSync(path.join(SITE, 'assets'), { recursive: true });
  try { execSync('npx tailwindcss -c tailwind.config.js -i src/input.css -o dist/.tailwind.css --minify', { cwd: ROOT, stdio: 'pipe' }); }
  catch (e) { return 'CSS алдаа: ' + ((e.stderr && e.stderr.toString()) || e.message); }
  const css = fs.readFileSync(path.join(DIST, '.tailwind.css'), 'utf8');
  fs.writeFileSync(path.join(DIST, 'ulaanbaatar-mn.html'), html.replace('/*__CSS__*/', () => css).replace('/*__JS__*/', () => bundleOne));
  fs.writeFileSync(path.join(SITE, 'assets', 'style.css'), css);
  fs.writeFileSync(path.join(SITE, 'assets', 'app.js'), bundle);
  fs.writeFileSync(path.join(SITE, 'favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 244 256"><image href="${LOGO}" width="244" height="256"/></svg>`);
  const head = '<link rel="stylesheet" href="assets/style.css">\n<link rel="icon" href="favicon.svg" type="image/svg+xml">';
  fs.writeFileSync(path.join(SITE, 'index.html'), html.replace('<style>/*__CSS__*/</style>', () => head).replace('<script>/*__JS__*/</script>', () => '<script src="assets/app.js"></script>'));
  fs.writeFileSync(path.join(DIST, 'news-index.json'), JSON.stringify(newsIndex));
  console.log(`✓ Бүтээлээ (${Date.now() - t0} мс)`);
  return null;
}
async function safeBuild() { try { return await build(); } catch (e) { return e.message; } }

if (require.main !== module) {
  module.exports = { build: safeBuild };   // server/index.js мэдээг тогтмол шинэчлэхэд ашиглана
} else if (!process.argv.includes('--serve')) {
  safeBuild().then((err) => {
    if (err) { console.error('✗ ' + err); process.exit(1); }
    console.log('  dist/site/ ба dist/ulaanbaatar-mn.html бэлэн боллоо.');
  });
} else {
  // Хөгжүүлэлтийн сервер: эхлээд асаад (өмнөх хувилбарыг үйлчилнэ), дараа нь бүтээж, хөтчийг refresh хийлгэнэ.
  const clients = new Set(); let buildId = '0', lastErr = '';
  const send = (ev, data) => { for (const res of clients) res.write(`event: ${ev}\ndata: ${String(data).replace(/\n/g, ' ')}\n\n`); };
  const DEV = `<script>(()=>{let seen=null;const es=new EventSource('/__dev');const ok=(e)=>{if(e.data==='0')return;if(seen&&e.data!==seen)location.reload();seen=e.data;};es.addEventListener('hello',ok);es.addEventListener('built',ok);es.addEventListener('fail',(e)=>{let b=document.getElementById('__devErr');if(!b){b=document.createElement('div');b.id='__devErr';b.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;background:#D81E34;color:#fff;font:600 14px/1.45 system-ui,sans-serif;padding:14px 16px;border-radius:12px;box-shadow:0 12px 30px rgba(0,0,0,.35);white-space:pre-wrap';document.body.appendChild(b);}b.textContent='✗ '+e.data;});})();</script>`;
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
  const api = require('./server/api');   // backend: admin CMS + маягтууд (data/ub.sqlite)
  const pages = require('./server/pages');   // нүүр ба /news/<id> хуудас, og зураг, sitemap
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (api.handles(p)) { api.handle(req, res); return; }
    if (p === '/__dev') {
      res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
      res.write(`event: hello\ndata: ${buildId}\n\n`); if (lastErr) res.write(`event: fail\ndata: ${lastErr.replace(/\n/g, ' ')}\n\n`);
      clients.add(res); req.on('close', () => clients.delete(res)); return;
    }
    if (pages.handles(p)) { pages.handle(req, res, p, { bodyEnd: DEV }); return; }
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(SITE, p);
    if (!f.startsWith(SITE)) { res.writeHead(403); res.end(); return; }
    fs.readFile(f, (err, data) => {
      if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end(fs.existsSync(SITE) ? 'Not found' : 'Бүтээж байна... хэдэн секундын дараа refresh хийнэ үү.'); return; }
      if (f.endsWith('.html')) data = Buffer.from(data.toString('utf8').replace('</body>', DEV + '</body>'));
      res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); res.end(data);
    });
  });
  let port = 8080, tries = 0;
  server.on('error', (e) => {
    if (e.code !== 'EADDRINUSE') { console.error('✗ Сервер асаж чадсангүй:', e.message); process.exit(1); }
    if (++tries <= 10) { setTimeout(() => server.listen(port), 300); return; }   // nodemon дахин асаах үед хуучин процесс гарах хүртэл хүлээнэ
    console.warn(`⚠ ${port} порт завгүй байна, ${port + 1}-ийг оролдож байна...`); port += 1; tries = 0; server.listen(port);
  });
  server.listen(port, async () => {
    console.log(`\n→ http://localhost:${port}  (хөтөч өөрөө refresh хийгдэнэ, зогсоох: Ctrl + C, гараар дахин бүтээх: rs + Enter)\n`);
    const err = await safeBuild();
    if (err) { lastErr = err; console.error('✗ ' + err + '\n  Алдааг засаад хадгалахад автоматаар дахин бүтээнэ.'); send('fail', err); }
    else { buildId = String(Date.now()); send('built', buildId); }
  });
}
