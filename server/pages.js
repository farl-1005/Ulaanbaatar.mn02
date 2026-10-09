/* Сервер дээр бэлддэг хуудсууд: мэдээ бүр өөрийн хаягтай, Facebook / Google-д зөв харагдана.
   - /news/<id>     Мэдээний хуудас: гарчиг, тайлбар, og:/twitter: tag, JSON-LD, текстийг HTML-д нь шууд оруулна
                    (JS ажиллуулдаггүй робот ч уншина). Хөтөч дээр app.js ачаалагдаад ердийнхөөрөө ажиллана.
   - /              Нүүр хуудас (og: tag-тай). <meta name="ubmn-routes"> нь app.js-д /news/<id> хаяг ашиглаж болохыг хэлнэ.
   - /og/<id>.jpg   Share хийхэд харагдах 1200×630 зураг. sharp-аар үүсгэж dist/.og/-д кэшлэнэ.
   - /sitemap.xml, /robots.txt
   Мэдээ: build.js-ийн бичсэн dist/news-index.json + admin-ы засвар (data/ub.sqlite), src/cms.js-ийн дүрмээр нийлүүлнэ.
   Домэйн: SITE_URL (жишээ нь https://ulaanbaatar.mn) → DOMAIN → хүсэлтийн Host. */
const fs = require('fs'), path = require('path'), crypto = require('crypto'), vm = require('vm');
const api = require('./api');
let sharp = null;
try { sharp = require('sharp'); } catch (e) { console.warn('  ⚠ sharp олдсонгүй: og зураг үүсгэхгүй.'); }

const ROOT = path.join(__dirname, '..'), DIST = path.join(ROOT, 'dist'), SITE = path.join(DIST, 'site');
const TEMPLATE = path.join(SITE, 'index.html'), INDEX = path.join(DIST, 'news-index.json'), OG_DIR = path.join(DIST, '.og');
const ID_RE = /^[\w.-]{1,80}$/, PHOTO_RE = /^assets\/news\/[\w.-]+$/, SCENE_RE = /^[a-z]+:[a-z]+:\d+$/;
const NEWS_P = /^\/news\/([^/]+)\/?$/, OG_P = /^\/og\/([\w.-]+)\.jpg$/;
const W = 1200, H = 630;
const PUBLISHER = 'Нийслэлийн Засаг даргын Тамгын газар';

const sha = (s) => crypto.createHash('sha1').update(s).digest('hex');
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = (x) => JSON.parse(JSON.stringify(x));
const mn = (v) => (Array.isArray(v) ? v[0] || v[1] || '' : String(v || ''));   // сервер дээр монголоор; хэлийг хөтөч дээр сольдог
const clip = (s, n) => { s = String(s).replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; };
/* src/core.js-ийн fill: {t+3} → 3 хоногийн дараах огноо */
const fill = (s) => String(s).replace(/\{t([+-]\d+)\}/g, (_, n) => { const d = new Date(Date.now() + 8 * 3600e3 + n * 864e5); return (d.getUTCMonth() + 1) + '-р сарын ' + d.getUTCDate(); }).replace(/\{(aqi|tr)\}/g, '');
const isoUB = (d) => { const m = String(d || '').match(/(\d{4})\D(\d{2})\D(\d{2})\D+(\d{2}):(\d{2})/); return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00+08:00` : null; };
const dateMn = (iso) => { const m = iso.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}:\d{2})/); return `${m[1]} оны ${+m[2]}-р сарын ${+m[3]}, ${m[4]}`; };

/* Файлыг өөрчлөгдөх хүртэл санах ойд хадгална (build бүр дахин бичдэг) */
const fileCache = {};
function cached(file, parse) {
  let st; try { st = fs.statSync(file); } catch (e) { return null; }
  const c = fileCache[file];
  if (!c || c.mtime !== st.mtimeMs) fileCache[file] = { mtime: st.mtimeMs, val: parse(fs.readFileSync(file, 'utf8')) };
  return fileCache[file].val;
}

/* ================= Мэдээ: build-ийн жагсаалт + admin-ы засвар ================= */
function merged(defs, ov) {   // src/cms.js-ийн mergedItems-тэй ижил дүрэм
  const out = [], seen = new Set();
  defs.forEach((d) => { seen.add(d.id); const o = ov[d.id]; if (o && o.deleted) return; out.push(Object.assign(clone(d), o || {})); });
  Object.keys(ov).forEach((id) => { const o = ov[id]; if (!seen.has(id) && !o.deleted) out.push(clone(o)); });
  return out;
}
const paras = (s) => String(s || '').split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
function allNews() {
  const idx = cached(INDEX, JSON.parse); if (!idx) return null;
  const rub = clone(idx.rub), rubOv = api.cmsCol('rubrics');
  for (const id in rubOv) if (!rubOv[id].deleted) rub[id] = { t: rubOv[id].t || (rub[id] || {}).t, c: rubOv[id].c || (rub[id] || {}).c };
  const news = merged(idx.news, api.cmsCol('news')).filter((n) => !n.draft && ID_RE.test(n.id || '') && mn(n.t)).map((n) => {
    if (n.bt) { const a = paras(n.bt[0]), b = paras(n.bt[1]); n.b = Array.from({ length: Math.max(a.length, b.length) }, (_, i) => [a[i] || b[i] || '', b[i] || a[i] || '']); }
    if (!rub[n.cat]) n.cat = 'city';
    n.at = isoUB(n.d);
    return n;
  }).sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
  return { news, rub, src: idx.src };
}

/* ================= og зураг ================= */
let SCENE;   // src/scene.js-ийн Scene(): мэдээний чимэглэлийг (SVG) сервер дээр зурна
function sceneSvg(key) {
  if (SCENE === undefined) {
    try { SCENE = vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'src', 'scene.js'), 'utf8') + '\n;Scene', { CMS: { data: { media: {} } }, LOGO_SRC: '' }); }
    catch (e) { console.warn('  ⚠ scene.js:', e.message); SCENE = null; }
  }
  return SCENE ? Buffer.from(SCENE(key).replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" `)) : null;
}
/* Мэдээний зургийн эх: бодит зураг, admin-аас оруулсан зураг эсвэл чимэглэл. null бол сайтын ерөнхий зураг. */
function ogSource(n) {
  const img = (n && n.img) || '';
  if (PHOTO_RE.test(img)) {
    const f = path.join(SITE, img);
    try { const st = fs.statSync(f); return { key: `photo:${img}:${st.mtimeMs}`, load: () => fs.promises.readFile(f) }; } catch (e) { /* зураг алга */ }
  }
  if (img.startsWith('media:')) {
    const m = api.cmsGet('media', img.slice(6)), mm = m && /^data:image\/(?:webp|png|jpeg|gif);base64,([A-Za-z0-9+/=]+)$/.exec(m.src || '');
    if (mm) return { key: 'media:' + sha(mm[1]), load: async () => Buffer.from(mm[1], 'base64') };
  }
  if (SCENE_RE.test(img) && sceneSvg(img)) return { key: 'scene:' + img, load: async () => sceneSvg(img) };
  return null;
}
const SITE_OG = 'site:v1';   // сайтын ерөнхий зургийг солибол дугаарыг нэмнэ
const ogUrl = (id, src) => `/og/${id}.jpg?v=${sha(src ? src.key : SITE_OG).slice(0, 10)}`;   // зураг солигдвол хаяг нь солигдож Facebook дахин татна
async function siteBase() {
  const bg = sceneSvg('skyline:dusk:24');
  const shade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#0B1D45" fill-opacity=".55"/><rect y="${H - 16}" width="${W}" height="16" fill="#D81E34"/></svg>`);
  const logo = await sharp(path.join(ROOT, 'src', 'logo.webp')).resize({ height: 360 }).png().toBuffer();
  const base = bg ? sharp(bg).resize(W, H) : sharp({ create: { width: W, height: H, channels: 3, background: '#0B1D45' } });
  return sharp(await base.composite([{ input: shade }, { input: logo, gravity: 'centre' }]).png().toBuffer());
}
const inflight = new Map();
function ogFile(src) {
  const file = path.join(OG_DIR, sha(src ? src.key : SITE_OG).slice(0, 24) + '.jpg');
  if (fs.existsSync(file)) return Promise.resolve(file);
  if (!inflight.has(file)) {
    inflight.set(file, (async () => {
      const img = src ? sharp(await src.load()).resize(W, H, { fit: 'cover' }) : await siteBase();
      const buf = await img.flatten({ background: '#0B1D45' }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
      fs.mkdirSync(OG_DIR, { recursive: true }); fs.writeFileSync(file, buf);
      return file;
    })().finally(() => inflight.delete(file)));
  }
  return inflight.get(file);
}

/* ================= HTML ================= */
function origin(req) {
  const dom = process.env.DOMAIN || '';
  const fixed = process.env.SITE_URL || (/^[\w.-]+\.[a-z]{2,}$/i.test(dom) ? 'https://' + dom : '');
  if (fixed) return fixed.replace(/\/+$/, '');
  const host = String(req.headers.host || '');
  return (api.secure(req) ? 'https://' : 'http://') + (/^[\w.-]+(:\d+)?$/.test(host) ? host : 'localhost');
}
function page(o, m, body) {
  const tpl = cached(TEMPLATE, (s) => s); if (!tpl) return null;
  const url = o + m.path, title = m.title || (tpl.match(/<title>([^<]*)<\/title>/) || [])[1] || 'ulaanbaatar.mn';
  const desc = m.desc || (tpl.match(/<meta name="description" content="([^"]*)">/) || [])[1] || '';
  const tags = [
    '<meta name="ubmn-routes" content="path">',
    m.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${esc(url)}">`,
    '<meta property="og:site_name" content="ulaanbaatar.mn">',
    '<meta property="og:locale" content="mn_MN">',
    `<meta property="og:type" content="${m.type || 'website'}">`,
    `<meta property="og:title" content="${esc(m.ogTitle || title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:image" content="${esc(o + m.image)}">`,
    `<meta property="og:image:width" content="${W}">`, `<meta property="og:image:height" content="${H}">`,
    `<meta property="og:image:alt" content="${esc(m.ogTitle || title)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    ...(m.extra || []),
    m.ld ? `<script type="application/ld+json">${JSON.stringify(m.ld).replace(/</g, '\\u003c')}</script>` : '',
  ].filter(Boolean).join('\n');
  // <base>: /news/<id> хаяг дээр app.js-ийн харьцангуй замууд (assets/...) сайтын үндсээс уншигдана
  let html = tpl.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="/">')
    .replace(/<title>[^<]*<\/title>/, () => `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, () => `<meta name="description" content="${esc(desc)}">`)
    .replace('</head>', () => tags + '\n</head>');
  if (body) html = html.replace('<div id="view-home">', '<div id="view-home" hidden>').replace('<div id="view-news" hidden></div>', () => `<div id="view-news">${body}</div>`);
  return html;
}
function newsPage(o, n, all) {
  const r = all.rub[n.cat] || { t: ['Мэдээ'] }, cat = mn(r.t);
  const title = fill(mn(n.t)), lead = fill(mn(n.l)), body = (n.b || []).map((p) => fill(mn(p))).filter(Boolean);
  const desc = clip(lead || body[0] || title, 200), p = '/news/' + encodeURIComponent(n.id), src = ogSource(n);
  const srcUrl = n.live ? all.src + n.id.slice(1) : /^https?:\/\//.test(n.src || '') ? n.src : '';
  const modified = /^\d{4}-\d\d-\d\dT/.test(n.updatedAt || '') ? n.updatedAt : n.at;   // admin-аас засварласан огноо
  const ld = {
    '@context': 'https://schema.org', '@type': 'NewsArticle', mainEntityOfPage: o + p,
    headline: clip(title, 110), description: desc, image: [o + ogUrl(n.id, src)], articleSection: cat, inLanguage: 'mn',
    datePublished: n.at || undefined, dateModified: modified || undefined,
    author: { '@type': 'Organization', name: PUBLISHER },
    publisher: { '@type': 'Organization', name: PUBLISHER, logo: { '@type': 'ImageObject', url: o + ogUrl('site', null) } },
  };
  const article = `<article class="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
<nav class="text-[13.5px] text-muted"><a href="/">Нүүр</a> › <a href="/#hub">Мэдээ</a> › ${esc(cat)}</nav>
<h1 class="mt-4 text-[30px] sm:text-[40px] lg:text-[48px] font-extrabold leading-[1.08] tracking-[-0.025em] text-balance">${esc(title)}</h1>
${lead ? `<p class="mt-5 text-[18px] sm:text-[20px] leading-relaxed text-ink/80 font-medium">${esc(lead)}</p>` : ''}
${n.at ? `<p class="mt-4 text-[13px] text-muted"><time datetime="${n.at}">${dateMn(n.at)}</time> · ${esc(PUBLISHER)}</p>` : ''}
${PHOTO_RE.test(n.img || '') ? `<figure class="mt-8"><img src="/${esc(n.img)}" alt="${esc(title)}" class="w-full rounded-[22px]"></figure>` : ''}
${body.length ? `<div class="mt-8 max-w-[760px] space-y-6 text-[17px] sm:text-[18px] leading-[1.85] text-ink/85">${body.map((x) => `<p>${esc(x)}</p>`).join('')}</div>` : ''}
${srcUrl ? `<p class="mt-8"><a href="${esc(srcUrl)}" rel="noopener">Эх сурвалж</a></p>` : ''}
</article>`;
  return page(o, {
    path: p, type: 'article', title: title + ' · ulaanbaatar.mn', ogTitle: title, desc, image: ogUrl(n.id, src), ld,
    extra: [n.at && `<meta property="article:published_time" content="${n.at}">`, `<meta property="article:section" content="${esc(cat)}">`].filter(Boolean),
  }, article);
}

/* ================= Чиглүүлэлт ================= */
const handles = (p) => p === '/' || p === '/index.html' || p === '/sitemap.xml' || p === '/robots.txt' || NEWS_P.test(p) || OG_P.test(p);

function send(req, res, code, type, body, extra) {
  res.writeHead(code, Object.assign({ 'Content-Type': type, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' }, extra));
  res.end(req.method === 'HEAD' ? undefined : body);
}
async function handle(req, res, p, opts = {}) {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
  try {
    const o = origin(req);
    const html = (code, s) => send(req, res, code, 'text/html; charset=utf-8', opts.bodyEnd ? s.replace('</body>', () => opts.bodyEnd + '</body>') : s);
    const building = () => send(req, res, 503, 'text/plain; charset=utf-8', 'Сайтыг бүтээж байна... хэдэн секундын дараа дахин ачаална уу.', { 'Retry-After': '5' });
    let r;

    if (p === '/robots.txt') return send(req, res, 200, 'text/plain; charset=utf-8', `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /uploads/\n\nSitemap: ${o}/sitemap.xml\n`);

    if (p === '/sitemap.xml') {
      const all = allNews(); if (!all) return building();
      const url = (loc, mod) => `<url><loc>${esc(o + loc)}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ''}</url>`;
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[url('/', all.news[0] && all.news[0].at)].concat(all.news.map((n) => url('/news/' + encodeURIComponent(n.id), n.at))).join('\n')}\n</urlset>\n`;
      return send(req, res, 200, 'application/xml; charset=utf-8', xml);
    }

    if ((r = p.match(OG_P))) {
      const id = r[1]; let src = null, n = null;
      if (id !== 'site') { const all = allNews(); n = all && all.news.find((x) => x.id === id); if (!n) return send(req, res, 404, 'text/plain; charset=utf-8', 'Not found'); src = ogSource(n); }
      if (!sharp) { if (n && PHOTO_RE.test(n.img || '')) { res.writeHead(302, { Location: '/' + n.img }); res.end(); return; } return send(req, res, 404, 'text/plain; charset=utf-8', 'Not found'); }
      let file;
      try { file = await ogFile(src); } catch (e) { console.warn('  ⚠ og зураг (' + id + '):', e.message); file = await ogFile(null); }
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff' });
      if (req.method === 'HEAD') { res.end(); return; }
      fs.createReadStream(file).pipe(res); return;
    }

    if ((r = p.match(NEWS_P))) {
      const id = r[1], all = allNews();
      if (!all) return building();
      const n = ID_RE.test(id) && all.news.find((x) => x.id === id);
      const out = n ? newsPage(o, n, all) : page(o, { path: '/', image: ogUrl('site', null), noindex: true });
      return out ? html(n ? 200 : 404, out) : building();
    }

    // Нүүр хуудас
    const out = page(o, { path: '/', image: ogUrl('site', null) });
    return out ? html(200, out) : building();
  } catch (e) {
    console.error('Хуудас алдаа:', e);
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end();
  }
}

module.exports = { handles, handle };
