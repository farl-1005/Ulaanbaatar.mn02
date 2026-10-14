import { Module } from '@nestjs/common';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';

/** Хөтчийн кодыг (src/) бүтээж dist/site/ болгох, dev горимд автоматаар дахин бүтээх */
@Module({
  controllers: [SiteController],
  providers: [SiteService],
  exports: [SiteService],
})
export class SiteModule {}
