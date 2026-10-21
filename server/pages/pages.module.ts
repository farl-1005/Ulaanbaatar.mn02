import { Module } from '@nestjs/common';
import { CmsModule } from '../cms/cms.module';
import { NewsFeedService } from './news-feed.service';
import { OgImageService } from './og-image.service';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';

/** Хуудасны өгөгдөл (сайт: site/ — Next.js), og зураг, sitemap.xml, robots.txt */
@Module({
  imports: [CmsModule],
  controllers: [PagesController],
  providers: [PagesService, NewsFeedService, OgImageService],
})
export class PagesModule {}
