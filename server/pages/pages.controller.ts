import { Controller, Get, Param, Req, Res } from '@nestjs/common';
import { ApiError } from '../common/http';
import type { Request, Response } from 'express';
import { NewsFeedService } from './news-feed.service';
import { OgImageService, PHOTO_RE } from './og-image.service';
import { PAGES, PagesService } from './pages.service';

/** Хуудасны өгөгдөл (сайт өөрөө site/ — Next.js), share зураг, sitemap.xml, robots.txt */
@Controller()
export class PagesController {
  constructor(private readonly pages: PagesService, private readonly feed: NewsFeedService, private readonly og: OgImageService) {}

  /** GET /api/pages: цэсний хуудсууд, сайтын ерөнхий share зураг (site/ — Next.js хуудсууд үүгээр мета бэлддэг) */
  @Get('api/pages')
  info() {
    return { pages: PAGES, siteImage: this.og.url('site', null) };
  }

  /** GET /api/pages/news/<id>: мэдээний хуудасны өгөгдөл (site/app/news/[id]) */
  @Get('api/pages/news/:id')
  async news(@Param('id') id: string) {
    const found = await this.feed.find(id);
    if (!found || !found.item) throw new ApiError(404, 'not_found');
    return this.pages.newsData(found.item, found.feed);
  }

  /** /og/<id>.jpg: share хийхэд харагдах зураг (id = site бол сайтын ерөнхий зураг) */
  @Get('og/:file')
  async ogImage(@Param('file') file: string, @Res() res: Response) {
    const id = (/^([\w.-]+)\.jpg$/.exec(file) || [])[1];
    const notFound = () => this.pages.send(res, 404, 'text/plain; charset=utf-8', 'Not found');
    if (!id) return notFound();
    let item = null;
    if (id !== 'site') {
      item = (await this.feed.find(id))?.item;
      if (!item) return notFound();
    }
    if (!this.og.available) return item && PHOTO_RE.test(item.img || '') ? res.redirect(302, '/' + item.img) : notFound();
    const src = await this.og.source(item);
    let jpg: string;
    try { jpg = await this.og.file(src); } catch (e) {
      console.warn('  ⚠ og зураг (' + id + '):', (e as Error).message);
      jpg = await this.og.file(null);
    }
    res.sendFile(jpg, { maxAge: 86400e3, dotfiles: 'allow', headers: { 'Content-Type': 'image/jpeg', 'X-Content-Type-Options': 'nosniff' } });
  }

  @Get('sitemap.xml')
  async sitemap(@Req() req: Request, @Res() res: Response) {
    const feed = await this.feed.all();
    if (!feed) return this.pages.sendBuilding(res);
    this.pages.send(res, 200, 'application/xml; charset=utf-8', this.pages.sitemap(this.pages.origin(req), feed));
  }

  @Get('robots.txt')
  robots(@Req() req: Request, @Res() res: Response) {
    this.pages.send(res, 200, 'text/plain; charset=utf-8', this.pages.robots(this.pages.origin(req)));
  }
}
