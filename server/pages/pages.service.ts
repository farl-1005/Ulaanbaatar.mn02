import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { isHttps } from '../common/http';
import { SITE } from '../config';
import { SiteService } from '../site/site.service';
import { NewsFeed, NewsItem } from './news-feed.service';
import { OG_H, OG_W, OgImageService, PHOTO_RE } from './og-image.service';
import { clip, dateMn, esc, fill, mn } from './text';

const TEMPLATE = path.join(SITE, 'index.html');
const PUBLISHER = 'Нийслэлийн Засаг даргын Тамгын газар';

/** Цэсний тусдаа хуудсууд (src/core/pages.js PAGES-тэй ижил): хаяг → [гарчиг, тайлбар] */
export const PAGES: Record<string, [string, string]> = {
  news: ['Мэдээ мэдээлэл', 'Нийслэлийн Засаг дарга, дүүрэг, харьяа байгууллагуудын бүх мэдээ, зар мэдээлэл.'],
  services: ['Үйлчилгээ', 'Иргэн, аж ахуйн нэгжид зориулсан бүх үйлчилгээ, амьдралын нөхцөл бүрт хэрэгтэй алхмууд.'],
  events: ['Арга хэмжээ', 'Хотод болох соёл, спорт, иргэний арга хэмжээ.'],
  media: ['Медиа', 'Хотын видео, шууд дамжуулалт, фото сурвалжилга, подкаст.'],
  projects: ['24 мега төсөл', 'Нийслэлийн мега төслүүдийн гүйцэтгэл, төсөв, хугацаа.'],
  data: ['Хотын өгөгдөл', 'Агаарын чанар, түгжрэл, цаг агаар, хүн ам, төсвийн бодит цагийн самбар.'],
  transparency: ['Ил тод байдал', 'Нийслэлийн ИТХ-ын тогтоол, Засаг даргын захирамж, тендер.'],
  about: ['Хотын тухай', 'Нийслэлийн Засаг даргын ажлын хуваарь, удирдлага, түүх, харьяа байгууллагууд.'],
};

/** Хуудасны мета: гарчиг, тайлбар, og зураг, JSON-LD ... */
interface PageMeta {
  path: string; image: string;
  title?: string; ogTitle?: string; desc?: string; type?: string;
  extra?: string[]; ld?: object; noindex?: boolean; notFound?: boolean;
}

/** Сервер дээр бэлддэг HTML: бүтээсэн index.html дээр og:/twitter: tag, JSON-LD, мэдээний текстийг нэмнэ
    (Facebook, Google зэрэг JS ажиллуулдаггүй робот ч зөв харна). Хөтөч дээр app.js ачаалагдаад ердийнхөөрөө ажиллана. */
@Injectable()
export class PagesService {
  private template: { mtime: number; html: string } | null = null;

  constructor(private readonly og: OgImageService, private readonly site: SiteService) {}

  /** Сайтын хаяг: SITE_URL (жишээ нь https://ulaanbaatar.mn) → DOMAIN → хүсэлтийн Host */
  origin(req: Request) {
    const dom = process.env.DOMAIN || '';
    const fixed = process.env.SITE_URL || (/^[\w.-]+\.[a-z]{2,}$/i.test(dom) ? 'https://' + dom : '');
    if (fixed) return fixed.replace(/\/+$/, '');
    const host = String(req.headers.host || '');
    return (isHttps(req) ? 'https://' : 'http://') + (/^[\w.-]+(:\d+)?$/.test(host) ? host : 'localhost');
  }

  home(o: string) {
    return this.page(o, { path: '/', image: this.og.url('site', null) });
  }

  /** /news, /services ...: ижил апп, хаягаар нь хуудсаа нээнэ */
  section(o: string, key: string) {
    return this.page(o, { path: '/' + key, title: PAGES[key][0] + ' · ulaanbaatar.mn', desc: PAGES[key][1], image: this.og.url('site', null) });
  }

  notFoundPage(o: string, p: string) {
    return this.page(o, { path: p, title: 'Хуудас олдсонгүй · ulaanbaatar.mn', image: this.og.url('site', null), noindex: true, notFound: true });
  }

  async newsPage(o: string, n: NewsItem, feed: NewsFeed) {
    const r = feed.rub[n.cat] || { t: ['Мэдээ'] }, cat = mn(r.t);
    const title = fill(mn(n.t)), lead = fill(mn(n.l)), body = (n.b || []).map((p) => fill(mn(p))).filter(Boolean);
    const desc = clip(lead || body[0] || title, 200), p = '/news/' + encodeURIComponent(n.id), src = await this.og.source(n);
    const srcUrl = n.live ? feed.src + n.id.slice(1) : /^https?:\/\//.test(n.src || '') ? n.src : '';
    const modified = /^\d{4}-\d\d-\d\dT/.test(n.updatedAt || '') ? n.updatedAt : n.at;   // admin-аас засварласан огноо
    const ld = {
      '@context': 'https://schema.org', '@type': 'NewsArticle', mainEntityOfPage: o + p,
      headline: clip(title, 110), description: desc, image: [o + this.og.url(n.id, src)], articleSection: cat, inLanguage: 'mn',
      datePublished: n.at || undefined, dateModified: modified || undefined,
      author: { '@type': 'Organization', name: PUBLISHER },
      publisher: { '@type': 'Organization', name: PUBLISHER, logo: { '@type': 'ImageObject', url: o + this.og.url('site', null) } },
    };
    const article = `<article class="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
<nav class="text-[13.5px] text-muted"><a href="/">Нүүр</a> › <a href="/#hub">Мэдээ</a> › ${esc(cat)}</nav>
<header class="news-head mt-6" style="--rc:${esc(r.c || '#D81E34')}"><div class="news-head-in">
<h1 class="text-[30px] sm:text-[40px] lg:text-[48px] font-extrabold leading-[1.08] tracking-[-0.025em] text-balance">${esc(title)}</h1>
${lead ? `<p class="mt-5 text-[18px] sm:text-[20px] leading-relaxed text-ink/80 font-medium">${esc(lead)}</p>` : ''}
${n.at ? `<p class="mt-4 text-[13px] text-muted"><time datetime="${n.at}">${dateMn(n.at)}</time> · ${esc(PUBLISHER)}</p>` : ''}
</div>${PHOTO_RE.test(n.img || '') ? `<figure class="news-head-fig"><img src="/${esc(n.img)}" alt="${esc(title)}" class="w-full aspect-[16/9] lg:aspect-[21/9] object-cover"></figure>` : ''}</header>
${body.length ? `<div class="news-paper mt-8 max-w-[760px]">${body.length > 1 ? `<p class="news-intro">${esc(body[0])}</p>` : ''}<div class="news-text">${(body.length > 1 ? body.slice(1) : body).map((x) => `<p>${esc(x)}</p>`).join('')}</div></div>` : ''}
${srcUrl ? `<p class="mt-8"><a href="${esc(srcUrl)}" rel="noopener">Эх сурвалж</a></p>` : ''}
</article>`;
    return this.page(o, {
      path: p, type: 'article', title: title + ' · ulaanbaatar.mn', ogTitle: title, desc, image: this.og.url(n.id, src), ld,
      extra: [n.at && `<meta property="article:published_time" content="${n.at}">`, `<meta property="article:section" content="${esc(cat)}">`].filter((x): x is string => !!x),
    }, article);
  }

  sitemap(o: string, feed: NewsFeed) {
    const url = (loc: string, mod?: string | null) => `<url><loc>${esc(o + loc)}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ''}</url>`;
    const urls = [url('/', feed.news[0] && feed.news[0].at)]
      .concat(Object.keys(PAGES).map((k) => url('/' + k)))
      .concat(feed.news.map((n) => url('/news/' + encodeURIComponent(n.id), n.at)));
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  }

  robots(o: string) {
    return `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /uploads/\n\nSitemap: ${o}/sitemap.xml\n`;
  }

  /* ---- Хариу илгээх ---- */

  send(res: Response, status: number, type: string, body: string, extra: Record<string, string> = {}) {
    res.status(status).set({ 'Content-Type': type, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', ...extra }).send(body);
  }

  /** HTML (dev горимд автоматаар refresh хийх скрипттэй). null бол сайт бүтээгдэж байна. */
  sendHtml(res: Response, status: number, html: string | null) {
    if (html == null) return this.sendBuilding(res);
    const end = this.site.bodyEnd;
    this.send(res, status, 'text/html; charset=utf-8', end ? html.replace('</body>', () => end + '</body>') : html);
  }

  sendBuilding(res: Response) {
    this.send(res, 503, 'text/plain; charset=utf-8', 'Сайтыг бүтээж байна... хэдэн секундын дараа дахин ачаална уу.', { 'Retry-After': '5' });
  }

  /** Олдохгүй хаяг: апп-ын 404 хуудас, 404 статустай */
  sendNotFound(req: Request, res: Response) {
    const html = this.notFoundPage(this.origin(req), req.path);
    if (html == null) return this.send(res, 404, 'text/plain; charset=utf-8', 'Not found');
    this.sendHtml(res, 404, html);
  }

  /* ---- HTML загвар ---- */

  /** Бүтээсэн index.html (файл өөрчлөгдөх хүртэл санах ойд) */
  private readTemplate(): string | null {
    let st: fs.Stats;
    try { st = fs.statSync(TEMPLATE); } catch { return null; }
    if (!this.template || this.template.mtime !== st.mtimeMs) this.template = { mtime: st.mtimeMs, html: fs.readFileSync(TEMPLATE, 'utf8') };
    return this.template.html;
  }

  private page(o: string, m: PageMeta, body?: string): string | null {
    const tpl = this.readTemplate();
    if (!tpl) return null;
    const url = o + m.path, title = m.title || (tpl.match(/<title>([^<]*)<\/title>/) || [])[1] || 'ulaanbaatar.mn';
    const desc = m.desc || (tpl.match(/<meta name="description" content="([^"]*)">/) || [])[1] || '';
    const tags = [
      '<meta name="ubmn-routes" content="path">',   // app.js-д /news/<id> хаяг ашиглаж болохыг хэлнэ
      m.notFound ? '<meta name="ubmn-404" content="1">' : '',   // app.js 404 хуудсаа харуулна
      m.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${esc(url)}">`,
      '<meta property="og:site_name" content="ulaanbaatar.mn">',
      '<meta property="og:locale" content="mn_MN">',
      `<meta property="og:type" content="${m.type || 'website'}">`,
      `<meta property="og:title" content="${esc(m.ogTitle || title)}">`,
      `<meta property="og:description" content="${esc(desc)}">`,
      `<meta property="og:url" content="${esc(url)}">`,
      `<meta property="og:image" content="${esc(o + m.image)}">`,
      `<meta property="og:image:width" content="${OG_W}">`, `<meta property="og:image:height" content="${OG_H}">`,
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
    if (m.notFound) html = html.replace('<div id="view-home">', '<div id="view-home" hidden>').replace('<div id="view-404" hidden></div>', () => `<div id="view-404"><div class="max-w-site mx-auto px-4 py-20 text-center"><p class="text-[72px] font-extrabold text-ubred leading-none">404</p><h1 class="mt-3 text-[28px] font-extrabold">Хуудас олдсонгүй</h1><p class="mt-3 text-muted">Таны хайсан хуудас устсан, нэр нь өөрчлөгдсөн эсвэл хаяг буруу байна.</p><p class="mt-6"><a href="/">Нүүр хуудас</a></p></div></div>`);
    return html;
  }
}
