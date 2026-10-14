import { Module } from '@nestjs/common';
import { CmsModule } from '../cms/cms.module';
import { SiteModule } from '../site/site.module';
import { NewsFeedService } from './news-feed.service';
import { OgImageService } from './og-image.service';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';

/** Сервер дээр бэлддэг хуудсууд: нүүр, /news/<id>, og зураг, sitemap.xml, robots.txt */
@Module({
  imports: [CmsModule, SiteModule],
  controllers: [PagesController],
  providers: [PagesService, NewsFeedService, OgImageService],
  exports: [PagesService],
})
export class PagesModule {}
