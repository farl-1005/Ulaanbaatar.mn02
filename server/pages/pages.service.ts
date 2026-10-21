import { Injectable } from '@nestjs/common';
import type { Request, Response } from 'express';
import { isHttps } from '../common/http';
import { NewsFeed, NewsItem } from './news-feed.service';
import { OgImageService, PHOTO_RE } from './og-image.service';
import { clip, dateMn, esc, fill, mn } from './text';

const PUBLISHER = 'Нийслэлийн Засаг даргын Тамгын газар';

/** Цэсний тусдаа хуудсууд (src/core/pages.js PAGES-тэй ижил): хаяг → [гарчиг, тайлбар]. Сайт (site/) /api/pages-ээр авна. */
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

/** Хуудасны өгөгдөл: сайт (site/, Next.js) мэдээний хуудсаа үүгээр бэлддэг. Мөн sitemap.xml, robots.txt. */
@Injectable()
export class PagesService {
  constructor(private readonly og: OgImageService) {}

  /** Сайтын хаяг: SITE_URL (жишээ нь https://ulaanbaatar.mn) → DOMAIN → хүсэлтийн Host */
  origin(req: Request) {
    const dom = process.env.DOMAIN || '';
    const fixed = process.env.SITE_URL || (/^[\w.-]+\.[a-z]{2,}$/i.test(dom) ? 'https://' + dom : '');
    if (fixed) return fixed.replace(/\/+$/, '');
    const host = String(req.headers.host || '');
    return (isHttps(req) ? 'https://' : 'http://') + (/^[\w.-]+(:\d+)?$/.test(host) ? host : 'localhost');
  }

  /** Мэдээний хуудсанд хэрэгтэй бүх зүйл: монгол текст ({t+3} г.м. орлуулсан), огноо, рубрик, зураг, og зураг */
  async newsData(n: NewsItem, feed: NewsFeed) {
    const r = feed.rub[n.cat] || { t: ['Мэдээ'], c: '' };
    const title = fill(mn(n.t)), lead = fill(mn(n.l)), body = (n.b || []).map((p) => fill(mn(p))).filter(Boolean);
    return {
      id: n.id, title, headline: clip(title, 110), lead, body, desc: clip(lead || body[0] || title, 200),
      cat: mn(r.t), color: r.c || '#D81E34',
      at: n.at, dateText: n.at ? dateMn(n.at) : '',
      modified: /^\d{4}-\d\d-\d\dT/.test(n.updatedAt || '') ? n.updatedAt : n.at,   // admin-аас засварласан огноо
      photo: PHOTO_RE.test(n.img || '') ? n.img : '',
      source: n.live ? feed.src + n.id.slice(1) : /^https?:\/\//.test(n.src || '') ? n.src : '',
      image: this.og.url(n.id, await this.og.source(n)), siteImage: this.og.url('site', null), publisher: PUBLISHER,
    };
  }

  sitemap(o: string, feed: NewsFeed) {
    const url = (loc: string, mod?: string | null) => `<url><loc>${esc(o + loc)}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ''}</url>`;
    const urls = [url('/', feed.news[0] && feed.news[0].at)]
      .concat(Object.keys(PAGES).map((k) => url('/' + k)))
      .concat(feed.news.map((n) => url('/news/' + encodeURIComponent(n.id), n.at)));
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  }

  robots(o: string) {
    return `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /uploads/\nDisallow: /admin/\n\nSitemap: ${o}/sitemap.xml\n`;
  }

  send(res: Response, status: number, type: string, body: string, extra: Record<string, string> = {}) {
    res.status(status).set({ 'Content-Type': type, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', ...extra }).send(body);
  }

  sendBuilding(res: Response) {
    this.send(res, 503, 'text/plain; charset=utf-8', 'Сайтыг бүтээж байна... хэдэн секундын дараа дахин ачаална уу.', { 'Retry-After': '5' });
  }
}
