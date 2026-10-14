import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { CmsModule } from './cms/cms.module';
import { CommonModule } from './common/common.module';
import { HttpErrorFilter } from './common/http-error.filter';
import { NoStoreInterceptor } from './common/no-store.interceptor';
import { SameOriginGuard } from './common/same-origin.guard';
import { DatabaseModule } from './database/database.module';
import { EventsModule } from './events/events.module';
import { FormsModule } from './forms/forms.module';
import { HealthController } from './health.controller';
import { LiveModule } from './live/live.module';
import { PagesModule } from './pages/pages.module';
import { SiteModule } from './site/site.module';

/** Бүх модуль. Модуль бүр нэг үүрэгтэй:
     auth    admin нэвтрэлт            cms     admin-ы засвар          forms   иргэдийн маягт, ирсэн хүсэлт
     events  шууд мэдэгдэл (SSE)       live    цаг агаар, агаар, газрын зураг, зураг
     site    сайтыг бүтээх (src/)      pages   нүүр, /news/<id>, og зураг, sitemap
     database  PostgreSQL / SQLite     common  хурдны хязгаар, CSRF, алдааны хариу */
@Module({
  imports: [CommonModule, DatabaseModule, AuthModule, EventsModule, CmsModule, FormsModule, LiveModule, SiteModule, PagesModule],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: SameOriginGuard },
    { provide: APP_INTERCEPTOR, useClass: NoStoreInterceptor },
    { provide: APP_FILTER, useClass: HttpErrorFilter },
  ],
})
export class AppModule {}
